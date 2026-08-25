import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ensureDatabaseReady } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();

    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status && status !== 'ALL') where.status = status;

    const backups = await prisma.mzBackup.findMany({
      where,
      orderBy: { backupDate: 'desc' },
      include: {
        client: {
          select: { id: true, companyName: true, contactName: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ backups });
  } catch (error: any) {
    console.error('Erro ao listar registros de backup:', error);
    return NextResponse.json({ error: 'Erro ao buscar registros de backup.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();

    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      clientId,
      projectId,
      databaseName,
      backupDate,
      fileName,
      storageLocation,
      fileSize,
      status,
      notes,
    } = body;

    if (!clientId || !fileName || !storageLocation) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: Cliente, Nome do Arquivo e Local de Armazenamento.' },
        { status: 400 }
      );
    }

    const backup = await prisma.mzBackup.create({
      data: {
        clientId,
        projectId: projectId || null,
        databaseName: databaseName || 'PostgreSQL (Railway)',
        backupDate: backupDate ? new Date(backupDate) : new Date(),
        fileName,
        storageLocation,
        fileSize: fileSize || null,
        status: status || 'VALIDO',
        notes: notes || null,
      },
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ backup }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao registrar backup manual:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar registro de backup.' }, { status: 500 });
  }
}
