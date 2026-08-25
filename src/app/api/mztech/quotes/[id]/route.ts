import { NextRequest, NextResponse } from 'next/server';
import { updateQuote, deleteQuote, getStoredQuotes } from '@/lib/quotes-store';
import {
  approveQuoteAndGenerateContract,
  getStoredClientById,
  getStoredContractById,
} from '@/lib/mz-entities-store';
import { getUserFromRequest } from '@/lib/auth';
import { logActivity } from '@/lib/audit-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotes = getStoredQuotes();
    const quote = quotes.find((q) => q.id === params.id);
    if (!quote) {
      return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
    }

    let linkedClient = null;
    let linkedContract = null;

    if (quote.linkedClientId) {
      linkedClient = getStoredClientById(quote.linkedClientId);
    }
    if (quote.linkedContractId) {
      linkedContract = getStoredContractById(quote.linkedContractId);
    }

    return NextResponse.json({
      quote,
      linkedClient,
      linkedContract,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao buscar orçamento.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      action,
      adminName,
      status,
      notes,
      selectedDev,
      initialDevPrice,
      monthlyPrice,
      discount,
      finalPrice,
      paymentMethodChoice,
      billingPeriodicity,
      dueDay,
      estimatedBudget,
      desiredDeadline,
      projectType,
      company,
      cnpjCpf,
    } = body;

    const user = getUserFromRequest(req);
    const responsible = adminName || user?.name || selectedDev || 'Roberto';

    // Ação Especial: APROVAR / ACEITAR SERVIÇO
    if (action === 'APPROVE' || status === 'APROVADO' || status === 'CONCLUIDO') {
      const approvalResult = await approveQuoteAndGenerateContract(params.id, responsible);
      return NextResponse.json({
        success: true,
        message: `Orçamento aprovado com sucesso por ${responsible}! Contrato, cliente, projeto e cobrança gerados automaticamente.`,
        ...approvalResult,
      });
    }

    // Ação: RECUSAR
    if (action === 'REJECT' || status === 'RECUSADO') {
      const updated = updateQuote(params.id, {
        status: 'RECUSADO',
        notes: notes || 'Orçamento recusado pela equipe comercial.',
      });
      if (updated) {
        logActivity({
          actor: responsible,
          action: 'RECUSAR_ORCAMENTO',
          category: 'ORCAMENTO',
          targetId: params.id,
          targetNumber: updated.quoteNumber,
          description: `${responsible} recusou o orçamento comercial ${updated.quoteNumber || params.id}.`,
        });
      }
      return NextResponse.json({
        success: true,
        message: 'Orçamento marcado como recusado.',
        quote: updated,
      });
    }

    // Ação: CANCELAR
    if (action === 'CANCEL' || status === 'CANCELADO') {
      const updated = updateQuote(params.id, {
        status: 'CANCELADO',
        notes: notes || 'Orçamento cancelado.',
      });
      return NextResponse.json({
        success: true,
        message: 'Orçamento cancelado.',
        quote: updated,
      });
    }

    // Atualizações de campos comerciais normais
    const updatesToApply: any = {};
    if (status !== undefined) updatesToApply.status = status;
    if (notes !== undefined) updatesToApply.notes = notes;
    if (selectedDev !== undefined) updatesToApply.selectedDev = selectedDev;
    if (initialDevPrice !== undefined) updatesToApply.initialDevPrice = Number(initialDevPrice);
    if (monthlyPrice !== undefined) updatesToApply.monthlyPrice = Number(monthlyPrice);
    if (discount !== undefined) updatesToApply.discount = Number(discount);
    if (finalPrice !== undefined) updatesToApply.finalPrice = Number(finalPrice);
    if (paymentMethodChoice !== undefined) updatesToApply.paymentMethodChoice = paymentMethodChoice;
    if (billingPeriodicity !== undefined) updatesToApply.billingPeriodicity = billingPeriodicity;
    if (dueDay !== undefined) updatesToApply.dueDay = Number(dueDay);
    if (estimatedBudget !== undefined) updatesToApply.estimatedBudget = estimatedBudget;
    if (desiredDeadline !== undefined) updatesToApply.desiredDeadline = desiredDeadline;
    if (projectType !== undefined) updatesToApply.projectType = projectType;
    if (company !== undefined) updatesToApply.company = company;
    if (cnpjCpf !== undefined) updatesToApply.cnpjCpf = cnpjCpf;

    const updated = updateQuote(params.id, updatesToApply);

    if (!updated) {
      return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
    }

    logActivity({
      actor: responsible,
      action: 'EDITAR_ORCAMENTO',
      category: 'ORCAMENTO',
      targetId: params.id,
      targetNumber: updated.quoteNumber,
      description: `${responsible} alterou as condições comerciais do orçamento ${updated.quoteNumber || params.id}.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Orçamento atualizado com sucesso!',
      quote: updated,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar orçamento:', error);
    return NextResponse.json({ error: error.message || 'Erro ao atualizar orçamento.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = deleteQuote(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Orçamento excluído com sucesso.',
      id: params.id,
    });
  } catch (error: any) {
    console.error('Erro ao excluir orçamento:', error);
    return NextResponse.json({ error: 'Erro ao excluir orçamento.' }, { status: 500 });
  }
}
