import fs from 'fs';
import path from 'path';

export interface CompanyEmailItem {
  id: string;
  address: string;
  label: string; // 'Principal', 'Financeiro', 'Suporte', 'Comercial'
  isPrimary?: boolean;
}

export interface CompanyPixItem {
  id: string;
  key: string;
  type: 'EMAIL' | 'CPF_CNPJ' | 'PHONE' | 'RANDOM';
  holder: string; // 'Roberto', 'Morvan', 'mzTech Soluções'
  bank?: string; // 'Nubank', 'Inter', 'Itaú', 'Bradesco'
  isPrimary?: boolean;
}

export type SiteThemeStyle = 'DARK_CYBER_GLOW' | 'CYBER_DARK' | 'STUDIO_PREMIUM' | 'CLEAN_CORPORATE';

export interface CompanySettings {
  name: string;
  legalName: string;
  tagline: string;
  siteTheme?: SiteThemeStyle;
  email: string;
  emails: CompanyEmailItem[];
  robertoName: string;
  robertoPhone: string;
  robertoWhatsapp: string;
  robertoPixKey?: string;
  morvanName: string;
  morvanPhone: string;
  morvanWhatsapp: string;
  morvanPixKey?: string;
  pixKey: string;
  pixKeys: CompanyPixItem[];
  workingHours: string;
  year: number;
  // Integração Mercado Pago
  mercadoPagoEnabled?: boolean;
  mercadoPagoAccessToken?: string;
  mercadoPagoPublicKey?: string;
  mercadoPagoEnvironment?: 'SANDBOX' | 'PRODUCTION';
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'company-settings.json');

export const defaultCompanySettings: CompanySettings = {
  name: 'mzTech',
  legalName: 'mzTech Soluções Digitais & Desenvolvimento',
  tagline: 'Tecnologia que coloca sua empresa no digital.',
  siteTheme: 'DARK_CYBER_GLOW',
  email: 'robertomazzoni956@gmail.com',
  emails: [
    {
      id: 'email-1',
      address: 'robertomazzoni956@gmail.com',
      label: 'E-mail Principal & Atendimento',
      isPrimary: true,
    },
  ],
  robertoName: 'Roberto',
  robertoPhone: '(31) 98684-7049',
  robertoWhatsapp: '5531986847049',
  robertoPixKey: 'robertomazzoni956@gmail.com',
  morvanName: 'Morvan',
  morvanPhone: '(31) 99359-7136',
  morvanWhatsapp: '5531993597136',
  morvanPixKey: 'morvan@mztech.com.br',
  pixKey: 'robertomazzoni956@gmail.com',
  pixKeys: [
    {
      id: 'pix-roberto',
      key: 'robertomazzoni956@gmail.com',
      type: 'EMAIL',
      holder: 'Roberto (Sócio mzTech)',
      bank: 'Nubank / Inter',
      isPrimary: true,
    },
    {
      id: 'pix-morvan',
      key: 'morvan@mztech.com.br',
      type: 'EMAIL',
      holder: 'Morvan (Sócio mzTech)',
      bank: 'Nubank / Inter',
      isPrimary: false,
    },
  ],
  workingHours: 'Segunda a Sexta, 08h às 19h • Sábados, 09h às 14h',
  year: 2026,
  mercadoPagoEnabled: true,
  mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  mercadoPagoPublicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
  mercadoPagoEnvironment: 'PRODUCTION',
};

const globalSettingsKey = Symbol.for('mztech.settings');
const globalObj = globalThis as any;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getStoredSettings(): CompanySettings {
  if (!globalObj[globalSettingsKey]) {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          const merged: CompanySettings = { ...defaultCompanySettings, ...parsed };
          
          // Garante que emails seja um array válido
          if (!Array.isArray(merged.emails) || merged.emails.length === 0) {
            merged.emails = [
              {
                id: `email-${Date.now()}`,
                address: merged.email || 'robertomazzoni956@gmail.com',
                label: 'E-mail Principal',
                isPrimary: true,
              },
            ];
          }

          // Garante que pixKeys seja um array válido
          if (!Array.isArray(merged.pixKeys) || merged.pixKeys.length === 0) {
            merged.pixKeys = [
              {
                id: `pix-${Date.now()}`,
                key: merged.pixKey || 'robertomazzoni956@gmail.com',
                type: 'EMAIL',
                holder: 'Roberto (Sócio mzTech)',
                bank: 'Conta Principal',
                isPrimary: true,
              },
            ];
          }

          // Garante que siteTheme tenha fallback
          if (!merged.siteTheme) {
            merged.siteTheme = 'DARK_CYBER_GLOW';
          }

          globalObj[globalSettingsKey] = merged;
          return globalObj[globalSettingsKey];
        }
      }
    } catch (e) {}
    globalObj[globalSettingsKey] = defaultCompanySettings;
    saveStoredSettings(defaultCompanySettings);
  }
  return globalObj[globalSettingsKey];
}

import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';

export async function syncSettingsFromDb(): Promise<CompanySettings> {
  const online = await isDatabaseOnline();
  if (online) {
    try {
      const record = await prisma.mzCompanySetting.findUnique({
        where: { id: 'company-settings' },
      });
      if (record && record.dataJson) {
        const parsed = JSON.parse(record.dataJson);
        if (parsed && typeof parsed === 'object') {
          const merged: CompanySettings = { ...defaultCompanySettings, ...parsed };
          globalObj[globalSettingsKey] = merged;
          saveStoredSettings(merged);
          return merged;
        }
      }
    } catch (e) {
      console.warn('Aviso ao sincronizar configurações do banco:', e);
    }
  }
  return getStoredSettings();
}

export function saveStoredSettings(settings: CompanySettings) {
  globalObj[globalSettingsKey] = settings;
  try {
    ensureDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (e) {}

  if (process.env.DATABASE_URL) {
    prisma.mzCompanySetting.upsert({
      where: { id: 'company-settings' },
      create: {
        id: 'company-settings',
        dataJson: JSON.stringify(settings),
      },
      update: {
        dataJson: JSON.stringify(settings),
      },
    }).catch(() => {});
  }
}

export function updateSettings(partial: Partial<CompanySettings>): CompanySettings {
  const current = getStoredSettings();
  const updated: CompanySettings = {
    ...current,
    ...partial,
  };

  // Sincroniza e-mails
  if (Array.isArray(updated.emails) && updated.emails.length > 0) {
    const primary = updated.emails.find((e) => e.isPrimary) || updated.emails[0];
    updated.email = primary.address;
  }

  // Sincroniza chaves Pix com os sócios
  if (Array.isArray(updated.pixKeys) && updated.pixKeys.length > 0) {
    const primary = updated.pixKeys.find((p) => p.isPrimary) || updated.pixKeys[0];
    updated.pixKey = primary.key;

    const robertoPixItem = updated.pixKeys.find((p) => p.holder?.toLowerCase().includes('roberto') || p.id === 'pix-roberto');
    if (robertoPixItem && robertoPixItem.key) {
      updated.robertoPixKey = robertoPixItem.key;
    } else if (primary && primary.key) {
      updated.robertoPixKey = primary.key;
    }

    const morvanPixItem = updated.pixKeys.find((p) => p.holder?.toLowerCase().includes('morvan') || p.id === 'pix-morvan');
    if (morvanPixItem && morvanPixItem.key) {
      updated.morvanPixKey = morvanPixItem.key;
    }
  }

  // Se o usuário atualizou diretamente robertoPixKey ou morvanPixKey
  if (partial.robertoPixKey && Array.isArray(updated.pixKeys)) {
    const rItem = updated.pixKeys.find((p) => p.holder?.toLowerCase().includes('roberto') || p.id === 'pix-roberto');
    if (rItem) rItem.key = partial.robertoPixKey;
  }
  if (partial.morvanPixKey && Array.isArray(updated.pixKeys)) {
    const mItem = updated.pixKeys.find((p) => p.holder?.toLowerCase().includes('morvan') || p.id === 'pix-morvan');
    if (mItem) mItem.key = partial.morvanPixKey;
  }

  saveStoredSettings(updated);
  return updated;
}
