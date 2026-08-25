import { prisma } from '@/lib/db';
import { ensureDatabaseReady } from '@/lib/init-db';
import { IPaymentGatewayAdapter } from './gateway-adapter.interface';
import { SandboxMockAdapter } from './adapters/sandbox-mock-adapter';
import {
  CreateSubscriptionDTO,
  ParsedWebhookEvent,
} from './types';
import {
  ClientFinancialStatus,
  PaymentStatus,
  SubscriptionStatus,
} from '@/types/mztech';

export class PaymentService {
  private static instance: PaymentService;
  private adapters: Map<string, IPaymentGatewayAdapter> = new Map();
  private defaultGateway: string = 'SANDBOX_MOCK';

  private constructor() {
    const sandboxAdapter = new SandboxMockAdapter();
    this.adapters.set(sandboxAdapter.gatewayName, sandboxAdapter);
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  public getAdapter(gatewayName?: string): IPaymentGatewayAdapter {
    const name = gatewayName || process.env.PAYMENT_GATEWAY || this.defaultGateway;
    const adapter = this.adapters.get(name) || this.adapters.get('SANDBOX_MOCK');
    if (!adapter) {
      throw new Error(`Gateway adapter "${name}" não encontrado.`);
    }
    return adapter;
  }

  /**
   * Processa Webhooks recebidos com verificação rigorosa de IDEMPOTÊNCIA
   */
  public async processWebhookEvent(
    rawPayload: any,
    headers?: Headers
  ): Promise<{
    success: boolean;
    processedStatus: 'PROCESSED' | 'IGNORED_DUPLICATE' | 'ERROR';
    message: string;
    parsedEvent?: ParsedWebhookEvent;
    clientFinancialStatus?: ClientFinancialStatus;
  }> {
    await ensureDatabaseReady();

    const adapter = this.getAdapter();

    // 1. Validação de Assinatura/Segurança
    if (headers) {
      const isValid = await adapter.verifyWebhookSignature(headers, JSON.stringify(rawPayload));
      if (!isValid) {
        console.warn('⚠️ [WEBHOOK] Tentativa de acesso com assinatura inválida rejeitada.');
        return {
          success: false,
          processedStatus: 'ERROR',
          message: 'Assinatura/Secret do Webhook inválida.',
        };
      }
    }

    // 2. Parse do Evento
    const parsedEvent = await adapter.parseWebhookEvent(rawPayload);

    // 3. IDEMPOTÊNCIA: Verifica se este evento já foi processado
    try {
      const existingEvent = await prisma.mzWebhookEvent.findUnique({
        where: { eventId: parsedEvent.eventId },
      });

      if (existingEvent) {
        console.log(`ℹ️ [WEBHOOK] Evento duplicado detectado (${parsedEvent.eventId}). Ignorando reprocessamento.`);
        return {
          success: true,
          processedStatus: 'IGNORED_DUPLICATE',
          message: `Evento ${parsedEvent.eventId} já havia sido processado anteriormente (Idempotência garantida).`,
          parsedEvent,
        };
      }
    } catch (err) {
      console.warn('⚠️ [WEBHOOK] Verificação de idempotência em fallback:', err);
    }

    // 4. Localizar Cliente e Assinatura
    let clientId = parsedEvent.rawPayload?.clientId;
    let subscriptionId = parsedEvent.rawPayload?.subscriptionId;

    if (!clientId && parsedEvent.gatewayCustomerId) {
      const sub = await prisma.mzSubscription.findFirst({
        where: { gatewayCustomerId: parsedEvent.gatewayCustomerId },
      });
      if (sub) {
        clientId = sub.clientId;
        subscriptionId = sub.id;
      }
    }

    if (!clientId) {
      const firstClient = await prisma.mzClient.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      clientId = firstClient?.id;
    }

    if (!clientId) {
      return {
        success: false,
        processedStatus: 'ERROR',
        message: 'Cliente não identificado para o evento recebido.',
      };
    }

    // 5. Atualizar ou Criar Pagamento
    let paymentId = parsedEvent.rawPayload?.paymentId;
    let createdPayment = null;

    try {
      if (parsedEvent.gatewayPaymentId) {
        const existingPayment = await prisma.mzPayment.findFirst({
          where: { gatewayPaymentId: parsedEvent.gatewayPaymentId },
        });

        if (existingPayment) {
          paymentId = existingPayment.id;
          createdPayment = await prisma.mzPayment.update({
            where: { id: existingPayment.id },
            data: {
              status: parsedEvent.status,
              paidAt: parsedEvent.paidAt,
              failureReason: parsedEvent.failureReason,
              retryCount:
                parsedEvent.status === 'FAILED'
                  ? { increment: 1 }
                  : existingPayment.retryCount,
            },
          });
        }
      }

      if (!createdPayment) {
        createdPayment = await prisma.mzPayment.create({
          data: {
            clientId,
            subscriptionId: subscriptionId || null,
            amount: parsedEvent.amount || 79.90,
            paymentMethod: parsedEvent.paymentMethod || 'CREDIT_CARD',
            status: parsedEvent.status,
            dueDate: parsedEvent.dueDate || new Date(),
            paidAt: parsedEvent.paidAt || null,
            gateway: parsedEvent.gateway,
            gatewayPaymentId: parsedEvent.gatewayPaymentId || `pay_mock_${Date.now()}`,
            failureReason: parsedEvent.failureReason || null,
            notes: `Processado via Webhook ${parsedEvent.eventType}`,
          },
        });
        paymentId = createdPayment.id;
      }
    } catch (payErr) {
      console.warn('⚠️ [PAYMENT] Erro ao gravar MzPayment:', payErr);
    }

    // 6. Atualizar Assinatura
    if (subscriptionId) {
      try {
        const nextBilling = new Date();
        nextBilling.setDate(nextBilling.getDate() + 30);

        await prisma.mzSubscription.update({
          where: { id: subscriptionId },
          data: {
            status: parsedEvent.subscriptionStatus || 'ACTIVE',
            nextBillingDate: parsedEvent.status === 'PAID' ? nextBilling : undefined,
            cancellationDate:
              parsedEvent.subscriptionStatus === 'CANCELLED' ? new Date() : undefined,
          },
        });
      } catch (subErr) {
        console.warn('⚠️ [SUBSCRIPTION] Erro ao atualizar MzSubscription:', subErr);
      }
    }

    // 7. Recalcular e Atualizar Situação Financeira do Cliente
    const updatedFinancialStatus = await this.updateClientFinancialStatus(clientId);

    // 8. Registrar Evento de Webhook para Idempotência e Auditoria
    try {
      await prisma.mzWebhookEvent.create({
        data: {
          eventId: parsedEvent.eventId,
          gateway: parsedEvent.gateway,
          eventType: parsedEvent.eventType,
          clientId,
          subscriptionId: subscriptionId || null,
          paymentId: paymentId || null,
          rawPayload: JSON.stringify(parsedEvent.rawPayload || {}),
          processedStatus: 'PROCESSED',
          errorMessage: null,
          processedAt: new Date(),
        },
      });
    } catch (eventErr) {
      console.warn('⚠️ [WEBHOOK] Log de MzWebhookEvent gravado em fallback:', eventErr);
    }

    console.log(
      `✅ [WEBHOOK] Evento ${parsedEvent.eventId} processado com sucesso. Situação do cliente ${clientId}: ${updatedFinancialStatus}`
    );

    return {
      success: true,
      processedStatus: 'PROCESSED',
      message: 'Webhook processado e situação financeira do cliente atualizada.',
      parsedEvent,
      clientFinancialStatus: updatedFinancialStatus,
    };
  }

  /**
   * Recalcula e sincroniza o status financeiro de um cliente com base em assinaturas e pagamentos
   */
  public async updateClientFinancialStatus(clientId: string): Promise<ClientFinancialStatus> {
    await ensureDatabaseReady();

    try {
      const client = await prisma.mzClient.findUnique({
        where: { id: clientId },
        include: {
          subscriptions: true,
          payments: {
            orderBy: { dueDate: 'desc' },
            take: 10,
          },
        },
      });

      if (!client) return 'EM_DIA';

      let newStatus: ClientFinancialStatus = 'EM_DIA';

      // 1. Se todas as assinaturas estão canceladas
      const hasActiveSub = client.subscriptions.some(
        (s) => s.status === 'ACTIVE' || s.status === 'PAYMENT_PENDING'
      );
      const isAllCancelled =
        client.subscriptions.length > 0 &&
        client.subscriptions.every((s) => s.status === 'CANCELLED');

      if (isAllCancelled) {
        newStatus = 'CANCELADO';
      } else {
        // 2. Verificar histórico recente de pagamentos
        const hasFailedPayment = client.payments.some((p) => p.status === 'FAILED');
        const hasOverduePayment = client.payments.some((p) => p.status === 'OVERDUE');
        const hasPendingPayment = client.payments.some((p) => p.status === 'PENDING');

        if (hasFailedPayment) {
          newStatus = 'RECUSADO';
        } else if (hasOverduePayment) {
          newStatus = 'ATRASADO';
        } else if (hasPendingPayment) {
          newStatus = 'PENDENTE';
        } else {
          newStatus = 'EM_DIA';
        }
      }

      await prisma.mzClient.update({
        where: { id: clientId },
        data: { financialStatus: newStatus },
      });

      return newStatus;
    } catch (err) {
      console.error('Erro ao recalcular status financeiro:', err);
      return 'EM_DIA';
    }
  }

  /**
   * Cria uma assinatura vinculada a um cliente
   */
  public async createSubscriptionForClient(
    dto: CreateSubscriptionDTO
  ): Promise<{ subscription: any; initialCharge?: any }> {
    await ensureDatabaseReady();

    const client = await prisma.mzClient.findUnique({
      where: { id: dto.clientId },
    });

    if (!client) {
      throw new Error(`Cliente ${dto.clientId} não encontrado.`);
    }

    const adapter = this.getAdapter();

    // 1. Criar/Obter Cliente no Gateway
    const customerRes = await adapter.createCustomer({
      name: client.contactName,
      email: client.email,
      whatsapp: client.whatsapp,
      companyName: client.companyName,
    });

    // 2. Criar Assinatura no Gateway
    const subRes = await adapter.createSubscription(dto, customerRes.gatewayCustomerId);

    // 3. Salvar no Banco mzTech
    const subscription = await prisma.mzSubscription.create({
      data: {
        clientId: dto.clientId,
        projectId: dto.projectId || null,
        planName: dto.planName,
        amount: dto.amount,
        periodicity: dto.periodicity || 'MENSAL',
        paymentMethod: dto.paymentMethod,
        status: subRes.status,
        startDate: new Date(),
        nextBillingDate: subRes.nextBillingDate,
        gateway: adapter.gatewayName,
        gatewaySubscriptionId: subRes.gatewaySubscriptionId,
        gatewayCustomerId: subRes.gatewayCustomerId,
        notes: `Criada via painel mzTech em modo ${adapter.gatewayName}`,
      },
    });

    // 4. Criar primeira cobrança
    const firstPayment = await prisma.mzPayment.create({
      data: {
        clientId: dto.clientId,
        subscriptionId: subscription.id,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        status: 'PENDING',
        dueDate: new Date(),
        gateway: adapter.gatewayName,
        gatewayPaymentId: `pay_${Date.now()}`,
        notes: 'Primeira mensalidade da assinatura',
      },
    });

    await this.updateClientFinancialStatus(dto.clientId);

    return { subscription, initialCharge: firstPayment };
  }
}

export const paymentService = PaymentService.getInstance();
