import {
  CreateCustomerDTO,
  CreateSubscriptionDTO,
  CreatePixChargeDTO,
  GatewayCustomerResponse,
  GatewaySubscriptionResponse,
  GatewayPixChargeResponse,
  ParsedWebhookEvent,
} from './types';

export interface IPaymentGatewayAdapter {
  readonly gatewayName: string;

  /**
   * Registra o cliente no gateway de pagamentos
   */
  createCustomer(dto: CreateCustomerDTO): Promise<GatewayCustomerResponse>;

  /**
   * Cria uma assinatura recorrente no gateway (Cartão ou Pix)
   */
  createSubscription(
    dto: CreateSubscriptionDTO,
    gatewayCustomerId: string
  ): Promise<GatewaySubscriptionResponse>;

  /**
   * Cria uma cobrança pontual via Pix
   */
  createPixCharge(
    dto: CreatePixChargeDTO,
    gatewayCustomerId: string
  ): Promise<GatewayPixChargeResponse>;

  /**
   * Cancela uma assinatura no gateway
   */
  cancelSubscription(gatewaySubscriptionId: string): Promise<boolean>;

  /**
   * Valida a autenticidade do webhook através do secret ou assinatura digital
   */
  verifyWebhookSignature(headers: Headers, rawBody: string): Promise<boolean>;

  /**
   * Converte o payload proprietário do gateway para o padrão interno da mzTech
   */
  parseWebhookEvent(rawPayload: any): Promise<ParsedWebhookEvent>;
}
