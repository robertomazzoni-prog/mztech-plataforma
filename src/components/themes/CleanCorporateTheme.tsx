'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Code2,
  Server,
  Wrench,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Send,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Layers,
  Calendar,
  ExternalLink,
  Shield,
  Terminal,
  Activity,
  Check,
  X,
  Phone,
  Mail,
  Lock,
  Users,
  UserCheck,
  UserPlus,
  CreditCard,
  Sun,
  Moon,
  Building2,
  Clock,
  Laptop,
} from 'lucide-react';
import {
  MZTECH_INFO,
  MZTECH_PLANS,
  MZTECH_SERVICE_CATEGORIES,
  MZTECH_STEPS,
  MZTECH_SCOPE_INCLUDED,
  MZTECH_FAQ,
  DEFAULT_CONTRACT_TEMPLATE,
} from '@/data/mztech-constants';
import { formatCurrency } from '@/lib/utils';

interface CleanCorporateThemeProps {
  settingsData: any;
  servicesList: any[];
  portfolioList: any[];
  currentUser: any;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleFormSubmit: (e: React.FormEvent) => void;
  formLoading: boolean;
  formSubmitted: boolean;
  openFaqIndex: number | null;
  setOpenFaqIndex: React.Dispatch<React.SetStateAction<number | null>>;
  termsModalOpen: boolean;
  setTermsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  devServices: any[];
  recurringServices: any[];
  getMonthlyPriceFromPlan: (plan: string, customPlans?: any[]) => number;
}

export default function CleanCorporateTheme({
  settingsData,
  servicesList,
  portfolioList,
  currentUser,
  formData,
  setFormData,
  handleFormSubmit,
  formLoading,
  formSubmitted,
  openFaqIndex,
  setOpenFaqIndex,
  termsModalOpen,
  setTermsModalOpen,
  devServices,
  recurringServices,
  getMonthlyPriceFromPlan,
}: CleanCorporateThemeProps) {
  // Estado local para Modo Claro / Modo Escuro do Clean Corporate
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [selectedPortfolioIdx, setSelectedPortfolioIdx] = useState<number>(0);

  // Carregar preferência salva no localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('mztech_corporate_mode');
      if (savedMode === 'dark') {
        setIsDarkMode(true);
      } else if (savedMode === 'light') {
        setIsDarkMode(false);
      } else {
        // Padrão corporativo limpo: Modo Claro
        setIsDarkMode(false);
      }
    } catch (e) {}
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('mztech_corporate_mode', next ? 'dark' : 'light');
      } catch (e) {}
      return next;
    });
  };

  const robertoPhone = settingsData?.robertoPhone || MZTECH_INFO.robertoPhone;
  const robertoName = settingsData?.robertoName || MZTECH_INFO.robertoName;
  const morvanPhone = settingsData?.morvanPhone || MZTECH_INFO.morvanPhone;
  const morvanName = settingsData?.morvanName || MZTECH_INFO.morvanName;
  const companyEmail = settingsData?.email || MZTECH_INFO.email;
  const tagline = settingsData?.tagline || MZTECH_INFO.tagline;
  const companyName = settingsData?.name || MZTECH_INFO.name;
  const legalName = settingsData?.legalName || MZTECH_INFO.legalName;
  const workingHours = settingsData?.workingHours || 'Segunda a Sexta, 08h às 19h • Sábados, 09h às 14h';

  // Classes de Estilo Condicionais para Modo Claro e Modo Escuro
  const theme = {
    bg: isDarkMode ? 'bg-[#0a0f1d]' : 'bg-slate-50',
    surface: isDarkMode ? 'bg-[#111c38]' : 'bg-white',
    surfaceHover: isDarkMode ? 'hover:bg-[#162244]' : 'hover:bg-slate-50',
    surfaceMuted: isDarkMode ? 'bg-[#162244]' : 'bg-slate-100',
    border: isDarkMode ? 'border-slate-800' : 'border-slate-200',
    borderFocus: isDarkMode ? 'focus:border-blue-500' : 'focus:border-blue-600',
    textPrimary: isDarkMode ? 'text-white' : 'text-slate-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-slate-600',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    badgeBg: isDarkMode ? 'bg-blue-950/60 text-blue-300 border-blue-800/60' : 'bg-blue-50 text-blue-700 border-blue-200',
    badgeSuccess: isDarkMode ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    btnPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold transition-all',
    btnSecondary: isDarkMode
      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all'
      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm font-semibold transition-all',
    input: isDarkMode
      ? 'bg-[#0e172e] border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textPrimary} antialiased flex flex-col font-sans transition-colors duration-200`}>
      
      {/* ============================================================ */}
      {/* 1. TOP BAR CORPORATIVA DE INFRAESTRUTURA & CONTATO */}
      {/* ============================================================ */}
      <div className={`${isDarkMode ? 'bg-[#080c18] border-b border-slate-800/80' : 'bg-slate-900 border-b border-slate-800'} px-4 py-2 text-xs text-slate-300`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">mzTech Soluções Digitais:</span>
            <span className="text-emerald-400 font-medium hidden sm:inline">Infraestrutura Cloud 100% Operacional & Segura</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden md:flex items-center gap-3 text-slate-400">
              <span>{workingHours}</span>
            </div>
            <Link
              href="/cliente/login"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-all"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Portal do Cliente</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. HEADER / NAVBAR CORPORATIVA */}
      {/* ============================================================ */}
      <header className={`sticky top-0 z-40 ${isDarkMode ? 'bg-[#0e172e]/95 border-b border-slate-800' : 'bg-white/95 border-b border-slate-200'} backdrop-blur-md shadow-sm transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          
          {/* Logo & Marca */}
          <Link href="/mztech" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-blue-700 transition-colors">
              mz
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-current">{companyName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${theme.badgeBg}`}>
                  Empresarial
                </span>
              </div>
              <p className={`text-xs ${theme.textMuted} font-normal`}>{tagline}</p>
            </div>
          </Link>

          {/* Links de Navegação */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <a href="#servicos" className={`${theme.textSecondary} hover:text-blue-600 transition-colors`}>Serviços</a>
            <a href="#portfolio" className={`${theme.textSecondary} hover:text-blue-600 transition-colors`}>Portfólio</a>
            <a href="#planos" className={`${theme.textSecondary} hover:text-blue-600 transition-colors`}>Planos</a>
            <a href="#metodologia" className={`${theme.textSecondary} hover:text-blue-600 transition-colors`}>Metodologia</a>
            <a href="#faq" className={`${theme.textSecondary} hover:text-blue-600 transition-colors`}>FAQ</a>
            <a href="#contato" className={`${theme.textSecondary} hover:text-blue-600 transition-colors`}>Contato</a>
          </nav>

          {/* Ações: Botão Claro/Escuro + Solicitar Orçamento */}
          <div className="flex items-center gap-3">
            {/* BOTÃO EXCLUSIVO CLARO / ESCURO */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
              title={isDarkMode ? 'Alternar para Modo Claro (☀️)' : 'Alternar para Modo Escuro (🌙)'}
              aria-label="Alternar tema claro e escuro"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <a
              href="#orcamento"
              className={`px-4 py-2 rounded-lg ${theme.btnPrimary} text-xs sm:text-sm flex items-center gap-2`}
            >
              <span>Solicitar Orçamento</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </header>

      {/* ============================================================ */}
      {/* 3. HERO SECTION CORPORATIVO & LIMPO */}
      {/* ============================================================ */}
      <section className={`py-16 sm:py-24 border-b ${theme.border} relative overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Coluna de Conteúdo */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${theme.badgeBg}`}>
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Soluções Digitais & Engenharia Web Corporativa</span>
              </div>

              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight ${theme.textPrimary} leading-tight`}>
                Seu negócio merece uma <span className="text-blue-600">presença digital profissional</span>.
              </h1>

              <p className={`text-base sm:text-lg ${theme.textSecondary} leading-relaxed max-w-2xl font-normal`}>
                Desenvolvemos sites institucionais, sistemas corporativos e lojas digitais sob medida com código nativo, alta velocidade, hospedagem em nuvem gerenciada e suporte técnico direto.
              </p>

              {/* 4 Badges de Garantia Corporativa */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-2">
                <div className={`p-3 rounded-lg border ${theme.border} ${theme.surface} flex items-center gap-3`}>
                  <Code2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <strong className="text-xs font-bold block">Código Sob Medida</strong>
                    <span className={`text-[11px] ${theme.textMuted}`}>Next.js & PostgreSQL</span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${theme.border} ${theme.surface} flex items-center gap-3`}>
                  <Server className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <strong className="text-xs font-bold block">Hospedagem Cloud</strong>
                    <span className={`text-[11px] ${theme.textMuted}`}>SSL, DNS & Backups</span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${theme.border} ${theme.surface} flex items-center gap-3`}>
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <strong className="text-xs font-bold block">Segurança & LGPD</strong>
                    <span className={`text-[11px] ${theme.textMuted}`}>Proteção de Dados</span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${theme.border} ${theme.surface} flex items-center gap-3`}>
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <strong className="text-xs font-bold block">Atendimento Direto</strong>
                    <span className={`text-[11px] ${theme.textMuted}`}>{robertoName} & {morvanName}</span>
                  </div>
                </div>
              </div>

              {/* Botões CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                <a
                  href="#orcamento"
                  className={`px-6 py-3.5 rounded-lg ${theme.btnPrimary} text-center text-sm flex items-center justify-center gap-2`}
                >
                  <span>Solicitar Proposta Comercial</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#planos"
                  className={`px-6 py-3.5 rounded-lg ${theme.btnSecondary} text-center text-sm flex items-center justify-center gap-2`}
                >
                  <span>Ver Planos de Hospedagem</span>
                </a>
              </div>

            </div>

            {/* Coluna Visual: Card de Visão Geral Corporativa */}
            <div className="lg:col-span-5">
              <div className={`rounded-2xl border ${theme.border} ${theme.surface} p-6 shadow-lg space-y-5`}>
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-current">Painel Operacional mzTech</span>
                  </div>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${theme.badgeSuccess}`}>
                    Status: Online
                  </span>
                </div>

                {/* Métricas Corporativas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3.5 rounded-xl ${theme.surfaceMuted} border ${theme.border}`}>
                    <span className={`text-[11px] ${theme.textMuted} block`}>Disponibilidade (SLA)</span>
                    <strong className="text-lg font-bold text-emerald-500">99.9%</strong>
                  </div>
                  <div className={`p-3.5 rounded-xl ${theme.surfaceMuted} border ${theme.border}`}>
                    <span className={`text-[11px] ${theme.textMuted} block`}>Tempo de Resposta</span>
                    <strong className="text-lg font-bold text-blue-600">&lt; 150ms</strong>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${theme.surfaceMuted} border ${theme.border} space-y-2`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">Tecnologia Utilizada</span>
                    <span className="font-mono text-blue-600 font-bold">Next.js 14 • PostgreSQL</span>
                  </div>
                  <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
                    Ambiente corporativo de alta escalabilidade, com rotinas automáticas de backup e monitoramento contínuo.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className={theme.textMuted}>Contato Comercial:</span>
                  <span className="font-semibold text-blue-600">{robertoPhone}</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. SERVIÇOS CORPORATIVOS */}
      {/* ============================================================ */}
      <section id="servicos" className={`py-16 sm:py-24 border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${theme.badgeBg}`}>
              Nossos Serviços
            </span>
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary}`}>
              Soluções Completas para a sua Empresa
            </h2>
            <p className={`text-sm sm:text-base ${theme.textSecondary}`}>
              Do planejamento e desenvolvimento até a hospedagem segura e suporte contínuo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MZTECH_SERVICE_CATEGORIES.map((cat, idx) => (
              <div
                key={idx}
                className={`p-6 sm:p-8 rounded-2xl border ${theme.border} ${theme.surface} ${theme.surfaceHover} transition-all space-y-5 flex flex-col justify-between shadow-sm`}
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600">
                    {idx === 0 ? <Code2 className="w-6 h-6" /> : idx === 1 ? <Server className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                  </div>

                  <div>
                    <h3 className={`text-lg font-bold ${theme.textPrimary}`}>{cat.name}</h3>
                    <span className="text-xs font-semibold text-blue-600 block mt-1">{cat.tag}</span>
                  </div>

                  <p className={`text-xs sm:text-sm ${theme.textSecondary} leading-relaxed`}>
                    {cat.description}
                  </p>

                  <ul className="space-y-2 pt-2">
                    {cat.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className={theme.textSecondary}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <a
                    href="#orcamento"
                    className={`w-full py-2.5 rounded-lg ${theme.btnSecondary} text-center text-xs flex items-center justify-center gap-1.5`}
                  >
                    <span>Solicitar Detalhes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. PORTFÓLIO DE PROJETOS */}
      {/* ============================================================ */}
      <section id="portfolio" className={`py-16 sm:py-24 border-b ${theme.border} ${theme.surfaceMuted}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${theme.badgeBg}`}>
              Projetos Entregues
            </span>
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary}`}>
              Portfólio de Soluções em Produção
            </h2>
            <p className={`text-sm sm:text-base ${theme.textSecondary}`}>
              Conheça alguns dos sites e sistemas desenvolvidos e mantidos pela infraestrutura mzTech.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioList && portfolioList.length > 0 ? (
              portfolioList.map((item, idx) => {
                const projectUrl = item.url || item.liveUrl;
                return (
                  <div
                    key={item.id || idx}
                    className={`rounded-2xl border ${theme.border} ${theme.surface} overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow`}
                  >
                    {item.previewImage && (
                      <div className="w-full h-44 overflow-hidden border-b border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                        <img
                          src={item.previewImage}
                          alt={item.title}
                          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded border ${theme.badgeBg}`}>
                            {item.category || 'Sistema Web'}
                          </span>
                          <span className={`text-[11px] font-mono ${theme.textMuted}`}>{item.badge || 'Produção'}</span>
                        </div>

                        <div className="flex items-start gap-2.5">
                          {item.favicon && (
                            <img
                              src={item.favicon}
                              alt=""
                              className="w-5 h-5 rounded object-contain flex-shrink-0 mt-0.5"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <h3 className={`text-lg font-bold ${theme.textPrimary}`}>{item.title}</h3>
                            {item.tagline && (
                              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase mt-0.5">
                                {item.tagline}
                              </p>
                            )}
                          </div>
                        </div>

                        <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
                          {item.description || 'Projeto corporativo de alta performance sob medida desenvolvido pela mzTech.'}
                        </p>
                      </div>

                      {item.features && item.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {item.features.slice(0, 3).map((feat: string, fIdx: number) => (
                            <span
                              key={fIdx}
                              className={`text-[10px] px-2 py-0.5 rounded ${theme.border} border bg-slate-50 dark:bg-slate-900/60 ${theme.textSecondary}`}
                            >
                              • {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={`p-4 border-t ${theme.border} bg-slate-50 dark:bg-[#0c1427] flex items-center justify-between`}>
                      <span className={`text-xs ${theme.textMuted}`}>{item.infrastructure || 'mzTech Cloud'}</span>
                      {projectUrl && (
                        <a
                          href={projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          <span>Acessar Projeto</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8">
                <p className={`text-sm ${theme.textMuted}`}>Projetos em atualização no catálogo corporativo.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. PLANOS DE MENSALIDADE & HOSPEDAGEM */}
      {/* ============================================================ */}
      <section id="planos" className={`py-16 sm:py-24 border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${theme.badgeBg}`}>
              Planos & Mensalidades
            </span>
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary}`}>
              Hospedagem & Gestão Contínua
            </h2>
            <p className={`text-sm sm:text-base ${theme.textSecondary}`}>
              Planos transparentes para manter sua presença digital no ar com segurança e estabilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {MZTECH_PLANS.map((plan, idx) => (
              <div
                key={idx}
                className={`p-6 sm:p-8 rounded-2xl border-2 transition-all flex flex-col justify-between shadow-sm relative ${
                  plan.recommended
                    ? isDarkMode
                      ? 'border-blue-500 bg-[#142040] shadow-blue-500/10'
                      : 'border-blue-600 bg-white shadow-md'
                    : `${theme.border} ${theme.surface}`
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className={`text-xl font-bold ${theme.textPrimary}`}>{plan.name}</h3>
                    <p className={`text-xs ${theme.textSecondary} mt-1`}>{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-blue-600">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className={`text-xs ${theme.textMuted}`}>{plan.period}</span>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs">
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className={theme.textSecondary}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
                  <a
                    href="#orcamento"
                    className={`w-full py-3 rounded-lg ${plan.recommended ? theme.btnPrimary : theme.btnSecondary} text-center text-xs font-semibold flex items-center justify-center gap-2`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. METODOLOGIA DE TRABALHO (4 ETAPAS) */}
      {/* ============================================================ */}
      <section id="metodologia" className={`py-16 sm:py-24 border-b ${theme.border} ${theme.surfaceMuted}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${theme.badgeBg}`}>
              Processo de Trabalho
            </span>
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary}`}>
              Como Funciona do Início à Entrega
            </h2>
            <p className={`text-sm sm:text-base ${theme.textSecondary}`}>
              Metodologia transparente e ágil para transformar a ideia do seu negócio em realidade digital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MZTECH_STEPS.map((step, idx) => (
              <div key={idx} className={`p-6 rounded-2xl border ${theme.border} ${theme.surface} space-y-3 shadow-sm`}>
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  0{idx + 1}
                </div>
                <h3 className={`text-base font-bold ${theme.textPrimary}`}>{step.title}</h3>
                <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>{step.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. FORMULÁRIO DE ORÇAMENTO CORPORATIVO */}
      {/* ============================================================ */}
      <section id="orcamento" className={`py-16 sm:py-24 border-b ${theme.border}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${theme.badgeBg}`}>
              Proposta Comercial
            </span>
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary}`}>
              Solicite seu Orçamento Personalizado
            </h2>
            <p className={`text-sm sm:text-base ${theme.textSecondary}`}>
              Preencha os dados abaixo para receber uma estimativa instantânea e atendimento direto.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className={`p-6 sm:p-10 rounded-2xl border ${theme.border} ${theme.surface} shadow-lg space-y-6`}>
            
            {/* Honeypot anti-spam invisível */}
            <input
              type="text"
              name="website_url_hp"
              value={formData.website_url_hp}
              onChange={(e) => setFormData({ ...formData, website_url_hp: e.target.value })}
              style={{ display: 'none', position: 'absolute', left: '-9999px' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${theme.textSecondary}`}>Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João da Silva"
                  className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${theme.textSecondary}`}>Empresa / Negócio *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Ex: Minha Empresa Ltda"
                  className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${theme.textSecondary}`}>WhatsApp / Telefone *</label>
                <input
                  type="text"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="Ex: (31) 98765-4321"
                  className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${theme.textSecondary}`}>E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ex: contato@minhaempresa.com.br"
                  className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${theme.textSecondary}`}>Tipo de Projeto</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                >
                  <option value="Site Institucional Profissional">Site Institucional Profissional</option>
                  <option value="Landing Page de Alta Conversão">Landing Page de Alta Conversão</option>
                  <option value="Sistema Web / Painel Sob Medida">Sistema Web / Painel Sob Medida</option>
                  <option value="Loja Virtual / E-commerce">Loja Virtual / E-commerce</option>
                  <option value="Apenas Hospedagem & Manutenção">Apenas Hospedagem & Manutenção</option>
                  <option value="Outro Projeto Digital">Outro Projeto Digital</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${theme.textSecondary}`}>Especialista Responsável</label>
                <select
                  value={formData.selectedDev}
                  onChange={(e) => setFormData({ ...formData, selectedDev: e.target.value as any })}
                  className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                >
                  <option value="Roberto">Roberto ({robertoPhone})</option>
                  <option value="Morvan">Morvan ({morvanPhone})</option>
                  <option value="Sem Preferência (Roberto ou Morvan)">Sem Preferência (Qualquer Fundador)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className={`text-xs font-semibold ${theme.textSecondary}`}>Detalhes e Objetivos do Projeto</label>
              <textarea
                rows={3}
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                placeholder="Conte brevemente o que sua empresa precisa (páginas, funcionalidades, etc.)..."
                className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
              />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span>Atendimento confidencial e direto com os fundadores.</span>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-lg ${theme.btnPrimary} text-sm flex items-center justify-center gap-2`}
              >
                {formLoading ? (
                  <span>Enviando proposta...</span>
                ) : (
                  <>
                    <span>Enviar Orçamento no WhatsApp</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FAQ ACCORDION CORPORATIVO */}
      {/* ============================================================ */}
      <section id="faq" className={`py-16 sm:py-24 border-b ${theme.border} ${theme.surfaceMuted}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${theme.badgeBg}`}>
              Dúvidas Frequentes
            </span>
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary}`}>
              Perguntas e Respostas
            </h2>
          </div>

          <div className="space-y-3">
            {MZTECH_FAQ.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border ${theme.border} ${theme.surface} overflow-hidden transition-all`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4"
                  >
                    <span className={`text-sm sm:text-base font-semibold ${theme.textPrimary}`}>
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className={`px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm ${theme.textSecondary} leading-relaxed border-t ${theme.border} pt-3`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. FOOTER CORPORATIVO */}
      {/* ============================================================ */}
      <footer id="contato" className={`${isDarkMode ? 'bg-[#080c18] border-t border-slate-800' : 'bg-slate-900 text-slate-300'} py-12 px-4 sm:px-6 lg:px-8 text-xs`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Coluna 1: Empresa */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
                mz
              </div>
              <strong className="text-white text-base">{companyName}</strong>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {legalName}
            </p>
            <p className="text-slate-500">
              © {MZTECH_INFO.year} mzTech. Todos os direitos reservados.
            </p>
          </div>

          {/* Coluna 2: Contatos */}
          <div className="space-y-2">
            <strong className="text-white text-sm block">Atendimento</strong>
            <p className="text-slate-400">Roberto: <span className="text-slate-200">{robertoPhone}</span></p>
            <p className="text-slate-400">Morvan: <span className="text-slate-200">{morvanPhone}</span></p>
            <p className="text-slate-400">E-mail: <span className="text-slate-200">{companyEmail}</span></p>
          </div>

          {/* Coluna 3: Links Rápidos */}
          <div className="space-y-2">
            <strong className="text-white text-sm block">Links Rápidos</strong>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#servicos" className="hover:text-white transition-colors">Serviços</a></li>
              <li><a href="#portfolio" className="hover:text-white transition-colors">Portfólio</a></li>
              <li><a href="#planos" className="hover:text-white transition-colors">Planos de Hospedagem</a></li>
              <li><a href="#orcamento" className="hover:text-white transition-colors">Solicitar Orçamento</a></li>
            </ul>
          </div>

          {/* Coluna 4: Portal & Segurança */}
          <div className="space-y-3">
            <strong className="text-white text-sm block">Área Restrita</strong>
            <Link
              href="/cliente/login"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Acessar Portal do Cliente</span>
            </Link>
            <p className="text-slate-500 text-[11px]">
              Infraestrutura Cloud com certificado SSL 256-bit e proteção de dados.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
