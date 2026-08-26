import { NextRequest, NextResponse } from 'next/server';
import {
  getStoredClients,
  getStoredProjects,
  getStoredContracts,
  getStoredPayments,
} from '@/lib/mz-entities-store';
import { getStoredQuotes } from '@/lib/quotes-store';
import { getStoredSettings } from '@/lib/mz-settings-store';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = getUserFromRequest(req);
    const emailParam = searchParams.get('email')?.toLowerCase();

    const targetEmail = emailParam || session?.email?.toLowerCase();

    let clients = getStoredClients();
    let projects = getStoredProjects();
    const quotes = getStoredQuotes();
    const contracts = getStoredContracts();
    const payments = getStoredPayments();
    const settings = getStoredSettings();

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        const dbProjects = await prisma.mzProject.findMany({
          orderBy: { createdAt: 'desc' },
          include: { client: true },
        });
        if (dbProjects && dbProjects.length > 0) {
          const mappedDbProjects: any[] = dbProjects.map((p) => ({
            id: p.id,
            clientId: p.clientId,
            client: p.client ? { id: p.client.id, companyName: p.client.companyName, contactName: p.client.contactName, email: p.client.email } : undefined,
            name: p.name,
            type: p.type,
            status: p.status,
            startDate: p.startDate ? p.startDate.toISOString() : null,
            deliveryDate: p.deliveryDate ? p.deliveryDate.toISOString() : null,
            domain: p.domain,
            hostingUrl: p.hostingUrl,
            githubRepo: p.githubRepo,
            hostingPlatform: p.hostingPlatform,
            notes: p.notes,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          }));

          const dbMap = new Map(mappedDbProjects.map((p) => [p.id, p]));
          projects = projects.map((p) => dbMap.get(p.id) || p);
          for (const dbP of mappedDbProjects) {
            if (!projects.some((p) => p.id === dbP.id)) {
              projects.push(dbP);
            }
          }
        }
      } catch (e) {}
    }

    let client = null;
    if (targetEmail) {
      client = clients.find(
        (c) =>
          c.email?.toLowerCase() === targetEmail ||
          c.contactName?.toLowerCase() === targetEmail ||
          c.companyName?.toLowerCase() === targetEmail ||
          c.id === targetEmail
      );
    }

    if (!client) {
      return NextResponse.json(
        {
          authenticated: false,
          client: null,
          error: 'UNAUTHORIZED',
          message: 'Sessão não autenticada. Por favor, faça login para acessar seu painel.',
        },
        { status: 401 }
      );
    }

    const isUserAdmin = session?.role === 'ADMIN' || session?.role === 'BARBER';

    // Buscar projetos do cliente
    const clientProjects = projects.filter(
      (p) =>
        p.clientId === client.id ||
        p.client?.companyName?.toLowerCase() === client.companyName?.toLowerCase() ||
        p.client?.email?.toLowerCase() === client.email?.toLowerCase()
    );

    // Buscar orçamentos do cliente
    const clientQuotes = quotes.filter(
      (q) =>
        q.email?.toLowerCase() === client.email?.toLowerCase() ||
        q.company?.toLowerCase() === client.companyName?.toLowerCase() ||
        q.name?.toLowerCase() === client.contactName?.toLowerCase()
    );

    // Buscar contratos do cliente
    const clientContracts = contracts.filter(
      (c) =>
        c.clientId === client.id ||
        c.client?.companyName?.toLowerCase() === client.companyName?.toLowerCase() ||
        c.client?.email?.toLowerCase() === client.email?.toLowerCase()
    );

    // Buscar cobranças/pagamentos reais do cliente
    const clientPayments = payments.filter((p) => p.clientId === client.id);

    const activePixKey = settings.pixKey || 'robertomazzoni956@gmail.com';

    // Identificar contratos que já tiveram a taxa inicial paga
    const paidInitialContractIds = new Set(
      clientPayments
        .filter((p) => p.paymentType === 'TAXA_INICIAL' && p.status === 'PAID' && p.contractId)
        .map((p) => p.contractId)
    );

    // Filtrar pagamentos para não exibir taxa inicial pendente duplicada caso já tenha sido paga
    const cleanPayments = clientPayments.filter((p) => {
      if (p.paymentType === 'TAXA_INICIAL' && p.status === 'PENDING' && p.contractId && paidInitialContractIds.has(p.contractId)) {
        return false;
      }
      return true;
    });

    // Se houver pagamentos cadastrados, formatar para o portal
    let invoices = cleanPayments.map((p) => ({
      id: p.id,
      title: p.title || 'Cobrança mzTech',
      amount: p.amount,
      dueDate: p.dueDate,
      status: p.status,
      paidAt: p.paidAt,
      pixKey: activePixKey,
      pixQrCodeText: activePixKey,
      paymentMethod: p.paymentMethod,
    }));

    // Se o cliente tem contrato assinado/ativo com mensalidade, mas ainda não gerou a fatura da mensalidade recorrente:
    const activeContractWithMonthly = clientContracts.find(
      (c) => (c.status === 'ATIVO' || c.clientSigned || c.acceptedOnline) && Number(c.monthlyPrice) > 0
    );

    const hasMonthlyInvoice = invoices.some(
      (i) => i.title.toLowerCase().includes('mensal') || i.title.toLowerCase().includes('hospedagem')
    );

    if (activeContractWithMonthly && !hasMonthlyInvoice) {
      const nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      if (activeContractWithMonthly.dueDay) {
        nextDueDate.setDate(Math.min(activeContractWithMonthly.dueDay, 28));
      }

      invoices.unshift({
        id: `fat-${client.id}-plan-monthly`,
        title: `Mensalidade — ${activeContractWithMonthly.project?.name || activeContractWithMonthly.title || 'Plano Hospedagem & Manutenção'}`,
        amount: Number(activeContractWithMonthly.monthlyPrice),
        dueDate: nextDueDate.toISOString().split('T')[0],
        status: 'PENDING',
        paidAt: undefined,
        pixKey: activePixKey,
        pixQrCodeText: activePixKey,
        paymentMethod: activeContractWithMonthly.paymentMethod?.includes('PIX') ? 'PIX' : 'CREDIT_CARD',
      });
    }

    return NextResponse.json({
      client,
      projects: clientProjects,
      quotes: clientQuotes,
      contracts: clientContracts,
      invoices,
      settings,
      availableClients: isUserAdmin
        ? clients.map((c) => ({
            id: c.id,
            companyName: c.companyName,
            contactName: c.contactName,
            email: c.email,
          }))
        : [],
    });
  } catch (error: any) {
    console.error('Erro ao carregar dados do portal do cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar portal do cliente.' },
      { status: 500 }
    );
  }
}
