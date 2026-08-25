'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  MZTECH_INFO,
  MZTECH_PLANS,
  MZTECH_SERVICE_CATEGORIES,
  MZTECH_STEPS,
  MZTECH_SCOPE_INCLUDED,
  MZTECH_SCOPE_EXCLUDED,
  MZTECH_FAQ,
  DEFAULT_CONTRACT_TEMPLATE,
} from '@/data/mztech-constants';
import { formatCurrency } from '@/lib/utils';

const PROJECT_DEV_PRICES: Record<string, number> = {
  'Site Institucional Profissional': 1200,
  'Landing Page de Conversão': 800,
  'Sistema Web Personalizado': 2400,
  'Sistema de Agendamento Online': 1600,
  'Portal / Catálogo': 1800,
  'Outro': 1200,
};

const getMonthlyPriceFromPlan = (plan: string): number => {
  if (plan.includes('39,90')) return 39.90;
  if (plan.includes('79,90')) return 79.90;
  if (plan.includes('Apenas')) return 0;
  return 79.90;
};

export default function MzTechPublicPage() {
  // Estado do FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Estado do Modal de Contrato/Termos
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // Estado do Formulário de Orçamento
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    whatsapp: '',
    email: '',
    selectedDev: 'Roberto' as 'Roberto' | 'Morvan' | 'Sem Preferência (Roberto ou Morvan)',
    projectType: 'Site Institucional Profissional',
    hasDomain: 'Não, preciso registrar',
    needsHosting: 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
    needsMaintenance: 'Sim',
    projectDescription: '',
    paymentMethodChoice: 'CREDIT_CARD_RECURRING' as 'CREDIT_CARD_RECURRING' | 'PIX' | 'CREDIT_CARD' | 'CARD_PLUS_PIX',
    initialDevPrice: 1200,
    monthlyPrice: 79.9,
    estimatedBudget: 'R$ 1.200,00',
    desiredDeadline: '15 a 30 dias',
    // Honeypot anti-spam
    website_url_hp: '',
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSelectPlan = (planName: string) => {
    const newMonthly = getMonthlyPriceFromPlan(planName);
    setFormData((prev) => ({
      ...prev,
      needsHosting: planName,
      monthlyPrice: newMonthly,
    }));
    const formElement = document.getElementById('orcamento');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website_url_hp) {
      return;
    }

    if (!formData.name || !formData.whatsapp || !formData.email) {
      alert('Por favor, preencha os campos obrigatórios (Nome, WhatsApp e E-mail).');
      return;
    }

    setFormLoading(true);

    try {
      await fetch('/api/mztech/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (err) {
      console.warn('Registro de orçamento gravado:', err);
    }

    const payChoiceText =
      formData.paymentMethodChoice === 'CREDIT_CARD_RECURRING'
        ? 'Cartão de Crédito Recorrente (Mensal)'
        : formData.paymentMethodChoice === 'PIX'
        ? 'PIX (À Vista / Recorrente)'
        : formData.paymentMethodChoice === 'CARD_PLUS_PIX'
        ? 'Entrada PIX + Mensalidade no Cartão'
        : 'Cartão de Crédito';

    // Formatar mensagem para WhatsApp da mzTech
    const message = `🚀 *NOVA SOLICITAÇÃO DE ORÇAMENTO - mzTech*\n\n` +
      `👤 *Nome:* ${formData.name}\n` +
      `🏢 *Empresa:* ${formData.company || 'Não informada'}\n` +
      `📱 *WhatsApp:* ${formData.whatsapp}\n` +
      `✉️ *E-mail:* ${formData.email}\n` +
      `👨‍💻 *Desenvolvedor Escolhido:* ${formData.selectedDev}\n` +
      `📂 *Tipo de Projeto:* ${formData.projectType}\n` +
      `🌐 *Possui Domínio?* ${formData.hasDomain}\n` +
      `☁️ *Plano Desejado:* ${formData.needsHosting}\n` +
      `💳 *Forma de Pagamento:* ${payChoiceText}\n` +
      `⏱️ *Prazo Desejado:* ${formData.desiredDeadline}\n` +
      `💰 *Orçamento Estimado:* ${formData.estimatedBudget}\n` +
      `📝 *Descrição:* ${formData.projectDescription || 'Apresentação inicial.'}\n\n` +
      `_Enviado através do site oficial mzTech._`;

    const encodedMessage = encodeURIComponent(message);
    const targetPhone = formData.selectedDev === 'Morvan'
      ? (MZTECH_INFO.morvanWhatsapp || '5531993597136')
      : (MZTECH_INFO.robertoWhatsapp || '5531986847049');
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;

    setFormLoading(false);
    setFormSubmitted(true);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950 flex flex-col font-sans">
      
      {/* Top Bar de Status da Infraestrutura */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 text-center text-xs text-slate-400 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">mzTech Cloud Infrastructure:</span>
            <span className="text-emerald-400 font-mono font-bold hidden sm:inline">100% Online & Seguro</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <Link
              href="/cliente/cadastro"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 font-bold transition-all shadow-sm group hover:scale-105"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span>Cadastre-se</span>
            </Link>

            <Link
              href="/cliente"
              className="text-slate-300 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Área do Cliente</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navbar Institucional */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo mzTech */}
            <Link href="/mztech" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-white block">
                  mz<span className="text-cyan-400">Tech</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium block -mt-1 tracking-wider uppercase">
                  Soluções Digitais
                </span>
              </div>
            </Link>

            {/* Links de Navegação */}
            <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-300">
              <Link href="#servicos" className="hover:text-cyan-400 transition-colors">
                O Que Fazemos
              </Link>
              <Link href="#como-funciona" className="hover:text-cyan-400 transition-colors">
                Como Funciona
              </Link>
              <Link href="#portfolio" className="hover:text-cyan-400 transition-colors">
                Portfólio
              </Link>
              <Link href="#planos" className="hover:text-cyan-400 transition-colors">
                Planos & Preços
              </Link>
              <Link href="#faq" className="hover:text-cyan-400 transition-colors">
                FAQ
              </Link>
              <Link href="/cliente" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                Portal do Cliente
              </Link>
            </nav>

            {/* CTA Navbar */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/cliente/cadastro"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 hover:border-cyan-400 shadow-md shadow-cyan-500/10 hover:scale-105 transition-all"
              >
                <UserPlus className="w-4 h-4 text-cyan-400" />
                <span>Criar Conta</span>
              </Link>

              <Link
                href="#orcamento"
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
              >
                Solicitar Orçamento
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative pt-20 pb-28 sm:pt-28 sm:pb-36 overflow-hidden">
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-indigo-500/0 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge Posicionamento */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold mb-8 shadow-md shadow-cyan-500/5 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{MZTECH_INFO.tagline}</span>
          </div>

          {/* Título Principal Oficial */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Seu negócio merece uma <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">presença digital profissional.</span>
          </h1>

          {/* Subtítulo Oficial */}
          <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            {MZTECH_INFO.description}
          </p>

          {/* Botões CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#orcamento"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-base shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Solicitar orçamento</span>
            </Link>

            <Link
              href="#servicos"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-500/40 font-semibold text-base flex items-center justify-center gap-2 transition-all"
            >
              <span>Conhecer nossos serviços</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SEÇÃO "O QUE FAZEMOS" */}
      {/* ============================================================ */}
      <section id="servicos" className="py-24 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Soluções Completas
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
              O Que a mzTech Faz
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-3">
              Da criação visual e desenvolvimento de código até a hospedagem contínua e manutenção técnica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-7 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Desenvolvimento de Sites</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Sites profissionais, rápidos, responsivos e adaptados à identidade da sua empresa. Estruturados para passar autoridade e converter visitantes em clientes.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-7 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sistemas Web</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Sistemas personalizados para automatizar processos, agendamentos, painéis administrativos e facilitar a gestão do seu negócio.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-7 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hospedagem</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Hospedagem gerenciada pela mzTech com infraestrutura moderna adequada ao projeto. Sem dores de cabeça com servidores ou configurações complexas.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-7 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-colors">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Manutenção</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Atualizações, correções e manutenção técnica constante para garantir que seu site ou sistema permaneça seguro e sempre no ar.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-7 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:bg-purple-500 group-hover:text-slate-950 transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Segurança</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Certificados SSL, proteção de dados, configurações de segurança de banco e monitoramento contra quedas e acessos indevidos.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-7 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Suporte</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Atendimento próximo para dúvidas, problemas e necessidades técnicas relacionadas ao serviço contratado via WhatsApp e e-mail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. COMO FUNCIONA (5 ETAPAS) */}
      {/* ============================================================ */}
      <section id="como-funciona" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Processo Transparente
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
              Como Funciona a Contratação
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-3">
              Um passo a passo claro, sem surpresas e focado na entrega do melhor resultado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {MZTECH_STEPS.map((s, idx) => (
              <div
                key={s.step}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative flex flex-col justify-between hover:border-cyan-500/30 transition-colors"
              >
                <div>
                  <span className="text-3xl font-black text-cyan-400/30 font-mono block mb-2">
                    {s.step}
                  </span>
                  <h3 className="font-bold text-white text-base mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-cyan-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Etapa {idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. PORTFÓLIO (CASE MAZZONI BARBERS) */}
      {/* ============================================================ */}
      <section id="portfolio" className="py-24 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Casos Reais em Produção
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
              Portfólio de Projetos
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-3">
              Projetos construídos pela mzTech com foco em usabilidade, velocidade e geração de negócios.
            </p>
          </div>

          {/* Destaque Case: Mazzoni Barbers */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Site + Sistema de Agendamento
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Em Produção
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
                Mazzoni Barbershop
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                "Projeto desenvolvido pela mzTech para gerenciamento da presença digital e atendimento de uma barbearia, incluindo funcionalidades voltadas para agendamento e administração."
              </p>

              <div className="space-y-2 pt-2">
                <p className="text-xs uppercase font-bold text-slate-400">Funcionalidades Chave:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span>Agendamento online 24h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span>Confirmação via WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span>Painel administrativo financeiro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span>Gestão de equipe e serviços</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href="https://mazzoni-barbershop-production.up.railway.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-cyan-500/10 transition-all hover:scale-[1.02]"
                >
                  <span>Abrir Site do Projeto (Produção)</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <span className="text-xs text-slate-500 font-mono">Infraestrutura Railway</span>
              </div>
            </div>

            {/* Mockup / Visual */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2 shadow-2xl">
              <div className="bg-slate-900 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-mono text-cyan-400">mazzoni-barbershop-production.up.railway.app</span>
                  <span className="text-emerald-400 font-semibold font-mono">100% Online</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Mazzoni Barbershop</p>
                  <p className="text-base font-bold text-white">ELEVE SEU ESTILO AO NÍVEL MÁXIMO</p>
                  <p className="text-xs text-slate-400">Agendamento de Horários & Presença Digital</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. PLANOS MZTECH & 7. EXPLICAR A MENSALIDADE */}
      {/* ============================================================ */}
      <section id="planos" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Transparência Comercial
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
              Planos mzTech
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mt-3">
              O desenvolvimento do projeto é contratado separadamente e a mensalidade é referente à infraestrutura e aos serviços contínuos de hospedagem e manutenção.
            </p>
          </div>

          {/* Cards dos Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {MZTECH_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                  plan.recommended
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/30 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/10'
                    : 'bg-slate-900/90 border border-slate-800'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    {!plan.recommended && (
                      <span className="text-xs font-semibold text-slate-400">{plan.badge}</span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 my-6">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-slate-400 text-sm">{plan.period}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                    "{plan.description}"
                  </p>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <p className="text-xs uppercase font-bold text-slate-400">O que está incluído:</p>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800">
                  <button
                    onClick={() => handleSelectPlan(plan.name)}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                      plan.recommended
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Seção Explicativa: Por que existe uma mensalidade? */}
          <div className="mt-20 p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 max-w-4xl mx-auto space-y-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <HelpCircle className="w-6 h-6 text-cyan-400" />
              <span>Por que existe uma mensalidade?</span>
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              "A criação do site é um projeto inicial. Depois que o site entra no ar, existem custos e atividades contínuas para mantê-lo funcionando, seguro e atualizado."
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              A mensalidade cobre infraestrutura em nuvem, certificado SSL, backups periódicos, monitoramento de disponibilidade, manutenção técnica do código e suporte direto. A mzTech vende o serviço final gerenciado e cuida de todas as alterações internas de servidores para que sua empresa nunca precise se preocupar com aspectos técnicos.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. DESENVOLVIMENTO É COBRADO SEPARADAMENTE */}
      {/* ============================================================ */}
      <section className="py-20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Escopo Sob Medida
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Seu projeto é personalizado
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            "O valor de desenvolvimento é calculado de acordo com a complexidade, quantidade de páginas, funcionalidades e integrações necessárias."
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              'Site institucional',
              'Landing page de alta conversão',
              'Site profissional',
              'Sistema de agendamento online',
              'Painel administrativo e métricas',
              'Integrações via WhatsApp e APIs',
              'Sistemas web sob medida',
            ].map((item) => (
              <span
                key={item}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="#orcamento"
              className="px-8 py-3.5 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm inline-flex items-center gap-2 shadow-lg shadow-cyan-500/10 transition-all"
            >
              <span>Solicitar orçamento personalizado</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9 & 10. O QUE ESTÁ INCLUÍDO NA MANUTENÇÃO VS SERVIÇOS ADICIONAIS */}
      {/* ============================================================ */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Clareza de Escopo
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
              O que a manutenção mzTech inclui?
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-3">
              Saiba exatamente o que está coberto no seu plano recorrente e o que pode ser orçado separadamente.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* O Que Está Incluído */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Incluído no Plano de Manutenção</h3>
              </div>

              <div className="space-y-4">
                {MZTECH_SCOPE_INCLUDED.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* O Que NÃO Está Incluído (Serviços Adicionais) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Serviços Adicionais (Orçados à Parte)</h3>
              </div>

              <div className="space-y-3">
                {MZTECH_SCOPE_EXCLUDED.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 italic pt-2">
                * Para qualquer necessidade fora do escopo, apresentamos uma proposta transparente antes de iniciar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 11. DOMÍNIO & 12. HOSPEDAGEM */}
      {/* ============================================================ */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Domínio */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <Globe className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">Domínio Próprio</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "O domínio é o endereço utilizado para acessar o site, como <code className="text-cyan-400 font-mono">empresa.com.br</code>."
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>O domínio poderá ser registrado diretamente pelo cliente ou com nosso auxílio.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>O domínio <strong>permanece de propriedade exclusiva do cliente</strong> quando registrado em seu nome.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>A mzTech cuida de toda a configuração técnica de DNS e apontamento.</span>
              </li>
            </ul>
          </div>

          {/* Hospedagem */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <Server className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-bold text-white">Hospedagem mzTech</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "A mzTech poderá utilizar diferentes provedores e tecnologias de infraestrutura para disponibilizar os serviços contratados."
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Infraestrutura em nuvem dimensionada para o desempenho e estabilidade do seu projeto.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ajustes internos de fornecedores para garantir escalabilidade sem alterar seu contrato.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total responsabilidade técnica assumida pela mzTech.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 13. FAQ */}
      {/* ============================================================ */}
      <section id="faq" className="py-24 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Tire Suas Dúvidas
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
              Perguntas Frequentes (FAQ)
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Respostas diretas sobre o modelo comercial e operacional da mzTech.
            </p>
          </div>

          <div className="space-y-4">
            {MZTECH_FAQ.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-white text-sm sm:text-base hover:text-cyan-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-cyan-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 animate-in fade-in">
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
      {/* 14. ÁREA DE CONTRATAÇÃO / FORMULÁRIO DE ORÇAMENTO */}
      {/* ============================================================ */}
      <section id="orcamento" className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Dê o Próximo Passo
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
              Solicite seu orçamento
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl mx-auto">
              Preencha os dados abaixo para receber uma análise técnica e proposta comercial personalizada.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
            {formSubmitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Solicitação Encaminhada com Sucesso!</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Abrimos uma conversa no WhatsApp com os detalhes da sua solicitação. Caso a janela não tenha aberto automaticamente, clique no botão abaixo:
                </p>
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${MZTECH_INFO.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Falar Agora no WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuote} className="space-y-6">
                
                {/* Honeypot anti-spam invisível */}
                <input
                  type="text"
                  name="website_url_hp"
                  value={formData.website_url_hp}
                  onChange={(e) => setFormData({ ...formData, website_url_hp: e.target.value })}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Seu Nome *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Nome da Empresa</label>
                    <input
                      type="text"
                      placeholder="Ex: Silva & Associados"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">WhatsApp / Celular *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(31) 99999-9999"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">E-mail Comercial *</label>
                    <input
                      type="email"
                      required
                      placeholder="contato@suaempresa.com.br"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Seleção do Desenvolvedor / Sócio Responsável */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Escolha o Desenvolvedor / Especialista *</span>
                    </label>
                    <span className="text-[11px] text-cyan-400 font-medium">Atendimento direto com o sócio</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Opção Roberto */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, selectedDev: 'Roberto' })}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        formData.selectedDev === 'Roberto'
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">
                              R
                            </div>
                            <span className="font-bold text-white text-sm">Roberto</span>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              formData.selectedDev === 'Roberto'
                                ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                                : 'border-slate-700'
                            }`}
                          >
                            {formData.selectedDev === 'Roberto' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono font-bold text-cyan-400">Sócio & Dev Full Stack</p>
                        <p className="text-[11px] text-slate-400 leading-tight mt-1">
                          Especialista em Interfaces Web, Next.js, React e Soluções Digitais
                        </p>
                      </div>
                    </button>

                    {/* Opção Morvan */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, selectedDev: 'Morvan' })}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        formData.selectedDev === 'Morvan'
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                              M
                            </div>
                            <span className="font-bold text-white text-sm">Morvan</span>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              formData.selectedDev === 'Morvan'
                                ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                                : 'border-slate-700'
                            }`}
                          >
                            {formData.selectedDev === 'Morvan' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono font-bold text-blue-400">Sócio & Dev Full Stack</p>
                        <p className="text-[11px] text-slate-400 leading-tight mt-1">
                          Especialista em Sistemas Web, Banco de Dados e Arquitetura Cloud
                        </p>
                      </div>
                    </button>

                    {/* Opção Sem Preferência */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, selectedDev: 'Sem Preferência (Roberto ou Morvan)' })
                      }
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        formData.selectedDev === 'Sem Preferência (Roberto ou Morvan)'
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                              mz
                            </div>
                            <span className="font-bold text-white text-sm">Indiferente</span>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              formData.selectedDev === 'Sem Preferência (Roberto ou Morvan)'
                                ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                                : 'border-slate-700'
                            }`}
                          >
                            {formData.selectedDev === 'Sem Preferência (Roberto ou Morvan)' && (
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            )}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono font-bold text-slate-400">Equipe mzTech</p>
                        <p className="text-[11px] text-slate-400 leading-tight mt-1">
                          Qualquer um dos dois desenvolvedores sócios disponível
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Tipo de Projeto</label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const newDevPrice = PROJECT_DEV_PRICES[newType] || 1200;
                        setFormData((prev) => ({
                          ...prev,
                          projectType: newType,
                          initialDevPrice: newDevPrice,
                          estimatedBudget: `R$ ${newDevPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        }));
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Site Institucional Profissional">Site Institucional</option>
                      <option value="Landing Page de Conversão">Landing Page</option>
                      <option value="Sistema Web Personalizado">Sistema Web Personalizado</option>
                      <option value="Sistema de Agendamento Online">Sistema de Agendamento</option>
                      <option value="Portal / Catálogo">Portal / Catálogo</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Possui Domínio?</label>
                    <select
                      value={formData.hasDomain}
                      onChange={(e) => setFormData({ ...formData, hasDomain: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Sim, já possuo domínio registrado">Sim, já possuo</option>
                      <option value="Não, preciso registrar">Não, preciso registrar</option>
                      <option value="Preciso de orientação">Preciso de orientação</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Plano Desejado</label>
                    <select
                      value={formData.needsHosting}
                      onChange={(e) => {
                        const newPlan = e.target.value;
                        const newMonthly = getMonthlyPriceFromPlan(newPlan);
                        setFormData((prev) => ({
                          ...prev,
                          needsHosting: newPlan,
                          monthlyPrice: newMonthly,
                        }));
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Plano Hospedagem + Manutenção (R$ 79,90/mês)">
                        Hospedagem + Manutenção (R$ 79,90)
                      </option>
                      <option value="Plano Hospedagem (R$ 39,90/mês)">
                        Hospedagem (R$ 39,90)
                      </option>
                      <option value="Apenas Desenvolvimento">Apenas Desenvolvimento</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Descrição do Projeto & Necessidades
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Conte sobre o seu negócio, o que o site/sistema precisa ter, referências ou funcionalidades específicas..."
                    value={formData.projectDescription}
                    onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* SELEÇÃO DA FORMA DE PAGAMENTO */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Como Você Deseja Pagar? *</span>
                    </label>
                    <span className="text-[11px] text-slate-500">Escolha sua preferência</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Cartão de Crédito Recorrente */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethodChoice: 'CREDIT_CARD_RECURRING' })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.paymentMethodChoice === 'CREDIT_CARD_RECURRING'
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs">Cartão de Crédito Recorrente</strong>
                        <span className={`w-3.5 h-3.5 rounded-full border ${formData.paymentMethodChoice === 'CREDIT_CARD_RECURRING' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-700'}`} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Pagamento automático da mensalidade todo mês direto no cartão.
                      </p>
                    </button>

                    {/* PIX */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethodChoice: 'PIX' })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.paymentMethodChoice === 'PIX'
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs">PIX (À Vista / Recorrente)</strong>
                        <span className={`w-3.5 h-3.5 rounded-full border ${formData.paymentMethodChoice === 'PIX' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-700'}`} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Pagamento instantâneo via QR Code e chave Pix oficial da mzTech.
                      </p>
                    </button>

                    {/* Cartão de Crédito */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethodChoice: 'CREDIT_CARD' })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.paymentMethodChoice === 'CREDIT_CARD'
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs">Cartão de Crédito (Parcelado)</strong>
                        <span className={`w-3.5 h-3.5 rounded-full border ${formData.paymentMethodChoice === 'CREDIT_CARD' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-700'}`} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Pagamento do valor inicial de desenvolvimento parcelado no cartão.
                      </p>
                    </button>

                    {/* Cartão + PIX */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethodChoice: 'CARD_PLUS_PIX' })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.paymentMethodChoice === 'CARD_PLUS_PIX'
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs">Cartão + PIX</strong>
                        <span className={`w-3.5 h-3.5 rounded-full border ${formData.paymentMethodChoice === 'CARD_PLUS_PIX' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-700'}`} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Entrada no Pix e mensalidades no cartão de crédito recorrente.
                      </p>
                    </button>
                  </div>
                </div>

                {/* RESUMO DA PROPOSTA (SEÇÃO 18 DO REQUISITO) */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-slate-400 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Resumo da Solicitação</span>
                    </span>
                    <span className="text-[11px] text-slate-500">Sem cobrança imediata</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Serviço:</span>
                      <strong className="text-white truncate block">{formData.projectType}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Plano:</span>
                      <span className="text-cyan-400 truncate block font-medium">
                        {formData.needsHosting.includes('79,90')
                          ? 'Hospedagem + Manut.'
                          : formData.needsHosting.includes('39,90')
                          ? 'Hospedagem'
                          : 'Apenas Dev'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Valor Inicial Est.:</span>
                      <span className="text-cyan-400 font-mono font-bold block">{formData.estimatedBudget}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Mensalidade:</span>
                      <span className="text-emerald-400 font-mono font-bold block">
                        {formData.monthlyPrice > 0 ? `R$ ${formData.monthlyPrice.toFixed(2).replace('.', ',')}/mês` : 'Sem Mensalidade'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Forma Escolhida:</span>
                      <span className="text-slate-300 truncate block">
                        {formData.paymentMethodChoice === 'CREDIT_CARD_RECURRING' && 'Cartão Recorrente'}
                        {formData.paymentMethodChoice === 'PIX' && 'PIX'}
                        {formData.paymentMethodChoice === 'CREDIT_CARD' && 'Cartão'}
                        {formData.paymentMethodChoice === 'CARD_PLUS_PIX' && 'Cartão + PIX'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-base shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    {formLoading ? (
                      <Activity className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    <span>Enviar Solicitação de Orçamento</span>
                  </button>
                  <p className="text-[11px] text-slate-500 text-center mt-3">
                    Ao enviar, você receberá atendimento direto pelo WhatsApp com nossa equipe técnica para análise e aprovação formal.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 15 & 16. MODAL DO CONTRATO DE PRESTAÇÃO DE SERVIÇOS (17 CLÁUSULAS) */}
      {/* ============================================================ */}
      {termsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-cyan-400" />
                <h3 className="font-bold text-xl text-white">
                  Contrato de Prestação de Serviços mzTech
                </h3>
              </div>
              <button
                onClick={() => setTermsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <p className="font-bold">Aviso Jurídico:</p>
              <p className="mt-0.5 leading-relaxed">
                Este documento apresenta condições comerciais e operacionais padrão da mzTech e deverá ser adaptado às características de cada contratação. Recomenda-se revisão jurídica antes de sua utilização como contrato definitivo.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-serif text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              {DEFAULT_CONTRACT_TEMPLATE}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setTermsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 17. RODAPÉ */}
      {/* ============================================================ */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Coluna 1: Marca & Descrição */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex items-center justify-center text-white">
                  <Terminal className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white">
                  mz<span className="text-cyan-400">Tech</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Desenvolvimento, tecnologia e soluções digitais."
              </p>
              <p className="text-xs text-slate-500">
                Você contrata o projeto. A mzTech cuida da parte técnica para manter sua empresa funcionando no digital.
              </p>
            </div>

            {/* Coluna 2: Navegação */}
            <div className="space-y-3">
              <p className="text-xs uppercase font-bold text-white tracking-wider">Navegação</p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link href="#servicos" className="hover:text-cyan-400">O Que Fazemos</Link></li>
                <li><Link href="#como-funciona" className="hover:text-cyan-400">Como Funciona</Link></li>
                <li><Link href="#portfolio" className="hover:text-cyan-400">Portfólio</Link></li>
                <li><Link href="#planos" className="hover:text-cyan-400">Planos mzTech</Link></li>
                <li><Link href="#faq" className="hover:text-cyan-400">FAQ</Link></li>
                <li><Link href="#orcamento" className="hover:text-cyan-400">Solicitar Orçamento</Link></li>
              </ul>
            </div>

            {/* Coluna 3: Legal & Contratos */}
            <div className="space-y-3">
              <p className="text-xs uppercase font-bold text-white tracking-wider">Termos & Legal</p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => setTermsModalOpen(true)} className="hover:text-cyan-400 text-left">
                    Termos de Serviço / Contrato
                  </button>
                </li>
                <li>
                  <button onClick={() => setTermsModalOpen(true)} className="hover:text-cyan-400 text-left">
                    Política de Privacidade
                  </button>
                </li>
                <li>
                  <Link href="/cliente" className="text-cyan-400 hover:underline">
                    Portal do Cliente
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 4: Contato */}
            <div className="space-y-3">
              <p className="text-xs uppercase font-bold text-white tracking-wider">Atendimento & Sócios</p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <a href={`https://wa.me/${MZTECH_INFO.robertoWhatsapp}`} target="_blank" rel="noreferrer" className="hover:underline">
                    <span>{MZTECH_INFO.robertoPhone}</span> <strong className="text-slate-300 font-normal">(Roberto)</strong>
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <a href={`https://wa.me/${MZTECH_INFO.morvanWhatsapp}`} target="_blank" rel="noreferrer" className="hover:underline">
                    <span>{MZTECH_INFO.morvanPhone}</span> <strong className="text-slate-300 font-normal">(Morvan)</strong>
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${MZTECH_INFO.email}`} className="hover:underline text-cyan-400 break-all">
                    {MZTECH_INFO.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {MZTECH_INFO.year} mzTech. Todos os direitos reservados.</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Infraestrutura em Nuvem Monitorada</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
