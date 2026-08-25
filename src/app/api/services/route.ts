import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { ensureDatabaseReady } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const all = searchParams.get('all') === 'true';

    const whereClause: any = {};
    if (!all) {
      whereClause.active = true;
    }
    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: [{ popular: 'desc' }, { price: 'asc' }],
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return NextResponse.json({ error: 'Erro ao listar serviços.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();

    const session = getUserFromRequest(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'BARBER')) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, category, description, price, durationMinutes, imageUrl, popular } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Nome e preço são obrigatórios.' }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        category: category || 'OUTROS',
        description: description || '',
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes, 10) || 30,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop',
        popular: !!popular,
      },
    });

    return NextResponse.json({ service, message: 'Serviço adicionado com sucesso!' }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return NextResponse.json({ error: 'Erro ao criar serviço.' }, { status: 500 });
  }
}
