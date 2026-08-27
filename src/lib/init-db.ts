import { prisma } from './db';
import bcrypt from 'bcryptjs';

let isInitialized = false;
let isChecking = false;
let isDbAvailable: boolean | null = null;
let lastCheckTime = 0;

/**
 * Verifica se o PostgreSQL está ativo com timeout seguro de 5000ms.
 */
export async function isDatabaseOnline(): Promise<boolean> {
  const now = Date.now();
  // Se já sabemos que está online, cache por 60 segundos
  if (isDbAvailable === true && now - lastCheckTime < 60000) {
    return true;
  }
  // Se falhou antes, retenta a cada 5 segundos
  if (isDbAvailable === false && now - lastCheckTime < 5000) {
    return false;
  }

  if (!process.env.DATABASE_URL) {
    isDbAvailable = false;
    lastCheckTime = now;
    return false;
  }

  try {
    const checkPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB_TIMEOUT')), 5000)
    );

    await Promise.race([checkPromise, timeoutPromise]);
    isDbAvailable = true;
  } catch (err) {
    isDbAvailable = false;
  }

  lastCheckTime = now;
  return isDbAvailable;
}

export async function ensureDatabaseReady() {
  if (isInitialized) return;
  if (isChecking) return;

  const online = await isDatabaseOnline();
  if (!online) {
    return;
  }

  isChecking = true;

  try {
    // 1. TABELAS DA BARBEARIA
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "role" TEXT DEFAULT 'CLIENT' NOT NULL,
        "avatar" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Service" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "durationMinutes" INTEGER DEFAULT 30 NOT NULL,
        "imageUrl" TEXT,
        "popular" BOOLEAN DEFAULT false NOT NULL,
        "active" BOOLEAN DEFAULT true NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Barber" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "bio" TEXT,
        "avatarUrl" TEXT,
        "specialties" TEXT,
        "workingHoursStart" TEXT DEFAULT '09:00' NOT NULL,
        "workingHoursEnd" TEXT DEFAULT '19:00' NOT NULL,
        "lunchStart" TEXT DEFAULT '12:00' NOT NULL,
        "lunchEnd" TEXT DEFAULT '13:00' NOT NULL,
        "workingDays" TEXT DEFAULT '1,2,3,4,5,6' NOT NULL,
        "active" BOOLEAN DEFAULT true NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Appointment" (
        "id" TEXT PRIMARY KEY,
        "clientName" TEXT NOT NULL,
        "clientPhone" TEXT NOT NULL,
        "clientEmail" TEXT,
        "date" TEXT NOT NULL,
        "timeSlot" TEXT NOT NULL,
        "status" TEXT DEFAULT 'CONFIRMED' NOT NULL,
        "notes" TEXT,
        "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
        "serviceId" TEXT NOT NULL REFERENCES "Service"("id") ON DELETE RESTRICT,
        "barberId" TEXT NOT NULL REFERENCES "Barber"("id") ON DELETE RESTRICT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    // 2. TABELAS MZTECH OPERACIONAIS
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MzClient" (
        "id" TEXT PRIMARY KEY,
        "companyName" TEXT NOT NULL,
        "contactName" TEXT NOT NULL,
        "whatsapp" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "domain" TEXT,
        "status" TEXT DEFAULT 'ATIVO' NOT NULL,
        "financialStatus" TEXT DEFAULT 'EM_DIA' NOT NULL,
        "startDate" TIMESTAMP(3),
        "notes" TEXT,
        "cancellationDate" TIMESTAMP(3),
        "terminationEffectiveDate" TIMESTAMP(3),
        "cancellationReason" TEXT,
        "terminatedServices" TEXT,
        "codeDelivered" BOOLEAN DEFAULT false NOT NULL,
        "backupDelivered" BOOLEAN DEFAULT false NOT NULL,
        "deliveredAt" TIMESTAMP(3),
        "deliveredBy" TEXT,
        "terminationNotes" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MzProject" (
        "id" TEXT PRIMARY KEY,
        "clientId" TEXT NOT NULL REFERENCES "MzClient"("id") ON DELETE CASCADE,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "status" TEXT DEFAULT 'PLANEJAMENTO' NOT NULL,
        "startDate" TIMESTAMP(3),
        "deliveryDate" TIMESTAMP(3),
        "domain" TEXT,
        "hostingUrl" TEXT,
        "githubRepo" TEXT,
        "hostingPlatform" TEXT DEFAULT 'Railway' NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MzService" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "recurrence" TEXT DEFAULT 'UNICA' NOT NULL,
        "status" TEXT DEFAULT 'ATIVO' NOT NULL,
        "active" BOOLEAN DEFAULT true NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MzHosting" (
        "id" TEXT PRIMARY KEY,
        "clientId" TEXT NOT NULL REFERENCES "MzClient"("id") ON DELETE CASCADE,
        "projectId" TEXT REFERENCES "MzProject"("id") ON DELETE SET NULL,
        "provider" TEXT DEFAULT 'Railway' NOT NULL,
        "serverType" TEXT DEFAULT 'Cloud App',
        "url" TEXT NOT NULL,
        "customDomain" TEXT,
        "platformDomain" TEXT,
        "startDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "renewalDate" TIMESTAMP(3),
        "cancellationDate" TIMESTAMP(3),
        "monthlyPrice" DOUBLE PRECISION DEFAULT 39.90 NOT NULL,
        "status" TEXT DEFAULT 'ATIVO' NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MzMaintenance" (
        "id" TEXT PRIMARY KEY,
        "clientId" TEXT NOT NULL REFERENCES "MzClient"("id") ON DELETE CASCADE,
        "projectId" TEXT REFERENCES "MzProject"("id") ON DELETE SET NULL,
        "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "type" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "responsible" TEXT DEFAULT 'mzTech Equipe' NOT NULL,
        "status" TEXT DEFAULT 'CONCLUIDO' NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MzContract" (
        "id" TEXT PRIMARY KEY,
        "clientId" TEXT NOT NULL REFERENCES "MzClient"("id") ON DELETE CASCADE,
        "projectId" TEXT REFERENCES "MzProject"("id") ON DELETE SET NULL,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "totalDevPrice" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
        "monthlyPrice" DOUBLE PRECISION DEFAULT 79.90 NOT NULL,
        "paymentMethod" TEXT DEFAULT 'PIX / Cartão de Crédito' NOT NULL,
        "termsVersion" TEXT DEFAULT 'v2.0-2026' NOT NULL,
        "codeOwnershipType" TEXT DEFAULT 'PROPRIEDADE_CLIENTE' NOT NULL,
        "scopeDevelopment" TEXT,
        "scopeHosting" TEXT,
        "scopeMaintenance" TEXT,
        "scopeSupport" TEXT,
        "backupRetentionDays" INTEGER DEFAULT 30 NOT NULL,
        "migrationExcluded" BOOLEAN DEFAULT true NOT NULL,
        "status" TEXT DEFAULT 'RASCUNHO' NOT NULL,
        "signedAt" TIMESTAMP(3),
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MzQuote" (
        "id" TEXT PRIMARY KEY,
        "quoteNumber" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "company" TEXT,
        "cnpjCpf" TEXT,
        "whatsapp" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "selectedDev" TEXT DEFAULT 'Roberto' NOT NULL,
        "projectType" TEXT DEFAULT 'Site Institucional Profissional' NOT NULL,
        "serviceId" TEXT,
        "hasDomain" TEXT DEFAULT 'Não, preciso registrar' NOT NULL,
        "needsHosting" TEXT DEFAULT 'Plano Hospedagem + Manutenção (R$ 79,90/mês)' NOT NULL,
        "needsMaintenance" TEXT DEFAULT 'Sim' NOT NULL,
        "projectDescription" TEXT,
        "initialDevPrice" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
        "monthlyPrice" DOUBLE PRECISION DEFAULT 79.90 NOT NULL,
        "discount" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
        "finalPrice" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
        "paymentMethodChoice" TEXT DEFAULT 'CREDIT_CARD_RECURRING' NOT NULL,
        "billingPeriodicity" TEXT DEFAULT 'MENSAL' NOT NULL,
        "dueDay" INTEGER DEFAULT 10 NOT NULL,
        "estimatedBudget" TEXT,
        "desiredDeadline" TEXT,
        "status" TEXT DEFAULT 'AGUARDANDO_ANALISE' NOT NULL,
        "notes" TEXT,
        "approvedBy" TEXT,
        "approvedAt" TIMESTAMP(3),
        "responsibleAdmin" TEXT,
        "linkedClientId" TEXT,
        "linkedProjectId" TEXT,
        "linkedContractId" TEXT,
        "linkedPaymentId" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MzCompanySetting" (
        "id" TEXT PRIMARY KEY DEFAULT 'company-settings',
        "dataJson" TEXT NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MzPortfolio" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "displayUrl" TEXT,
        "tagline" TEXT,
        "subheadline" TEXT,
        "previewImage" TEXT,
        "favicon" TEXT,
        "featuresJson" TEXT DEFAULT '[]' NOT NULL,
        "badge" TEXT DEFAULT 'Em Produção',
        "infrastructure" TEXT DEFAULT 'Infraestrutura Railway',
        "featured" BOOLEAN DEFAULT false NOT NULL,
        "active" BOOLEAN DEFAULT true NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    isInitialized = true;
  } catch (error) {
    console.error('Aviso na inicialização do banco:', error);
  } finally {
    isChecking = false;
  }
}
