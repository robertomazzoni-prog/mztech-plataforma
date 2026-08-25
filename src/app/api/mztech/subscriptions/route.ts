import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';
import {
  getStoredSubscriptions,
  createStoredSubscription,
  deleteStoredSubscription,
  getStoredClientById,
} from '@/lib/mz-entities-store';
import { logActivity } from '@/lib/audit-store';

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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da assinatura é obrigatório.' }, { status: 400 });
    }

    deleteStoredSubscription(id);

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        await prisma.mzSubscription.deleteMany({
          where: { id },
        });
      } catch (e) {}
    }

    logActivity({
      actor: 'Administrador',
      action: 'CANCELAR_ASSINATURA',
      category: 'PAGAMENTO',
      targetId: id,
      description: `Assinatura recorrente ${id} foi cancelada/excluída.`,
    });

    return NextResponse.json({ success: true, message: 'Assinatura cancelada com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao cancelar assinatura:', error);
    return NextResponse.json({ error: 'Erro ao cancelar assinatura.' }, { status: 500 });
  }
}
