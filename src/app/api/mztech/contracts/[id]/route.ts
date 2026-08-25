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

    const contract = await prisma.mzContract.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        project: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contrato não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ contract });
  } catch (error: any) {
    console.error('Erro ao buscar contrato:', error);
    return NextResponse.json({ error: 'Erro ao buscar contrato.' }, { status: 500 });
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
      title,
      content,
      totalDevPrice,
      monthlyPrice,
      paymentMethod,
      termsVersion,
      codeOwnershipType,
      scopeDevelopment,
      scopeHosting,
      scopeMaintenance,
      scopeSupport,
      backupRetentionDays,
      migrationExcluded,
      status,
      signedAt,
      notes,
    } = body;

    const dataToUpdate: any = {};
    if (clientId !== undefined) dataToUpdate.clientId = clientId;
    if (projectId !== undefined) {
      dataToUpdate.projectId =
        projectId && !projectId.startsWith('PLAN_') && projectId.trim() !== ''
          ? projectId
          : null;
    }
    if (title !== undefined) dataToUpdate.title = title;
    if (content !== undefined) dataToUpdate.content = content;
    if (totalDevPrice !== undefined) dataToUpdate.totalDevPrice = parseFloat(totalDevPrice);
    if (monthlyPrice !== undefined) dataToUpdate.monthlyPrice = parseFloat(monthlyPrice);
    if (paymentMethod !== undefined) dataToUpdate.paymentMethod = paymentMethod;
    if (termsVersion !== undefined) dataToUpdate.termsVersion = termsVersion;
    if (codeOwnershipType !== undefined) dataToUpdate.codeOwnershipType = codeOwnershipType;
    if (scopeDevelopment !== undefined) dataToUpdate.scopeDevelopment = scopeDevelopment;
    if (scopeHosting !== undefined) dataToUpdate.scopeHosting = scopeHosting;
    if (scopeMaintenance !== undefined) dataToUpdate.scopeMaintenance = scopeMaintenance;
    if (scopeSupport !== undefined) dataToUpdate.scopeSupport = scopeSupport;
    if (backupRetentionDays !== undefined)
      dataToUpdate.backupRetentionDays = parseInt(backupRetentionDays, 10);
    if (migrationExcluded !== undefined) dataToUpdate.migrationExcluded = Boolean(migrationExcluded);
    if (status !== undefined) dataToUpdate.status = status;
    if (signedAt !== undefined) dataToUpdate.signedAt = signedAt ? new Date(signedAt) : null;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const contract = await prisma.mzContract.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ contract });
  } catch (error: any) {
    console.error('Erro ao atualizar contrato:', error);
    return NextResponse.json({ error: 'Erro ao atualizar contrato.' }, { status: 500 });
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

    await prisma.mzContract.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Contrato removido com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao remover contrato:', error);
    return NextResponse.json({ error: 'Erro ao remover contrato.' }, { status: 500 });
  }
}
