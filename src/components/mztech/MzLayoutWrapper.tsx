'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Layers,
  Server,
  Wrench,
  FileText,
  Database,
  ArrowLeft,
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
  KeyRound,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface MzLayoutWrapperProps {
  children: React.ReactNode;
}

export default function MzLayoutWrapper({ children }: MzLayoutWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, login, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Estado do Formulário de Login Administrativo mzTech
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const menuItems = [
    { name: 'Dashboard', href: '/admin/mztech', icon: LayoutDashboard },
    { name: 'Clientes', href: '/admin/mztech/clientes', icon: Users },
    { name: 'Projetos', href: '/admin/mztech/projetos', icon: FolderGit2 },
    { name: 'Serviços', href: '/admin/mztech/servicos', icon: Layers },
    { name: 'Hospedagens', href: '/admin/mztech/hospedagens', icon: Server },
    { name: 'Manutenção', href: '/admin/mztech/manutencoes', icon: Wrench },
    { name: 'Contratos', href: '/admin/mztech/contratos', icon: FileText },
    { name: 'Backups', href: '/admin/mztech/backups', icon: Database },
    { name: 'Credenciais & Acessos', href: '/admin/mztech/credenciais', icon: KeyRound },
    { name: 'Configurações da Empresa', href: '/admin/mztech/configuracoes', icon: Settings },
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
        <Activity className="w-10 h-10 animate-spin" />
        <p className="text-sm font-medium text-slate-400 font-mono">Carregando Base Operacional mzTech...</p>
      </div>
    );
  }

  // TELA DE LOGIN DEDICADA DA MZTECH (SEM NENHUMA MISTURA COM BARBEARIA)
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden antialiased selection:bg-cyan-500 selection:text-slate-950">
        
        {/* Ambient Tech Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-indigo-500/0 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full relative z-10 space-y-6">
          
          {/* Header Marca mzTech */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-cyan-500/20 mb-4">
              <Terminal className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              mz<span className="text-cyan-400">Tech</span> <span className="text-slate-400 font-normal">OPS</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Painel de Controle da Base Operacional
            </p>
          </div>

          {/* Card de Autenticação */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Acesso Administrativo</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SSL Seguro
              </span>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>E-mail do Administrador</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@mazzoni.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Senha de Acesso</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {loginLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>Acessar Painel mzTech</span>
              </button>
            </form>

            {/* Dica de Acesso Rápido */}
            <div className="pt-2 text-center text-xs text-slate-500 space-y-1">
              <p>Credenciais padrão: <strong className="text-slate-300 font-mono">admin@mazzoni.com</strong> / <strong className="text-slate-300 font-mono">admin123</strong></p>
            </div>
          </div>

          {/* Links de Retorno */}
          <div className="text-center flex items-center justify-center gap-6 text-xs text-slate-400">
            <Link href="/" className="hover:text-cyan-400 flex items-center gap-1 transition-colors">
              <Globe className="w-3.5 h-3.5" />
              <span>Site Institucional mzTech</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // USUÁRIO AUTENTICADO COMO ADMIN: RENDERIZA O PAINEL COMPLETO MZTECH
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-cyan-500 selection:text-slate-950 font-sans">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/95 border-r border-slate-800/80 backdrop-blur-xl shrink-0 sticky top-0 h-screen z-40">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/admin/mztech" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">mzTech</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  OPS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">Base Operacional</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Módulos de Gestão
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/admin/mztech'
                ? pathname === '/admin/mztech'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm shadow-cyan-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Acessos Rápidos
          </div>

          <Link
            href="/cliente"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Portal do Cliente (/cliente)</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Site Institucional mzTech</span>
          </Link>
        </nav>

        {/* Admin User Info Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-cyan-400 font-mono truncate">Admin Master</p>
              </div>
            </div>
            <button
              onClick={async () => {
                if (confirm('Deseja realmente sair da Central Administrativa mzTech?')) {
                  await logout();
                  router.push('/login');
                }
              }}
              title="Sair da Conta Administrativa"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 flex items-center justify-between">
        <Link href="/admin/mztech" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-500 flex items-center justify-center text-white">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-base">mzTech OPS</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900/95 border-b border-slate-800 p-4 space-y-2 z-50">
          {menuItems.map((item) => {
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
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
        <header className="bg-slate-900/50 border-b border-slate-800/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">Infraestrutura Railway:</span>
              <span className="text-xs font-mono font-bold text-emerald-400">100% Operacional</span>
            </div>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Base de Gestão de Clientes, Contratos e Backups
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Ver Site mzTech</span>
            </Link>

            <button
              onClick={async () => {
                if (confirm('Deseja realmente sair da Central Administrativa mzTech?')) {
                  await logout();
                  router.push('/login');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold border border-red-500/30 transition-colors"
              title="Sair da Conta Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair (Logout)</span>
            </button>
          </div>
        </header>

        {/* Page Inner Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
