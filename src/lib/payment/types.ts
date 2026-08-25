import {
  PaymentMethod,
  PaymentStatus,
  SubscriptionStatus,
  ClientFinancialStatus,
} from '@/types/mztech';

export interface CreateCustomerDTO {
  name: string;
  email: string;
  whatsapp: string;
  companyName?: string;
}

export interface CreateSubscriptionDTO {
  clientId: string;
  projectId?: string;
  planName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  periodicity?: string;
}

export interface CreatePixChargeDTO {
  clientId: string;
  amount: number;
  description: string;
  dueDate?: Date;
}

export interface GatewayCustomerResponse {
  gatewayCustomerId: string;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
}

export interface GatewaySubscriptionResponse {
  gatewaySubscriptionId: string;
  gatewayCustomerId: string;
  status: SubscriptionStatus;
  nextBillingDate?: Date;
  errorMessage?: string;
}

export interface GatewayPixChargeResponse {
  gatewayPaymentId: string;
  pixQrCode: string;
  pixCopyPaste: string;
  expiresAt: Date;
  status: PaymentStatus;
}

export interface ParsedWebhookEvent {
  eventId: string;
  gateway: string;
  eventType: string; // Ex: 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'PAYMENT_OVERDUE', 'SUBSCRIPTION_CANCELLED'
  gatewayPaymentId?: string;
  gatewaySubscriptionId?: string;
  gatewayCustomerId?: string;
  amount?: number;
  paymentMethod?: PaymentMethod;
  status: PaymentStatus;
  subscriptionStatus?: SubscriptionStatus;
  paidAt?: Date;
  dueDate?: Date;
  failureReason?: string;
  rawPayload: any;
}
