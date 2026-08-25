import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { ensureDatabaseReady } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

// GET: Detalhes de um barbeiro
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabaseReady();
    const { id } = params;

    const barber = await prisma.barber.findUnique({
      where: { id },
      include: {
        appointments: {
          take: 10,
          orderBy: [{ date: 'desc' }, { timeSlot: 'desc' }],
        },
      },
    });

    if (!barber) {
      return NextResponse.json({ error: 'Barbeiro não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ barber });
  } catch (error) {
    console.error('Erro ao buscar barbeiro:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados do profissional.' }, { status: 500 });
  }
}

// PATCH: Editar barbeiro ou ativar/desativar
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabaseReady();
    const session = getUserFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const existing = await prisma.barber.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Barbeiro não encontrado.' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.bio !== undefined) updateData.bio = body.bio.trim();
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl.trim();
    if (body.specialties !== undefined) updateData.specialties = body.specialties.trim();
    if (body.workingHoursStart !== undefined) updateData.workingHoursStart = body.workingHoursStart;
    if (body.workingHoursEnd !== undefined) updateData.workingHoursEnd = body.workingHoursEnd;
    if (body.lunchStart !== undefined) updateData.lunchStart = body.lunchStart;
    if (body.lunchEnd !== undefined) updateData.lunchEnd = body.lunchEnd;
    if (body.workingDays !== undefined) updateData.workingDays = body.workingDays;
    if (body.active !== undefined) updateData.active = Boolean(body.active);

    const updated = await prisma.barber.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      barber: updated,
      message: 'Dados do barbeiro atualizados com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao atualizar barbeiro:', error);
    return NextResponse.json({ error: 'Erro ao atualizar dados do profissional.' }, { status: 500 });
  }
}

// DELETE: Remover barbeiro
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabaseReady();
    const session = getUserFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const { id } = params;

    const existing = await prisma.barber.findUnique({
      where: { id },
      include: { _count: { select: { appointments: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Barbeiro não encontrado.' }, { status: 404 });
    }

    // Se já tiver agendamentos vinculados, faz soft delete para não corromper histórico
    if (existing._count.appointments > 0) {
      await prisma.barber.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({
        message: 'O barbeiro possui histórico de agendamentos e foi desativado com segurança.',
        softDeleted: true,
      });
    }

    await prisma.barber.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Barbeiro removido com sucesso!',
      softDeleted: false,
    });
  } catch (error) {
    console.error('Erro ao deletar barbeiro:', error);
    return NextResponse.json({ error: 'Erro ao remover profissional.' }, { status: 500 });
  }
}
