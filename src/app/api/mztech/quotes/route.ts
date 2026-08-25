import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ensureDatabaseReady } from '@/lib/init-db';
import { MzQuoteItem, QuoteStatus } from '@/types/mztech';
import { getStoredQuotes, saveQuote } from '@/lib/quotes-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const devFilter = searchParams.get('dev');
    const statusFilter = searchParams.get('status');
    const query = searchParams.get('q')?.toLowerCase();

    const allQuotes = getStoredQuotes();
    let filtered = [...allQuotes];

    if (devFilter && devFilter !== 'ALL') {
      if (devFilter === 'Shared') {
        filtered = filtered.filter(
          (q) => !q.selectedDev?.includes('Roberto') && !q.selectedDev?.includes('Morvan')
        );
      } else {
        filtered = filtered.filter((q) =>
          q.selectedDev?.toLowerCase().includes(devFilter.toLowerCase())
        );
      }
    }

    if (statusFilter && statusFilter !== 'ALL') {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }

    if (query && query.trim() !== '') {
      filtered = filtered.filter(
        (q) =>
          q.name.toLowerCase().includes(query) ||
          q.company?.toLowerCase().includes(query) ||
          q.email.toLowerCase().includes(query) ||
          q.whatsapp.includes(query) ||
          q.projectType.toLowerCase().includes(query) ||
          q.notes?.toLowerCase().includes(query)
      );
    }

    const quotesForRoberto = allQuotes.filter((q) => q.selectedDev?.includes('Roberto')).length;
    const quotesForMorvan = allQuotes.filter((q) => q.selectedDev?.includes('Morvan')).length;
    const quotesShared = allQuotes.filter(
      (q) => !q.selectedDev?.includes('Roberto') && !q.selectedDev?.includes('Morvan')
    ).length;

    const statusCounts = {
      all: allQuotes.length,
      novo: allQuotes.filter((q) => q.status === 'NOVO').length,
      emContato: allQuotes.filter((q) => q.status === 'EM_CONTATO').length,
      emAndamento: allQuotes.filter((q) => q.status === 'EM_ANDAMENTO').length,
      concluido: allQuotes.filter((q) => q.status === 'CONCLUIDO').length,
      arquivado: allQuotes.filter((q) => q.status === 'ARQUIVADO' || q.status === 'CANCELADO').length,
    };

    return NextResponse.json({
      quotes: filtered,
      total: allQuotes.length,
      metrics: {
        quotesForRoberto,
        quotesForMorvan,
        quotesShared,
        statusCounts,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar orçamentos mzTech:', error);
    const fallbackQuotes = getStoredQuotes();
    return NextResponse.json({
      quotes: fallbackQuotes,
      total: fallbackQuotes.length,
      metrics: {
        quotesForRoberto: fallbackQuotes.filter((q) => q.selectedDev?.includes('Roberto')).length,
        quotesForMorvan: fallbackQuotes.filter((q) => q.selectedDev?.includes('Morvan')).length,
        quotesShared: 0,
        statusCounts: {
          all: fallbackQuotes.length,
          novo: fallbackQuotes.filter((q) => q.status === 'NOVO').length,
          emContato: fallbackQuotes.filter((q) => q.status === 'EM_CONTATO').length,
          emAndamento: fallbackQuotes.filter((q) => q.status === 'EM_ANDAMENTO').length,
          concluido: fallbackQuotes.filter((q) => q.status === 'CONCLUIDO').length,
          arquivado: fallbackQuotes.filter((q) => q.status === 'ARQUIVADO').length,
        },
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      company,
      whatsapp,
      email,
      selectedDev,
      projectType,
      hasDomain,
      needsHosting,
      projectDescription,
      estimatedBudget,
      desiredDeadline,
      status,
      notes,
    } = body;

    if (!name || !whatsapp || !email) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: Nome, WhatsApp e E-mail.' },
        { status: 400 }
      );
    }

    const dev = selectedDev || 'Roberto';

    const newQuote: MzQuoteItem = {
      id: `quote-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      company: company ? company.trim() : null,
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      selectedDev: dev,
      projectType: projectType || 'Site Institucional Profissional',
      hasDomain: hasDomain || 'Não informado',
      needsHosting: needsHosting || 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
      projectDescription: projectDescription || null,
      estimatedBudget: estimatedBudget || 'A definir',
      desiredDeadline: desiredDeadline || '15 a 30 dias',
      status: (status as QuoteStatus) || 'NOVO',
      notes: notes || `Solicitação via site oficial mzTech. Sócio escolhido: ${dev}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveQuote(newQuote);

    // Também cadastra como cliente potencial se o banco estiver online
    try {
      await ensureDatabaseReady();
      const existingClient = await prisma.mzClient.findFirst({
        where: {
          OR: [
            { email: { equals: email.trim(), mode: 'insensitive' } },
            { companyName: { equals: (company || name).trim(), mode: 'insensitive' } },
          ],
        },
      });

      if (!existingClient) {
        await prisma.mzClient.create({
          data: {
            companyName: (company || name).trim(),
            contactName: name.trim(),
            whatsapp: whatsapp.trim(),
            email: email.trim(),
            status: 'ATIVO',
            financialStatus: 'EM_DIA',
            notes: `Lead cadastrado pelo site mzTech • Dev: ${dev} • Projeto: ${projectType || 'Site'}`,
          },
        });
      }
    } catch (dbErr) {
      // Ignora erro se banco local estiver offline
    }

    console.log(`✅ [mzTech] Novo orçamento gravado: ${name} para o Dev ${dev}!`);

    return NextResponse.json({ success: true, quote: newQuote }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao registrar orçamento mzTech:', error);
    return NextResponse.json({ error: 'Erro ao processar solicitação.' }, { status: 500 });
  }
}
