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
    const {
      projectId,
      databaseName,
      backupDate,
      fileName,
      storageLocation,
      fileSize,
      status,
      notes,
    } = body;

    const dataToUpdate: any = {};
    if (projectId !== undefined) dataToUpdate.projectId = projectId || null;
    if (databaseName !== undefined) dataToUpdate.databaseName = databaseName;
    if (backupDate !== undefined) dataToUpdate.backupDate = backupDate ? new Date(backupDate) : new Date();
    if (fileName !== undefined) dataToUpdate.fileName = fileName;
    if (storageLocation !== undefined) dataToUpdate.storageLocation = storageLocation;
    if (fileSize !== undefined) dataToUpdate.fileSize = fileSize;
    if (status !== undefined) dataToUpdate.status = status;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const backup = await prisma.mzBackup.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ backup });
  } catch (error: any) {
    console.error('Erro ao atualizar registro de backup:', error);
    return NextResponse.json({ error: 'Erro ao atualizar registro de backup.' }, { status: 500 });
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

    await prisma.mzBackup.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Registro de backup removido.' });
  } catch (error: any) {
    console.error('Erro ao remover registro de backup:', error);
    return NextResponse.json({ error: 'Erro ao remover registro de backup.' }, { status: 500 });
  }
}
