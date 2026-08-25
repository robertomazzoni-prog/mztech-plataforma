import { IPaymentGatewayAdapter } from '../gateway-adapter.interface';
import {
  CreateCustomerDTO,
  CreateSubscriptionDTO,
  CreatePixChargeDTO,
  GatewayCustomerResponse,
  GatewaySubscriptionResponse,
  GatewayPixChargeResponse,
  ParsedWebhookEvent,
} from '../types';
import { PaymentStatus, SubscriptionStatus } from '@/types/mztech';

export class SandboxMockAdapter implements IPaymentGatewayAdapter {
  readonly gatewayName = 'SANDBOX_MOCK';

  async createCustomer(dto: CreateCustomerDTO): Promise<GatewayCustomerResponse> {
    const randomId = Math.random().toString(36).substring(2, 10);
    return {
      gatewayCustomerId: `cus_mock_${randomId}`,
      status: 'SUCCESS',
    };
  }

  async createSubscription(
    dto: CreateSubscriptionDTO,
    gatewayCustomerId: string
  ): Promise<GatewaySubscriptionResponse> {
    const randomId = Math.random().toString(36).substring(2, 10);
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    return {
      gatewaySubscriptionId: `sub_mock_${randomId}`,
      gatewayCustomerId,
      status: 'ACTIVE',
      nextBillingDate: nextBilling,
    };
  }

  async createPixCharge(
    dto: CreatePixChargeDTO,
    gatewayCustomerId: string
  ): Promise<GatewayPixChargeResponse> {
    const randomId = Math.random().toString(36).substring(2, 10);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
      gatewayPaymentId: `pay_mock_${randomId}`,
      pixQrCode: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%230f172a"/><text x="50%" y="50%" fill="%2322d3ee" text-anchor="middle" font-size="12">MOCK PIX QR CODE</text></svg>`,
      pixCopyPaste: `00020126580014br.gov.bcb.pix0136mztech-${randomId}-sandbox520400005303986540${dto.amount.toFixed(2)}5802BR5906mzTech6009SaoPaulo62070503***6304MOCK`,
      expiresAt,
      status: 'PENDING',
    };
  }

  async cancelSubscription(gatewaySubscriptionId: string): Promise<boolean> {
    return true;
  }

  async verifyWebhookSignature(headers: Headers, rawBody: string): Promise<boolean> {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'mztech_sandbox_secret_2026';
    const authHeader =
      headers.get('x-webhook-token') ||
      headers.get('authorization') ||
      headers.get('x-signature') ||
      headers.get('x-mztech-webhook-secret');

    // Em ambiente sandbox / desenvolvimento local, se não for passado token específico ou bater com o secret padrão, autoriza
    if (!authHeader) {
      return true;
    }

    return (
      authHeader === secret ||
      authHeader === `Bearer ${secret}` ||
      authHeader === 'sandbox_test_token'
    );
  }

  async parseWebhookEvent(rawPayload: any): Promise<ParsedWebhookEvent> {
    // Tratamento de payload padronizado em Sandbox / Mock
    const eventId =
      rawPayload.eventId ||
      rawPayload.id ||
      `evt_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const eventType = rawPayload.eventType || rawPayload.event || 'PAYMENT_RECEIVED';

    let status: PaymentStatus = 'PAID';
    let subscriptionStatus: SubscriptionStatus = 'ACTIVE';

    switch (eventType) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_PAID':
        status = 'PAID';
        subscriptionStatus = 'ACTIVE';
        break;

      case 'PAYMENT_FAILED':
      case 'PAYMENT_REFUSED':
      case 'PAYMENT_REJECTED':
        status = 'FAILED';
        subscriptionStatus = 'OVERDUE';
        break;

      case 'PAYMENT_OVERDUE':
      case 'PAYMENT_EXPIRED':
        status = 'OVERDUE';
        subscriptionStatus = 'OVERDUE';
        break;

      case 'PAYMENT_PENDING':
      case 'PAYMENT_CREATED':
        status = 'PENDING';
        subscriptionStatus = 'PAYMENT_PENDING';
        break;

      case 'SUBSCRIPTION_CANCELLED':
      case 'SUBSCRIPTION_DELETED':
        status = 'CANCELLED';
        subscriptionStatus = 'CANCELLED';
        break;

      case 'PAYMENT_REFUNDED':
        status = 'REFUNDED';
        subscriptionStatus = 'SUSPENDED';
        break;

      default:
        status = 'PAID';
        subscriptionStatus = 'ACTIVE';
        break;
    }

    return {
      eventId,
      gateway: this.gatewayName,
      eventType,
      gatewayPaymentId: rawPayload.paymentId || rawPayload.data?.paymentId,
      gatewaySubscriptionId: rawPayload.subscriptionId || rawPayload.data?.subscriptionId,
      gatewayCustomerId: rawPayload.customerId || rawPayload.data?.customerId,
      amount: rawPayload.amount || rawPayload.data?.amount ? Number(rawPayload.amount || rawPayload.data?.amount) : undefined,
      paymentMethod: rawPayload.paymentMethod === 'PIX' ? 'PIX' : 'CREDIT_CARD',
      status,
      subscriptionStatus,
      paidAt: status === 'PAID' ? new Date() : undefined,
      dueDate: rawPayload.dueDate ? new Date(rawPayload.dueDate) : new Date(),
      failureReason: rawPayload.failureReason || (status === 'FAILED' ? 'Cartão recusado pela operadora' : undefined),
      rawPayload,
    };
  }
}
