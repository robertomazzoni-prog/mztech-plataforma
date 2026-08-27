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

  const handleSelectPlan = (plan: any) => {
    const planString = `${plan.name} (${formatCurrency(plan.price)}/mês)`;
    setFormData((prev: any) => ({
      ...prev,
      needsHosting: planString,
      monthlyPrice: plan.price || getMonthlyPriceFromPlan(planString, recurringServices),
    }));
    const formElement = document.getElementById('orcamento');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Classes de Estilo Condicionais para Modo Claro e Modo Escuro (Preto/Zinc puro no escuro)
  const theme = {
    bg: isDarkMode ? 'bg-[#09090b]' : 'bg-slate-50',
    surface: isDarkMode ? 'bg-[#121215]' : 'bg-white',
    surfaceHover: isDarkMode ? 'hover:bg-[#18181c]' : 'hover:bg-slate-50',
    surfaceMuted: isDarkMode ? 'bg-[#18181c]' : 'bg-slate-100',
    border: isDarkMode ? 'border-[#27272a]' : 'border-slate-200',
    borderFocus: isDarkMode ? 'focus:border-blue-500' : 'focus:border-blue-600',
    textPrimary: isDarkMode ? 'text-white' : 'text-slate-900',
    textSecondary: isDarkMode ? 'text-zinc-300' : 'text-slate-600',
    textMuted: isDarkMode ? 'text-zinc-400' : 'text-slate-500',
    badgeBg: isDarkMode ? 'bg-zinc-800/80 text-blue-400 border-zinc-700' : 'bg-blue-50 text-blue-700 border-blue-200',
    badgeSuccess: isDarkMode ? 'bg-zinc-800/80 text-emerald-400 border-zinc-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    btnPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold transition-all',
    btnSecondary: isDarkMode
      ? 'bg-[#18181c] hover:bg-[#222227] text-zinc-200 border border-[#27272a] font-semibold transition-all'
      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm font-semibold transition-all',
    input: isDarkMode
      ? 'bg-[#121215] border-[#27272a] text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/20'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textPrimary} antialiased flex flex-col font-sans transition-colors duration-200`}>
      
      {/* ============================================================ */}
      {/* 1. TOP BAR CORPORATIVA DE INFRAESTRUTURA & CONTATO */}
      {/* ============================================================ */}
      <div className={`${isDarkMode ? 'bg-[#000000] border-b border-[#27272a]' : 'bg-slate-900 border-b border-slate-800'} px-4 py-2 text-xs text-slate-300`}>
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
      <header className={`sticky top-0 z-40 ${isDarkMode ? 'bg-[#09090b]/95 border-b border-[#27272a]' : 'bg-white/95 border-b border-slate-200'} backdrop-blur-md shadow-sm transition-colors duration-200`}>
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
                  ? 'bg-[#18181c] border-[#27272a] text-amber-300 hover:bg-[#222227]'
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${theme.badgeBg}`}>
              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Soluções Digitais & Engenharia Web Corporativa</span>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight ${theme.textPrimary} leading-tight max-w-4xl mx-auto`}>
              Seu negócio merece uma <span className="text-blue-600 dark:text-blue-400">presença digital profissional</span>.
            </h1>

            <p className={`text-base sm:text-lg ${theme.textSecondary} leading-relaxed max-w-3xl mx-auto font-normal`}>
              Desenvolvemos sites institucionais, sistemas corporativos e lojas digitais sob medida com código nativo, alta velocidade, hospedagem em nuvem gerenciada e suporte técnico direto.
            </p>
          </div>

          {/* Botões CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#orcamento"
              className={`px-8 py-3.5 rounded-xl ${theme.btnPrimary} text-center text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20`}
            >
              <span>Solicitar Proposta Comercial</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#planos"
              className={`px-8 py-3.5 rounded-xl ${theme.btnSecondary} text-center text-sm flex items-center justify-center gap-2`}
            >
              <span>Ver Planos de Hospedagem</span>
            </a>
          </div>

          {/* 4 Badges de Garantia Corporativa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 max-w-4xl mx-auto text-left">
            <div className={`p-4 rounded-xl border ${theme.border} ${theme.surface} flex items-center gap-3.5 shadow-sm`}>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-bold block text-current">Código Sob Medida</strong>
                <span className={`text-[11px] ${theme.textMuted}`}>Next.js & PostgreSQL</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${theme.border} ${theme.surface} flex items-center gap-3.5 shadow-sm`}>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-bold block text-current">Hospedagem Cloud</strong>
                <span className={`text-[11px] ${theme.textMuted}`}>SSL, DNS & Backups</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${theme.border} ${theme.surface} flex items-center gap-3.5 shadow-sm`}>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-bold block text-current">Segurança & LGPD</strong>
                <span className={`text-[11px] ${theme.textMuted}`}>Proteção de Dados</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${theme.border} ${theme.surface} flex items-center gap-3.5 shadow-sm`}>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-bold block text-current">Atendimento Direto</strong>
                <span className={`text-[11px] ${theme.textMuted}`}>{robertoName} & {morvanName}</span>
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
            {(recurringServices && recurringServices.length > 0 ? recurringServices : MZTECH_PLANS).map((plan: any, idx: number) => {
              const isRec = plan.recommended || (typeof plan.name === 'string' && plan.name.toLowerCase().includes('manutenção')) || plan.type === 'MANUTENCAO';
              const badgeText = plan.badge || (isRec ? 'Mais Recomendado' : 'Hospedagem Gerenciada');

              return (
                <div
                  key={plan.id || plan.name || idx}
                  className={`p-6 sm:p-8 rounded-2xl border-2 transition-all flex flex-col justify-between shadow-sm relative ${
                    isRec
                      ? isDarkMode
                        ? 'border-blue-500 bg-[#18181c] shadow-blue-500/10'
                        : 'border-blue-600 bg-white shadow-md'
                      : `${theme.border} ${theme.surface}`
                  }`}
                >
                  {isRec && (
                    <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                      {badgeText}
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
                      <span className={`text-xs ${theme.textMuted}`}>{plan.period || '/mês'}</span>
                    </div>

                    <ul className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                      {Array.isArray(plan.features) && plan.features.map((feat: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs">
                          <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className={theme.textSecondary}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3 rounded-lg ${isRec ? theme.btnPrimary : theme.btnSecondary} text-center text-xs font-semibold flex items-center justify-center gap-2`}
                    >
                      <span>{plan.cta || `Escolher ${plan.name?.replace('Plano ', '')}`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
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
              Metodologia de Engenharia Web
            </h2>
            <p className={`text-sm sm:text-base ${theme.textSecondary}`}>
              Fluxo ágil e transparente para entrega do seu projeto no prazo e com máxima qualidade.
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
              Dê o Próximo Passo
            </span>
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${theme.textPrimary}`}>
              Solicite seu Orçamento
            </h2>
            <p className={`text-sm sm:text-base ${theme.textSecondary}`}>
              Preencha os dados abaixo para receber uma análise técnica e proposta comercial personalizada.
            </p>
          </div>

          <div className={`p-6 sm:p-10 rounded-2xl border ${theme.border} ${theme.surface} shadow-xl`}>
            {formSubmitted ? (
              <div className="text-center py-12 space-y-6 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className={`text-2xl sm:text-3xl font-extrabold ${theme.textPrimary}`}>
                    Solicitação & Conta Criadas com Sucesso!
                  </h3>
                  <p className={`text-sm ${theme.textSecondary} max-w-md mx-auto leading-relaxed`}>
                    Sua conta no <strong className={theme.textPrimary}>Portal do Cliente</strong> foi gerada e sua proposta já está disponível no painel administrativo e no seu portal para acompanhamento em tempo real.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  <Link
                    href="/cliente"
                    className={`w-full sm:w-auto px-6 py-3.5 rounded-xl ${theme.btnPrimary} font-bold text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Acessar Meu Portal do Cliente</span>
                  </Link>

                  <a
                    href={`https://wa.me/${MZTECH_INFO.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Falar no WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {/* Honeypot anti-spam invisível */}
                <input
                  type="text"
                  name="website_url_hp"
                  value={formData.website_url_hp}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, website_url_hp: e.target.value }))}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Banner de Usuário Logado ou Criação de Conta */}
                {currentUser ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`font-bold ${theme.textPrimary} block`}>Conectado como {currentUser.name}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                          {currentUser.email} • Sua proposta será vinculada à sua conta
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                      Conta Ativa
                    </span>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl ${theme.surfaceMuted} border ${theme.border} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}>
                    <div className="flex items-start sm:items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`font-bold ${theme.textPrimary} block`}>Criação Obrigatória de Conta no Portal do Cliente</span>
                        <span className={`text-[11px] ${theme.textMuted}`}>
                          Para solicitar o orçamento, preencha os dados e defina sua senha para acompanhar o projeto e contratos no portal.
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/cliente/login"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[11px] whitespace-nowrap self-start sm:self-auto"
                    >
                      Já tem uma conta? Entrar
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold ${theme.textSecondary}`}>Seu Nome *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Silva"
                      value={formData.name}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold ${theme.textSecondary}`}>Nome da Empresa</label>
                    <input
                      type="text"
                      placeholder="Ex: Silva & Associados"
                      value={formData.company}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, company: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold ${theme.textSecondary}`}>WhatsApp / Celular *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(31) 99999-9999"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, whatsapp: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold ${theme.textSecondary}`}>E-mail Comercial (Login do Portal) *</label>
                    <input
                      type="email"
                      required
                      placeholder="contato@suaempresa.com.br"
                      value={formData.email}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                    />
                  </div>
                </div>

                {/* Campos de Senha Obrigatórios (se não estiver autenticado) */}
                {!currentUser && (
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl ${theme.surfaceMuted} border ${theme.border}`}>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className={`text-xs font-semibold ${theme.textSecondary} flex items-center gap-1.5`}>
                          <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Definir Senha de Acesso *</span>
                        </label>
                        <span className={`text-[10px] ${theme.textMuted} font-mono`}>Mínimo 6 dígitos</span>
                      </div>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={formData.password || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, password: e.target.value }))}
                        className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-xs font-semibold ${theme.textSecondary} flex items-center gap-1.5`}>
                        <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Confirmar Senha *</span>
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={formData.confirmPassword || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, confirmPassword: e.target.value }))}
                        className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                      />
                    </div>
                  </div>
                )}

                {/* Seleção do Desenvolvedor / Sócio Responsável */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className={`text-xs font-semibold ${theme.textSecondary} flex items-center gap-1.5`}>
                      <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Escolha o Desenvolvedor / Especialista *</span>
                    </label>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Atendimento direto com o sócio</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Roberto */}
                    <button
                      type="button"
                      onClick={() => setFormData((prev: any) => ({ ...prev, selectedDev: 'Roberto' }))}
                      className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        formData.selectedDev === 'Roberto'
                          ? 'bg-blue-500/10 border-blue-500 shadow-sm'
                          : `${theme.border} ${theme.surface} hover:border-slate-400 dark:hover:border-slate-600`
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                              R
                            </div>
                            <span className={`font-bold ${theme.textPrimary} text-sm`}>{robertoName}</span>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              formData.selectedDev === 'Roberto'
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-400 dark:border-slate-600'
                            }`}
                          >
                            {formData.selectedDev === 'Roberto' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">Sócio & Dev Full Stack</p>
                        <p className={`text-[11px] ${theme.textMuted} leading-tight mt-1`}>
                          Especialista em Interfaces Web, Next.js, React e Soluções Digitais
                        </p>
                      </div>
                    </button>

                    {/* Morvan */}
                    <button
                      type="button"
                      onClick={() => setFormData((prev: any) => ({ ...prev, selectedDev: 'Morvan' }))}
                      className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        formData.selectedDev === 'Morvan'
                          ? 'bg-blue-500/10 border-blue-500 shadow-sm'
                          : `${theme.border} ${theme.surface} hover:border-slate-400 dark:hover:border-slate-600`
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                              M
                            </div>
                            <span className={`font-bold ${theme.textPrimary} text-sm`}>{morvanName}</span>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              formData.selectedDev === 'Morvan'
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-400 dark:border-slate-600'
                            }`}
                          >
                            {formData.selectedDev === 'Morvan' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">Sócio & Dev Full Stack</p>
                        <p className={`text-[11px] ${theme.textMuted} leading-tight mt-1`}>
                          Especialista em Sistemas Web, Banco de Dados e Arquitetura Cloud
                        </p>
                      </div>
                    </button>

                    {/* Sem preferência */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev: any) => ({ ...prev, selectedDev: 'Sem Preferência (Roberto ou Morvan)' }))
                      }
                      className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        formData.selectedDev === 'Sem Preferência (Roberto ou Morvan)'
                          ? 'bg-blue-500/10 border-blue-500 shadow-sm'
                          : `${theme.border} ${theme.surface} hover:border-slate-400 dark:hover:border-slate-600`
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-600 text-white font-bold text-xs flex items-center justify-center">
                              mz
                            </div>
                            <span className={`font-bold ${theme.textPrimary} text-sm`}>Indiferente</span>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              formData.selectedDev === 'Sem Preferência (Roberto ou Morvan)'
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-400 dark:border-slate-600'
                            }`}
                          >
                            {formData.selectedDev === 'Sem Preferência (Roberto ou Morvan)' && (
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            )}
                          </span>
                        </div>
                        <p className={`text-[10px] font-mono font-bold ${theme.textMuted}`}>Equipe mzTech</p>
                        <p className={`text-[11px] ${theme.textMuted} leading-tight mt-1`}>
                          Qualquer um dos dois desenvolvedores sócios disponível
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className={`text-xs font-semibold ${theme.textSecondary}`}>Tipo de Projeto</label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, projectType: e.target.value }))}
                      className={`w-full px-3 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                    >
                      {devServices && devServices.length > 0 ? (
                        devServices.map((s: any) => (
                          <option key={s.id || s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Site Institucional Profissional">Site Institucional Profissional</option>
                          <option value="Landing Page de Alta Conversão">Landing Page de Alta Conversão</option>
                          <option value="Sistema Web / Painel Sob Medida">Sistema Web / Painel Sob Medida</option>
                          <option value="Loja Virtual / E-commerce">Loja Virtual / E-commerce</option>
                        </>
                      )}
                      <option value="Outro Projeto Personalizado">Outro Projeto Personalizado</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <label className={`text-xs font-semibold ${theme.textSecondary}`}>Possui Domínio?</label>
                    <select
                      value={formData.hasDomain}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, hasDomain: e.target.value }))}
                      className={`w-full px-3 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                    >
                      <option value="Sim, já possuo domínio registrado">Sim, já possuo</option>
                      <option value="Não, preciso registrar">Não, preciso registrar</option>
                      <option value="Preciso de orientação">Preciso de orientação</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <label className={`text-xs font-semibold ${theme.textSecondary}`}>Plano Desejado</label>
                    <select
                      value={formData.needsHosting}
                      onChange={(e) => {
                        const newPlan = e.target.value;
                        if (newPlan.toLowerCase().includes('definir')) {
                          setFormData((prev: any) => ({
                            ...prev,
                            needsHosting: 'A Definir na Proposta Comercial',
                            monthlyPrice: 0,
                          }));
                        } else if (newPlan === 'Apenas Desenvolvimento') {
                          setFormData((prev: any) => ({
                            ...prev,
                            needsHosting: 'Apenas Desenvolvimento',
                            monthlyPrice: 0,
                          }));
                        } else {
                          const plans = recurringServices && recurringServices.length > 0 ? recurringServices : MZTECH_PLANS;
                          const matchingPlan = plans.find((p: any) => newPlan.includes(p.name));
                          const newMonthly = matchingPlan ? matchingPlan.price : getMonthlyPriceFromPlan(newPlan, plans);
                          setFormData((prev: any) => ({
                            ...prev,
                            needsHosting: newPlan,
                            monthlyPrice: newMonthly,
                          }));
                        }
                      }}
                      className={`w-full px-3 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                    >
                      <option value="A Definir na Proposta Comercial">A Definir na Proposta Comercial</option>
                      {(recurringServices && recurringServices.length > 0 ? recurringServices : MZTECH_PLANS).map((p: any) => (
                        <option key={p.id || p.name} value={`${p.name} (${formatCurrency(p.price)}/mês)`}>
                          {p.name} ({formatCurrency(p.price)}/mês)
                        </option>
                      ))}
                      <option value="Apenas Desenvolvimento">Apenas Desenvolvimento (Sem Recorrência)</option>
                    </select>
                  </div>
                </div>

                {/* Campo condicional para inserir o Domínio Próprio */}
                {(formData.hasDomain?.toLowerCase().includes('sim') || formData.hasDomain?.toLowerCase().includes('já possuo')) && (
                  <div className={`p-4 rounded-xl ${theme.surfaceMuted} border border-emerald-500/40 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200`}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Qual é o seu Domínio Próprio? *</span>
                      </label>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Configuração DNS Inclusa
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Ex: suaempresa.com.br, seunegocio.com ou minhaclinica.com.br"
                      value={formData.customDomain || ''}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, customDomain: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-mono ${theme.input}`}
                    />
                    <p className={`text-[11px] ${theme.textMuted} leading-relaxed`}>
                      💡 A equipe técnica da mzTech cuidará de todos os apontamentos de DNS, vinculação dos servidores e instalação do Certificado de Segurança SSL no seu domínio registrado.
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${theme.textSecondary}`}>
                    Descrição do Projeto & Necessidades
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Conte sobre o seu negócio, o que o site/sistema precisa ter, referências ou funcionalidades específicas..."
                    value={formData.projectDescription}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, projectDescription: e.target.value }))}
                    className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm ${theme.input}`}
                  />
                </div>

                {/* SELEÇÃO DA FORMA DE PAGAMENTO */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className={`text-xs font-semibold ${theme.textSecondary} flex items-center gap-1.5`}>
                      <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Como Você Deseja Pagar? *</span>
                    </label>
                    <span className={`text-[11px] ${theme.textMuted}`}>Escolha sua preferência</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Cartão de Crédito Recorrente */}
                    <button
                      type="button"
                      onClick={() => setFormData((prev: any) => ({ ...prev, paymentMethodChoice: 'CREDIT_CARD_RECURRING' }))}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.paymentMethodChoice === 'CREDIT_CARD_RECURRING'
                          ? 'bg-blue-500/10 border-blue-500 shadow-sm'
                          : `${theme.border} ${theme.surface} hover:border-slate-400 dark:hover:border-slate-600`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className={`text-xs font-bold ${theme.textPrimary}`}>Cartão de Crédito Recorrente</strong>
                        <span className={`w-3.5 h-3.5 rounded-full border ${formData.paymentMethodChoice === 'CREDIT_CARD_RECURRING' ? 'border-blue-600 bg-blue-600' : 'border-slate-400 dark:border-slate-600'}`} />
                      </div>
                      <p className={`text-[11px] ${theme.textMuted} mt-1`}>
                        Pagamento automático da mensalidade todo mês direto no cartão.
                      </p>
                    </button>

                    {/* PIX */}
                    <button
                      type="button"
                      onClick={() => setFormData((prev: any) => ({ ...prev, paymentMethodChoice: 'PIX' }))}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.paymentMethodChoice === 'PIX'
                          ? 'bg-blue-500/10 border-blue-500 shadow-sm'
                          : `${theme.border} ${theme.surface} hover:border-slate-400 dark:hover:border-slate-600`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className={`text-xs font-bold ${theme.textPrimary}`}>PIX (À Vista / Recorrente)</strong>
                        <span className={`w-3.5 h-3.5 rounded-full border ${formData.paymentMethodChoice === 'PIX' ? 'border-blue-600 bg-blue-600' : 'border-slate-400 dark:border-slate-600'}`} />
                      </div>
                      <p className={`text-[11px] ${theme.textMuted} mt-1`}>
                        Pagamento instantâneo via QR Code e chave Pix oficial da mzTech.
                      </p>
                    </button>

                    {/* Cartão de Crédito Parcelado */}
                    <button
                      type="button"
                      onClick={() => setFormData((prev: any) => ({ ...prev, paymentMethodChoice: 'CREDIT_CARD' }))}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.paymentMethodChoice === 'CREDIT_CARD'
                          ? 'bg-blue-500/10 border-blue-500 shadow-sm'
                          : `${theme.border} ${theme.surface} hover:border-slate-400 dark:hover:border-slate-600`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className={`text-xs font-bold ${theme.textPrimary}`}>Cartão de Crédito (Parcelado)</strong>
                        <span className={`w-3.5 h-3.5 rounded-full border ${formData.paymentMethodChoice === 'CREDIT_CARD' ? 'border-blue-600 bg-blue-600' : 'border-slate-400 dark:border-slate-600'}`} />
                      </div>
                      <p className={`text-[11px] ${theme.textMuted} mt-1`}>
                        Pagamento do valor inicial de desenvolvimento parcelado no cartão.
                      </p>
                    </button>

                    {/* Cartão + PIX */}
                    <button
                      type="button"
                      onClick={() => setFormData((prev: any) => ({ ...prev, paymentMethodChoice: 'CARD_PLUS_PIX' }))}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.paymentMethodChoice === 'CARD_PLUS_PIX'
                          ? 'bg-blue-500/10 border-blue-500 shadow-sm'
                          : `${theme.border} ${theme.surface} hover:border-slate-400 dark:hover:border-slate-600`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className={`text-xs font-bold ${theme.textPrimary}`}>Cartão + PIX</strong>
                        <span className={`w-3.5 h-3.5 rounded-full border ${formData.paymentMethodChoice === 'CARD_PLUS_PIX' ? 'border-blue-600 bg-blue-600' : 'border-slate-400 dark:border-slate-600'}`} />
                      </div>
                      <p className={`text-[11px] ${theme.textMuted} mt-1`}>
                        Entrada no Pix e mensalidades no cartão de crédito recorrente.
                      </p>
                    </button>
                  </div>
                </div>

                {/* RESUMO DA PROPOSTA */}
                <div className={`p-4 rounded-xl ${theme.surfaceMuted} border ${theme.border} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Resumo da Solicitação</span>
                    </span>
                    <span className={`text-[11px] ${theme.textMuted}`}>Sem cobrança imediata</span>
                  </div>

                  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t ${theme.border} text-xs`}>
                    <div>
                      <span className={`text-[10px] ${theme.textMuted} block`}>Tipo de Projeto:</span>
                      <strong className={`truncate block ${theme.textPrimary}`}>{formData.projectType}</strong>
                    </div>
                    <div>
                      <span className={`text-[10px] ${theme.textMuted} block`}>Modalidade:</span>
                      <span className="text-blue-600 dark:text-blue-400 truncate block font-medium">
                        {formData.needsHosting?.includes('79,90') || formData.needsHosting?.includes('Hospedagem + Manutenção')
                          ? 'Hospedagem + Manutenção'
                          : formData.needsHosting?.includes('39,90') || formData.needsHosting?.includes('Hospedagem Gerenciada')
                          ? 'Hospedagem Gerenciada'
                          : formData.needsHosting === 'Apenas Desenvolvimento'
                          ? 'Apenas Desenvolvimento'
                          : 'A Definir'}
                      </span>
                    </div>
                    <div>
                      <span className={`text-[10px] ${theme.textMuted} block`}>Mensalidade:</span>
                      <span className={`${formData.monthlyPrice > 0 ? 'text-emerald-500 font-bold' : theme.textSecondary} font-mono block`}>
                        {formData.monthlyPrice > 0
                          ? `R$ ${formData.monthlyPrice.toFixed(2).replace('.', ',')}/mês`
                          : formData.needsHosting === 'Apenas Desenvolvimento'
                          ? 'Sem Mensalidade (R$ 0,00)'
                          : 'A Definir na Proposta'}
                      </span>
                    </div>
                    <div>
                      <span className={`text-[10px] ${theme.textMuted} block`}>Forma Escolhida:</span>
                      <span className={`truncate block ${theme.textSecondary}`}>
                        {formData.paymentMethodChoice === 'CREDIT_CARD_RECURRING' && 'Cartão Recorrente'}
                        {formData.paymentMethodChoice === 'PIX' && 'PIX'}
                        {formData.paymentMethodChoice === 'CREDIT_CARD' && 'Cartão'}
                        {formData.paymentMethodChoice === 'CARD_PLUS_PIX' && 'Cartão + PIX'}
                      </span>
                    </div>
                  </div>

                  <div className={`pt-2 border-t ${theme.border} text-[11px] ${theme.textMuted} flex items-center gap-1.5`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>Valor de desenvolvimento: <strong className={theme.textPrimary}>Definido sob medida na proposta comercial após análise</strong></span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`w-full py-4 rounded-xl ${theme.btnPrimary} font-bold text-base shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]`}
                  >
                    {formLoading ? (
                      <Activity className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    <span>Enviar Solicitação de Orçamento</span>
                  </button>
                  <p className={`text-[11px] ${theme.textMuted} text-center mt-3`}>
                    Ao enviar, seu orçamento e conta de cliente serão salvos no painel da mzTech e nossa equipe entrará em contato.
                  </p>
                </div>

              </form>
            )}
          </div>

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
      <footer id="contato" className={`${isDarkMode ? 'bg-[#000000] border-t border-[#27272a]' : 'bg-slate-900 text-slate-300'} py-12 px-4 sm:px-6 lg:px-8 text-xs`}>
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
