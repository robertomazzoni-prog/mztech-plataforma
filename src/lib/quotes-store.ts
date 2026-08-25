import fs from 'fs';
import path from 'path';
import { MzQuoteItem, QuoteStatus } from '@/types/mztech';

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

export function saveQuote(quote: MzQuoteItem): MzQuoteItem {
  const current = getStoredQuotes();
  const existingIdx = current.findIndex((q) => q.id === quote.id);
  if (existingIdx >= 0) {
    current[existingIdx] = quote;
  } else {
    current.unshift(quote);
  }
  globalObject[globalQuotesKey] = current;
  writeQuotesToFile(current);
  return quote;
}

export function updateQuote(
  id: string,
  updates: {
    status?: QuoteStatus;
    notes?: string | null;
    selectedDev?: string;
    estimatedBudget?: string | null;
    desiredDeadline?: string | null;
  }
): MzQuoteItem | null {
  const current = getStoredQuotes();
  const quote = current.find((q) => q.id === id);
  if (quote) {
    if (updates.status !== undefined) quote.status = updates.status;
    if (updates.notes !== undefined) quote.notes = updates.notes;
    if (updates.selectedDev !== undefined) quote.selectedDev = updates.selectedDev;
    if (updates.estimatedBudget !== undefined) quote.estimatedBudget = updates.estimatedBudget;
    if (updates.desiredDeadline !== undefined) quote.desiredDeadline = updates.desiredDeadline;
    quote.updatedAt = new Date().toISOString();
    globalObject[globalQuotesKey] = current;
    writeQuotesToFile(current);
    return quote;
  }
  return null;
}

export function deleteQuote(id: string): boolean {
  let current = getStoredQuotes();
  const initialLength = current.length;
  current = current.filter((q) => q.id !== id);
  if (current.length !== initialLength) {
    globalObject[globalQuotesKey] = current;
    writeQuotesToFile(current);
    return true;
  }
  return false;
}
