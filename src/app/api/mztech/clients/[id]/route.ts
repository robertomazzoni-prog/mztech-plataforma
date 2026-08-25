import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';
import {
  getStoredClientById,
  updateStoredClient,
  deleteStoredClient,
} from '@/lib/mz-entities-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // 1. Buscar no store em memória / JSON
    let client = getStoredClientById(params.id);

    // 2. Se não encontrou e o banco estiver online, busca no Prisma
    if (!client) {
      const dbOnline = await isDatabaseOnline();
      if (dbOnline) {
        try {
          const dbClient = await prisma.mzClient.findUnique({
            where: { id: params.id },
            include: {
              projects: true,
              hostings: true,
              maintenances: { orderBy: { date: 'desc' } },
              contracts: { orderBy: { createdAt: 'desc' } },
              backups: { orderBy: { backupDate: 'desc' } },
            },
          });
          if (dbClient) {
            client = dbClient;
          }
        } catch (err) {}
      }
    }

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error: any) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados do cliente.' }, { status: 500 });
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
    const {
      companyName,
      contactName,
      whatsapp,
      email,
      domain,
      status,
      startDate,
      notes,
      cancellationDate,
      terminationEffectiveDate,
      cancellationReason,
      terminatedServices,
      codeDelivered,
      backupDelivered,
      deliveredAt,
      deliveredBy,
      terminationNotes,
    } = body;

    const dataToUpdate: any = {};
    if (companyName !== undefined) dataToUpdate.companyName = companyName;
    if (contactName !== undefined) dataToUpdate.contactName = contactName;
    if (whatsapp !== undefined) dataToUpdate.whatsapp = whatsapp;
    if (email !== undefined) dataToUpdate.email = email;
    if (domain !== undefined) dataToUpdate.domain = domain;
    if (status !== undefined) dataToUpdate.status = status;
    if (startDate !== undefined) dataToUpdate.startDate = startDate ? new Date(startDate) : null;
    if (notes !== undefined) dataToUpdate.notes = notes;

    // Campos de cancelamento / encerramento
    if (cancellationDate !== undefined)
      dataToUpdate.cancellationDate = cancellationDate ? new Date(cancellationDate) : null;
    if (terminationEffectiveDate !== undefined)
      dataToUpdate.terminationEffectiveDate = terminationEffectiveDate ? new Date(terminationEffectiveDate) : null;
    if (cancellationReason !== undefined) dataToUpdate.cancellationReason = cancellationReason;
    if (terminatedServices !== undefined) dataToUpdate.terminatedServices = terminatedServices;
    if (codeDelivered !== undefined) dataToUpdate.codeDelivered = Boolean(codeDelivered);
    if (backupDelivered !== undefined) dataToUpdate.backupDelivered = Boolean(backupDelivered);
    if (deliveredAt !== undefined) dataToUpdate.deliveredAt = deliveredAt ? new Date(deliveredAt) : null;
    if (deliveredBy !== undefined) dataToUpdate.deliveredBy = deliveredBy;
    if (terminationNotes !== undefined) dataToUpdate.terminationNotes = terminationNotes;

    // 1. Atualizar no store JSON / memória
    let client = updateStoredClient(params.id, dataToUpdate);

    // 2. Se banco online, sincronizar com Prisma
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        const dbClient = await prisma.mzClient.update({
          where: { id: params.id },
          data: dataToUpdate,
        });

        if (status === 'ENCERRADO') {
          await prisma.mzHosting.updateMany({
            where: { clientId: params.id, status: 'ATIVO' },
            data: { status: 'ENCERRADO', cancellationDate: new Date() },
          }).catch(() => {});
        } else if (status === 'CANCELAMENTO_SOLICITADO') {
          await prisma.mzHosting.updateMany({
            where: { clientId: params.id, status: 'ATIVO' },
            data: { status: 'CANCELAMENTO_SOLICITADO' },
          }).catch(() => {});
        }

        if (!client) client = dbClient;
      } catch (err) {}
    }

    return NextResponse.json({ client: client || { id: params.id, ...dataToUpdate } });
  } catch (error: any) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cliente.' }, { status: 500 });
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

    // 1. Deletar do store local JSON e memória
    const deletedLocally = deleteStoredClient(params.id);

    // 2. Se o banco PostgreSQL estiver online, deletar em cascata
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        await prisma.mzHosting.deleteMany({ where: { clientId: params.id } }).catch(() => {});
        await prisma.mzProject.deleteMany({ where: { clientId: params.id } }).catch(() => {});
        await prisma.mzBackup.deleteMany({ where: { clientId: params.id } }).catch(() => {});
        await prisma.mzMaintenance.deleteMany({ where: { clientId: params.id } }).catch(() => {});
        await prisma.mzContract.deleteMany({ where: { clientId: params.id } }).catch(() => {});
        await prisma.mzClient.delete({ where: { id: params.id } }).catch(() => {});
      } catch (err) {
        console.warn('Erro ao deletar no Prisma (ignorado se deletado em memória):', err);
      }
    }

    return NextResponse.json({ success: true, message: 'Cliente removido com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao remover cliente:', error);
    return NextResponse.json({ error: 'Erro ao remover cliente.' }, { status: 500 });
  }
}
