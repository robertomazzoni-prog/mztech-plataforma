import fs from 'fs';
import path from 'path';
import { MzAuditLogItem } from '@/types/mztech';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const AUDIT_FILE = path.join(DATA_DIR, 'audit-logs.json');

const globalAuditKey = Symbol.for('mztech.audit_logs');
const globalObj = globalThis as any;

const defaultLogs: MzAuditLogItem[] = [
  {
    id: 'log-seed-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    actor: 'Sistema mzTech',
    action: 'INICIALIZACAO_SISTEMA',
    category: 'SISTEMA',
    description: 'Sistema comercial e base operacional mzTech inicializada com sucesso.',
  },
];

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getStoredAuditLogs(): MzAuditLogItem[] {
  if (!globalObj[globalAuditKey]) {
    try {
      if (fs.existsSync(AUDIT_FILE)) {
        const content = fs.readFileSync(AUDIT_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          globalObj[globalAuditKey] = parsed;
          return parsed;
        }
      }
    } catch (e) {}
    globalObj[globalAuditKey] = defaultLogs;
    saveStoredAuditLogs(defaultLogs);
  }
  return globalObj[globalAuditKey];
}

export function saveStoredAuditLogs(logs: MzAuditLogItem[]) {
  globalObj[globalAuditKey] = logs;
  try {
    ensureDir();
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (e) {}
}

export function logActivity(data: {
  actor?: string;
  action: string;
  category: 'ORCAMENTO' | 'CONTRATO' | 'PAGAMENTO' | 'CLIENTE' | 'PROJETO' | 'SISTEMA';
  targetId?: string;
  targetNumber?: string;
  description: string;
  details?: any;
}): MzAuditLogItem {
  const logs = getStoredAuditLogs();
  const newLog: MzAuditLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    actor: data.actor || 'Sistema',
    action: data.action,
    category: data.category,
    targetId: data.targetId,
    targetNumber: data.targetNumber,
    description: data.description,
    details: data.details || null,
  };

  logs.unshift(newLog);
  // Manter os últimos 200 logs
  if (logs.length > 200) {
    logs.length = 200;
  }
  saveStoredAuditLogs(logs);
  return newLog;
}
