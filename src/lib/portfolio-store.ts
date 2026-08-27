import fs from 'fs';
import path from 'path';
import { MzPortfolioItem } from '@/types/mztech';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio-store.json');

const defaultPortfolio: MzPortfolioItem[] = [
  {
    id: 'port-mazzoni-barbershop',
    title: 'Mazzoni Barbershop',
    category: 'Site + Sistema de Agendamento',
    description:
      'Plataforma web completa desenvolvida sob medida pela mzTech em Next.js e PostgreSQL para gerenciamento e atendimento de barbearia. Inclui fluxo de agendamentos 24h integrado ao WhatsApp, painel financeiro e controle operacional de equipe.',
    url: 'https://mazzoni-barbershop-production.up.railway.app',
    displayUrl: 'mazzoni-barbershop-production.up.railway.app',
    tagline: 'ELEVE SEU ESTILO AO NÍVEL MÁXIMO',
    subheadline: 'Agendamento de Horários & Presença Digital',
    previewImage: null,
    favicon: null,
    features: [
      'Agendamento online 24h',
      'Confirmação via WhatsApp',
      'Painel administrativo financeiro',
      'Gestão de equipe e serviços',
    ],
    badge: 'Em Produção',
    infrastructure: 'Infraestrutura Railway',
    order: 1,
    featured: true,
    active: true,
    createdAt: '2026-08-25T00:00:00.000Z',
    updatedAt: '2026-08-26T18:00:00.000Z',
  },
];

const globalPortfolioKey = Symbol.for('mztech.portfolio');
const globalObj = globalThis as any;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getStoredPortfolio(): MzPortfolioItem[] {
  if (!globalObj[globalPortfolioKey]) {
    let items: MzPortfolioItem[] = [];
    try {
      if (fs.existsSync(PORTFOLIO_FILE)) {
        const content = fs.readFileSync(PORTFOLIO_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          items = parsed;
        } else {
          items = [...defaultPortfolio];
          saveStoredPortfolio(items);
        }
      } else {
        items = [...defaultPortfolio];
        saveStoredPortfolio(items);
      }
    } catch (e) {
      items = [...defaultPortfolio];
    }
    globalObj[globalPortfolioKey] = items;
  }
  return globalObj[globalPortfolioKey];
}

export function saveStoredPortfolio(items: MzPortfolioItem[]) {
  globalObj[globalPortfolioKey] = items;
  try {
    ensureDir();
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erro ao persistir portfolio-store.json:', error);
  }
}

export async function syncPortfolioFromDb(): Promise<MzPortfolioItem[]> {
  const online = await isDatabaseOnline();
  if (online) {
    try {
      const dbItems = await prisma.mzPortfolio.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbItems && dbItems.length > 0) {
        const mapped: MzPortfolioItem[] = dbItems.map((item: any) => {
          let features: string[] = [];
          try {
            features = JSON.parse(item.featuresJson || '[]');
          } catch (e) {
            features = ['Design Responsivo', 'Alta Performance'];
          }
          return {
            id: item.id,
            title: item.title,
            category: item.category,
            description: item.description,
            url: item.url,
            displayUrl: item.displayUrl || item.url.replace(/^https?:\/\//i, ''),
            tagline: item.tagline || '',
            subheadline: item.subheadline || '',
            previewImage: item.previewImage,
            favicon: item.favicon,
            features,
            badge: item.badge || 'Em Produção',
            infrastructure: item.infrastructure || 'Infraestrutura Railway',
            featured: Boolean(item.featured),
            active: item.active !== false,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
          };
        });
        saveStoredPortfolio(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Aviso ao sincronizar portfólio do banco:', e);
    }
  }
  return getStoredPortfolio();
}

export function createPortfolioItem(data: Omit<MzPortfolioItem, 'id' | 'createdAt' | 'updatedAt'>): MzPortfolioItem {
  const items = getStoredPortfolio();
  const now = new Date().toISOString();
  const newItem: MzPortfolioItem = {
    id: `port-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...data,
    order: data.order !== undefined ? data.order : items.length + 1,
    active: data.active !== undefined ? data.active : true,
    createdAt: now,
    updatedAt: now,
  };

  items.unshift(newItem);
  saveStoredPortfolio(items);

  // Sincroniza em background com o PostgreSQL
  if (process.env.DATABASE_URL) {
    prisma.mzPortfolio.create({
      data: {
        id: newItem.id,
        title: newItem.title,
        category: newItem.category,
        description: newItem.description,
        url: newItem.url,
        displayUrl: newItem.displayUrl,
        tagline: newItem.tagline,
        subheadline: newItem.subheadline,
        previewImage: newItem.previewImage,
        favicon: newItem.favicon,
        featuresJson: JSON.stringify(newItem.features),
        badge: newItem.badge,
        infrastructure: newItem.infrastructure,
        featured: newItem.featured,
        active: newItem.active,
      },
    }).catch((e) => console.warn('Aviso ao salvar portfólio no Prisma:', e));
  }

  return newItem;
}

export function updatePortfolioItem(id: string, updates: Partial<MzPortfolioItem>): MzPortfolioItem | null {
  const items = getStoredPortfolio();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const updatedItem: MzPortfolioItem = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  items[index] = updatedItem;
  saveStoredPortfolio(items);

  if (process.env.DATABASE_URL) {
    prisma.mzPortfolio.update({
      where: { id },
      data: {
        ...(updatedItem.title && { title: updatedItem.title }),
        ...(updatedItem.category && { category: updatedItem.category }),
        ...(updatedItem.description && { description: updatedItem.description }),
        ...(updatedItem.url && { url: updatedItem.url }),
        ...(updatedItem.displayUrl !== undefined && { displayUrl: updatedItem.displayUrl }),
        ...(updatedItem.tagline !== undefined && { tagline: updatedItem.tagline }),
        ...(updatedItem.subheadline !== undefined && { subheadline: updatedItem.subheadline }),
        ...(updatedItem.previewImage !== undefined && { previewImage: updatedItem.previewImage }),
        ...(updatedItem.favicon !== undefined && { favicon: updatedItem.favicon }),
        ...(updatedItem.features && { featuresJson: JSON.stringify(updatedItem.features) }),
        ...(updatedItem.badge !== undefined && { badge: updatedItem.badge }),
        ...(updatedItem.infrastructure !== undefined && { infrastructure: updatedItem.infrastructure }),
        ...(updatedItem.featured !== undefined && { featured: updatedItem.featured }),
        ...(updatedItem.active !== undefined && { active: updatedItem.active }),
      },
    }).catch((e) => console.warn('Aviso ao atualizar portfólio no Prisma:', e));
  }

  return updatedItem;
}

export function deletePortfolioItem(id: string): boolean {
  const items = getStoredPortfolio();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;

  saveStoredPortfolio(filtered);

  if (process.env.DATABASE_URL) {
    prisma.mzPortfolio.delete({ where: { id } }).catch(() => {});
  }

  return true;
}

