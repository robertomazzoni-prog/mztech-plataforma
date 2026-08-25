import { NextRequest, NextResponse } from 'next/server';
import { getStoredClients } from '@/lib/mz-entities-store';
import { getStoredProjects } from '@/lib/mz-entities-store';
import { getStoredQuotes } from '@/lib/quotes-store';
import { getStoredSettings } from '@/lib/mz-settings-store';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = getUserFromRequest(req);
    const emailParam = searchParams.get('email')?.toLowerCase();

    const targetEmail = emailParam || session?.email?.toLowerCase();

    const clients = getStoredClients();
    const projects = getStoredProjects();
    const quotes = getStoredQuotes();
    const settings = getStoredSettings();

    let client = null;
    if (targetEmail) {
      client = clients.find(
        (c) =>
          c.email?.toLowerCase() === targetEmail ||
          c.contactName?.toLowerCase().includes(targetEmail) ||
          c.companyName?.toLowerCase().includes(targetEmail)
      );
    }

    if (!client) {
      return NextResponse.json({
        client: null,
        projects: [],
        quotes: [],
        invoices: [],
        availableClients: [],
        settings,
      });
    }

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

    // Faturas vinculadas ao cliente real
    const today = new Date();
    const nextDueDate = new Date();
    nextDueDate.setDate(today.getDate() + 5);

    const activePixKey = settings.pixKey || 'robertomazzoni956@gmail.com';

    const invoices = client.financialStatus === 'EM_DIA'
      ? []
      : [
          {
            id: `fat-${client.id}-current`,
            title: 'Mensalidade Hospedagem & Manutenção Técnica',
            amount: 79.90,
            planName: 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
            dueDate: nextDueDate.toISOString().split('T')[0],
            status: 'PENDING',
            daysUntilDue: 5,
            pixKey: activePixKey,
            pixQrCodeText: activePixKey,
            paymentMethod: 'PIX_OR_CARD',
          },
        ];

    return NextResponse.json({
      client,
      projects: clientProjects,
      quotes: clientQuotes,
      invoices,
      settings,
      availableClients: clients.map((c) => ({
        id: c.id,
        companyName: c.companyName,
        contactName: c.contactName,
        email: c.email,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao carregar dados do portal do cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar portal do cliente.' },
      { status: 500 }
    );
  }
}
