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
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (type && type !== 'ALL') where.type = type;
    if (status && status !== 'ALL') where.status = status;

    const maintenances = await prisma.mzMaintenance.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        client: {
          select: { id: true, companyName: true, contactName: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ maintenances });
  } catch (error: any) {
    console.error('Erro ao listar manutenções:', error);
    return NextResponse.json({ error: 'Erro ao buscar manutenções.' }, { status: 500 });
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
    const { clientId, projectId, date, type, description, responsible, status, notes } = body;

    if (!clientId || !type || !description) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: Cliente, Tipo e Descrição da manutenção.' },
        { status: 400 }
      );
    }

    const maintenance = await prisma.mzMaintenance.create({
      data: {
        clientId,
        projectId: projectId || null,
        date: date ? new Date(date) : new Date(),
        type,
        description,
        responsible: responsible || 'mzTech Equipe',
        status: status || 'CONCLUIDO',
        notes: notes || null,
      },
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ maintenance }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao cadastrar manutenção:', error);
    return NextResponse.json({ error: 'Erro ao criar registro de manutenção.' }, { status: 500 });
  }
}
