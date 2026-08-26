import { getStoredSettings } from './mz-settings-store';

export interface MercadoPagoAccountInfo {
  id: number;
  nickname: string;
  first_name: string;
  last_name: string;
  email: string;
  site_id: string;
}

export function getMercadoPagoCredentials() {
  const settings = getStoredSettings();
  const accessToken = settings.mercadoPagoAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN || '';
  const publicKey = settings.mercadoPagoPublicKey || process.env.MERCADOPAGO_PUBLIC_KEY || '';
  const isEnabled = settings.mercadoPagoEnabled !== false;
  const isSandbox = settings.mercadoPagoEnvironment === 'SANDBOX' || accessToken.startsWith('TEST-');

  return {
    accessToken,
    publicKey,
    isEnabled,
    isSandbox,
    isConfigured: Boolean(accessToken && accessToken.length > 10),
  };
}

/**
 * Testa a conexão com a API do Mercado Pago usando o Access Token fornecido
 */
export async function testMercadoPagoConnection(tokenOverride?: string): Promise<{
  success: boolean;
  account?: MercadoPagoAccountInfo;
  error?: string;
}> {
  try {
    const creds = getMercadoPagoCredentials();
    const token = tokenOverride || creds.accessToken;

    if (!token) {
      return { success: false, error: 'Access Token do Mercado Pago não informado.' };
    }

    const res = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errJson.message || `Erro ${res.status}: Credencial do Mercado Pago inválida ou sem permissão.`,
      };
    }

    const data: MercadoPagoAccountInfo = await res.json();
    return {
      success: true,
      account: {
        id: data.id,
        nickname: data.nickname,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        site_id: data.site_id,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Erro de conexão com os servidores do Mercado Pago.',
    };
  }
}

/**
 * Cria uma preferência de pagamento (Checkout Pro) no Mercado Pago
 */
export async function createMercadoPagoPreference(params: {
  contractId: string;
  contractNumber?: string;
  title: string;
  amount: number;
  clientName?: string;
  clientEmail?: string;
  installments?: number;
  baseUrl: string;
}) {
  const creds = getMercadoPagoCredentials();
  if (!creds.isConfigured) {
    throw new Error('Mercado Pago não configurado. Por favor, cadastre seu Access Token no painel administrativo.');
  }

  const preferencePayload = {
    items: [
      {
        id: params.contractId,
        title: `${params.contractNumber ? `[${params.contractNumber}] ` : ''}${params.title}`,
        description: `Serviço Digital mzTech — Contrato ${params.contractNumber || params.contractId}`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: Number(params.amount.toFixed(2)),
      },
    ],
    payer: {
      name: params.clientName || 'Cliente mzTech',
      email: params.clientEmail || 'cliente@mztech.com.br',
    },
    back_urls: {
      success: `${params.baseUrl}/pagamento/${params.contractId}?mp_status=approved`,
      pending: `${params.baseUrl}/pagamento/${params.contractId}?mp_status=pending`,
      failure: `${params.baseUrl}/pagamento/${params.contractId}?mp_status=failure`,
    },
    auto_return: 'approved',
    external_reference: params.contractId,
    payment_methods: {
      installments: params.installments || 12,
    },
    statement_descriptor: 'MZTECH SOLUCOES',
    notification_url: `${params.baseUrl}/api/webhooks/mercadopago`,
  };

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${creds.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferencePayload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Erro ao gerar preferência no Mercado Pago (${res.status})`);
  }

  const data = await res.json();
  return {
    preferenceId: data.id,
    initPoint: creds.isSandbox ? (data.sandbox_init_point || data.init_point) : data.init_point,
    sandboxInitPoint: data.sandbox_init_point,
  };
}

/**
 * Consulta o status de um pagamento pelo ID no Mercado Pago
 */
export async function getMercadoPagoPaymentDetails(paymentId: string) {
  const creds = getMercadoPagoCredentials();
  if (!creds.isConfigured) return null;

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${creds.accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return await res.json();
}
