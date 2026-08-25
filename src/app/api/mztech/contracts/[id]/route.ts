import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';
import {
  getStoredContracts,
  updateStoredContract,
  deleteStoredContract,
} from '@/lib/mz-entities-store';
import { logActivity } from '@/lib/audit-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contracts = getStoredContracts();
    const contract = contracts.find((c) => c.id === params.id);

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
    const body = await req.json();
    const {
      action,
      clientName,
      title,
      content,
      totalDevPrice,
      monthlyPrice,
      discount,
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

    // Ação: ACEITE DIGITAL DO CLIENTE
    if (action === 'ACCEPT_ONLINE') {
      const nowStr = new Date().toISOString();
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'Browser Web';

      const updated = updateStoredContract(params.id, {
        status: 'ATIVO',
        acceptedOnline: true,
        acceptedAt: nowStr,
        acceptedIp: ip,
        acceptedUserAgent: userAgent,
        signedAt: nowStr,
      });

      if (updated) {
        logActivity({
          actor: clientName || updated.client?.contactName || 'Cliente',
          action: 'ACEITE_CONTRATO',
          category: 'CONTRATO',
          targetId: params.id,
          targetNumber: updated.contractNumber,
          description: `Cliente "${updated.client?.companyName || updated.client?.contactName}" aceitou e assinou digitalmente o contrato ${updated.contractNumber || params.id}.`,
          details: { ip, userAgent, timestamp: nowStr },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Contrato aceito e assinado digitalmente com sucesso!',
        contract: updated,
      });
    }

    // Atualização normal
    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (content !== undefined) dataToUpdate.content = content;
    if (totalDevPrice !== undefined) dataToUpdate.totalDevPrice = parseFloat(totalDevPrice);
    if (monthlyPrice !== undefined) dataToUpdate.monthlyPrice = parseFloat(monthlyPrice);
    if (discount !== undefined) dataToUpdate.discount = parseFloat(discount);
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
    if (signedAt !== undefined) dataToUpdate.signedAt = signedAt ? new Date(signedAt).toISOString() : null;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const updated = updateStoredContract(params.id, dataToUpdate);

    if (!updated) {
      return NextResponse.json({ error: 'Contrato não encontrado.' }, { status: 404 });
    }

    const user = getUserFromRequest(req);
    logActivity({
      actor: user?.name || 'Administrador',
      action: 'EDITAR_CONTRATO',
      category: 'CONTRATO',
      targetId: params.id,
      targetNumber: updated.contractNumber,
      description: `Contrato ${updated.contractNumber || params.id} atualizado. Status: ${updated.status}.`,
    });

    return NextResponse.json({ contract: updated });
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
    const success = deleteStoredContract(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Contrato não encontrado.' }, { status: 404 });
    }

    const user = getUserFromRequest(req);
    logActivity({
      actor: user?.name || 'Administrador',
      action: 'EXCLUIR_CONTRATO',
      category: 'CONTRATO',
      targetId: params.id,
      description: `Contrato ${params.id} foi excluído do sistema.`,
    });

    return NextResponse.json({ success: true, message: 'Contrato removido com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao remover contrato:', error);
    return NextResponse.json({ error: 'Erro ao remover contrato.' }, { status: 500 });
  }
}
