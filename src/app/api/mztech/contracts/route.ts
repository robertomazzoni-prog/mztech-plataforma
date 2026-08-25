import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';
import { DEFAULT_CONTRACT_TEMPLATE } from '@/data/mztech-constants';
import {
  getStoredContracts,
  saveStoredContracts,
  getStoredClients,
  getStoredProjects,
} from '@/lib/mz-entities-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    let contracts = getStoredContracts();

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        const where: any = {};
        if (clientId) where.clientId = clientId;
        if (status && status !== 'ALL') where.status = status;

        const dbContracts = await prisma.mzContract.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            client: {
              select: { id: true, companyName: true, contactName: true, email: true, whatsapp: true },
            },
            project: {
              select: { id: true, name: true, domain: true },
            },
          },
        });
        if (dbContracts && dbContracts.length > 0) {
          contracts = dbContracts as any;
        }
      } catch (e) {}
    }

    if (clientId) {
      contracts = contracts.filter((c) => c.clientId === clientId);
    }
    if (status && status !== 'ALL') {
      contracts = contracts.filter((c) => c.status === status);
    }

    return NextResponse.json({ contracts });
  } catch (error: any) {
    console.error('Erro ao listar contratos mzTech:', error);
    return NextResponse.json({ error: 'Erro ao buscar contratos.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      clientId,
      newClientName,
      projectId,
      assignedDev,
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

    let finalClientId = clientId;
    const clients = getStoredClients();
    const projects = getStoredProjects();

    let matchedClient = clients.find((c) => c.id === finalClientId);

    if ((!finalClientId || finalClientId === 'NEW') && newClientName) {
      const cleanName = newClientName.trim();
      matchedClient = clients.find((c) => c.companyName?.toLowerCase() === cleanName.toLowerCase());
      if (!matchedClient) {
        matchedClient = {
          id: `client-${Date.now()}`,
          companyName: cleanName,
          contactName: cleanName,
          whatsapp: '(31) 98684-7049',
          email: `contato@${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'empresa'}.com.br`,
          status: 'ATIVO',
          financialStatus: 'EM_DIA',
          notes: 'Cadastrado diretamente pelo módulo de contratos.',
          codeDelivered: false,
          backupDelivered: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      finalClientId = matchedClient.id;
    }

    if (!finalClientId || !title) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: Cliente e Título do Contrato.' },
        { status: 400 }
      );
    }

    const matchedProject = projects.find((p) => p.id === projectId);

    const nowStr = new Date().toISOString();
    const newContract: any = {
      id: `contrato-${Date.now()}`,
      clientId: finalClientId,
      client: matchedClient
        ? {
            id: matchedClient.id,
            companyName: matchedClient.companyName,
            contactName: matchedClient.contactName,
            email: matchedClient.email,
            whatsapp: matchedClient.whatsapp,
          }
        : { id: finalClientId, companyName: 'Cliente mzTech' },
      projectId: projectId || null,
      project: matchedProject ? { id: matchedProject.id, name: matchedProject.name } : null,
      assignedDev: assignedDev || 'Roberto',
      title,
      content: content || DEFAULT_CONTRACT_TEMPLATE,
      totalDevPrice: totalDevPrice !== undefined ? parseFloat(totalDevPrice) : 0.0,
      monthlyPrice: monthlyPrice !== undefined ? parseFloat(monthlyPrice) : 79.90,
      paymentMethod: paymentMethod || 'PIX / Boleto / Transferência',
      termsVersion: termsVersion || 'v2.0-2026',
      codeOwnershipType: codeOwnershipType || 'PROPRIEDADE_CLIENTE',
      scopeDevelopment: scopeDevelopment || null,
      scopeHosting: scopeHosting || null,
      scopeMaintenance: scopeMaintenance || null,
      scopeSupport: scopeSupport || null,
      backupRetentionDays: backupRetentionDays ? parseInt(backupRetentionDays, 10) : 30,
      migrationExcluded: migrationExcluded !== undefined ? Boolean(migrationExcluded) : true,
      status: status || 'RASCUNHO',
      signedAt: signedAt || null,
      notes: notes || null,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const storedContracts = getStoredContracts();
    storedContracts.unshift(newContract);
    saveStoredContracts(storedContracts);

    // Tentar sincronizar com Prisma se disponível
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        await prisma.mzContract.create({
          data: {
            clientId: finalClientId,
            projectId: projectId && !projectId.startsWith('PLAN_') ? projectId : null,
            title,
            content: content || DEFAULT_CONTRACT_TEMPLATE,
            totalDevPrice: totalDevPrice !== undefined ? parseFloat(totalDevPrice) : 0.0,
            monthlyPrice: monthlyPrice !== undefined ? parseFloat(monthlyPrice) : 79.90,
            paymentMethod: paymentMethod || 'PIX / Boleto / Transferência',
            termsVersion: termsVersion || 'v2.0-2026',
            codeOwnershipType: codeOwnershipType || 'PROPRIEDADE_CLIENTE',
            backupRetentionDays: backupRetentionDays ? parseInt(backupRetentionDays, 10) : 30,
            migrationExcluded: migrationExcluded !== undefined ? Boolean(migrationExcluded) : true,
            status: status || 'RASCUNHO',
            signedAt: signedAt ? new Date(signedAt) : null,
            notes: notes || null,
          },
        });
      } catch (dbErr) {}
    }

    return NextResponse.json({ contract: newContract }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao cadastrar contrato mzTech:', error);
    return NextResponse.json({ error: 'Erro ao criar contrato.' }, { status: 500 });
  }
}
