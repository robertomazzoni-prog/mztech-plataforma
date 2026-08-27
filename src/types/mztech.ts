export type ClientStatus =
  | 'ATIVO'
  | 'SUSPENSO'
  | 'CANCELAMENTO_SOLICITADO'
  | 'ENCERRADO';

export type ClientFinancialStatus =
  | 'EM_DIA'
  | 'PENDENTE'
  | 'ATRASADO'
  | 'RECUSADO'
  | 'CANCELADO';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PAYMENT_PENDING'
  | 'OVERDUE'
  | 'SUSPENDED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethodChoice =
  | 'PIX'
  | 'CREDIT_CARD'
  | 'CREDIT_CARD_RECURRING'
  | 'CARD_PLUS_PIX';

export type PaymentMethod = 'CREDIT_CARD' | 'PIX';

export type ProjectStatus =
  | 'PLANEJAMENTO'
  | 'DESENVOLVIMENTO'
  | 'TESTE'
  | 'PRODUCAO'
  | 'MANUTENCAO'
  | 'ENCERRADO';

export type ServiceType =
  | 'DESENVOLVIMENTO'
  | 'HOSPEDAGEM'
  | 'MANUTENCAO'
  | 'SUPORTE'
  | 'MIGRACAO_ADICIONAL'
  | 'ADICIONAL';

export type ServiceRecurrence = 'UNICA' | 'MENSAL' | 'TRIMESTRAL' | 'ANUAL';

export type HostingProvider =
  | 'Railway'
  | 'DigitalOcean'
  | 'VPS Própria'
  | 'Hetzner'
  | 'AWS'
  | 'Outro';

export type HostingStatus =
  | 'ATIVO'
  | 'SUSPENSO'
  | 'CANCELAMENTO_SOLICITADO'
  | 'ENCERRADO';

export type MaintenanceType =
  | 'CORRECAO'
  | 'ALTERACAO'
  | 'ATUALIZACAO'
  | 'SUPORTE'
  | 'SEGURANCA'
  | 'OUTRO';

export type MaintenanceStatus =
  | 'PENDENTE'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export type CodeOwnershipType =
  | 'PROPRIEDADE_CLIENTE'
  | 'LICENCA_USO'
  | 'MISTO'
  | 'PROPRIEDADE_MZTECH';

export type ContractStatus =
  | 'RASCUNHO'
  | 'EMITIDO'
  | 'AGUARDANDO_ENVIO'
  | 'AGUARDANDO_ACEITE'
  | 'AGUARDANDO_PAGAMENTO'
  | 'ASSINADO'
  | 'ATIVO'
  | 'SUSPENSO'
  | 'CANCELADO'
  | 'ENCERRADO';

export type BackupStatus = 'VALIDO' | 'TESTADO' | 'ARQUIVADO' | 'ENTREGUE_AO_CLIENTE';

export type QuoteStatus =
  | 'AGUARDANDO_ANALISE'
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'RECUSADO'
  | 'CANCELADO'
  // Compatibilidade com status legados
  | 'NOVO'
  | 'EM_CONTATO'
  | 'PROPOSTA_ENVIADA'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDO'
  | 'ARQUIVADO';

export interface MzAuditLogItem {
  id: string;
  timestamp: string;
  actor: string; // Ex: "Roberto", "Morvan", "Sistema", "Cliente"
  action: string; // Ex: "APROVAR_ORCAMENTO", "GERAR_CONTRATO", "PAGAMENTO_CONFIRMADO", "ACEITE_CONTRATO"
  category: 'ORCAMENTO' | 'CONTRATO' | 'PAGAMENTO' | 'CLIENTE' | 'PROJETO' | 'SISTEMA';
  targetId?: string;
  targetNumber?: string; // Ex: "#MZ-000123", "#CTR-000123"
  description: string; // Ex: "Roberto aprovou o orçamento #MZ-000123."
  details?: any;
}

export interface MzQuoteItem {
  id: string;
  quoteNumber?: string; // Ex: "MZ-2026-0001"
  name: string;
  company?: string | null;
  cnpjCpf?: string | null;
  whatsapp: string;
  email: string;
  selectedDev: string; // "Roberto" | "Morvan" | "Sem Preferência (Roberto ou Morvan)"
  projectType: string;
  serviceId?: string;
  hasDomain: string;
  customDomain?: string | null;
  needsHosting: string;
  needsMaintenance?: string;
  projectDescription?: string | null;
  
  // Condições Comerciais Detalhadas
  initialDevPrice: number;
  monthlyPrice: number;
  discount?: number;
  finalPrice: number;
  paymentMethodChoice: PaymentMethodChoice;
  billingPeriodicity: 'UNICA' | 'MENSAL' | 'ANUAL';
  dueDay?: number; // Ex: 10
  estimatedBudget?: string | null;
  desiredDeadline?: string | null;
  
  // Status e Auditoria
  status: QuoteStatus;
  notes?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  responsibleAdmin?: string | null;
  
  // Vínculos gerados após aprovação
  linkedClientId?: string | null;
  linkedProjectId?: string | null;
  linkedContractId?: string | null;
  linkedPaymentId?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface MzClientItem {
  id: string;
  companyName: string;
  contactName: string;
  cnpjCpf?: string | null;
  whatsapp: string;
  email: string;
  domain?: string | null;
  status: ClientStatus;
  financialStatus: ClientFinancialStatus;
  startDate?: string | null;
  notes?: string | null;

  // Encerramento & Entrega de Ativos
  cancellationDate?: string | null;
  terminationEffectiveDate?: string | null;
  cancellationReason?: string | null;
  terminatedServices?: string | null;
  codeDelivered: boolean;
  backupDelivered: boolean;
  deliveredAt?: string | null;
  deliveredBy?: string | null;
  terminationNotes?: string | null;

  createdAt: string;
  updatedAt: string;
  projects?: MzProjectItem[];
  hostings?: MzHostingItem[];
  maintenances?: MzMaintenanceItem[];
  contracts?: MzContractItem[];
  backups?: MzBackupItem[];
  subscriptions?: MzSubscriptionItem[];
  payments?: MzPaymentItem[];
  _count?: {
    projects: number;
    hostings: number;
    maintenances: number;
    backups: number;
    subscriptions?: number;
    payments?: number;
  };
}

export interface MzProjectItem {
  id: string;
  clientId: string;
  client?: {
    id: string;
    companyName: string;
    contactName: string;
    email?: string;
    whatsapp?: string;
  };
  contractId?: string | null;
  name: string;
  type: string;
  status: ProjectStatus;
  startDate?: string | null;
  deliveryDate?: string | null;
  domain?: string | null;
  hostingUrl?: string | null;
  githubRepo?: string | null;
  hostingPlatform: string;
  responsibleDev?: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MzServiceItem {
  id: string;
  name: string;
  description: string;
  type: ServiceType;
  price: number;
  recurrence: ServiceRecurrence;
  status: string;
  active: boolean;
  features?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MzHostingItem {
  id: string;
  clientId: string;
  client?: {
    id: string;
    companyName: string;
  };
  projectId?: string | null;
  project?: {
    id: string;
    name: string;
  } | null;
  provider: HostingProvider | string;
  serverType?: string | null;
  url?: string | null;
  customDomain?: string | null;
  platformDomain?: string | null;
  startDate: string;
  renewalDate?: string | null;
  cancellationDate?: string | null;
  monthlyPrice: number;
  status: HostingStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MzMaintenanceItem {
  id: string;
  clientId: string;
  client?: {
    id: string;
    companyName: string;
  };
  projectId?: string | null;
  project?: {
    id: string;
    name: string;
  } | null;
  date: string;
  type: MaintenanceType;
  description: string;
  responsible: string;
  status: MaintenanceStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MzContractSnapshot {
  clientName: string;
  companyName: string;
  email: string;
  whatsapp: string;
  cnpjCpf?: string | null;
  projectName: string;
  serviceType: string;
  initialDevPrice: number;
  monthlyPrice: number;
  paymentMethod: string;
  periodicity: string;
  dueDay?: number;
  hasHosting: boolean;
  hasMaintenance: boolean;
  hasDomain?: string | null;
  backupRetentionDays: number;
  codeOwnership: CodeOwnershipType;
  termsVersion: string;
  assignedDev?: string;
  generatedAt: string;
}

export interface MzContractItem {
  id: string;
  contractNumber?: string; // Ex: "CTR-2026-0001"
  clientId: string;
  client?: {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
    whatsapp: string;
    cnpjCpf?: string | null;
  };
  projectId?: string | null;
  project?: {
    id: string;
    name: string;
    domain?: string | null;
  } | null;
  quoteId?: string | null;
  assignedDev?: string; // "Roberto" | "Morvan" | "Sem Preferência"
  title: string;
  content: string;
  totalDevPrice: number;
  monthlyPrice: number;
  discount?: number;
  paymentMethod: string;
  periodicity?: string;
  dueDay?: number;
  termsVersion: string;
  codeOwnershipType: CodeOwnershipType;
  scopeDevelopment?: string | null;
  scopeHosting?: string | null;
  scopeMaintenance?: string | null;
  scopeSupport?: string | null;
  backupRetentionDays: number;
  migrationExcluded: boolean;
  status: ContractStatus;
  
  // Snapshot imutável
  snapshot?: MzContractSnapshot;

  // Assinatura Digital do Prestador (mzTech / Roberto / Morvan)
  providerSigned?: boolean;
  providerSignedBy?: string | null;
  providerSignedAt?: string | null;
  providerSignedIp?: string | null;
  providerSignatureDataUrl?: string | null;

  // Assinatura Digital do Cliente (Contratante)
  clientSigned?: boolean;
  clientSignedBy?: string | null;
  clientSignedDocument?: string | null;
  clientSignedAt?: string | null;
  clientSignedIp?: string | null;
  clientSignedUserAgent?: string | null;
  clientSignatureDataUrl?: string | null;

  // Certificado de Autenticidade
  signatureCertificateHash?: string | null;

  // Compatibilidade legada
  acceptedOnline?: boolean;
  acceptedAt?: string | null;
  acceptedIp?: string | null;
  acceptedUserAgent?: string | null;
  signedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MzBackupItem {
  id: string;
  clientId: string;
  client?: {
    id: string;
    companyName: string;
  };
  projectId?: string | null;
  project?: {
    id: string;
    name: string;
  } | null;
  databaseName: string;
  backupDate: string;
  fileName: string;
  storageLocation: string;
  fileSize?: string | null;
  retentionDays: number;
  status: BackupStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MzSubscriptionItem {
  id: string;
  clientId: string;
  client?: {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
  };
  projectId?: string | null;
  project?: {
    id: string;
    name: string;
  } | null;
  contractId?: string | null;
  planName: string;
  amount: number;
  periodicity: string;
  paymentMethod: PaymentMethod;
  status: SubscriptionStatus;
  startDate: string;
  nextBillingDate?: string | null;
  cancellationDate?: string | null;
  cancellationReason?: string | null;
  gateway: string;
  gatewaySubscriptionId?: string | null;
  gatewayCustomerId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  payments?: MzPaymentItem[];
}

export interface MzPaymentItem {
  id: string;
  transactionId?: string; // Ex: "TXN-2026-0001"
  clientId: string;
  client?: {
    id: string;
    companyName: string;
    contactName: string;
  };
  contractId?: string | null;
  subscriptionId?: string | null;
  subscription?: {
    id: string;
    planName: string;
    status: SubscriptionStatus;
  } | null;
  title?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentType?: 'TAXA_INICIAL' | 'MENSALIDADE_REVISAO' | 'TAXA_MENSAL' | 'AVULSO';
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string | null;
  gateway: string;
  gatewayPaymentId?: string | null;
  gatewayPixQrCode?: string | null;
  retryCount: number;
  failureReason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MzDashboardMetrics {
  totalClients: number;
  activeClients: number;
  pendingQuotesCount: number;
  activeContractsCount: number;
  pendingPaymentsCount: number;
  initialRevenueApproved: number;
  monthlyRecurringRevenue: number;
  
  cancellationRequestedClients: number;
  terminatedClients: number;
  totalProjects: number;
  productionProjects: number;
  totalHostings: number;
  pendingMaintenances: number;
  latestBackupsCount: number;
  
  financialMetrics: {
    paidRevenueTotal: number;
    pendingRevenueTotal: number;
    initialRevenueApproved: number;
    monthlyRecurringRevenue: number;
    paidCount: number;
    pendingCount: number;
    failedCount: number;
    overdueCount: number;
    cancelledCount: number;
  };

  upcomingBillings: {
    id: string;
    clientName: string;
    amount: number;
    dueDate: string;
    paymentMethod: string;
    status: string;
  }[];

  recentActivities: MzAuditLogItem[];

  infrastructureStatus: {
    platform: string;
    status: 'ONLINE' | 'WARNING' | 'MAINTENANCE';
    lastBackupDate: string;
    backupFile: string;
  };
}

export interface MzPortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  displayUrl?: string;
  tagline?: string;
  subheadline?: string;
  previewImage?: string | null;
  favicon?: string | null;
  features: string[];
  badge?: string;
  infrastructure?: string;
  order?: number;
  featured?: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

