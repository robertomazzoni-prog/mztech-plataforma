import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import { getStoredClients, saveStoredClients, syncClientsFromDb } from '@/lib/mz-entities-store';
import { MzClientItem } from '@/types/mztech';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const financialStatus = searchParams.get('financialStatus');
    const search = searchParams.get('search')?.toLowerCase();

    let clients = await syncClientsFromDb();

    let filtered = [...clients];
    if (status && status !== 'ALL') {
      filtered = filtered.filter((c) => c.status === status);
    }
    if (financialStatus && financialStatus !== 'ALL') {
      filtered = filtered.filter((c) => c.financialStatus === financialStatus);
    }
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.companyName?.toLowerCase().includes(search) ||
          c.contactName?.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ clients: filtered });
  } catch (error: any) {
    return NextResponse.json({ clients: getStoredClients() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      contactName,
      whatsapp,
      email,
      domain,
      status,
      financialStatus,
      startDate,
      notes,
    } = body;

    if (!companyName || !contactName || !whatsapp || !email) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: Nome da Empresa, Responsável, WhatsApp e E-mail.' },
        { status: 400 }
      );
    }

    const newClientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowStr = new Date().toISOString();

    const newClient: MzClientItem = {
      id: newClientId,
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      domain: domain || null,
      status: (status as any) || 'ATIVO',
      financialStatus: (financialStatus as any) || 'EM_DIA',
      startDate: startDate || nowStr,
      notes: notes || null,
      codeDelivered: true,
      backupDelivered: true,
      projects: [],
      hostings: [
        {
          id: `host-${Date.now()}`,
          clientId: newClientId,
          provider: 'Railway',
          url: null,
          monthlyPrice: 79.9,
          status: 'ATIVO',
          startDate: nowStr,
          createdAt: nowStr,
          updatedAt: nowStr,
        },
      ],
      _count: { projects: 0, hostings: 1, maintenances: 0, backups: 1 },
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const clients = getStoredClients();
    clients.unshift(newClient);
    saveStoredClients(clients);

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        await prisma.mzClient.upsert({
          where: { id: newClient.id },
          create: {
            id: newClient.id,
            companyName: newClient.companyName,
            contactName: newClient.contactName,
            whatsapp: newClient.whatsapp,
            email: newClient.email,
            domain: newClient.domain,
            status: newClient.status,
            financialStatus: newClient.financialStatus,
            notes: newClient.notes,
          },
          update: {
            companyName: newClient.companyName,
            contactName: newClient.contactName,
            whatsapp: newClient.whatsapp,
            email: newClient.email,
            domain: newClient.domain,
            status: newClient.status,
            financialStatus: newClient.financialStatus,
            notes: newClient.notes,
          },
        });
      } catch (err) {}
    }

    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao cadastrar cliente.' }, { status: 500 });
  }
}
