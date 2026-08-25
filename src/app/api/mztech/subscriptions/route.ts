import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ensureDatabaseReady } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';
import { paymentService } from '@/lib/payment/payment-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    await ensureDatabaseReady();

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    const where: any = {};
    if (clientId) where.clientId = clientId;

    const subscriptions = await prisma.mzSubscription.findMany({
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
        payments: {
          orderBy: { dueDate: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({ subscriptions });
  } catch (error: any) {
    console.error('Erro ao buscar assinaturas mzTech:', error);
    return NextResponse.json({ error: 'Erro ao buscar assinaturas.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { clientId, projectId, planName, amount, paymentMethod, periodicity } = body;

    if (!clientId || !planName || !amount) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: clientId, planName, amount.' },
        { status: 400 }
      );
    }

    const result = await paymentService.createSubscriptionForClient({
      clientId,
      projectId,
      planName,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'CREDIT_CARD',
      periodicity: periodicity || 'MENSAL',
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar assinatura mzTech:', error);
    return NextResponse.json({ error: error?.message || 'Erro ao criar assinatura.' }, { status: 500 });
  }
}
