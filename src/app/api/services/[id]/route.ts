import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getUserFromRequest(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'BARBER')) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const { id } = params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        appointments: true,
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 });
    }

    // Se houver agendamentos atrelados a este serviço, desativamos para manter o histórico
    if (service.appointments.length > 0) {
      await prisma.service.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({
        message: 'Serviço desativado e removido do catálogo público com sucesso (histórico preservado).',
      });
    } else {
      // Se não houver agendamentos, podemos excluir permanentemente
      await prisma.service.delete({
        where: { id },
      });
      return NextResponse.json({
        message: 'Serviço excluído permanentemente com sucesso!',
      });
    }
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    return NextResponse.json({ error: 'Erro ao remover serviço.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getUserFromRequest(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'BARBER')) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, category, description, price, durationMinutes, imageUrl, popular, active } = body;

    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(durationMinutes !== undefined && { durationMinutes: parseInt(durationMinutes, 10) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(popular !== undefined && { popular: !!popular }),
        ...(active !== undefined && { active: !!active }),
      },
    });

    return NextResponse.json({
      message: 'Serviço atualizado com sucesso!',
      service: updated,
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return NextResponse.json({ error: 'Erro ao atualizar serviço.' }, { status: 500 });
  }
}
