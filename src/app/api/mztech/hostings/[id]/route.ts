import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ensureDatabaseReady } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabaseReady();

    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const hosting = await prisma.mzHosting.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        project: true,
      },
    });

    if (!hosting) {
      return NextResponse.json({ error: 'Hospedagem não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ hosting });
  } catch (error: any) {
    console.error('Erro ao buscar hospedagem:', error);
    return NextResponse.json({ error: 'Erro ao buscar hospedagem.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabaseReady();

    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      clientId,
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

    const dataToUpdate: any = {};
    if (clientId !== undefined) dataToUpdate.clientId = clientId;
    if (projectId !== undefined) dataToUpdate.projectId = projectId || null;
    if (provider !== undefined) dataToUpdate.provider = provider;
    if (serverType !== undefined) dataToUpdate.serverType = serverType;
    if (url !== undefined) dataToUpdate.url = url;
    if (customDomain !== undefined) dataToUpdate.customDomain = customDomain || null;
    if (platformDomain !== undefined) dataToUpdate.platformDomain = platformDomain || null;
    if (startDate !== undefined) dataToUpdate.startDate = startDate ? new Date(startDate) : new Date();
    if (renewalDate !== undefined) dataToUpdate.renewalDate = renewalDate ? new Date(renewalDate) : null;
    if (cancellationDate !== undefined)
      dataToUpdate.cancellationDate = cancellationDate ? new Date(cancellationDate) : null;
    if (monthlyPrice !== undefined) dataToUpdate.monthlyPrice = parseFloat(monthlyPrice);
    if (status !== undefined) dataToUpdate.status = status;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const hosting = await prisma.mzHosting.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ hosting });
  } catch (error: any) {
    console.error('Erro ao atualizar hospedagem:', error);
    return NextResponse.json({ error: 'Erro ao atualizar hospedagem.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabaseReady();

    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    await prisma.mzHosting.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Hospedagem removida com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao remover hospedagem:', error);
    return NextResponse.json({ error: 'Erro ao remover hospedagem.' }, { status: 500 });
  }
}
