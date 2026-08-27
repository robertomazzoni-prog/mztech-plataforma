import fs from 'fs';
import path from 'path';
import {
  MzClientItem,
  MzProjectItem,
  MzQuoteItem,
  MzContractItem,
  MzContractSnapshot,
  MzPaymentItem,
  MzSubscriptionItem,
  CodeOwnershipType,
  ContractStatus,
} from '@/types/mztech';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import { logActivity } from '@/lib/audit-store';
import { getStoredQuotes, updateQuote } from '@/lib/quotes-store';
import { DEFAULT_CONTRACT_TEMPLATE } from '@/data/mztech-constants';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients-store.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects-store.json');
const CONTRACTS_FILE = path.join(DATA_DIR, 'contracts-store.json');
const SERVICES_FILE = path.join(DATA_DIR, 'services-store.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments-store.json');
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'subscriptions-store.json');

// Bases padrão dinâmicas (iniciam vazias e utilizam PostgreSQL como fonte de verdade)
const defaultClients: MzClientItem[] = [];
const defaultProjects: MzProjectItem[] = [];
const defaultContracts: MzContractItem[] = [];
const defaultPayments: MzPaymentItem[] = [];
const defaultSubscriptions: MzSubscriptionItem[] = [];

// Catálogo padrão de Serviços mzTech
export const defaultServices: any[] = [
  {
    id: 'serv-landing-page',
    name: 'Landing Page de Alta Conversão',
    description: 'Página única responsiva e moderna focada em vendas, captura de leads, WhatsApp integrado e SEO.',
    type: 'DESENVOLVIMENTO',
    price: 890.00,
    recurrence: 'UNICA',
    status: 'ATIVO',
    active: true,
    features: [
      'Design exclusivo focado em conversão',
      'Botão WhatsApp flutuante integrado',
      'Carregamento ultra-rápido (< 1s)',
      'Otimização completa para celulares',
      'Configuração de tags de SEO e Meta tags',
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'serv-site-institucional',
    name: 'Site Institucional Profissional',
    description: 'Site corporativo multi-páginas (Início, Quem Somos, Serviços, Portfólio, Contato e Blog opcional).',
    type: 'DESENVOLVIMENTO',
    price: 1500.00,
    recurrence: 'UNICA',
    status: 'ATIVO',
    active: true,
    features: [
      'Estrutura multi-páginas de alta autoridade',
      'Formulário inteligente de captação de clientes',
      'Integração com e-mail e WhatsApp',
      'Código limpo com Next.js, React e TypeScript',
      'Certificado de Segurança SSL incluso',
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'serv-sistema-web',
    name: 'Sistema Web & Painel Administrativo Sob Medida',
    description: 'Plataforma web personalizada com autenticação de usuários, dashboard, fluxo operacional e controle de dados.',
    type: 'DESENVOLVIMENTO',
    price: 2900.00,
    recurrence: 'UNICA',
    status: 'ATIVO',
    active: true,
    features: [
      'Painel administrativo completo e responsivo',
      'Controle de níveis de acesso (Admin, Usuário, Cliente)',
      'Banco de dados relacional seguro',
      'Exportação de relatórios e relatórios operacionais',
      'APIs REST / Webhooks integrados',
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'serv-plano-hospedagem',
    name: 'Plano Hospedagem Gerenciada',
    description: 'Hospedagem em nuvem de alta velocidade com monitoramento de estabilidade, SSL e suporte técnico.',
    type: 'HOSPEDAGEM',
    price: 39.90,
    recurrence: 'MENSAL',
    status: 'ATIVO',
    active: true,
    features: [
      'Infraestrutura em nuvem gerenciada pela mzTech',
      'Certificado SSL automático e renovado',
      'Configuração de DNS e domínio próprio',
      'Monitoramento contínuo de uptime',
      'Suporte para dúvidas e estabilidade',
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'serv-plano-completo',
    name: 'Plano Hospedagem + Manutenção Técnica',
    description: 'Nosso plano mais recomendado: hospedagem em nuvem, atualizações contínuas de segurança, pequenas alterações e suporte prioritário via WhatsApp.',
    type: 'MANUTENCAO',
    price: 79.90,
    recurrence: 'MENSAL',
    status: 'ATIVO',
    active: true,
    features: [
      'Tudo incluído no Plano Hospedagem',
      'Manutenção preventiva e patches de segurança',
      'Pequenas alterações de textos, telefones e imagens',
      'Rotinas de backup e validação',
      'Suporte prioritário direto com os desenvolvedores (Roberto & Morvan)',
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'serv-suporte-dedicado',
    name: 'Plano Manutenção & Suporte Dedicado',
    description: 'Para empresas com alta demanda que necessitam de SLA reduzido, plantão de atendimento e melhorias contínuas.',
    type: 'SUPORTE',
    price: 149.90,
    recurrence: 'MENSAL',
    status: 'ATIVO',
    active: true,
    features: [
      'Atendimento prioritário em tempo recorde',
      'Backups diários automatizados',
      'Auditorias de performance e segurança',
      'Suporte e alterações sob demanda prioritária',
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

// Global singletons
const globalClientsKey = Symbol.for('mztech.clients');
const globalProjectsKey = Symbol.for('mztech.projects');
const globalContractsKey = Symbol.for('mztech.contracts');
const globalServicesKey = Symbol.for('mztech.services');
const globalPaymentsKey = Symbol.for('mztech.payments');
const globalSubscriptionsKey = Symbol.for('mztech.subscriptions');
const globalObj = globalThis as any;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ============================================================
// CLIENTES (MzClient)
// ============================================================
export function getStoredClients(): MzClientItem[] {
  if (!globalObj[globalClientsKey]) {
    let clients: MzClientItem[] = [];
    try {
      if (fs.existsSync(CLIENTS_FILE)) {
        const content = fs.readFileSync(CLIENTS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          clients = parsed;
        } else {
          clients = [...defaultClients];
          saveStoredClients(clients);
        }
      } else {
        clients = [...defaultClients];
        saveStoredClients(clients);
      }
    } catch (e) {
      clients = [...defaultClients];
    }
    globalObj[globalClientsKey] = clients;
  }
  return globalObj[globalClientsKey];
}

export async function syncClientsFromDb(): Promise<MzClientItem[]> {
  const online = await isDatabaseOnline();
  if (online) {
    try {
      const dbClients = await prisma.mzClient.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          projects: true,
          hostings: true,
          maintenances: true,
          contracts: true,
          backups: true,
          subscriptions: true,
          payments: true,
          _count: {
            select: {
              projects: true,
              hostings: true,
              maintenances: true,
              backups: true,
              subscriptions: true,
              payments: true,
            },
          },
        },
      });
      if (dbClients && dbClients.length > 0) {
        const mapped: MzClientItem[] = dbClients.map((c: any) => ({
          id: c.id,
          companyName: c.companyName,
          contactName: c.contactName,
          whatsapp: c.whatsapp,
          email: c.email,
          domain: c.domain,
          status: c.status as any,
          financialStatus: c.financialStatus as any,
          startDate: c.startDate ? c.startDate.toISOString() : null,
          notes: c.notes,
          cancellationDate: c.cancellationDate ? c.cancellationDate.toISOString() : null,
          terminationEffectiveDate: c.terminationEffectiveDate ? c.terminationEffectiveDate.toISOString() : null,
          cancellationReason: c.cancellationReason,
          terminatedServices: c.terminatedServices,
          codeDelivered: c.codeDelivered,
          backupDelivered: c.backupDelivered,
          deliveredAt: c.deliveredAt ? c.deliveredAt.toISOString() : null,
          deliveredBy: c.deliveredBy,
          terminationNotes: c.terminationNotes,
          projects: c.projects || [],
          hostings: c.hostings || [],
          maintenances: c.maintenances || [],
          contracts: c.contracts || [],
          backups: c.backups || [],
          subscriptions: c.subscriptions || [],
          payments: c.payments || [],
          _count: c._count || {
            projects: c.projects?.length || 0,
            hostings: c.hostings?.length || 0,
            maintenances: c.maintenances?.length || 0,
            backups: c.backups?.length || 0,
          },
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }));

        globalObj[globalClientsKey] = mapped;
        saveStoredClients(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Aviso ao sincronizar clientes do banco:', e);
    }
  }
  return getStoredClients();
}

async function syncClientToPrisma(client: MzClientItem) {
  try {
    if (process.env.DATABASE_URL) {
      await prisma.mzClient.upsert({
        where: { id: client.id },
        create: {
          id: client.id,
          companyName: client.companyName,
          contactName: client.contactName,
          whatsapp: client.whatsapp,
          email: client.email,
          domain: client.domain,
          status: client.status,
          financialStatus: client.financialStatus,
          notes: client.notes,
        },
        update: {
          companyName: client.companyName,
          contactName: client.contactName,
          whatsapp: client.whatsapp,
          email: client.email,
          domain: client.domain,
          status: client.status,
          financialStatus: client.financialStatus,
          notes: client.notes,
        },
      });
    }
  } catch (e) {}
}

export function saveStoredClients(clients: MzClientItem[]) {
  globalObj[globalClientsKey] = clients;
  try {
    ensureDir();
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf-8');
  } catch (e) {}

  if (process.env.DATABASE_URL) {
    clients.forEach((c) => syncClientToPrisma(c).catch(() => {}));
  }
}

export function getStoredClientById(id: string): MzClientItem | null {
  const clients = getStoredClients();
  return clients.find((c) => c.id === id) || null;
}

export function updateStoredClient(id: string, updates: Partial<MzClientItem>): MzClientItem | null {
  const clients = getStoredClients();
  const client = clients.find((c) => c.id === id);
  if (!client) return null;

  Object.assign(client, updates, { updatedAt: new Date().toISOString() });
  saveStoredClients(clients);
  return client;
}

export function deleteStoredClient(id: string): boolean {
  let clients = getStoredClients();
  const initialCount = clients.length;
  clients = clients.filter((c) => c.id !== id);

  if (clients.length !== initialCount) {
    saveStoredClients(clients);

    if (process.env.DATABASE_URL) {
      prisma.mzClient.delete({ where: { id } }).catch(() => {});
    }

    // Remover também os projetos vinculados a este cliente
    let projects = getStoredProjects();
    const updatedProjects = projects.filter((p) => p.clientId !== id && p.client?.id !== id);
    if (updatedProjects.length !== projects.length) {
      saveStoredProjects(updatedProjects);
    }

    return true;
  }
  return false;
}

// PROJETOS (MzProject)
// ============================================================
export function getStoredProjects(): MzProjectItem[] {
  if (!globalObj[globalProjectsKey]) {
    let projects: MzProjectItem[] = [];
    try {
      if (fs.existsSync(PROJECTS_FILE)) {
        const content = fs.readFileSync(PROJECTS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          projects = parsed;
        } else {
          projects = [...defaultProjects];
          saveStoredProjects(projects);
        }
      } else {
        projects = [...defaultProjects];
        saveStoredProjects(projects);
      }
    } catch (e) {
      projects = [...defaultProjects];
    }
    globalObj[globalProjectsKey] = projects;
  }
  return globalObj[globalProjectsKey];
}

export async function syncProjectsFromDb(): Promise<MzProjectItem[]> {
  const online = await isDatabaseOnline();
  if (online) {
    try {
      const dbProjects = await prisma.mzProject.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, companyName: true, contactName: true, email: true, whatsapp: true } },
          hostings: true,
          maintenances: true,
          contracts: true,
          backups: true,
        },
      });
      if (dbProjects && dbProjects.length > 0) {
        const mapped: MzProjectItem[] = dbProjects.map((p: any) => ({
          id: p.id,
          clientId: p.clientId,
          client: p.client,
          name: p.name,
          type: p.type,
          status: p.status,
          startDate: p.startDate ? p.startDate.toISOString() : null,
          deliveryDate: p.deliveryDate ? p.deliveryDate.toISOString() : null,
          domain: p.domain,
          hostingUrl: p.hostingUrl,
          githubRepo: p.githubRepo,
          hostingPlatform: p.hostingPlatform || 'Railway Cloud',
          notes: p.notes,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }));
        globalObj[globalProjectsKey] = mapped;
        saveStoredProjects(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Aviso ao sincronizar projetos do banco:', e);
    }
  }
  return getStoredProjects();
}

async function syncProjectToPrisma(project: MzProjectItem) {
  try {
    if (process.env.DATABASE_URL) {
      // Garante que o cliente existe antes de salvar o projeto
      if (project.clientId) {
        const client = getStoredClientById(project.clientId);
        if (client) {
          await syncClientToPrisma(client);
        }
      }

      await prisma.mzProject.upsert({
        where: { id: project.id },
        create: {
          id: project.id,
          clientId: project.clientId,
          name: project.name,
          type: project.type,
          status: project.status,
          domain: project.domain,
          hostingUrl: project.hostingUrl,
          githubRepo: project.githubRepo,
          notes: project.notes,
        },
        update: {
          name: project.name,
          type: project.type,
          status: project.status,
          domain: project.domain,
          hostingUrl: project.hostingUrl,
          githubRepo: project.githubRepo,
          notes: project.notes,
        },
      });
    }
  } catch (e) {}
}

export function saveStoredProjects(projects: MzProjectItem[]) {
  globalObj[globalProjectsKey] = projects;
  try {
    ensureDir();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (e) {}

  if (process.env.DATABASE_URL) {
    projects.forEach((p) => syncProjectToPrisma(p).catch(() => {}));
  }
}

export function updateStoredProject(id: string, updates: Partial<MzProjectItem>): MzProjectItem | null {
  const projects = getStoredProjects();
  const project = projects.find((p) => p.id === id);
  if (!project) return null;

  Object.assign(project, updates, { updatedAt: new Date().toISOString() });
  saveStoredProjects(projects);
  return project;
}

export function deleteStoredProject(id: string): boolean {
  let projects = getStoredProjects();
  const initialCount = projects.length;
  projects = projects.filter((p) => p.id !== id);

  if (projects.length !== initialCount) {
    saveStoredProjects(projects);
    if (process.env.DATABASE_URL) {
      prisma.mzProject.delete({ where: { id } }).catch(() => {});
    }
    return true;
  }
  return false;
}

// CONTRATOS (MzContract) COM SNAPSHOT
// ============================================================
export function getStoredContracts(): MzContractItem[] {
  if (!globalObj[globalContractsKey]) {
    let contracts: MzContractItem[] = [];
    try {
      if (fs.existsSync(CONTRACTS_FILE)) {
        const content = fs.readFileSync(CONTRACTS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          contracts = parsed;
        } else {
          contracts = [...defaultContracts];
          saveStoredContracts(contracts);
        }
      } else {
        contracts = [...defaultContracts];
        saveStoredContracts(contracts);
      }
    } catch (e) {
      contracts = [...defaultContracts];
    }
    globalObj[globalContractsKey] = contracts;
  }
  return globalObj[globalContractsKey];
}

export async function syncContractsFromDb(): Promise<MzContractItem[]> {
  const online = await isDatabaseOnline();
  if (online) {
    try {
      const dbContracts = await prisma.mzContract.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, companyName: true, contactName: true, email: true, whatsapp: true } },
          project: { select: { id: true, name: true, domain: true } },
        },
      });
      if (dbContracts && dbContracts.length > 0) {
        const current = getStoredContracts();
        const localMap = new Map(current.map((c) => [c.id, c]));
        current.forEach((c) => {
          if (c.contractNumber) localMap.set(c.contractNumber, c);
        });

        const mapped: MzContractItem[] = dbContracts.map((c: any) => {
          const local = localMap.get(c.id);
          return {
            id: c.id,
            contractNumber: local?.contractNumber || c.id,
            clientId: c.clientId,
            client: c.client || local?.client,
            projectId: c.projectId || local?.projectId,
            project: c.project || local?.project,
            title: c.title,
            content: c.content,
            totalDevPrice: c.totalDevPrice,
            monthlyPrice: c.monthlyPrice,
            discount: local?.discount || 0,
            dueDay: local?.dueDay || 10,
            paymentMethod: c.paymentMethod,
            periodicity: local?.periodicity || 'Mensal',
            termsVersion: c.termsVersion,
            codeOwnershipType: c.codeOwnershipType,
            scopeDevelopment: c.scopeDevelopment,
            scopeHosting: c.scopeHosting,
            scopeMaintenance: c.scopeMaintenance,
            scopeSupport: c.scopeSupport,
            backupRetentionDays: c.backupRetentionDays,
            migrationExcluded: c.migrationExcluded,
            status: c.status,
            signedAt: c.signedAt ? c.signedAt.toISOString() : local?.signedAt || null,
            providerSigned: local?.providerSigned !== undefined ? local.providerSigned : Boolean(c.signedAt),
            providerSignedBy: local?.providerSignedBy,
            providerSignedAt: local?.providerSignedAt,
            providerSignedIp: local?.providerSignedIp,
            providerSignatureDataUrl: local?.providerSignatureDataUrl,
            clientSigned: local?.clientSigned !== undefined ? local.clientSigned : Boolean(c.signedAt),
            clientSignedBy: local?.clientSignedBy,
            clientSignedDocument: local?.clientSignedDocument,
            clientSignedAt: local?.clientSignedAt,
            clientSignedIp: local?.clientSignedIp,
            clientSignedUserAgent: local?.clientSignedUserAgent,
            clientSignatureDataUrl: local?.clientSignatureDataUrl,
            acceptedOnline: local?.acceptedOnline !== undefined ? local.acceptedOnline : Boolean(c.signedAt),
            acceptedAt: local?.acceptedAt,
            acceptedIp: local?.acceptedIp,
            acceptedUserAgent: local?.acceptedUserAgent,
            signatureCertificateHash: local?.signatureCertificateHash,
            snapshot: local?.snapshot,
            notes: c.notes,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
          };
        });

        globalObj[globalContractsKey] = mapped;
        saveStoredContracts(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Aviso ao sincronizar contratos do banco:', e);
    }
  }
  return getStoredContracts();
}

async function syncContractToPrisma(contract: MzContractItem) {
  try {
    if (process.env.DATABASE_URL) {
      if (contract.clientId) {
        const client = getStoredClientById(contract.clientId);
        if (client) {
          await syncClientToPrisma(client);
        }
      }

      await prisma.mzContract.upsert({
        where: { id: contract.id },
        create: {
          id: contract.id,
          clientId: contract.clientId,
          projectId: contract.projectId || null,
          title: contract.title,
          content: contract.content || '',
          totalDevPrice: contract.totalDevPrice || 0,
          monthlyPrice: contract.monthlyPrice || 0,
          paymentMethod: contract.paymentMethod || 'PIX / Cartão de Crédito',
          termsVersion: contract.termsVersion || 'v2.0-2026',
          codeOwnershipType: contract.codeOwnershipType || 'PROPRIEDADE_CLIENTE',
          scopeDevelopment: contract.scopeDevelopment || null,
          scopeHosting: contract.scopeHosting || null,
          scopeMaintenance: contract.scopeMaintenance || null,
          scopeSupport: contract.scopeSupport || null,
          backupRetentionDays: contract.backupRetentionDays || 30,
          migrationExcluded: contract.migrationExcluded !== undefined ? contract.migrationExcluded : true,
          status: contract.status || (contract.clientSigned ? 'ATIVO' : 'RASCUNHO'),
          signedAt: contract.signedAt ? new Date(contract.signedAt) : (contract.clientSignedAt ? new Date(contract.clientSignedAt) : null),
          notes: contract.notes || null,
        },
        update: {
          title: contract.title,
          content: contract.content || '',
          totalDevPrice: contract.totalDevPrice || 0,
          monthlyPrice: contract.monthlyPrice || 0,
          status: contract.status || (contract.clientSigned ? 'ATIVO' : 'RASCUNHO'),
          signedAt: contract.signedAt ? new Date(contract.signedAt) : (contract.clientSignedAt ? new Date(contract.clientSignedAt) : null),
          notes: contract.notes || null,
        },
      });
    }
  } catch (e) {}
}

export function saveStoredContracts(contracts: MzContractItem[]) {
  globalObj[globalContractsKey] = contracts;
  try {
    ensureDir();
    fs.writeFileSync(CONTRACTS_FILE, JSON.stringify(contracts, null, 2), 'utf-8');
  } catch (e) {}

  if (process.env.DATABASE_URL) {
    contracts.forEach((c) => syncContractToPrisma(c).catch(() => {}));
  }
}

export function getStoredContractById(id: string): MzContractItem | null {
  const contracts = getStoredContracts();
  return contracts.find((c) => c.id === id || c.contractNumber === id) || null;
}

export function updateStoredContract(id: string, updates: Partial<MzContractItem>): MzContractItem | null {
  const contracts = getStoredContracts();
  const contract = contracts.find((c) => c.id === id || c.contractNumber === id);
  if (!contract) return null;

  Object.assign(contract, updates, { updatedAt: new Date().toISOString() });
  saveStoredContracts(contracts);
  return contract;
}

export function deleteStoredContract(id: string): boolean {
  let contracts = getStoredContracts();
  const contract = contracts.find((c) => c.id === id || c.contractNumber === id);
  const targetId = contract ? contract.id : id;

  const initialCount = contracts.length;
  contracts = contracts.filter((c) => c.id !== targetId && c.contractNumber !== id && c.id !== id);

  if (contracts.length !== initialCount || contract) {
    saveStoredContracts(contracts);
    if (process.env.DATABASE_URL) {
      prisma.mzContract.deleteMany({
        where: {
          OR: [
            { id: targetId },
            { id: id },
          ],
        },
      }).catch(() => {});
    }
    return true;
  }
  return false;
}

// ============================================================
// SERVIÇOS & PLANOS (MzService)
// ============================================================
export function getStoredServices(): any[] {
  if (!globalObj[globalServicesKey]) {
    try {
      if (fs.existsSync(SERVICES_FILE)) {
        const content = fs.readFileSync(SERVICES_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          globalObj[globalServicesKey] = parsed;
          return parsed;
        }
      }
    } catch (e) {}
    globalObj[globalServicesKey] = defaultServices;
    saveStoredServices(defaultServices);
  }
  return globalObj[globalServicesKey];
}

export function saveStoredServices(services: any[]) {
  globalObj[globalServicesKey] = services;
  try {
    ensureDir();
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(services, null, 2), 'utf-8');
  } catch (e) {}
}

export function updateStoredService(id: string, updates: any): any | null {
  const services = getStoredServices();
  const service = services.find((s) => s.id === id);
  if (!service) return null;

  Object.assign(service, updates, { updatedAt: new Date().toISOString() });
  saveStoredServices(services);
  return service;
}

export function deleteStoredService(id: string): boolean {
  let services = getStoredServices();
  const initialCount = services.length;
  services = services.filter((s) => s.id !== id);

  if (services.length !== initialCount) {
    saveStoredServices(services);
    return true;
  }
  return false;
}

export function createStoredService(service: any): any {
  const services = getStoredServices();
  const newService = {
    id: service.id || `serv-${Date.now()}`,
    ...service,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  services.push(newService);
  saveStoredServices(services);
  return newService;
}

// ============================================================
// PAGAMENTOS (MzPayment)
// ============================================================
export function getStoredPayments(): MzPaymentItem[] {
  if (!globalObj[globalPaymentsKey]) {
    let payments: MzPaymentItem[] = [];
    try {
      if (fs.existsSync(PAYMENTS_FILE)) {
        const content = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          payments = parsed;
        }
      } else {
        payments = [...defaultPayments];
        saveStoredPayments(payments);
      }
    } catch (e) {
      payments = [];
    }
    globalObj[globalPaymentsKey] = payments;
  }
  return globalObj[globalPaymentsKey];
}

async function syncPaymentToPrisma(payment: MzPaymentItem) {
  try {
    if (process.env.DATABASE_URL) {
      await prisma.mzPayment.upsert({
        where: { id: payment.id },
        create: {
          id: payment.id,
          clientId: payment.clientId,
          subscriptionId: payment.subscriptionId || null,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          dueDate: new Date(payment.dueDate),
          paidAt: payment.paidAt ? new Date(payment.paidAt) : null,
          gateway: payment.gateway || 'SANDBOX_MOCK',
          notes: payment.notes || null,
        },
        update: {
          status: payment.status,
          paidAt: payment.paidAt ? new Date(payment.paidAt) : null,
          notes: payment.notes || null,
        },
      });
    }
  } catch (e) {}
}

export function saveStoredPayments(payments: MzPaymentItem[]) {
  globalObj[globalPaymentsKey] = payments;
  try {
    ensureDir();
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), 'utf-8');
  } catch (e) {}

  if (process.env.DATABASE_URL) {
    payments.forEach((p) => syncPaymentToPrisma(p).catch(() => {}));
  }
}

export function createStoredPayment(payment: Partial<MzPaymentItem>): MzPaymentItem {
  const payments = getStoredPayments();
  const nowStr = new Date().toISOString();
  const count = payments.length + 1;
  const transactionId = payment.transactionId || `TXN-2026-${count.toString().padStart(4, '0')}`;

  const newPayment: MzPaymentItem = {
    id: payment.id || `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    transactionId,
    clientId: payment.clientId || '',
    client: payment.client,
    contractId: payment.contractId || null,
    subscriptionId: payment.subscriptionId || null,
    title: payment.title || 'Cobrança mzTech',
    amount: payment.amount !== undefined ? Number(payment.amount) : 0,
    paymentMethod: payment.paymentMethod || 'CREDIT_CARD',
    paymentType: payment.paymentType || 'TAXA_INICIAL',
    status: payment.status || 'PENDING',
    dueDate: payment.dueDate || nowStr,
    paidAt: payment.paidAt || null,
    gateway: payment.gateway || 'SANDBOX_MOCK',
    gatewayPaymentId: payment.gatewayPaymentId || `mock_gw_${Date.now()}`,
    gatewayPixQrCode: payment.gatewayPixQrCode || null,
    retryCount: payment.retryCount || 0,
    failureReason: payment.failureReason || null,
    notes: payment.notes || null,
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  payments.unshift(newPayment);
  saveStoredPayments(payments);
  return newPayment;
}

export function updateStoredPayment(id: string, updates: Partial<MzPaymentItem>): MzPaymentItem | null {
  const payments = getStoredPayments();
  const payment = payments.find((p) => p.id === id);
  if (!payment) return null;

  Object.assign(payment, updates, { updatedAt: new Date().toISOString() });
  saveStoredPayments(payments);
  return payment;
}

export function deleteStoredPayment(id: string): boolean {
  let payments = getStoredPayments();
  const initialCount = payments.length;
  payments = payments.filter((p) => p.id !== id);

  if (payments.length !== initialCount) {
    saveStoredPayments(payments);
    if (process.env.DATABASE_URL) {
      prisma.mzPayment.delete({ where: { id } }).catch(() => {});
    }
    return true;
  }
  return false;
}

export function deleteStoredSubscription(id: string): boolean {
  let subs = getStoredSubscriptions();
  const initialCount = subs.length;
  subs = subs.filter((s) => s.id !== id);
  if (subs.length !== initialCount) {
    saveStoredSubscriptions(subs);
    return true;
  }
  return false;
}

// ============================================================
// RECORRÊNCIAS / ASSINATURAS (MzSubscription)
// ============================================================
export function getStoredSubscriptions(): MzSubscriptionItem[] {
  if (!globalObj[globalSubscriptionsKey]) {
    let subs: MzSubscriptionItem[] = [];
    try {
      if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
        const content = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          subs = parsed;
        }
      } else {
        subs = [...defaultSubscriptions];
        saveStoredSubscriptions(subs);
      }
    } catch (e) {
      subs = [];
    }
    globalObj[globalSubscriptionsKey] = subs;
  }
  return globalObj[globalSubscriptionsKey];
}

async function syncSubscriptionToPrisma(sub: MzSubscriptionItem) {
  try {
    if (process.env.DATABASE_URL) {
      await prisma.mzSubscription.upsert({
        where: { id: sub.id },
        create: {
          id: sub.id,
          clientId: sub.clientId,
          projectId: sub.projectId || null,
          planName: sub.planName,
          amount: sub.amount,
          periodicity: sub.periodicity || 'MENSAL',
          paymentMethod: sub.paymentMethod || 'CREDIT_CARD',
          status: sub.status || 'ACTIVE',
          gateway: sub.gateway || 'SANDBOX_MOCK',
          notes: sub.notes || null,
        },
        update: {
          planName: sub.planName,
          amount: sub.amount,
          status: sub.status,
          notes: sub.notes,
        },
      });
    }
  } catch (e) {}
}

export function saveStoredSubscriptions(subs: MzSubscriptionItem[]) {
  globalObj[globalSubscriptionsKey] = subs;
  try {
    ensureDir();
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2), 'utf-8');
  } catch (e) {}

  if (process.env.DATABASE_URL) {
    subs.forEach((s) => syncSubscriptionToPrisma(s).catch(() => {}));
  }
}

export function createStoredSubscription(sub: Partial<MzSubscriptionItem>): MzSubscriptionItem {
  const subs = getStoredSubscriptions();
  const now = new Date();
  const nextBilling = new Date();
  nextBilling.setDate(nextBilling.getDate() + 30);

  const newSub: MzSubscriptionItem = {
    id: sub.id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    clientId: sub.clientId || '',
    client: sub.client,
    projectId: sub.projectId || null,
    contractId: sub.contractId || null,
    planName: sub.planName || 'Plano Hospedagem + Manutenção',
    amount: sub.amount !== undefined ? Number(sub.amount) : 79.90,
    periodicity: sub.periodicity || 'MENSAL',
    paymentMethod: sub.paymentMethod || 'CREDIT_CARD',
    status: sub.status || 'ACTIVE',
    startDate: sub.startDate || now.toISOString(),
    nextBillingDate: sub.nextBillingDate || nextBilling.toISOString(),
    cancellationDate: sub.cancellationDate || null,
    cancellationReason: sub.cancellationReason || null,
    gateway: sub.gateway || 'SANDBOX_MOCK',
    gatewaySubscriptionId: sub.gatewaySubscriptionId || `sub_gw_${Date.now()}`,
    gatewayCustomerId: sub.gatewayCustomerId || `cust_gw_${Date.now()}`,
    notes: sub.notes || null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  subs.unshift(newSub);
  saveStoredSubscriptions(subs);
  return newSub;
}

// ============================================================
// FLUXO AUTOMÁTICO DE APROVAÇÃO COMERCIAL ("ACEITAR SERVIÇO")
// ============================================================
export async function approveQuoteAndGenerateContract(quoteId: string, adminName: string = 'Roberto') {
  const quotes = getStoredQuotes();
  const quote = quotes.find((q) => q.id === quoteId);
  if (!quote) {
    throw new Error('Orçamento não encontrado.');
  }

  const nowStr = new Date().toISOString();
  const company = quote.company || quote.name;
  const isOnlyDev = Boolean(quote.needsHosting?.toLowerCase().includes('apenas'));
  const initialDevPrice = Number(quote.initialDevPrice !== undefined ? quote.initialDevPrice : 0);
  const monthlyPrice = isOnlyDev ? 0 : Number(quote.monthlyPrice !== undefined ? quote.monthlyPrice : 0);
  const paymentMethodChoice = quote.paymentMethodChoice || 'CREDIT_CARD_RECURRING';

  // 1. Criar ou Obter Cliente
  let clients = getStoredClients();
  let client = clients.find(
    (c) =>
      c.companyName?.toLowerCase() === company.toLowerCase() ||
      c.email?.toLowerCase() === quote.email.toLowerCase()
  );

  // Extrair domínio próprio informado pelo cliente
  const extractedDomain =
    quote.customDomain ||
    (quote.hasDomain && quote.hasDomain.includes('(') && quote.hasDomain.includes(')')
      ? quote.hasDomain.substring(quote.hasDomain.indexOf('(') + 1, quote.hasDomain.indexOf(')')).trim()
      : quote.hasDomain && quote.hasDomain.includes(':')
      ? quote.hasDomain.split(':')[1]?.trim()
      : null);

  const clientDomain = extractedDomain || (quote.hasDomain?.toLowerCase().includes('sim') ? `${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br` : null);

  if (!client) {
    const newClientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    client = {
      id: newClientId,
      companyName: company,
      contactName: quote.name,
      cnpjCpf: quote.cnpjCpf || null,
      whatsapp: quote.whatsapp,
      email: quote.email,
      domain: clientDomain,
      status: 'ATIVO',
      financialStatus: 'PENDENTE',
      startDate: nowStr,
      notes: `Cliente originado do orçamento comercial ${quote.quoteNumber || quote.id} • Aprovado por ${adminName}`,
      codeDelivered: false,
      backupDelivered: false,
      projects: [],
      hostings: isOnlyDev ? [] : [{
        id: `host-${Date.now()}`,
        clientId: newClientId,
        provider: 'Railway Cloud',
        url: clientDomain ? (clientDomain.startsWith('http') ? clientDomain : `https://${clientDomain}`) : 'https://app.mztech.dev',
        customDomain: clientDomain,
        monthlyPrice,
        status: 'ATIVO',
        startDate: nowStr,
        createdAt: nowStr,
        updatedAt: nowStr,
      }],
      _count: { projects: 1, hostings: isOnlyDev ? 0 : 1, maintenances: 0, backups: 1 },
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    clients.unshift(client);
    saveStoredClients(clients);

    logActivity({
      actor: adminName,
      action: 'CRIAR_CLIENTE',
      category: 'CLIENTE',
      targetId: client.id,
      targetNumber: client.companyName,
      description: `Cliente "${client.companyName}" (${client.contactName}) foi cadastrado automaticamente.`,
    });
  }

  const chosenDev = quote.selectedDev?.includes('Morvan')
    ? 'Morvan'
    : quote.selectedDev?.includes('Roberto')
    ? 'Roberto'
    : (adminName?.includes('Morvan') ? 'Morvan' : 'Roberto');

  // 2. Criar Projeto Registrado
  let projects = getStoredProjects();
  const projectName = `${quote.projectType} - ${company}`;
  let project = projects.find((p) => p.clientId === client.id && p.name === projectName);

  if (!project) {
    project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientId: client.id,
      client: {
        id: client.id,
        companyName: client.companyName,
        contactName: client.contactName,
        email: client.email,
        whatsapp: client.whatsapp,
      },
      name: projectName,
      type: quote.projectType?.includes('SISTEMA')
        ? 'SISTEMA_WEB'
        : quote.projectType?.includes('LOJA')
        ? 'ECOMMERCE'
        : 'SITE_INSTITUCIONAL',
      status: 'PLANEJAMENTO',
      startDate: nowStr,
      deliveryDate: null,
      domain: client.domain || null,
      hostingUrl: client.domain ? `https://${client.domain}` : 'https://app.mztech.dev',
      hostingPlatform: 'Railway Cloud',
      responsibleDev: chosenDev,
      notes: `Projeto vinculado ao orçamento ${quote.quoteNumber || quote.id}. Desenvolvedor especialista: ${chosenDev}.`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    projects.unshift(project);
    saveStoredProjects(projects);

    if (!client.projects) client.projects = [];
    client.projects.push(project);
    saveStoredClients(clients);

    logActivity({
      actor: adminName,
      action: 'CRIAR_PROJETO',
      category: 'PROJETO',
      targetId: project.id,
      targetNumber: project.name,
      description: `Projeto "${project.name}" foi criado e alocado para ${chosenDev}.`,
    });
  }

  // 3. Gerar Snapshot Imutável e Contrato Formal
  const contracts = getStoredContracts();
  const contractCount = contracts.length + 1;
  const contractNumber = `CTR-2026-${contractCount.toString().padStart(4, '0')}`;

  const snapshot: MzContractSnapshot = {
    clientName: quote.name,
    companyName: company,
    email: quote.email,
    whatsapp: quote.whatsapp,
    cnpjCpf: quote.cnpjCpf || null,
    projectName: project.name,
    serviceType: quote.projectType,
    initialDevPrice,
    monthlyPrice,
    paymentMethod: paymentMethodChoice === 'CREDIT_CARD_RECURRING'
      ? 'Cartão de Crédito (Recorrência Mensal Automática)'
      : paymentMethodChoice === 'PIX'
      ? 'PIX (À Vista / Chave Oficial)'
      : paymentMethodChoice === 'CARD_PLUS_PIX'
      ? 'Entrada PIX + Mensalidade no Cartão'
      : 'Cartão de Crédito (Parcelado em até 12x)',
    periodicity: quote.billingPeriodicity || 'MENSAL',
    dueDay: quote.dueDay || 10,
    hasHosting: !isOnlyDev,
    hasMaintenance: !isOnlyDev,
    hasDomain: quote.hasDomain || 'Não informado',
    backupRetentionDays: 30,
    codeOwnership: 'PROPRIEDADE_CLIENTE',
    termsVersion: 'v2.0-2026',
    assignedDev: chosenDev,
    generatedAt: nowStr,
  };

  const clientAlreadyHasDomain = Boolean(
    quote.hasDomain?.toLowerCase().includes('sim') || quote.hasDomain?.toLowerCase().includes('já possuo')
  );

  const newContract: MzContractItem = {
    id: `contract-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    contractNumber,
    clientId: client.id,
    client: {
      id: client.id,
      companyName: client.companyName,
      contactName: client.contactName,
      email: client.email,
      whatsapp: client.whatsapp,
      cnpjCpf: client.cnpjCpf || null,
    },
    projectId: project.id,
    project: {
      id: project.id,
      name: project.name,
      domain: project.domain || (clientAlreadyHasDomain ? 'Domínio Próprio do Cliente' : null),
    },
    quoteId: quote.id,
    assignedDev: chosenDev,
    title: `Contrato de Prestação de Serviços Digitais — ${company}`,
    content: DEFAULT_CONTRACT_TEMPLATE,
    totalDevPrice: initialDevPrice,
    monthlyPrice,
    discount: quote.discount || 0,
    paymentMethod: snapshot.paymentMethod,
    periodicity: snapshot.periodicity,
    dueDay: snapshot.dueDay,
    termsVersion: 'v2.0-2026',
    codeOwnershipType: 'PROPRIEDADE_CLIENTE',
    scopeDevelopment: `Desenvolvimento de ${quote.projectType} com alta performance e design responsivo.${clientAlreadyHasDomain ? ' Inclui configuração técnica de DNS e apontamento do domínio próprio já existente.' : ''}`,
    scopeHosting: isOnlyDev ? 'Não contratada (Apenas Desenvolvimento)' : 'Hospedagem em nuvem Railway com certificado SSL incluso.',
    scopeMaintenance: isOnlyDev ? 'Garantia de 90 dias após entrega do código.' : 'Manutenção preventiva, correções e suporte prioritário via WhatsApp.',
    scopeSupport: isOnlyDev ? 'Suporte durante o período de desenvolvimento.' : `Atendimento direto com o sócio desenvolvedor ${chosenDev}.`,
    backupRetentionDays: 30,
    migrationExcluded: true,
    status: 'AGUARDANDO_PAGAMENTO',
    snapshot,
    providerSigned: false,
    providerSignedBy: null,
    providerSignedAt: null,
    providerSignedIp: null,
    clientSigned: false,
    clientSignedBy: null,
    clientSignedAt: null,
    acceptedOnline: false,
    acceptedAt: null,
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  contracts.unshift(newContract);
  saveStoredContracts(contracts);

  logActivity({
    actor: adminName,
    action: 'GERAR_CONTRATO',
    category: 'CONTRATO',
    targetId: newContract.id,
    targetNumber: newContract.contractNumber,
    description: `Contrato ${newContract.contractNumber} gerado para "${company}". Aguardando assinatura digital do cliente para liberação da cobrança.`,
    details: {
      devPrice: initialDevPrice,
      monthlyPrice,
      metodo: snapshot.paymentMethod,
    },
  });

  // 5. Atualizar o Orçamento como APROVADO e com os Vínculos
  updateQuote(quote.id, {
    status: 'APROVADO',
    approvedBy: adminName,
    approvedAt: nowStr,
    responsibleAdmin: adminName,
    linkedClientId: client.id,
    linkedProjectId: project.id,
    linkedContractId: newContract.id,
    linkedPaymentId: null,
  });

  logActivity({
    actor: adminName,
    action: 'APROVAR_ORCAMENTO',
    category: 'ORCAMENTO',
    targetId: quote.id,
    targetNumber: quote.quoteNumber,
    description: `${adminName} aprovou o orçamento comercial ${quote.quoteNumber || quote.id}.`,
  });

  return {
    quote,
    client,
    project,
    contract: newContract,
    payment: null,
  };
}

/**
 * Libera e gera as cobranças e recorrências na Gestão Financeira SOMENTE após a assinatura do contrato pelo cliente
 */
export function generateBillingForSignedContract(contractId: string): { payment?: MzPaymentItem; subscription?: MzSubscriptionItem } | null {
  const contracts = getStoredContracts();
  const contract = contracts.find((c) => c.id === contractId);
  if (!contract) return null;

  const payments = getStoredPayments();
  const existingPayment = payments.find((p) => p.contractId === contract.id);

  let initialCharge: MzPaymentItem | undefined = existingPayment;

  // 1. Gerar Cobrança Inicial de Desenvolvimento (se houver valor e ainda não existir)
  if (contract.totalDevPrice > 0 && !existingPayment) {
    const clients = getStoredClients();
    const client = clients.find((c) => c.id === contract.clientId) || contract.client;

    const isPixOnly = Boolean(
      contract.paymentMethod?.toLowerCase().includes('pix') &&
      !contract.paymentMethod?.toLowerCase().includes('cartão') &&
      !contract.paymentMethod?.toLowerCase().includes('cartao')
    );

    initialCharge = createStoredPayment({
      clientId: contract.clientId,
      client: {
        id: contract.clientId,
        companyName: client?.companyName || 'Cliente',
        contactName: client?.contactName || 'Contato',
      },
      contractId: contract.id,
      title: `Taxa de Desenvolvimento Inicial — ${contract.project?.name || contract.title}`,
      amount: contract.totalDevPrice,
      paymentMethod: isPixOnly ? 'PIX' : 'CREDIT_CARD',
      paymentType: 'TAXA_INICIAL',
      status: 'PENDING',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 dias para pagamento
      notes: `Cobrança liberada após assinatura digital do contrato ${contract.contractNumber}`,
    });

    logActivity({
      actor: 'Sistema mzTech',
      action: 'CRIAR_COBRANCA',
      category: 'PAGAMENTO',
      targetId: initialCharge.id,
      targetNumber: initialCharge.transactionId,
      description: `Cobrança inicial de R$ ${contract.totalDevPrice.toFixed(2)} (${initialCharge.transactionId}) gerada para Gestão Financeira após assinatura do contrato ${contract.contractNumber}.`,
    });
  }

  // 2. Se houver mensalidade, registrar a assinatura recorrente
  let newSubscription: MzSubscriptionItem | undefined;
  if (contract.monthlyPrice > 0) {
    const subscriptions = getStoredSubscriptions();
    const existingSub = subscriptions.find((s) => s.contractId === contract.id);

    if (!existingSub) {
      const clients = getStoredClients();
      const client = clients.find((c) => c.id === contract.clientId) || contract.client;

      const isSubPixOnly = Boolean(
        contract.paymentMethod?.toLowerCase().includes('pix') &&
        !contract.paymentMethod?.toLowerCase().includes('cartão') &&
        !contract.paymentMethod?.toLowerCase().includes('cartao')
      );

      newSubscription = createStoredSubscription({
        clientId: contract.clientId,
        client: {
          id: contract.clientId,
          companyName: client?.companyName || 'Cliente',
          contactName: client?.contactName || 'Contato',
          email: client?.email || '',
        },
        projectId: contract.projectId,
        contractId: contract.id,
        planName: contract.title || 'Plano Hospedagem + Manutenção mzTech',
        amount: contract.monthlyPrice,
        periodicity: 'MENSAL',
        paymentMethod: isSubPixOnly ? 'PIX' : 'CREDIT_CARD',
        status: 'ACTIVE',
        notes: `Recorrência ativada após assinatura digital do contrato ${contract.contractNumber}`,
      });

      logActivity({
        actor: 'Sistema mzTech',
        action: 'CRIAR_ASSINATURA',
        category: 'PAGAMENTO',
        targetId: newSubscription.id,
        description: `Recorrência mensal de R$ ${contract.monthlyPrice.toFixed(2)}/mês ativada na Gestão Financeira após assinatura do contrato ${contract.contractNumber}.`,
      });
    } else {
      newSubscription = existingSub;
    }
  }

  return { payment: initialCharge, subscription: newSubscription };
}

/**
 * Legado para manter compatibilidade total
 */
export async function finalizeQuoteAndRegisterProject(quote: MzQuoteItem) {
  return approveQuoteAndGenerateContract(quote.id, quote.selectedDev || 'Roberto');
}
