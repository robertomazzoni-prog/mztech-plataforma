import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { paymentService } from '@/lib/payment/payment-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { action, clientId, subscriptionId, eventIdOverride } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'clientId é obrigatório para simulação.' }, { status: 400 });
    }

    const eventId =
      eventIdOverride || `sim_evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let eventType = 'PAYMENT_RECEIVED';
    let failureReason = undefined;

    switch (action) {
      case 'SIMULAR_APROVADO':
        eventType = 'PAYMENT_RECEIVED';
        break;

      case 'SIMULAR_RECUSADO':
        eventType = 'PAYMENT_FAILED';
        failureReason = 'Cartão de crédito com limite insuficiente ou recusado pelo emissor (Simulação)';
        break;

      case 'SIMULAR_PENDENTE':
        eventType = 'PAYMENT_PENDING';
        break;

      case 'SIMULAR_ATRASADO':
        eventType = 'PAYMENT_OVERDUE';
        break;

      case 'SIMULAR_REGULARIZACAO':
        eventType = 'PAYMENT_RECEIVED';
        break;

      case 'SIMULAR_CANCELAMENTO':
        eventType = 'SUBSCRIPTION_CANCELLED';
        break;

      default:
        eventType = 'PAYMENT_RECEIVED';
    }

    const payload = {
      eventId,
      eventType,
      clientId,
      subscriptionId,
      amount: 79.90,
      paymentMethod: 'CREDIT_CARD',
      failureReason,
      simulatedAt: new Date().toISOString(),
    };

    const result = await paymentService.processWebhookEvent(payload);

    return NextResponse.json({
      success: true,
      simulatedAction: action,
      eventId,
      result,
    });
  } catch (error: any) {
    console.error('Erro na simulação de webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao executar simulação de webhook.', details: error?.message },
      { status: 500 }
    );
  }
}
