import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { ensureDatabaseReady } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();

    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const whereClause: any = {};
    if (!all) {
      whereClause.active = true;
    }

    const barbers = await prisma.barber.findMany({
      where: whereClause,
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
    });

    return NextResponse.json({ barbers });
  } catch (error) {
    console.error('Erro ao buscar barbeiros:', error);
    return NextResponse.json({ error: 'Erro ao listar profissionais.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();

    const session = getUserFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      bio,
      avatarUrl,
      specialties,
      workingHoursStart,
      workingHoursEnd,
      lunchStart,
      lunchEnd,
      workingDays,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome do barbeiro é obrigatório.' }, { status: 400 });
    }

    const barber = await prisma.barber.create({
      data: {
        name: name.trim(),
        bio: bio?.trim() || '',
        avatarUrl: avatarUrl?.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
        specialties: specialties?.trim() || 'Corte, Barba',
        workingHoursStart: workingHoursStart || '09:00',
        workingHoursEnd: workingHoursEnd || '19:00',
        lunchStart: lunchStart || '12:00',
        lunchEnd: lunchEnd || '13:00',
        workingDays: workingDays || '1,2,3,4,5,6',
      },
    });

    return NextResponse.json({ barber, message: 'Barbeiro cadastrado com sucesso!' }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar barbeiro:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar barbeiro.' }, { status: 500 });
  }
}
