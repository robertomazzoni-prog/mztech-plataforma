import { NextRequest, NextResponse } from 'next/server';
import { MzQuoteItem, QuoteStatus, PaymentMethodChoice } from '@/types/mztech';
import { getStoredQuotes, saveQuote, syncQuotesFromDb } from '@/lib/quotes-store';
import { getStoredClients, saveStoredClients } from '@/lib/mz-entities-store';
import { hashPassword, signToken, getUserFromRequest } from '@/lib/auth';
import { formatPhoneNumber } from '@/lib/utils';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const devFilter = searchParams.get('dev');
    const statusFilter = searchParams.get('status');
    const query = searchParams.get('q')?.toLowerCase();

    let allQuotes = await syncQuotesFromDb();

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
      filtered = filtered.filter((q) => {
        if (statusFilter === 'AGUARDANDO_ANALISE') {
          return q.status === 'AGUARDANDO_ANALISE' || q.status === 'NOVO' || q.status === 'EM_CONTATO';
        }
        if (statusFilter === 'APROVADO') {
          return q.status === 'APROVADO' || q.status === 'CONCLUIDO' || q.status === 'EM_ANDAMENTO';
        }
        if (statusFilter === 'RECUSADO') {
          return q.status === 'RECUSADO';
        }
        if (statusFilter === 'CANCELADO') {
          return q.status === 'CANCELADO' || q.status === 'ARQUIVADO';
        }
        return q.status === statusFilter;
      });
    }

    if (query && query.trim() !== '') {
      filtered = filtered.filter(
        (q) =>
          q.name.toLowerCase().includes(query) ||
          q.company?.toLowerCase().includes(query) ||
          q.quoteNumber?.toLowerCase().includes(query) ||
          q.cnpjCpf?.toLowerCase().includes(query) ||
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
      aguardando: allQuotes.filter(
        (q) => q.status === 'AGUARDANDO_ANALISE' || q.status === 'NOVO' || q.status === 'EM_CONTATO'
      ).length,
      emAnalise: allQuotes.filter((q) => q.status === 'EM_ANALISE').length,
      aprovados: allQuotes.filter(
        (q) => q.status === 'APROVADO' || q.status === 'CONCLUIDO' || q.status === 'EM_ANDAMENTO'
      ).length,
      recusados: allQuotes.filter((q) => q.status === 'RECUSADO').length,
      cancelados: allQuotes.filter((q) => q.status === 'CANCELADO' || q.status === 'ARQUIVADO').length,
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
    return NextResponse.json({ error: 'Erro ao buscar orçamentos.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      company,
      cnpjCpf,
      whatsapp,
      email,
      password,
      selectedDev,
      projectType,
      serviceId,
      hasDomain,
      needsHosting,
      needsMaintenance,
      projectDescription,
      initialDevPrice,
      monthlyPrice,
      discount,
      finalPrice,
      paymentMethodChoice,
      billingPeriodicity,
      dueDay,
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

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = whatsapp.trim();
    const cleanName = name.trim();
    const cleanCompany = company ? company.trim() : cleanName;

    // 1. Criação ou Identificação da Conta do Cliente
    const clients = getStoredClients();
    let matchedClient = clients.find((c) => c.email?.toLowerCase() === cleanEmail);

    const nowStr = new Date().toISOString();

    if (!matchedClient) {
      matchedClient = {
        id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        companyName: cleanCompany,
        contactName: cleanName,
        whatsapp: formatPhoneNumber(cleanPhone),
        email: cleanEmail,
        status: 'ATIVO' as const,
        financialStatus: 'EM_DIA' as const,
        startDate: nowStr,
        notes: 'Conta de cliente criada automaticamente ao solicitar proposta no site.',
        codeDelivered: false,
        backupDelivered: false,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      clients.unshift(matchedClient);
      saveStoredClients(clients);

      const dbOnline = await isDatabaseOnline();
      if (dbOnline) {
        try {
          const hashedPassword = password ? await hashPassword(password) : undefined;
          await prisma.mzClient.create({
            data: {
              companyName: matchedClient.companyName,
              contactName: matchedClient.contactName,
              whatsapp: matchedClient.whatsapp,
              email: matchedClient.email,
              status: 'ATIVO',
              financialStatus: 'EM_DIA',
              notes: matchedClient.notes,
            },
          });

          if (hashedPassword) {
            await prisma.user.upsert({
              where: { email: cleanEmail },
              create: {
                name: cleanName,
                email: cleanEmail,
                phone: matchedClient.whatsapp,
                password: hashedPassword,
                role: 'CLIENT',
              },
              update: {
                password: hashedPassword,
              },
            });
          }
        } catch (e) {}
      }
    }

    const dev = selectedDev || 'Roberto';
    const isOnlyDev = Boolean(needsHosting?.toLowerCase().includes('apenas'));

    // Parse de valores comerciais
    const parsedInitialPrice = initialDevPrice !== undefined ? Number(initialDevPrice) : 0;
    const parsedMonthlyPrice = isOnlyDev ? 0 : (monthlyPrice !== undefined ? Number(monthlyPrice) : 0);
    const parsedDiscount = discount !== undefined ? Number(discount) : 0;
    const parsedFinalPrice = finalPrice !== undefined ? Number(finalPrice) : (parsedInitialPrice > 0 ? parsedInitialPrice - parsedDiscount : 0);

    const saved = saveQuote({
      name: cleanName,
      company: cleanCompany,
      cnpjCpf: cnpjCpf ? cnpjCpf.trim() : null,
      whatsapp: cleanPhone,
      email: cleanEmail,
      selectedDev: dev,
      projectType: projectType || 'Site Institucional Profissional',
      serviceId,
      hasDomain: hasDomain || 'Não informado',
      needsHosting: needsHosting || 'A Definir na Proposta Comercial',
      needsMaintenance: isOnlyDev ? 'Não (Apenas Desenvolvimento)' : (needsMaintenance || 'A Definir'),
      projectDescription: projectDescription || null,
      initialDevPrice: isNaN(parsedInitialPrice) ? 0 : parsedInitialPrice,
      monthlyPrice: isNaN(parsedMonthlyPrice) ? 0 : parsedMonthlyPrice,
      discount: isNaN(parsedDiscount) ? 0 : parsedDiscount,
      finalPrice: isNaN(parsedFinalPrice) ? 0 : parsedFinalPrice,
      paymentMethodChoice: (paymentMethodChoice as PaymentMethodChoice) || 'CREDIT_CARD_RECURRING',
      billingPeriodicity: billingPeriodicity || 'MENSAL',
      dueDay: dueDay || 10,
      estimatedBudget: estimatedBudget || (parsedInitialPrice > 0 ? `R$ ${parsedInitialPrice.toFixed(2)}` : 'A Definir na Proposta'),
      desiredDeadline: desiredDeadline || '15 a 30 dias',
      status: (status as QuoteStatus) || 'AGUARDANDO_ANALISE',
      notes: notes || `Solicitação via site oficial mzTech com criação automática de conta. Sócio: ${dev}`,
      linkedClientId: matchedClient.id,
    });

    console.log(`✅ [mzTech] Novo orçamento gravado: ${saved.quoteNumber} para ${saved.name} (Cliente: ${matchedClient.id})!`);

    // 2. Gerar Token de Sessão para Login Automático do Cliente
    const sessionUser = {
      id: matchedClient.id,
      name: matchedClient.contactName || matchedClient.companyName,
      email: matchedClient.email,
      phone: matchedClient.whatsapp,
      role: 'CLIENT' as const,
      companyName: matchedClient.companyName,
    };

    const token = signToken(sessionUser);
    const response = NextResponse.json({
      success: true,
      quote: saved,
      user: sessionUser,
      client: matchedClient,
      token,
    }, { status: 201 });

    response.cookies.set('mazzoni_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Erro ao registrar orçamento mzTech:', error);
    return NextResponse.json({ error: 'Erro ao processar solicitação.' }, { status: 500 });
  }
}

