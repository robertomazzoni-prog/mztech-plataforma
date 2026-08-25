import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';
import {
  getStoredSubscriptions,
  createStoredSubscription,
  getStoredClientById,
} from '@/lib/mz-entities-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    let subscriptions = getStoredSubscriptions();

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        const where: any = {};
        if (clientId) where.clientId = clientId;

        const dbSubs = await prisma.mzSubscription.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
                email: true,
              },
            },
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        if (dbSubs && dbSubs.length > 0) {
          subscriptions = dbSubs as any;
        }
      } catch (e) {}
    }

    if (clientId) {
      subscriptions = subscriptions.filter((s) => s.clientId === clientId);
    }

    return NextResponse.json({ subscriptions });
  } catch (error: any) {
    console.error('Erro ao buscar assinaturas mzTech:', error);
    return NextResponse.json({ error: 'Erro ao buscar assinaturas.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, projectId, planName, amount, paymentMethod, periodicity } = body;

    if (!clientId || !planName || !amount) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: clientId, planName, amount.' },
        { status: 400 }
      );
    }

    const client = getStoredClientById(clientId);

    const subscription = createStoredSubscription({
      clientId,
      client: client ? {
        id: client.id,
        companyName: client.companyName,
        contactName: client.contactName,
        email: client.email,
      } : undefined,
      projectId: projectId || null,
      planName,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'CREDIT_CARD',
      periodicity: periodicity || 'MENSAL',
      status: 'ACTIVE',
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar assinatura mzTech:', error);
    return NextResponse.json({ error: error?.message || 'Erro ao criar assinatura.' }, { status: 500 });
  }
}
