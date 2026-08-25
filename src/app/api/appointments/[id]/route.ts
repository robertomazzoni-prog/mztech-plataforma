import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getUserFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, notes } = body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    // Se for cliente comum, só pode cancelar seu próprio agendamento
    if (session.role === 'CLIENT') {
      const isOwner =
        appointment.userId === session.id ||
        appointment.clientPhone === session.phone ||
        appointment.clientEmail === session.email;

      if (!isOwner) {
        return NextResponse.json({ error: 'Acesso não permitido.' }, { status: 403 });
      }

      if (status !== 'CANCELLED') {
        return NextResponse.json(
          { error: 'Clientes só podem solicitar o cancelamento do agendamento.' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        service: true,
        barber: true,
      },
    });

    return NextResponse.json({
      message: 'Status atualizado com sucesso!',
      appointment: updated,
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar agendamento.' },
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
    if (!session || (session.role !== 'ADMIN' && session.role !== 'BARBER')) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const { id } = params;
    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Agendamento excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao excluir agendamento.' }, { status: 500 });
  }
}
