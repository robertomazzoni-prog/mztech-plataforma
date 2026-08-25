import fs from 'fs';
import path from 'path';
import { MzClientItem, MzProjectItem, MzQuoteItem } from '@/types/mztech';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients-store.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects-store.json');
const CONTRACTS_FILE = path.join(DATA_DIR, 'contracts-store.json');
const SERVICES_FILE = path.join(DATA_DIR, 'services-store.json');

// Base limpa sem clientes fictícios de teste
const defaultClients: any[] = [];

// Base limpa sem projetos fictícios de teste
const defaultProjects: any[] = [];

// Base de contratos
const defaultContracts: any[] = [];

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
const globalObj = globalThis as any;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getStoredClients(): any[] {
  if (!globalObj[globalClientsKey]) {
    try {
      if (fs.existsSync(CLIENTS_FILE)) {
        const content = fs.readFileSync(CLIENTS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          globalObj[globalClientsKey] = parsed;
          return parsed;
        }
      }
    } catch (e) {}
    globalObj[globalClientsKey] = defaultClients;
  }
  return globalObj[globalClientsKey];
}

export function saveStoredClients(clients: any[]) {
  globalObj[globalClientsKey] = clients;
  try {
    ensureDir();
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf-8');
  } catch (e) {}
}

export function getStoredProjects(): any[] {
  if (!globalObj[globalProjectsKey]) {
    try {
      if (fs.existsSync(PROJECTS_FILE)) {
        const content = fs.readFileSync(PROJECTS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          globalObj[globalProjectsKey] = parsed;
          return parsed;
        }
      }
    } catch (e) {}
    globalObj[globalProjectsKey] = defaultProjects;
  }
  return globalObj[globalProjectsKey];
}

export function saveStoredProjects(projects: any[]) {
  globalObj[globalProjectsKey] = projects;
  try {
    ensureDir();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (e) {}
}

export function getStoredContracts(): any[] {
  if (!globalObj[globalContractsKey]) {
    try {
      if (fs.existsSync(CONTRACTS_FILE)) {
        const content = fs.readFileSync(CONTRACTS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          globalObj[globalContractsKey] = parsed;
          return parsed;
        }
      }
    } catch (e) {}
    globalObj[globalContractsKey] = defaultContracts;
  }
  return globalObj[globalContractsKey];
}

export function saveStoredContracts(contracts: any[]) {
  globalObj[globalContractsKey] = contracts;
  try {
    ensureDir();
    fs.writeFileSync(CONTRACTS_FILE, JSON.stringify(contracts, null, 2), 'utf-8');
  } catch (e) {}
}

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

export function getStoredClientById(id: string): any | null {
  const clients = getStoredClients();
  return clients.find((c) => c.id === id) || null;
}

export function updateStoredClient(id: string, updates: any): any | null {
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

export function updateStoredProject(id: string, updates: any): any | null {
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
    return true;
  }
  return false;
}

/**
 * Função central para finalizar um projeto/orçamento e registrar automaticamente
 * em Clientes (MzClient) e Projetos (MzProject).
 */
export async function finalizeQuoteAndRegisterProject(quote: MzQuoteItem) {
  const company = quote.company || quote.name;
  const dev = quote.selectedDev || 'Roberto';
  const nowStr = new Date().toISOString();

  // 1. Criar ou Obter Cliente
  let clients = getStoredClients();
  let client = clients.find(
    (c) =>
      c.companyName?.toLowerCase() === company.toLowerCase() ||
      c.email?.toLowerCase() === quote.email.toLowerCase()
  );

  if (!client) {
    client = {
      id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      companyName: company,
      contactName: quote.name,
      whatsapp: quote.whatsapp,
      email: quote.email,
      domain: quote.hasDomain?.includes('Sim') ? `${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br` : null,
      status: 'ATIVO',
      financialStatus: 'EM_DIA',
      startDate: nowStr,
      notes: `Cliente cadastrado via Finalização de Projeto • Desenvolvedor: ${dev} • ${quote.notes || ''}`,
      codeDelivered: true,
      backupDelivered: true,
      deliveredAt: nowStr,
      deliveredBy: dev,
      projects: [],
      hostings: [{ id: `host-${Date.now()}`, provider: 'Railway', monthlyPrice: 79.90, status: 'ATIVO' }],
      _count: { projects: 1, hostings: 1, maintenances: 0, backups: 1 },
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    clients.unshift(client);
    saveStoredClients(clients);
  } else {
    client.status = 'ATIVO';
    client.financialStatus = 'EM_DIA';
    client.updatedAt = nowStr;
    saveStoredClients(clients);
  }

  // 2. Criar Projeto Registrado
  let projects = getStoredProjects();
  const projectName = `${quote.projectType} - ${company}`;
  let project = projects.find((p) => p.clientId === client.id && p.name === projectName);

  if (!project) {
    project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientId: client.id,
      client: {
        id: client.id,
        companyName: client.companyName,
        contactName: client.contactName,
        email: client.email,
        whatsapp: client.whatsapp,
      },
      name: projectName,
      type: quote.projectType.includes('Landing')
        ? 'LANDING_PAGE'
        : quote.projectType.includes('Sistema')
        ? 'SISTEMA_WEB'
        : 'SITE_INSTITUCIONAL',
      status: 'PRODUCAO',
      startDate: quote.createdAt || nowStr,
      deliveryDate: nowStr,
      domain: client.domain || null,
      hostingUrl: client.domain ? `https://${client.domain}` : 'https://app.mztech.dev',
      hostingPlatform: 'Railway Cloud',
      notes: `Desenvolvido por ${dev}. Projeto finalizado com sucesso e entregue ao cliente. Orçamento: ${quote.estimatedBudget || 'Sob proposta'}.`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    projects.unshift(project);
    saveStoredProjects(projects);

    // Atualizar vínculo no cliente
    if (!client.projects) client.projects = [];
    client.projects.push({ id: project.id, name: project.name, status: 'PRODUCAO' });
    client._count = { ...client._count, projects: client.projects.length };
    saveStoredClients(clients);
  }

  // 3. Tentar persistir também no Prisma se banco estiver disponível
  try {
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      let dbClient = await prisma.mzClient.findFirst({
        where: {
          OR: [{ companyName: { equals: company, mode: 'insensitive' } }, { email: { equals: quote.email, mode: 'insensitive' } }],
        },
      });

      if (!dbClient) {
        dbClient = await prisma.mzClient.create({
          data: {
            companyName: company,
            contactName: quote.name,
            whatsapp: quote.whatsapp,
            email: quote.email,
            status: 'ATIVO',
            financialStatus: 'EM_DIA',
            notes: `Cadastrado automaticamente ao finalizar projeto • Dev: ${dev}`,
          },
        });
      }

      await prisma.mzProject.create({
        data: {
          clientId: dbClient.id,
          name: projectName,
          type: 'SITE_INSTITUCIONAL',
          status: 'PRODUCAO',
          deliveryDate: new Date(),
          hostingPlatform: 'Railway',
          notes: `Projeto finalizado por ${dev}.`,
        },
      });
    }
  } catch (dbErr) {
    // Memória/JSON já garantem persistência
  }

  return { client, project };
}
