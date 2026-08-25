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
    const provider = searchParams.get('provider');

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status && status !== 'ALL') where.status = status;
    if (provider && provider !== 'ALL') where.provider = provider;

    const hostings = await prisma.mzHosting.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { id: true, companyName: true, contactName: true, email: true, status: true },
        },
        project: {
          select: { id: true, name: true, domain: true },
        },
      },
    });

    return NextResponse.json({ hostings });
  } catch (error: any) {
    console.error('Erro ao listar hospedagens mzTech:', error);
    return NextResponse.json({ error: 'Erro ao buscar hospedagens.' }, { status: 500 });
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
      newClientName,
      projectId,
      provider,
      serverType,
      url,
      customDomain,
      platformDomain,
      startDate,
      renewalDate,
      cancellationDate,
      monthlyPrice,
      status,
      notes,
    } = body;

    let finalClientId = clientId;
    if ((!finalClientId || finalClientId === 'NEW') && newClientName) {
      const cleanName = newClientName.trim();
      let existingClient = await prisma.mzClient.findFirst({
        where: { companyName: { equals: cleanName, mode: 'insensitive' } },
      });

      if (!existingClient) {
        existingClient = await prisma.mzClient.create({
          data: {
            companyName: cleanName,
            contactName: cleanName,
            whatsapp: '5511999998888',
            email: `contato@${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'empresa'}.com.br`,
            status: 'ATIVO',
            notes: 'Cadastrado diretamente pelo módulo de hospedagens.',
          },
        });
      }

      finalClientId = existingClient.id;
    }

    if (!finalClientId || !url) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: Cliente e URL da aplicação.' },
        { status: 400 }
      );
    }

    const hosting = await prisma.mzHosting.create({
      data: {
        clientId: finalClientId,
        projectId: projectId || null,
        provider: provider || 'Railway',
        serverType: serverType || 'Cloud App',
        url,
        customDomain: customDomain || null,
        platformDomain: platformDomain || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        cancellationDate: cancellationDate ? new Date(cancellationDate) : null,
        monthlyPrice: monthlyPrice !== undefined ? parseFloat(monthlyPrice) : 39.90,
        status: status || 'ATIVO',
        notes: notes || null,
      },
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ hosting }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao cadastrar hospedagem:', error);
    return NextResponse.json({ error: 'Erro ao criar hospedagem.' }, { status: 500 });
  }
}
