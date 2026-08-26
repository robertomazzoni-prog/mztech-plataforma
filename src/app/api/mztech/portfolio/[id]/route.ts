import { NextRequest, NextResponse } from 'next/server';
import {
  updatePortfolioItem,
  deletePortfolioItem,
  getStoredPortfolio,
} from '@/lib/portfolio-store';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getUserFromRequest(req);
    if (session && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const updated = updatePortfolioItem(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: 'Item do portfólio não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Item do portfólio atualizado com sucesso!',
      item: updated,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar item do portfólio:', error);
    return NextResponse.json(
      { error: 'Erro ao processar atualização do item.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getUserFromRequest(req);
    if (session && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const { id } = params;
    const ok = deletePortfolioItem(id);

    if (!ok) {
      return NextResponse.json(
        { error: 'Item do portfólio não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Item removido do portfólio com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao excluir item do portfólio:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir item do portfólio.' },
      { status: 500 }
    );
  }
}
