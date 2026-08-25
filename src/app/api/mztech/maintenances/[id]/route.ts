import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ensureDatabaseReady } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabaseReady();

    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, date, type, description, responsible, status, notes } = body;

    const dataToUpdate: any = {};
    if (projectId !== undefined) dataToUpdate.projectId = projectId || null;
    if (date !== undefined) dataToUpdate.date = date ? new Date(date) : new Date();
    if (type !== undefined) dataToUpdate.type = type;
    if (description !== undefined) dataToUpdate.description = description;
    if (responsible !== undefined) dataToUpdate.responsible = responsible;
    if (status !== undefined) dataToUpdate.status = status;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const maintenance = await prisma.mzMaintenance.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ maintenance });
  } catch (error: any) {
    console.error('Erro ao atualizar manutenção:', error);
    return NextResponse.json({ error: 'Erro ao atualizar manutenção.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabaseReady();

    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    await prisma.mzMaintenance.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Registro de manutenção removido.' });
  } catch (error: any) {
    console.error('Erro ao remover manutenção:', error);
    return NextResponse.json({ error: 'Erro ao remover manutenção.' }, { status: 500 });
  }
}
