import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';
import {
  updateStoredService,
  deleteStoredService,
  getStoredServices,
} from '@/lib/mz-entities-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const services = getStoredServices();
    const service = services.find((s) => s.id === params.id);
    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ service });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao buscar serviço.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, type, price, recurrence, status, active, features } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (description !== undefined) dataToUpdate.description = description;
    if (type !== undefined) dataToUpdate.type = type;
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (recurrence !== undefined) dataToUpdate.recurrence = recurrence;
    if (status !== undefined) dataToUpdate.status = status;
    if (active !== undefined) dataToUpdate.active = Boolean(active);
    if (features !== undefined) dataToUpdate.features = Array.isArray(features) ? features : [];

    const updated = updateStoredService(params.id, dataToUpdate);

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        await prisma.mzService.update({
          where: { id: params.id },
          data: {
            ...(dataToUpdate.name && { name: dataToUpdate.name }),
            ...(dataToUpdate.description !== undefined && { description: dataToUpdate.description }),
            ...(dataToUpdate.type && { type: dataToUpdate.type }),
            ...(dataToUpdate.price !== undefined && { price: dataToUpdate.price }),
            ...(dataToUpdate.recurrence && { recurrence: dataToUpdate.recurrence }),
            ...(dataToUpdate.status && { status: dataToUpdate.status }),
            ...(dataToUpdate.active !== undefined && { active: dataToUpdate.active }),
          },
        });
      } catch (e) {}
    }

    return NextResponse.json({ service: updated || { id: params.id, ...dataToUpdate } });
  } catch (error: any) {
    console.error('Erro ao atualizar serviço mzTech:', error);
    return NextResponse.json({ error: 'Erro ao atualizar serviço.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    deleteStoredService(params.id);

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        await prisma.mzService.delete({
          where: { id: params.id },
        });
      } catch (e) {}
    }

    return NextResponse.json({ success: true, message: 'Serviço removido com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao remover serviço mzTech:', error);
    return NextResponse.json({ error: 'Erro ao remover serviço.' }, { status: 500 });
  }
}
