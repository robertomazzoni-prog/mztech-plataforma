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
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'REFUNDED';

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

export type ContractStatus = 'RASCUNHO' | 'EMITIDO' | 'ASSINADO' | 'CANCELADO';

export type BackupStatus = 'VALIDO' | 'TESTADO' | 'ARQUIVADO' | 'ENTREGUE_AO_CLIENTE';

export interface MzClientItem {
  id: string;
  companyName: string;
  contactName: string;
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
  };
  name: string;
  type: string;
  status: ProjectStatus;
  startDate?: string | null;
  deliveryDate?: string | null;
  domain?: string | null;
  hostingUrl?: string | null;
  githubRepo?: string | null;
  hostingPlatform: string;
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
  url: string;
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

export interface MzContractItem {
  id: string;
  clientId: string;
  client?: {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
    whatsapp: string;
  };
  projectId?: string | null;
  project?: {
    id: string;
    name: string;
    domain?: string | null;
  } | null;
  title: string;
  content: string;
  totalDevPrice: number;
  monthlyPrice: number;
  paymentMethod: string;
  termsVersion: string;
  codeOwnershipType: CodeOwnershipType;
  scopeDevelopment?: string | null;
  scopeHosting?: string | null;
  scopeMaintenance?: string | null;
  scopeSupport?: string | null;
  backupRetentionDays: number;
  migrationExcluded: boolean;
  status: ContractStatus;
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

export interface MzDashboardMetrics {
  totalClients: number;
  activeClients: number;
  cancellationRequestedClients: number;
  terminatedClients: number;
  totalProjects: number;
  productionProjects: number;
  monthlyRecurringRevenue: number;
  totalHostings: number;
  pendingMaintenances: number;
  latestBackupsCount: number;
  providersBreakdown: {
    provider: string;
    count: number;
  }[];
  financialMetrics?: {
    paidClients: number;
    pendingClients: number;
    overdueClients: number;
    failedClients: number;
    cancelledClients: number;
  };
  infrastructureStatus: {
    platform: string;
    status: 'ONLINE' | 'WARNING' | 'MAINTENANCE';
    lastBackupDate: string;
    backupFile: string;
  };
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
  clientId: string;
  client?: {
    id: string;
    companyName: string;
    contactName: string;
  };
  subscriptionId?: string | null;
  subscription?: {
    id: string;
    planName: string;
    status: SubscriptionStatus;
  } | null;
  amount: number;
  paymentMethod: PaymentMethod;
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

export interface MzWebhookEventItem {
  id: string;
  eventId: string;
  gateway: string;
  eventType: string;
  clientId?: string | null;
  subscriptionId?: string | null;
  paymentId?: string | null;
  rawPayload: string;
  processedStatus: 'PROCESSED' | 'IGNORED_DUPLICATE' | 'ERROR';
  errorMessage?: string | null;
  processedAt: string;
  createdAt: string;
}

export type QuoteStatus =
  | 'NOVO'
  | 'EM_CONTATO'
  | 'PROPOSTA_ENVIADA'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDO'
  | 'CANCELADO'
  | 'ARQUIVADO';

export interface MzQuoteItem {
  id: string;
  name: string;
  company?: string | null;
  whatsapp: string;
  email: string;
  selectedDev: string; // "Roberto" | "Morvan" | "Sem Preferência (Roberto ou Morvan)"
  projectType: string;
  hasDomain: string;
  needsHosting: string;
  projectDescription?: string | null;
  estimatedBudget?: string | null;
  desiredDeadline?: string | null;
  status: QuoteStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}
