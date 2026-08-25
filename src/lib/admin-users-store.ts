import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'ADMIN';
  partner: 'Roberto' | 'Morvan' | 'Geral';
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const ADMIN_USERS_FILE = path.join(DATA_DIR, 'admin-users.json');

// Senha padrão inicial: admin123
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('admin123', 10);

const defaultAdminUsers: AdminUserItem[] = [
  {
    id: 'admin-roberto',
    name: 'Roberto',
    email: 'roberto@mztech.com.br',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '(31) 98888-0001',
    role: 'ADMIN',
    partner: 'Roberto',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'admin-morvan',
    name: 'Morvan',
    email: 'morvan@mztech.com.br',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '(31) 98888-0002',
    role: 'ADMIN',
    partner: 'Morvan',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'admin-master',
    name: 'Admin Master OPS',
    email: 'admin@mztech.com.br',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '(31) 98888-9999',
    role: 'ADMIN',
    partner: 'Geral',
    updatedAt: new Date().toISOString(),
  },
];

const globalAdminUsersKey = Symbol.for('mztech.admin-users');
const globalObj = globalThis as any;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getStoredAdminUsers(): AdminUserItem[] {
  if (!globalObj[globalAdminUsersKey]) {
    try {
      if (fs.existsSync(ADMIN_USERS_FILE)) {
        const content = fs.readFileSync(ADMIN_USERS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          globalObj[globalAdminUsersKey] = parsed;
          return parsed;
        }
      }
    } catch (e) {}
    globalObj[globalAdminUsersKey] = defaultAdminUsers;
    saveStoredAdminUsers(defaultAdminUsers);
  }
  return globalObj[globalAdminUsersKey];
}

export function saveStoredAdminUsers(users: AdminUserItem[]) {
  globalObj[globalAdminUsersKey] = users;
  try {
    ensureDir();
    fs.writeFileSync(ADMIN_USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {}
}

export async function updateAdminUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    newPassword?: string;
    phone?: string;
  }
): Promise<AdminUserItem | null> {
  const users = getStoredAdminUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return null;

  if (data.name) user.name = data.name.trim();
  if (data.email) user.email = data.email.toLowerCase().trim();
  if (data.phone) user.phone = data.phone.trim();
  if (data.newPassword && data.newPassword.trim().length >= 4) {
    user.passwordHash = await bcrypt.hash(data.newPassword.trim(), 10);
  }
  user.updatedAt = new Date().toISOString();

  saveStoredAdminUsers(users);
  return user;
}

export async function validateAdminLogin(
  email: string,
  plainPassword: string
): Promise<AdminUserItem | null> {
  const cleanEmail = email.toLowerCase().trim();
  const users = getStoredAdminUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    // Compatibilidade temporária se tentar admin@mazzoni.com
    if (cleanEmail === 'admin@mazzoni.com') {
      const master = users.find((u) => u.id === 'admin-master');
      if (master) {
        const isMatch = await bcrypt.compare(plainPassword, master.passwordHash);
        if (isMatch) return master;
      }
    }
    return null;
  }

  const isMatch = await bcrypt.compare(plainPassword, user.passwordHash);
  if (isMatch) {
    return user;
  }

  return null;
}
