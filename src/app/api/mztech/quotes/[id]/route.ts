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
    if (body.name !== undefined) updatesToApply.name = body.name.trim();
    if (body.company !== undefined) updatesToApply.company = body.company?.trim() || null;
    if (body.cnpjCpf !== undefined) updatesToApply.cnpjCpf = body.cnpjCpf?.trim() || null;
    if (body.whatsapp !== undefined) updatesToApply.whatsapp = body.whatsapp.trim();
    if (body.email !== undefined) updatesToApply.email = body.email.trim();
    if (body.selectedDev !== undefined) updatesToApply.selectedDev = body.selectedDev;
    if (body.projectType !== undefined) updatesToApply.projectType = body.projectType;
    if (body.serviceId !== undefined) updatesToApply.serviceId = body.serviceId;
    if (body.hasDomain !== undefined) updatesToApply.hasDomain = body.hasDomain;
    if (body.needsHosting !== undefined) updatesToApply.needsHosting = body.needsHosting;
    if (body.needsMaintenance !== undefined) updatesToApply.needsMaintenance = body.needsMaintenance;
    if (body.projectDescription !== undefined) updatesToApply.projectDescription = body.projectDescription;
    
    if (body.initialDevPrice !== undefined) {
      const parsedInit = Number(body.initialDevPrice);
      updatesToApply.initialDevPrice = isNaN(parsedInit) ? 0 : parsedInit;
      
      const disc = body.discount !== undefined ? Number(body.discount) : 0;
      updatesToApply.discount = isNaN(disc) ? 0 : disc;
      
      if (body.finalPrice !== undefined && body.finalPrice !== null && !isNaN(Number(body.finalPrice))) {
        updatesToApply.finalPrice = Number(body.finalPrice);
      } else {
        updatesToApply.finalPrice = updatesToApply.initialDevPrice - updatesToApply.discount;
      }
    } else if (body.discount !== undefined) {
      const disc = Number(body.discount);
      updatesToApply.discount = isNaN(disc) ? 0 : disc;
    }

    if (body.monthlyPrice !== undefined) {
      const parsedMonth = Number(body.monthlyPrice);
      updatesToApply.monthlyPrice = isNaN(parsedMonth) ? 0 : parsedMonth;
    }

    if (body.paymentMethodChoice !== undefined) updatesToApply.paymentMethodChoice = body.paymentMethodChoice;
    if (body.billingPeriodicity !== undefined) updatesToApply.billingPeriodicity = body.billingPeriodicity;
    if (body.dueDay !== undefined) updatesToApply.dueDay = Number(body.dueDay);
    if (body.estimatedBudget !== undefined) updatesToApply.estimatedBudget = body.estimatedBudget;
    if (body.desiredDeadline !== undefined) updatesToApply.desiredDeadline = body.desiredDeadline;
    if (body.status !== undefined) updatesToApply.status = body.status;
    if (body.notes !== undefined) updatesToApply.notes = body.notes;

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
    const success = await deleteQuote(params.id);
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
