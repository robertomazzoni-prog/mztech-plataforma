import fs from 'fs';
import path from 'path';
import { MzQuoteItem, QuoteStatus, PaymentMethodChoice } from '@/types/mztech';
import { logActivity } from '@/lib/audit-store';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const QUOTES_FILE = path.join(DATA_DIR, 'quotes-store.json');

// Base limpa sem dados fictícios de teste
const defaultQuotes: MzQuoteItem[] = [];

// Singleton em globalThis para persistência na memória do processo Next.js
const globalQuotesKey = Symbol.for('mztech.quotes');
const globalObject = globalThis as unknown as { [key: symbol]: MzQuoteItem[] };

function readQuotesFromFile(): MzQuoteItem[] {
  try {
    if (fs.existsSync(QUOTES_FILE)) {
      const content = fs.readFileSync(QUOTES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('⚠️ Leitura do arquivo quotes-store.json:', err);
  }
  return defaultQuotes;
}

function writeQuotesToFile(quotes: MzQuoteItem[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(QUOTES_FILE, JSON.stringify(quotes, null, 2), 'utf-8');
  } catch (err) {
    console.warn('⚠️ Erro ao salvar quotes-store.json:', err);
  }
}

export function getStoredQuotes(): MzQuoteItem[] {
  if (!globalObject[globalQuotesKey]) {
    globalObject[globalQuotesKey] = readQuotesFromFile();
  }
  return globalObject[globalQuotesKey];
}

import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';

export async function syncQuotesFromDb(): Promise<MzQuoteItem[]> {
  const online = await isDatabaseOnline();
  if (online) {
    try {
      const dbQuotes = await prisma.mzQuote.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbQuotes && dbQuotes.length > 0) {
        const mapped: MzQuoteItem[] = dbQuotes.map((q: any) => ({
          id: q.id,
          quoteNumber: q.quoteNumber,
          name: q.name,
          company: q.company,
          cnpjCpf: q.cnpjCpf,
          whatsapp: q.whatsapp,
          email: q.email,
          selectedDev: q.selectedDev,
          projectType: q.projectType,
          serviceId: q.serviceId,
          hasDomain: q.hasDomain,
          needsHosting: q.needsHosting,
          needsMaintenance: q.needsMaintenance,
          projectDescription: q.projectDescription,
          initialDevPrice: q.initialDevPrice,
          monthlyPrice: q.monthlyPrice,
          discount: q.discount,
          finalPrice: q.finalPrice,
          paymentMethodChoice: q.paymentMethodChoice as PaymentMethodChoice,
          billingPeriodicity: q.billingPeriodicity,
          dueDay: q.dueDay,
          estimatedBudget: q.estimatedBudget,
          desiredDeadline: q.desiredDeadline,
          status: q.status as QuoteStatus,
          notes: q.notes,
          approvedBy: q.approvedBy,
          approvedAt: q.approvedAt ? q.approvedAt.toISOString() : null,
          responsibleAdmin: q.responsibleAdmin,
          linkedClientId: q.linkedClientId,
          linkedProjectId: q.linkedProjectId,
          linkedContractId: q.linkedContractId,
          linkedPaymentId: q.linkedPaymentId,
          createdAt: q.createdAt.toISOString(),
          updatedAt: q.updatedAt.toISOString(),
        }));

        const current = getStoredQuotes();
        const dbIds = new Set(mapped.map((m) => m.id));
        for (const localQ of current) {
          if (!dbIds.has(localQ.id)) {
            mapped.push(localQ);
            syncQuoteToPrisma(localQ).catch(() => {});
          }
        }
        globalObject[globalQuotesKey] = mapped;
        writeQuotesToFile(mapped);
        return mapped;
      } else {
        const current = getStoredQuotes();
        for (const localQ of current) {
          syncQuoteToPrisma(localQ).catch(() => {});
        }
        return current;
      }
    } catch (e) {
      console.warn('Aviso ao sincronizar orçamentos do banco:', e);
    }
  }
  return getStoredQuotes();
}

async function syncQuoteToPrisma(quote: MzQuoteItem) {
  try {
    if (process.env.DATABASE_URL) {
      const qNum = quote.quoteNumber || `MZ-${quote.id}`;
      await prisma.mzQuote.upsert({
        where: { quoteNumber: qNum },
        create: {
          id: quote.id,
          quoteNumber: qNum,
          name: quote.name,
          company: quote.company,
          cnpjCpf: quote.cnpjCpf,
          whatsapp: quote.whatsapp,
          email: quote.email,
          selectedDev: quote.selectedDev || 'Roberto',
          projectType: quote.projectType,
          serviceId: quote.serviceId,
          hasDomain: quote.hasDomain,
          needsHosting: quote.needsHosting,
          needsMaintenance: quote.needsMaintenance,
          projectDescription: quote.projectDescription,
          initialDevPrice: quote.initialDevPrice,
          monthlyPrice: quote.monthlyPrice,
          discount: quote.discount,
          finalPrice: quote.finalPrice,
          paymentMethodChoice: quote.paymentMethodChoice,
          billingPeriodicity: quote.billingPeriodicity,
          dueDay: quote.dueDay,
          estimatedBudget: quote.estimatedBudget,
          desiredDeadline: quote.desiredDeadline,
          status: quote.status,
          notes: quote.notes,
          approvedBy: quote.approvedBy,
          responsibleAdmin: quote.responsibleAdmin,
          linkedClientId: quote.linkedClientId,
          linkedProjectId: quote.linkedProjectId,
          linkedContractId: quote.linkedContractId,
          linkedPaymentId: quote.linkedPaymentId,
        },
        update: {
          name: quote.name,
          company: quote.company,
          cnpjCpf: quote.cnpjCpf,
          whatsapp: quote.whatsapp,
          email: quote.email,
          selectedDev: quote.selectedDev,
          projectType: quote.projectType,
          serviceId: quote.serviceId,
          hasDomain: quote.hasDomain,
          needsHosting: quote.needsHosting,
          needsMaintenance: quote.needsMaintenance,
          projectDescription: quote.projectDescription,
          initialDevPrice: quote.initialDevPrice,
          monthlyPrice: quote.monthlyPrice,
          discount: quote.discount,
          finalPrice: quote.finalPrice,
          paymentMethodChoice: quote.paymentMethodChoice,
          billingPeriodicity: quote.billingPeriodicity,
          dueDay: quote.dueDay,
          estimatedBudget: quote.estimatedBudget,
          desiredDeadline: quote.desiredDeadline,
          status: quote.status,
          notes: quote.notes,
          approvedBy: quote.approvedBy,
          responsibleAdmin: quote.responsibleAdmin,
          linkedClientId: quote.linkedClientId,
          linkedProjectId: quote.linkedProjectId,
          linkedContractId: quote.linkedContractId,
          linkedPaymentId: quote.linkedPaymentId,
        },
      });
    }
  } catch (e) {}
}

export function saveQuote(quote: Partial<MzQuoteItem>): MzQuoteItem {
  const current = getStoredQuotes();
  const nowStr = new Date().toISOString();
  
  // Gerar número sequencial de proposta comercial (ex: MZ-2026-0001)
  const count = current.length + 1;
  const quoteNumber = quote.quoteNumber || `MZ-2026-${count.toString().padStart(4, '0')}`;

  const fullQuote: MzQuoteItem = {
    id: quote.id || `quote-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    quoteNumber,
    name: quote.name || '',
    company: quote.company || null,
    cnpjCpf: quote.cnpjCpf || null,
    whatsapp: quote.whatsapp || '',
    email: quote.email || '',
    selectedDev: quote.selectedDev || 'Roberto',
    projectType: quote.projectType || 'Site Institucional Profissional',
    serviceId: quote.serviceId,
    hasDomain: quote.hasDomain || 'Não, preciso registrar',
    needsHosting: quote.needsHosting || 'A Definir na Proposta Comercial',
    needsMaintenance: quote.needsMaintenance || 'A Definir',
    projectDescription: quote.projectDescription || null,
    
    // Condições comerciais
    initialDevPrice: quote.initialDevPrice !== undefined ? Number(quote.initialDevPrice) : 0,
    monthlyPrice: quote.monthlyPrice !== undefined ? Number(quote.monthlyPrice) : (quote.needsHosting?.includes('79,90') ? 79.9 : quote.needsHosting?.includes('39,90') ? 39.9 : 0),
    discount: quote.discount !== undefined ? Number(quote.discount) : 0,
    finalPrice: quote.finalPrice !== undefined ? Number(quote.finalPrice) : (quote.initialDevPrice ? Number(quote.initialDevPrice) - Number(quote.discount || 0) : 0),
    paymentMethodChoice: (quote.paymentMethodChoice as PaymentMethodChoice) || 'CREDIT_CARD_RECURRING',
    billingPeriodicity: quote.billingPeriodicity || 'MENSAL',
    dueDay: quote.dueDay || 10,
    estimatedBudget: quote.estimatedBudget || 'A Definir na Proposta',
    desiredDeadline: quote.desiredDeadline || '15 a 30 dias',
    
    status: (quote.status as QuoteStatus) || 'AGUARDANDO_ANALISE',
    notes: quote.notes || null,
    approvedBy: quote.approvedBy || null,
    approvedAt: quote.approvedAt || null,
    responsibleAdmin: quote.responsibleAdmin || quote.selectedDev || 'Roberto',
    
    linkedClientId: quote.linkedClientId || null,
    linkedProjectId: quote.linkedProjectId || null,
    linkedContractId: quote.linkedContractId || null,
    linkedPaymentId: quote.linkedPaymentId || null,

    createdAt: quote.createdAt || nowStr,
    updatedAt: nowStr,
  };

  const existingIdx = current.findIndex((q) => q.id === fullQuote.id);
  if (existingIdx >= 0) {
    current[existingIdx] = { ...current[existingIdx], ...fullQuote, updatedAt: nowStr };
  } else {
    current.unshift(fullQuote);
    
    // Gravar auditoria da nova solicitação
    logActivity({
      actor: 'Cliente',
      action: 'NOVA_SOLICITACAO_ORCAMENTO',
      category: 'ORCAMENTO',
      targetId: fullQuote.id,
      targetNumber: fullQuote.quoteNumber,
      description: `Cliente "${fullQuote.name}" (${fullQuote.company || 'Pessoa Física'}) solicitou o orçamento ${fullQuote.quoteNumber}.`,
      details: {
        servico: fullQuote.projectType,
        pagamento: fullQuote.paymentMethodChoice,
        valorInicial: fullQuote.initialDevPrice,
        mensalidade: fullQuote.monthlyPrice,
      },
    });
  }

  globalObject[globalQuotesKey] = current;
  writeQuotesToFile(current);

  if (process.env.DATABASE_URL) {
    syncQuoteToPrisma(fullQuote).catch(() => {});
  }

  return fullQuote;
}

export function updateQuote(
  id: string,
  updates: Partial<MzQuoteItem>
): MzQuoteItem | null {
  const current = getStoredQuotes();
  const quote = current.find((q) => q.id === id);
  if (quote) {
    Object.assign(quote, updates, { updatedAt: new Date().toISOString() });
    globalObject[globalQuotesKey] = current;
    writeQuotesToFile(current);

    if (process.env.DATABASE_URL) {
      syncQuoteToPrisma(quote).catch(() => {});
    }

    return quote;
  }
  return null;
}

export function deleteQuote(id: string): boolean {
  let current = getStoredQuotes();
  const quote = current.find((q) => q.id === id);
  const initialLength = current.length;
  current = current.filter((q) => q.id !== id);
  if (current.length !== initialLength) {
    globalObject[globalQuotesKey] = current;
    writeQuotesToFile(current);

    if (quote) {
      logActivity({
        actor: 'Administrador',
        action: 'EXCLUIR_ORCAMENTO',
        category: 'ORCAMENTO',
        targetId: id,
        targetNumber: quote.quoteNumber,
        description: `Orçamento ${quote.quoteNumber || id} foi excluído da fila comercial.`,
      });
    }

    return true;
  }
  return false;
}
