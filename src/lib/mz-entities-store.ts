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

// Bases padrão
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

export function saveStoredClients(clients: MzClientItem[]) {
  globalObj[globalClientsKey] = clients;
  try {
    ensureDir();
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf-8');
  } catch (e) {}
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

// ============================================================
// PROJETOS (MzProject)
// ============================================================
export function getStoredProjects(): MzProjectItem[] {
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

export function saveStoredProjects(projects: MzProjectItem[]) {
  globalObj[globalProjectsKey] = projects;
  try {
    ensureDir();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (e) {}
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
    return true;
  }
  return false;
}

// ============================================================
// CONTRATOS (MzContract) COM SNAPSHOT
// ============================================================
export function getStoredContracts(): MzContractItem[] {
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

export function saveStoredContracts(contracts: MzContractItem[]) {
  globalObj[globalContractsKey] = contracts;
  try {
    ensureDir();
    fs.writeFileSync(CONTRACTS_FILE, JSON.stringify(contracts, null, 2), 'utf-8');
  } catch (e) {}
}

export function getStoredContractById(id: string): MzContractItem | null {
  const contracts = getStoredContracts();
  return contracts.find((c) => c.id === id) || null;
}

export function updateStoredContract(id: string, updates: Partial<MzContractItem>): MzContractItem | null {
  const contracts = getStoredContracts();
  const contract = contracts.find((c) => c.id === id);
  if (!contract) return null;

  Object.assign(contract, updates, { updatedAt: new Date().toISOString() });
  saveStoredContracts(contracts);
  return contract;
}

export function deleteStoredContract(id: string): boolean {
  let contracts = getStoredContracts();
  const initialCount = contracts.length;
  contracts = contracts.filter((c) => c.id !== id);

  if (contracts.length !== initialCount) {
    saveStoredContracts(contracts);
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
    try {
      if (fs.existsSync(PAYMENTS_FILE)) {
        const content = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          globalObj[globalPaymentsKey] = parsed;
          return parsed;
        }
      }
    } catch (e) {}
    globalObj[globalPaymentsKey] = defaultPayments;
  }
  return globalObj[globalPaymentsKey];
}

export function saveStoredPayments(payments: MzPaymentItem[]) {
  globalObj[globalPaymentsKey] = payments;
  try {
    ensureDir();
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), 'utf-8');
  } catch (e) {}
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
  payments = payments.filter((p) => p.id !== id && p.transactionId !== id);
  if (payments.length !== initialCount) {
    saveStoredPayments(payments);
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
    try {
      if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
        const content = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          globalObj[globalSubscriptionsKey] = parsed;
          return parsed;
        }
      }
    } catch (e) {}
    globalObj[globalSubscriptionsKey] = defaultSubscriptions;
  }
  return globalObj[globalSubscriptionsKey];
}

export function saveStoredSubscriptions(subs: MzSubscriptionItem[]) {
  globalObj[globalSubscriptionsKey] = subs;
  try {
    ensureDir();
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2), 'utf-8');
  } catch (e) {}
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

  if (!client) {
    const newClientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    client = {
      id: newClientId,
      companyName: company,
      contactName: quote.name,
      cnpjCpf: quote.cnpjCpf || null,
      whatsapp: quote.whatsapp,
      email: quote.email,
      domain: quote.hasDomain?.includes('Sim') ? `${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br` : null,
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
        url: quote.hasDomain?.includes('Sim') ? `https://${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br` : 'https://app.mztech.dev',
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
      : 'Cartão de Crédito',
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
      paymentMethod: contract.paymentMethod?.includes('PIX') ? 'PIX' : 'CREDIT_CARD',
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
        paymentMethod: contract.paymentMethod?.includes('PIX') ? 'PIX' : 'CREDIT_CARD',
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
