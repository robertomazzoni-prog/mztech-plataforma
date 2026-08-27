import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';
import {
  getStoredContracts,
  updateStoredContract,
  deleteStoredContract,
  generateBillingForSignedContract,
} from '@/lib/mz-entities-store';
import { logActivity } from '@/lib/audit-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contracts = getStoredContracts();
    const contract = contracts.find((c) => c.id === params.id || c.contractNumber === params.id);

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
      // Dados de Assinatura do Prestador
      providerName,
      providerSignatureDataUrl,
      // Dados de Assinatura do Cliente
      clientName,
      clientDocument,
      clientSignatureDataUrl,
      // Campos comuns
      assignedDev,
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

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser Web';
    const nowStr = new Date().toISOString();

    // 1. ASSINATURA DIGITAL DO PRESTADOR (Roberto / Morvan / mzTech)
    if (action === 'SIGN_PROVIDER') {
      const signer = providerName || 'Roberto Mazzoni';
      const certHash = `MZ-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`;

      const updated = updateStoredContract(params.id, {
        providerSigned: true,
        providerSignedBy: signer,
        providerSignedAt: nowStr,
        providerSignedIp: ip,
        providerSignatureDataUrl: providerSignatureDataUrl || null,
        signatureCertificateHash: certHash,
      });

      if (updated) {
        logActivity({
          actor: signer,
          action: 'ASSINATURA_PRESTADOR',
          category: 'CONTRATO',
          targetId: params.id,
          targetNumber: updated.contractNumber,
          description: `Prestador "${signer}" assinou digitalmente o contrato ${updated.contractNumber || params.id}.`,
          details: { ip, timestamp: nowStr, certHash },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Contrato assinado digitalmente com sucesso por ${signer}!`,
        contract: updated,
      });
    }

    // 2. ASSINATURA DIGITAL DO CLIENTE (Contratante)
    if (action === 'SIGN_CLIENT' || action === 'ACCEPT_ONLINE') {
      const contracts = getStoredContracts();
      const current = contracts.find((c) => c.id === params.id || c.contractNumber === params.id);
      const signer = clientName || current?.client?.contactName || 'Cliente';
      const certHash = current?.signatureCertificateHash || `MZ-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`;

      const updated = updateStoredContract(params.id, {
        clientSigned: true,
        clientSignedBy: signer,
        clientSignedDocument: clientDocument || current?.client?.cnpjCpf || null,
        clientSignedAt: nowStr,
        clientSignedIp: ip,
        clientSignedUserAgent: userAgent,
        clientSignatureDataUrl: clientSignatureDataUrl || null,
        acceptedOnline: true,
        acceptedAt: nowStr,
        acceptedIp: ip,
        acceptedUserAgent: userAgent,
        signedAt: nowStr,
        signatureCertificateHash: certHash,
        status: current?.providerSigned ? 'ATIVO' : (current?.status || 'AGUARDANDO_PAGAMENTO'),
      });

      if (updated) {
        logActivity({
          actor: signer,
          action: 'ACEITE_CONTRATO',
          category: 'CONTRATO',
          targetId: params.id,
          targetNumber: updated.contractNumber,
          description: `Cliente "${updated.client?.companyName || signer}" assinou e aceitou digitalmente o contrato ${updated.contractNumber || params.id}.`,
          details: { ip, userAgent, timestamp: nowStr, document: clientDocument },
        });

        // Libera e gera a cobrança inicial e assinatura no módulo financeiro agora que o cliente assinou
        generateBillingForSignedContract(params.id);
      }

      return NextResponse.json({
        success: true,
        message: 'Contrato aceito e assinado digitalmente com sucesso pelo cliente! Cobrança liberada.',
        contract: updated,
      });
    }

    // 3. Atualização normal de campos contratuais
    const dataToUpdate: any = {};
    if (assignedDev !== undefined) dataToUpdate.assignedDev = assignedDev;
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
