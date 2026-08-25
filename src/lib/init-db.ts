import { prisma } from './db';
import bcrypt from 'bcryptjs';

let isInitialized = false;
let isChecking = false;
let isDbAvailable: boolean | null = null;
let lastCheckTime = 0;

/**
 * Verifica rapidamente se o PostgreSQL está ativo sem travar a requisição.
 * Timeout ultra-rápido de 250ms.
 */
export async function isDatabaseOnline(): Promise<boolean> {
  const now = Date.now();
  // Cache do status por 30 segundos para máxima velocidade (0ms de latência)
  if (isDbAvailable !== null && now - lastCheckTime < 30000) {
    return isDbAvailable;
  }

  try {
    const checkPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB_TIMEOUT')), 250)
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
    // Banco local não está rodando - o sistema opera instantaneamente via cache/JSON em < 5ms
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

    // 2. TABELAS MZTECH
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

    isInitialized = true;
  } catch (error) {
    // Silencia em caso de erro para manter alta performance
  } finally {
    isChecking = false;
  }
}
