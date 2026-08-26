import { NextRequest, NextResponse } from 'next/server';
import { getMercadoPagoPaymentDetails } from '@/lib/mercadopago';
import {
  getStoredContracts,
  saveStoredContracts,
  createStoredPayment,
  getStoredPayments,
  saveStoredPayments,
} from '@/lib/mz-entities-store';
import { logActivity } from '@/lib/audit-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    // ID do pagamento do Mercado Pago
    const paymentId = searchParams.get('data.id') || searchParams.get('id') || body?.data?.id || body?.id;
    const topic = searchParams.get('type') || searchParams.get('topic') || body?.type || body?.action;

    if (!paymentId) {
      return NextResponse.json({ message: 'Notificação recebida sem ID de pagamento.' }, { status: 200 });
    }

    // Consultar detalhes reais do pagamento diretamente na API do Mercado Pago
    const paymentData = await getMercadoPagoPaymentDetails(paymentId.toString());

    if (!paymentData) {
      console.warn(`⚠️ [WEBHOOK MP] Não foi possível consultar detalhes do pagamento ${paymentId}.`);
      return NextResponse.json({ message: 'Pagamento não localizado na API MP.' }, { status: 200 });
    }

    const contractId = paymentData.external_reference;
    const status = paymentData.status; // 'approved', 'pending', 'in_process', 'rejected', etc.

    console.log(`🔔 [WEBHOOK MP] Pagamento ${paymentId} para Contrato ${contractId} — Status: ${status}`);

    if (status === 'approved' && contractId) {
      const contracts = getStoredContracts();
      const contract = contracts.find((c) => c.id === contractId);

      if (contract) {
        // 1. Atualizar Contrato
        contract.status = 'ATIVO';
        contract.paymentMethod = `Mercado Pago (${paymentData.payment_method_id?.toUpperCase() || 'Cartão'} ${paymentData.installments || 1}x)`;
        saveStoredContracts(contracts);

        // 2. Registrar pagamento na Gestão Financeira se ainda não existir
        const payments = getStoredPayments();
        const existingPayment = payments.find((p) => p.notes?.includes(`ID: ${paymentId}`) || (p.contractId === contractId && p.status === 'PAID'));

        if (!existingPayment) {
          const newPayment = createStoredPayment({
            clientId: contract.clientId,
            client: contract.client,
            contractId: contract.id,
            title: `Pagamento Mercado Pago — ${contract.title}`,
            amount: Number(paymentData.transaction_amount || contract.totalDevPrice),
            paymentMethod: 'CREDIT_CARD',
            paymentType: 'TAXA_INICIAL',
            status: 'PAID',
            paidAt: new Date().toISOString(),
            dueDate: new Date().toISOString(),
            notes: `Aprovado via Mercado Pago Oficial (ID: ${paymentId}) • Parcelas: ${paymentData.installments || 1}x • Bandeira: ${paymentData.payment_method_id?.toUpperCase()} • Líquido: R$ ${paymentData.transaction_details?.net_received_amount || paymentData.transaction_amount}.`,
          });

          logActivity({
            actor: 'Mercado Pago Webhook',
            action: 'CONFIRMAR_PAGAMENTO',
            category: 'PAGAMENTO',
            targetId: newPayment.id,
            targetNumber: newPayment.transactionId,
            description: `Pagamento de R$ ${paymentData.transaction_amount} aprovado via Mercado Pago para o contrato ${contract.contractNumber || contract.title}.`,
          });
        }
      }
    }

    return NextResponse.json({ received: true, status }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao processar webhook Mercado Pago:', error);
    return NextResponse.json({ error: 'Erro interno ao processar notificação.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook Mercado Pago Ativo e Operante.' });
}
