import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payment/payment-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const result = await paymentService.processWebhookEvent(rawBody, req.headers);

    if (!result.success && result.processedStatus === 'ERROR') {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        received: true,
        processedStatus: result.processedStatus,
        message: result.message,
        financialStatus: result.clientFinancialStatus,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro no processamento do Webhook de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar webhook.', details: error?.message },
      { status: 500 }
    );
  }
}
