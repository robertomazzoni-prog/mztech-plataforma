import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';
import {
  getStoredServices,
  createStoredService,
} from '@/lib/mz-entities-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const all = searchParams.get('all') === 'true';

    let services = getStoredServices();

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        const where: any = {};
        if (!all) where.active = true;
        if (type && type !== 'ALL') where.type = type;

        const dbServices = await prisma.mzService.findMany({
          where,
          orderBy: [{ price: 'asc' }],
        });
        if (dbServices && dbServices.length > 0) {
          services = dbServices;
        }
      } catch (e) {}
    }

    if (!all) {
      services = services.filter((s) => s.active !== false && s.status !== 'INATIVO');
    }
    if (type && type !== 'ALL') {
      services = services.filter((s) => s.type === type);
    }

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error('Erro ao listar serviços mzTech:', error);
    return NextResponse.json({ error: 'Erro ao buscar serviços.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, type, price, recurrence, status, active, features } = body;

    if (!name || !type || price === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: Nome, Tipo e Preço.' },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(price);
    const newService = createStoredService({
      name: name.trim(),
      description: description || '',
      type,
      price: isNaN(parsedPrice) ? 0 : parsedPrice,
      recurrence: recurrence || 'UNICA',
      status: status || 'ATIVO',
      active: active !== undefined ? Boolean(active) : true,
      features: Array.isArray(features) ? features : [],
    });

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        await prisma.mzService.upsert({
          where: { id: newService.id },
          create: {
            id: newService.id,
            name: newService.name,
            description: newService.description,
            type: newService.type,
            price: newService.price,
            recurrence: newService.recurrence,
            status: newService.status,
            active: newService.active,
          },
          update: {
            name: newService.name,
            description: newService.description,
            type: newService.type,
            price: newService.price,
            recurrence: newService.recurrence,
            status: newService.status,
            active: newService.active,
          },
        });
      } catch (e) {}
    }

    return NextResponse.json({ service: newService }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao cadastrar serviço mzTech:', error);
    return NextResponse.json({ error: 'Erro ao criar serviço.' }, { status: 500 });
  }
}
