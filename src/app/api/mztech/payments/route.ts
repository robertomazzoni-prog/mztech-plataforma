import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';
import {
  getStoredPayments,
  createStoredPayment,
  updateStoredPayment,
  deleteStoredPayment,
  updateStoredClient,
  getStoredClientById,
  getStoredContractById,
  updateStoredContract,
} from '@/lib/mz-entities-store';
import { MzPaymentItem } from '@/types/mztech';
import { logActivity } from '@/lib/audit-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const paymentType = searchParams.get('type');

    let payments = getStoredPayments();

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        const where: any = {};
        if (clientId) where.clientId = clientId;
        if (status && status !== 'ALL') where.status = status;

        const dbPayments = await prisma.mzPayment.findMany({
          where,
          orderBy: { dueDate: 'desc' },
          include: {
            client: {
              select: { id: true, companyName: true, contactName: true },
            },
            subscription: {
              select: { id: true, planName: true, status: true },
            },
          },
        });
        if (dbPayments && dbPayments.length > 0) {
          payments = dbPayments as any;
        }
      } catch (e) {}
    }

    if (clientId) {
      payments = payments.filter((p) => p.clientId === clientId);
    }
    if (status && status !== 'ALL') {
      payments = payments.filter((p) => p.status === status);
    }
    if (paymentType && paymentType !== 'ALL') {
      payments = payments.filter((p) => p.paymentType === paymentType);
    }

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Erro ao buscar pagamentos mzTech:', error);
    return NextResponse.json({ error: 'Erro ao buscar pagamentos.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientId,
      contractId,
      subscriptionId,
      title,
      amount,
      paymentMethod,
      paymentType,
      status,
      dueDate,
      notes,
    } = body;

    if (!clientId || amount === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: Cliente e Valor.' },
        { status: 400 }
      );
    }

    const client = getStoredClientById(clientId);

    const payments = getStoredPayments();
    let paymentRecord: MzPaymentItem;

    // Se for confirmação de pagamento do checkout e já existir cobrança inicial pendente para este contrato:
    const existingPendingInitPayment = contractId
      ? payments.find((p) => p.contractId === contractId && p.paymentType === 'TAXA_INICIAL' && p.status === 'PENDING')
      : null;

    if (existingPendingInitPayment && status === 'PAID') {
      paymentRecord = updateStoredPayment(existingPendingInitPayment.id, {
        status: 'PAID',
        paidAt: new Date().toISOString(),
        paymentMethod: paymentMethod || existingPendingInitPayment.paymentMethod,
        notes: notes || existingPendingInitPayment.notes,
      })!;
    } else {
      paymentRecord = createStoredPayment({
        clientId,
        client: client
          ? { id: client.id, companyName: client.companyName, contactName: client.contactName }
          : undefined,
        contractId: contractId || null,
        subscriptionId: subscriptionId || null,
        title: title || 'Cobrança Avulsa mzTech',
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'CREDIT_CARD',
        paymentType: paymentType || 'TAXA_INICIAL',
        status: status || 'PENDING',
        dueDate: dueDate || new Date().toISOString(),
        notes: notes || null,
      });
    }

    if (status === 'PAID' && clientId) {
      updateStoredClient(clientId, { financialStatus: 'EM_DIA' });
      if (contractId) {
        const contract = getStoredContractById(contractId);
        if (contract) {
          updateStoredContract(contractId, { status: 'ATIVO' });

          // Se o contrato tem mensalidade contratada (plano), gerar a próxima fatura mensal recorrente para o cliente
          if (contract.monthlyPrice > 0) {
            const hasExistingMonthlyPending = payments.some(
              (p) => p.contractId === contractId && p.paymentType === 'TAXA_MENSAL' && p.status === 'PENDING'
            );

            if (!hasExistingMonthlyPending) {
              const nextMonthDate = new Date();
              nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
              if (contract.dueDay) {
                nextMonthDate.setDate(Math.min(contract.dueDay, 28));
              }

              createStoredPayment({
                clientId: contract.clientId,
                client: {
                  id: contract.clientId,
                  companyName: client?.companyName || 'Cliente',
                  contactName: client?.contactName || 'Contato',
                },
                contractId: contract.id,
                title: `Mensalidade — ${contract.project?.name || contract.title || 'Plano de Hospedagem & Manutenção'}`,
                amount: contract.monthlyPrice,
                paymentMethod: paymentMethod || 'CREDIT_CARD',
                paymentType: 'TAXA_MENSAL',
                status: 'PENDING',
                dueDate: nextMonthDate.toISOString(),
                notes: `Mensalidade recorrente do plano contratado (R$ ${contract.monthlyPrice.toFixed(2)}/mês).`,
              });
            }
          }
        }
      }
    }

    const user = getUserFromRequest(req);
    logActivity({
      actor: user?.name || 'Administrador',
      action: 'CRIAR_COBRANCA',
      category: 'PAGAMENTO',
      targetId: paymentRecord.id,
      targetNumber: paymentRecord.transactionId,
      description: `Cobrança ${paymentRecord.transactionId} de R$ ${paymentRecord.amount.toFixed(2)} (${paymentRecord.status}) para "${client?.companyName || clientId}".`,
    });

    return NextResponse.json({ success: true, payment: paymentRecord }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar cobrança:', error);
    return NextResponse.json({ error: 'Erro ao criar cobrança.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, status, paidAt, failureReason, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do pagamento é obrigatório.' }, { status: 400 });
    }

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (paidAt !== undefined) updates.paidAt = paidAt;
    if (failureReason !== undefined) updates.failureReason = failureReason;
    if (notes !== undefined) updates.notes = notes;

    // Ação rápida: CONFIRMAR PAGAMENTO MANUALMENTE
    if (action === 'CONFIRM_PAID' || status === 'PAID') {
      updates.status = 'PAID';
      updates.paidAt = paidAt || new Date().toISOString();
    }

    const updatedPayment = updateStoredPayment(id, updates);
    if (!updatedPayment) {
      return NextResponse.json({ error: 'Pagamento não encontrado.' }, { status: 404 });
    }

    // Se o pagamento foi marcado como PAID, atualizar status financeiro do cliente
    if (updatedPayment.status === 'PAID' && updatedPayment.clientId) {
      updateStoredClient(updatedPayment.clientId, {
        financialStatus: 'EM_DIA',
      });

      // Se tiver contrato vinculado e estiver aguardando pagamento, ativar contrato
      if (updatedPayment.contractId) {
        const contract = getStoredContractById(updatedPayment.contractId);
        if (contract) {
          if (contract.status === 'AGUARDANDO_PAGAMENTO' || contract.status === 'RASCUNHO') {
            updateStoredContract(updatedPayment.contractId, {
              status: 'ATIVO',
            });
          }

          // Se for taxa inicial paga e o contrato tiver mensalidade, gerar a próxima fatura de mensalidade do plano
          if (updatedPayment.paymentType === 'TAXA_INICIAL' && contract.monthlyPrice > 0) {
            const allPayments = getStoredPayments();
            const hasMonthlyPending = allPayments.some(
              (p) => p.contractId === contract.id && p.paymentType === 'TAXA_MENSAL' && p.status === 'PENDING'
            );

            if (!hasMonthlyPending) {
              const nextMonthDate = new Date();
              nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
              if (contract.dueDay) {
                nextMonthDate.setDate(Math.min(contract.dueDay, 28));
              }

              createStoredPayment({
                clientId: contract.clientId,
                client: updatedPayment.client,
                contractId: contract.id,
                title: `Mensalidade — ${contract.project?.name || contract.title || 'Plano de Hospedagem & Manutenção'}`,
                amount: contract.monthlyPrice,
                paymentMethod: updatedPayment.paymentMethod || 'CREDIT_CARD',
                paymentType: 'TAXA_MENSAL',
                status: 'PENDING',
                dueDate: nextMonthDate.toISOString(),
                notes: `Mensalidade recorrente do plano contratado (R$ ${contract.monthlyPrice.toFixed(2)}/mês).`,
              });
            }
          }
        }
      }
    }

    const user = getUserFromRequest(req);
    logActivity({
      actor: user?.name || 'Administrador / Gateway',
      action: updatedPayment.status === 'PAID' ? 'PAGAMENTO_CONFIRMADO' : 'ATUALIZAR_PAGAMENTO',
      category: 'PAGAMENTO',
      targetId: updatedPayment.id,
      targetNumber: updatedPayment.transactionId,
      description: `Pagamento ${updatedPayment.transactionId} atualizado para status "${updatedPayment.status}".`,
    });

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (error: any) {
    console.error('Erro ao atualizar pagamento:', error);
    return NextResponse.json({ error: 'Erro ao atualizar pagamento.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da cobrança é obrigatório.' }, { status: 400 });
    }

    deleteStoredPayment(id);

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        await prisma.mzPayment.deleteMany({
          where: { id },
        });
      } catch (e) {}
    }

    logActivity({
      actor: 'Administrador',
      action: 'EXCLUIR_COBRANCA',
      category: 'PAGAMENTO',
      targetId: id,
      description: `Cobrança ${id} foi excluída da Gestão Financeira.`,
    });

    return NextResponse.json({ success: true, message: 'Cobrança excluída com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao excluir pagamento:', error);
    return NextResponse.json({ error: 'Erro ao excluir pagamento.' }, { status: 500 });
  }
}
