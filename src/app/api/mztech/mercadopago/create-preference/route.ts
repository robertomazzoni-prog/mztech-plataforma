import { NextRequest, NextResponse } from 'next/server';
import { getStoredContracts } from '@/lib/mz-entities-store';
import { createMercadoPagoPreference, getMercadoPagoCredentials } from '@/lib/mercadopago';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const creds = getMercadoPagoCredentials();
    if (!creds.isConfigured) {
      return NextResponse.json(
        {
          error: 'Mercado Pago não configurado.',
          isConfigured: false,
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { contractId, installments } = body;

    if (!contractId) {
      return NextResponse.json({ error: 'ID do contrato é obrigatório.' }, { status: 400 });
    }

    const contracts = getStoredContracts();
    const contract = contracts.find((c) => c.id === contractId);

    if (!contract) {
      return NextResponse.json({ error: 'Contrato não encontrado.' }, { status: 404 });
    }

    const amount = contract.totalDevPrice > 0 ? contract.totalDevPrice : (contract.monthlyPrice || 79.9);
    
    // Obter host dinâmico da requisição
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const preference = await createMercadoPagoPreference({
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      title: contract.title || 'Desenvolvimento mzTech',
      amount,
      clientName: contract.client?.contactName || contract.client?.companyName,
      clientEmail: contract.client?.email,
      installments: installments || 12,
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      initPoint: preference.initPoint,
      preferenceId: preference.preferenceId,
      isSandbox: creds.isSandbox,
    });
  } catch (error: any) {
    console.error('Erro ao gerar preferência Mercado Pago:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao gerar checkout do Mercado Pago.' },
      { status: 500 }
    );
  }
}
