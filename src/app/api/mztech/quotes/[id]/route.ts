import { NextRequest, NextResponse } from 'next/server';
import { updateQuote, deleteQuote, getStoredQuotes } from '@/lib/quotes-store';
import { finalizeQuoteAndRegisterProject } from '@/lib/mz-entities-store';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, notes, selectedDev, estimatedBudget, desiredDeadline } = body;

    const updated = updateQuote(params.id, {
      status,
      notes,
      selectedDev,
      estimatedBudget,
      desiredDeadline,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
    }

    // Se o status foi marcado como 'CONCLUIDO' (Projeto Finalizado),
    // registra automaticamente nas abas de Clientes e Projetos!
    let registeredData = null;
    if (status === 'CONCLUIDO') {
      registeredData = await finalizeQuoteAndRegisterProject(updated);
    }

    return NextResponse.json({
      success: true,
      message:
        status === 'CONCLUIDO'
          ? 'Projeto finalizado e registrado automaticamente nas abas Clientes e Projetos!'
          : 'Orçamento atualizado com sucesso!',
      quote: updated,
      registered: registeredData,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar orçamento:', error);
    return NextResponse.json({ error: 'Erro ao atualizar orçamento.' }, { status: 500 });
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
