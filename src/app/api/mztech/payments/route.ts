import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ensureDatabaseReady } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';

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
    const status = searchParams.get('status');

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status && status !== 'ALL') where.status = status;

    const payments = await prisma.mzPayment.findMany({
      where,
      orderBy: { dueDate: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          },
        },
        subscription: {
          select: {
            id: true,
            planName: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Erro ao buscar pagamentos mzTech:', error);
    return NextResponse.json({ error: 'Erro ao buscar pagamentos.' }, { status: 500 });
  }
}
