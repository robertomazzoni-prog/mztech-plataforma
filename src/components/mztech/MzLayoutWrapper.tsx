'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  Layers,
  FileText,
  DollarSign,
  FolderGit2,
  Server,
  Wrench,
  Database,
  KeyRound,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  Terminal,
  Activity,
  Globe,
  Lock,
  Mail,
  Key,
  AlertCircle,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface MzLayoutWrapperProps {
  children: React.ReactNode;
}

interface NavGroup {
  groupName?: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export default function MzLayoutWrapper({ children }: MzLayoutWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, login, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Formulário de Login Administrativo mzTech
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Nova Estrutura Reorganizada por Módulos
  const navGroups: NavGroup[] = [
    {
      items: [
        { name: 'Dashboard', href: '/admin/mztech', icon: LayoutDashboard },
      ],
    },
    {
      groupName: 'COMERCIAL & SITE',
      items: [
        { name: 'Orçamentos', href: '/admin/mztech/orcamentos', icon: FileCheck2 },
        { name: 'Clientes', href: '/admin/mztech/clientes', icon: Users },
        { name: 'Portfólio do Site', href: '/admin/mztech/portfolio', icon: Sparkles },
        { name: 'Serviços & Planos', href: '/admin/mztech/servicos', icon: Layers },
      ],
    },
    {
      groupName: 'JURÍDICO & CONTRATOS',
      items: [
        { name: 'Contratos', href: '/admin/mztech/contratos', icon: FileText },
      ],
    },
    {
      groupName: 'FINANCEIRO',
      items: [
        { name: 'Financeiro & Pagamentos', href: '/admin/mztech/financeiro', icon: DollarSign },
      ],
    },
    {
      groupName: 'PROJETOS & INFRA',
      items: [
        { name: 'Projetos', href: '/admin/mztech/projetos', icon: FolderGit2 },
        { name: 'Hospedagens', href: '/admin/mztech/hospedagens', icon: Server },
        { name: 'Manutenções', href: '/admin/mztech/manutencoes', icon: Wrench },
        { name: 'Backups', href: '/admin/mztech/backups', icon: Database },
      ],
    },
    {
      groupName: 'CONFIGURAÇÕES',
      items: [
        { name: 'Pagamentos & Empresa', href: '/admin/mztech/configuracoes', icon: Settings },
        { name: 'Usuários & Credenciais', href: '/admin/mztech/credenciais', icon: KeyRound },
      ],
    },
  ];

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    const result = await login(adminEmail, adminPassword);
    setLoginLoading(false);

    if (!result.success) {
      setLoginError(result.error || 'Credenciais inválidas. Verifique seu e-mail e senha de administrador.');
    } else {
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-cyan-400">
        <Activity className="w-8 h-8 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Carregando Base Operacional mzTech...</p>
      </div>
    );
  }

  // TELA DE LOGIN DEDICADA DA MZTECH
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative antialiased selection:bg-cyan-500 selection:text-slate-950">
        <div className="max-w-md w-full relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-600/20 mb-3">
              <Terminal className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              mz<span className="text-cyan-400">Tech</span> <span className="text-slate-400 font-normal">OPS</span>
            </h1>
            <p className="text-xs text-slate-400">
              Painel de Gestão Comercial e Operacional
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-medium">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Autenticação Restrita</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Protegido
              </span>
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>E-mail</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@mazzoni.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>Senha</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/10 flex items-center justify-center gap-2 transition-all mt-2"
              >
                {loginLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>Acessar Painel</span>
              </button>
            </form>
          </div>

          <div className="text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-cyan-400 inline-flex items-center gap-1 transition-colors">
              <Globe className="w-3.5 h-3.5" />
              <span>Voltar ao Site Institucional</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // USUÁRIO AUTENTICADO: RENDERIZA PAINEL PROFISSIONAL mzTech
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-cyan-500 selection:text-slate-950 font-sans">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 sticky top-0 h-screen z-40">
        
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin/mztech" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center shadow-sm text-slate-950 font-bold">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">mzTech</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  OPS
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Plataforma Operacional</p>
            </div>
          </Link>
        </div>

        {/* Navigation Grouped */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {group.groupName && (
                <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono">
                  {group.groupName}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === '/admin/mztech'
                    ? pathname === '/admin/mztech'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500 text-slate-950 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Links Rápidos */}
          <div className="pt-2 border-t border-slate-800 space-y-1">
            <div className="px-2.5 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono">
              PORTAIS
            </div>
            <Link
              href="/cliente"
              target="_blank"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Portal do Cliente</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Site Institucional</span>
            </Link>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">Administrador</p>
              </div>
            </div>
            <button
              onClick={async () => {
                if (confirm('Deseja encerrar a sessão administrativa?')) {
                  await logout();
                  router.push('/login');
                }
              }}
              title="Sair"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-3 sticky top-0 z-50 flex items-center justify-between">
        <Link href="/admin/mztech" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-sm">mzTech OPS</span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg bg-slate-800"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-3 z-50 max-h-[85vh] overflow-y-auto">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {group.groupName && (
                <div className="px-2 pt-1 text-[10px] font-bold text-slate-500 uppercase font-mono">
                  {group.groupName}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === '/admin/mztech'
                    ? pathname === '/admin/mztech'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
            <Link href="/" target="_blank" className="text-cyan-400 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Site mzTech
            </Link>
            <button onClick={() => logout()} className="text-red-400 flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Status Header */}
        <header className="bg-slate-900/60 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400 font-medium">Infraestrutura:</span>
            <span className="font-mono text-emerald-400 font-semibold">100% Operacional</span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">
              Gestão Comercial & Operacional Integrada
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Ver Site</span>
            </Link>
          </div>
        </header>

        {/* Page Inner Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
