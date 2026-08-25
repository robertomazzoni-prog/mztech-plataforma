'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  FolderGit2,
  Server,
  Wrench,
  DollarSign,
  Database,
  ArrowRight,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  HardDrive,
  FileText,
  Layers,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  UserX,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  Send,
  UserCheck,
  Check,
  Search,
  Trash2,
  Edit3,
  Save,
  Play,
  CheckCircle,
  X,
  Filter,
  Briefcase,
  Calendar,
  Tag,
  ChevronRight,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import { formatCurrency, formatDatePtBR } from '@/lib/utils';
import { MzDashboardMetrics, MzQuoteItem, QuoteStatus } from '@/types/mztech';

export default function MzTechDashboardPage() {
  const [metrics, setMetrics] = useState<MzDashboardMetrics | null>(null);
  const [quotes, setQuotes] = useState<MzQuoteItem[]>([]);
  const [quoteMetrics, setQuoteMetrics] = useState({
    quotesForRoberto: 0,
    quotesForMorvan: 0,
    quotesShared: 0,
  });

  // Filtros Interativos
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    'ALL' | 'NOVO' | 'EM_CONTATO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ARQUIVADO'
  >('ALL');
  const [selectedDevFilter, setSelectedDevFilter] = useState<'ALL' | 'Roberto' | 'Morvan' | 'Shared'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de Edição e Modais
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [newQuoteModalOpen, setNewQuoteModalOpen] = useState(false);
  const [newQuoteForm, setNewQuoteForm] = useState({
    name: '',
    company: '',
    whatsapp: '',
    email: '',
    selectedDev: 'Roberto',
    projectType: 'Site Institucional Profissional',
    hasDomain: 'Sim, já possuo',
    needsHosting: 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
    projectDescription: '',
    estimatedBudget: 'R$ 2.500,00',
    desiredDeadline: '20 dias',
    status: 'NOVO' as QuoteStatus,
    notes: '',
  });

  // Modal de Conversão em Cliente
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [quoteToConvert, setQuoteToConvert] = useState<MzQuoteItem | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertSuccess, setConvertSuccess] = useState<string | null>(null);

  // Toast / Notificação de Projeto Finalizado com Auto-Registro em Clientes e Projetos
  const [finalizedToast, setFinalizedToast] = useState<{
    open: boolean;
    clientName: string;
    projectName: string;
  } | null>(null);

  // Controle de cards saindo da tela com animação
  const [finishingIds, setFinishingIds] = useState<string[]>([]);

  const { logout } = useAuth();
  const router = useRouter();

  const handleAdminLogout = async () => {
    if (!confirm('Deseja realmente sair da Central Administrativa mzTech?')) return;
    try {
      await logout();
    } catch (err) {}
    router.push('/login');
  };

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [dashRes, quotesRes] = await Promise.all([
        fetch('/api/mztech/dashboard'),
        fetch('/api/mztech/quotes'),
      ]);

      if (dashRes.ok) {
        const data = await dashRes.json();
        setMetrics(data);
      }

      if (quotesRes.ok) {
        const qData = await quotesRes.json();
        setQuotes(qData.quotes || []);
        if (qData.metrics) {
          setQuoteMetrics(qData.metrics);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard mzTech:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh a cada 4 segundos para capturar novos orçamentos em tempo real
    const interval = setInterval(() => {
      loadData();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Finalização interativa: animação de saída imediata da tela + registro em Clientes e Projetos
  const handleFinishQuote = async (id: string) => {
    // 1. Inicia animação de saída do card
    setFinishingIds((prev) => [...prev, id]);

    const targetQuote = quotes.find((q) => q.id === id);

    // 2. Aguarda 450ms para transição suave e atualiza no backend e na lista
    setTimeout(async () => {
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: 'CONCLUIDO' as QuoteStatus, updatedAt: new Date().toISOString() } : q))
      );
      setFinishingIds((prev) => prev.filter((item) => item !== id));

      try {
        const res = await fetch(`/api/mztech/quotes/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CONCLUIDO' }),
        });

        if (res.ok && targetQuote) {
          setFinalizedToast({
            open: true,
            clientName: targetQuote.company || targetQuote.name,
            projectName: `${targetQuote.projectType} - ${targetQuote.company || targetQuote.name}`,
          });
          loadData();
        }
      } catch (err) {
        console.warn('Erro ao finalizar orçamento:', err);
      }
    }, 450);
  };

  // Atualização rápida de status (Novo, Em Contato, Em Andamento, Arquivado)
  const handleUpdateStatus = async (id: string, newStatus: QuoteStatus) => {
    if (newStatus === 'CONCLUIDO') {
      return handleFinishQuote(id);
    }

    const targetQuote = quotes.find((q) => q.id === id);
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: newStatus, updatedAt: new Date().toISOString() } : q))
    );

    try {
      await fetch(`/api/mztech/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadData();
    } catch (err) {
      console.warn('Erro ao atualizar status do lead:', err);
    }
  };

  // Reatribuição rápida de Sócio / Desenvolvedor (Roberto <-> Morvan)
  const handleReassignDev = async (id: string, newDev: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, selectedDev: newDev, updatedAt: new Date().toISOString() } : q))
    );

    try {
      await fetch(`/api/mztech/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedDev: newDev }),
      });
      loadData();
    } catch (err) {
      console.warn('Erro ao reatribuir desenvolvedor:', err);
    }
  };

  // Salvar anotações do sócio
  const handleSaveNote = async (id: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, notes: noteContent, updatedAt: new Date().toISOString() } : q))
    );
    setEditingNoteId(null);

    try {
      await fetch(`/api/mztech/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteContent }),
      });
    } catch (err) {
      console.warn('Erro ao salvar anotação:', err);
    }
  };

  // Excluir ou arquivar solicitação
  const handleDeleteQuote = async (id: string) => {
    if (!confirm('Deseja realmente remover esta solicitação de orçamento?')) return;

    setQuotes((prev) => prev.filter((q) => q.id !== id));

    try {
      await fetch(`/api/mztech/quotes/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Erro ao excluir solicitação:', err);
    }
  };

  // Criar orçamento manual
  const handleCreateManualQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteForm.name || !newQuoteForm.whatsapp || !newQuoteForm.email) {
      alert('Preencha os campos obrigatórios (Nome, WhatsApp e E-mail).');
      return;
    }

    try {
      const res = await fetch('/api/mztech/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuoteForm),
      });

      if (res.ok) {
        setNewQuoteModalOpen(false);
        setNewQuoteForm({
          name: '',
          company: '',
          whatsapp: '',
          email: '',
          selectedDev: 'Roberto',
          projectType: 'Site Institucional Profissional',
          hasDomain: 'Sim, já possuo',
          needsHosting: 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
          projectDescription: '',
          estimatedBudget: 'R$ 2.500,00',
          desiredDeadline: '20 dias',
          status: 'NOVO',
          notes: '',
        });
        loadData();
      }
    } catch (err) {
      alert('Erro ao registrar orçamento manual.');
    }
  };

  // Converter orçamento em Cliente Oficial mzTech
  const handleConfirmConversion = async () => {
    if (!quoteToConvert) return;
    setConverting(true);

    try {
      // 1. Cadastra como cliente no endpoint de clientes
      const clientRes = await fetch('/api/mztech/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: quoteToConvert.company || quoteToConvert.name,
          contactName: quoteToConvert.name,
          whatsapp: quoteToConvert.whatsapp,
          email: quoteToConvert.email,
          status: 'ATIVO',
          financialStatus: 'EM_DIA',
          notes: `Cliente convertido de solicitação comercial • Dev: ${quoteToConvert.selectedDev} • ${quoteToConvert.notes || ''}`,
        }),
      });

      // 2. Atualiza status do orçamento para 'CONCLUIDO' ou 'EM_ANDAMENTO'
      await handleUpdateStatus(quoteToConvert.id, 'EM_ANDAMENTO');

      setConvertSuccess(
        `Cliente "${quoteToConvert.company || quoteToConvert.name}" cadastrado com sucesso na base mzTech!`
      );
      setTimeout(() => {
        setConvertModalOpen(false);
        setQuoteToConvert(null);
        setConvertSuccess(null);
        setConverting(false);
      }, 1500);
    } catch (err) {
      alert('Erro ao converter lead em cliente.');
      setConverting(false);
    }
  };

  // Cálculos de métricas do Pipeline
  const countAtivos = quotes.filter((q) => q.status !== 'CONCLUIDO' && q.status !== 'ARQUIVADO' && q.status !== 'CANCELADO').length;
  const countAll = quotes.length;
  const countNovo = quotes.filter((q) => q.status === 'NOVO').length;
  const countEmContato = quotes.filter((q) => q.status === 'EM_CONTATO').length;
  const countEmAndamento = quotes.filter((q) => q.status === 'EM_ANDAMENTO').length;
  const countConcluido = quotes.filter((q) => q.status === 'CONCLUIDO').length;
  const countArquivado = quotes.filter((q) => q.status === 'ARQUIVADO' || q.status === 'CANCELADO').length;

  // Filtragem múltipla: Dev + Status + Busca por texto
  const filteredQuotes = quotes.filter((q) => {
    // Filtro de Sócio
    if (selectedDevFilter === 'Roberto' && !q.selectedDev?.includes('Roberto')) return false;
    if (selectedDevFilter === 'Morvan' && !q.selectedDev?.includes('Morvan')) return false;
    if (
      selectedDevFilter === 'Shared' &&
      (q.selectedDev?.includes('Roberto') || q.selectedDev?.includes('Morvan'))
    ) {
      return false;
    }

    // Filtro de Status
    // Quando em "ALL" (Em Aberto), oculta automaticamente os Concluídos/Arquivados da tela principal
    if (selectedStatusFilter === 'ALL' && (q.status === 'CONCLUIDO' || q.status === 'ARQUIVADO' || q.status === 'CANCELADO')) {
      return false;
    }
    if (selectedStatusFilter === 'NOVO' && q.status !== 'NOVO') return false;
    if (selectedStatusFilter === 'EM_CONTATO' && q.status !== 'EM_CONTATO') return false;
    if (selectedStatusFilter === 'EM_ANDAMENTO' && q.status !== 'EM_ANDAMENTO') return false;
    if (selectedStatusFilter === 'CONCLUIDO' && q.status !== 'CONCLUIDO') return false;
    if (
      selectedStatusFilter === 'ARQUIVADO' &&
      q.status !== 'ARQUIVADO' &&
      q.status !== 'CANCELADO'
    ) {
      return false;
    }

    // Busca por Texto
    if (searchQuery.trim() !== '') {
      const sq = searchQuery.toLowerCase();
      const matchName = q.name.toLowerCase().includes(sq);
      const matchCompany = q.company?.toLowerCase().includes(sq);
      const matchEmail = q.email.toLowerCase().includes(sq);
      const matchPhone = q.whatsapp.includes(sq);
      const matchProject = q.projectType.toLowerCase().includes(sq);
      const matchNotes = q.notes?.toLowerCase().includes(sq);
      if (!matchName && !matchCompany && !matchEmail && !matchPhone && !matchProject && !matchNotes) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* BANNER ANIMADO: PROJETO FINALIZADO COM AUTO-REGISTRO EM CLIENTES E PROJETOS */}
      {finalizedToast?.open && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/15 to-slate-900 border border-emerald-500/50 shadow-2xl shadow-emerald-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>🎉 Projeto Finalizado com Sucesso!</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-slate-950 uppercase">
                  Auto-Registrado
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                O cliente <strong className="text-emerald-300">{finalizedToast.clientName}</strong> e o projeto <strong className="text-cyan-300">"{finalizedToast.projectName}"</strong> foram cadastrados automaticamente nas abas <strong className="text-white">Projetos</strong> e <strong className="text-white">Clientes</strong>!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/mztech/projetos"
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Ver em Projetos ➔</span>
            </Link>

            <Link
              href="/admin/mztech/clientes"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ver em Clientes ➔</span>
            </Link>

            <button
              onClick={() => setFinalizedToast(null)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs border border-slate-800"
              title="Dispensar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header com Boas-Vindas e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Central de Operações mzTech • Roberto & Morvan
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Dashboard mzTech</span>
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700 transition-all"
              title="Atualizar Dados em Tempo Real"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gestão de orçamentos por desenvolvedor (Roberto & Morvan), clientes, hospedagens e backups.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setNewQuoteModalOpen(true)}
            className="px-4 py-2 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Orçamento Manual</span>
          </button>

          <Link
            href="/admin/mztech/clientes"
            className="px-4 py-2 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Clientes mzTech</span>
          </Link>

          <button
            onClick={handleAdminLogout}
            className="px-3.5 py-2 rounded-xl font-bold text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 flex items-center gap-1.5 transition-all shadow-sm"
            title="Sair da Conta Administrativa"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair (Logout)</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEÇÃO INTERATIVA: PIPELINE DE SOLICITAÇÕES & ORÇAMENTOS */}
      {/* ============================================================ */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Top Header do Painel com Contadores por Desenvolvedor */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Solicitações de Orçamento & Pipeline</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500 text-slate-950">
                  {quotes.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Controle interativo de leads, serviços em andamento e entregas com Roberto e Morvan.
              </p>
            </div>
          </div>

          {/* Cards de Métricas por Sócio/Dev */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedDevFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                selectedDevFilter === 'ALL'
                  ? 'bg-slate-800 text-white border-slate-600 shadow-md'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span>👥 Todos Sócios:</span>
              <span className="font-mono">{countAll}</span>
            </button>

            <button
              onClick={() => setSelectedDevFilter('Roberto')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                selectedDevFilter === 'Roberto'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-cyan-400 border-cyan-500/30 hover:bg-slate-800'
              }`}
            >
              <span>💻 Roberto:</span>
              <span className="underline font-mono font-black">{quoteMetrics.quotesForRoberto}</span>
            </button>

            <button
              onClick={() => setSelectedDevFilter('Morvan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                selectedDevFilter === 'Morvan'
                  ? 'bg-blue-500 text-slate-950 border-blue-400 shadow-md shadow-blue-500/20'
                  : 'bg-slate-950 text-blue-400 border-blue-500/30 hover:bg-slate-800'
              }`}
            >
              <span>🚀 Morvan:</span>
              <span className="underline font-mono font-black">{quoteMetrics.quotesForMorvan}</span>
            </button>

            <button
              onClick={() => setSelectedDevFilter('Shared')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                selectedDevFilter === 'Shared'
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-950 text-indigo-400 border-indigo-500/30 hover:bg-slate-800'
              }`}
            >
              <span>🤝 Sem Preferência:</span>
              <span className="font-mono">{quoteMetrics.quotesShared}</span>
            </button>
          </div>
        </div>

        {/* BARRA DE FILTROS POR STATUS DO SERVIÇO (PIPELINE) & BUSCA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tabs de Status do Serviço */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedStatusFilter === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌟 Em Aberto</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
                {countAtivos}
              </span>
            </button>

            <button
              onClick={() => setSelectedStatusFilter('NOVO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedStatusFilter === 'NOVO'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Novos</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
                {countNovo}
              </span>
            </button>

            <button
              onClick={() => setSelectedStatusFilter('EM_CONTATO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedStatusFilter === 'EM_CONTATO'
                  ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                  : 'text-blue-400 hover:bg-blue-500/10'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Em Contato</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
                {countEmContato}
              </span>
            </button>

            <button
              onClick={() => setSelectedStatusFilter('EM_ANDAMENTO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedStatusFilter === 'EM_ANDAMENTO'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-indigo-400 hover:bg-indigo-500/10'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Em Andamento</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
                {countEmAndamento}
              </span>
            </button>

            <button
              onClick={() => setSelectedStatusFilter('CONCLUIDO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedStatusFilter === 'CONCLUIDO'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Finalizados</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
                {countConcluido}
              </span>
            </button>

            <button
              onClick={() => setSelectedStatusFilter('ARQUIVADO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedStatusFilter === 'ARQUIVADO'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>📁 Arquivados</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
                {countArquivado}
              </span>
            </button>
          </div>

          {/* Campo de Busca em Tempo Real */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente, empresa, dev..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* LISTAGEM INTERATIVA DE CARDS DO PIPELINE */}
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-14 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
              <Filter className="w-6 h-6" />
            </div>
            <p className="text-slate-300 font-bold text-sm">
              Nenhuma solicitação de orçamento encontrada para os filtros selecionados.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Experimente alterar os filtros de desenvolvedor ou status acima, ou cadastre uma nova solicitação manual.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredQuotes.map((q) => {
              const cleanPhone = q.whatsapp.replace(/\D/g, '');
              const devName = q.selectedDev?.includes('Roberto')
                ? 'Roberto'
                : q.selectedDev?.includes('Morvan')
                ? 'Morvan'
                : 'da equipe mzTech';

              const waText = encodeURIComponent(
                `Olá ${q.name}! Aqui é o ${devName} da mzTech Soluções Digitais. Recebemos sua solicitação para o projeto "${q.projectType}" e estamos à disposição para alinhar os detalhes técnicos e a proposta comercial!`
              );
              const waLink = `https://wa.me/55${cleanPhone}?text=${waText}`;

              const isEditingNote = editingNoteId === q.id;
              const isFinishing = finishingIds.includes(q.id);

              return (
                <div
                  key={q.id}
                  className={`bg-slate-950 border rounded-2xl p-5 space-y-4 transition-all duration-500 transform relative overflow-hidden ${
                    isFinishing
                      ? 'opacity-0 scale-90 -translate-y-6 pointer-events-none'
                      : q.status === 'NOVO'
                      ? 'border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : q.status === 'EM_ANDAMENTO'
                      ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                      : q.status === 'CONCLUIDO'
                      ? 'border-emerald-500/40'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Barra Superior do Card: Nome, Sócio e Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-base tracking-tight">{q.name}</span>
                        
                        {/* Seletor Rápido de Sócio Responsável */}
                        <div className="inline-flex items-center gap-1">
                          {q.selectedDev?.includes('Roberto') ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                              <span>💻 Roberto</span>
                              <button
                                onClick={() => handleReassignDev(q.id, 'Morvan')}
                                title="Transferir para Morvan"
                                className="text-[9px] text-cyan-400 hover:text-white underline ml-1"
                              >
                                ➔ Morvan
                              </button>
                            </span>
                          ) : q.selectedDev?.includes('Morvan') ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                              <span>🚀 Morvan</span>
                              <button
                                onClick={() => handleReassignDev(q.id, 'Roberto')}
                                title="Transferir para Roberto"
                                className="text-[9px] text-blue-400 hover:text-white underline ml-1"
                              >
                                ➔ Roberto
                              </button>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                              <span>🤝 Sem Pref.</span>
                              <button
                                onClick={() => handleReassignDev(q.id, 'Roberto')}
                                className="text-[9px] text-cyan-400 hover:text-white ml-1"
                              >
                                Atribuir Roberto
                              </button>
                            </span>
                          )}
                        </div>
                      </div>

                      {q.company && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-slate-500" />
                          <span>Empresa: <strong className="text-slate-300">{q.company}</strong></span>
                        </p>
                      )}
                    </div>

                    {/* Badge de Status Atual */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          q.status === 'NOVO'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : q.status === 'EM_CONTATO'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : q.status === 'EM_ANDAMENTO'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            : q.status === 'CONCLUIDO'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {q.status === 'NOVO' && '🟡 Novo Lead'}
                        {q.status === 'EM_CONTATO' && '💬 Em Contato'}
                        {q.status === 'EM_ANDAMENTO' && '🚀 Em Andamento'}
                        {q.status === 'CONCLUIDO' && '✅ Serviço Finalizado'}
                        {q.status === 'ARQUIVADO' && '📁 Arquivado'}
                        {q.status === 'CANCELADO' && '❌ Cancelado'}
                      </span>
                    </div>
                  </div>

                  {/* STEPPER INTERATIVO DE MUDANÇA DE STATUS RÁPIDO */}
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/90 space-y-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span>Progresso do Serviço / Pipeline:</span>
                      <span className="font-mono text-[9px] text-cyan-400">Clique para avançar</span>
                    </p>

                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => handleUpdateStatus(q.id, 'NOVO')}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all text-center ${
                          q.status === 'NOVO'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-amber-300'
                        }`}
                      >
                        1. Novo
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(q.id, 'EM_CONTATO')}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all text-center ${
                          q.status === 'EM_CONTATO'
                            ? 'bg-blue-500 text-slate-950 border-blue-400 font-extrabold shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-blue-300'
                        }`}
                      >
                        2. Negociação
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(q.id, 'EM_ANDAMENTO')}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all text-center ${
                          q.status === 'EM_ANDAMENTO'
                            ? 'bg-indigo-500 text-white border-indigo-400 font-extrabold shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-indigo-300'
                        }`}
                      >
                        3. Em Andamento
                      </button>

                      <button
                        onClick={() => handleFinishQuote(q.id)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all text-center ${
                          q.status === 'CONCLUIDO' || isFinishing
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-emerald-300'
                        }`}
                      >
                        {isFinishing ? '✨ Finalizando...' : '4. Finalizado'}
                      </button>
                    </div>
                  </div>

                  {/* Informações Técnicas e Escopo do Projeto */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-2 text-slate-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Tipo de Projeto:</span>
                        <p className="font-semibold text-white mt-0.5">{q.projectType}</p>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Hospedagem & Plano:</span>
                        <p className="text-cyan-300 font-medium mt-0.5">{q.needsHosting}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/70">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Orçamento Estimado:</span>
                        <p className="text-white font-mono font-bold mt-0.5">
                          {q.estimatedBudget || 'A definir'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Prazo Desejado:</span>
                        <p className="text-slate-300 font-mono mt-0.5">
                          {q.desiredDeadline || '15 a 30 dias'}
                        </p>
                      </div>
                    </div>

                    {q.projectDescription && (
                      <div className="pt-2 border-t border-slate-800/70">
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Descrição do Cliente:</span>
                        <p className="text-slate-300 italic mt-0.5 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/50">
                          "{q.projectDescription}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Anotações Internas dos Sócios (Roberto & Morvan) */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Anotações dos Sócios (Histórico):</span>
                      </span>

                      {!isEditingNote && (
                        <button
                          onClick={() => {
                            setEditingNoteId(q.id);
                            setNoteContent(q.notes || '');
                          }}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold"
                        >
                          Editar Anotação
                        </button>
                      )}
                    </div>

                    {isEditingNote ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          placeholder="Adicione anotações sobre o contato, reuniões, valores acordados ou progresso técnico..."
                          className="w-full bg-slate-950 border border-cyan-500/50 rounded-lg p-2 text-white text-xs focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] hover:bg-slate-700"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveNote(q.id)}
                            className="px-3 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-[11px] hover:bg-cyan-400 flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>Salvar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">
                        {q.notes || 'Nenhuma anotação registrada ainda.'}
                      </p>
                    )}
                  </div>

                  {/* BARRA DE AÇÕES DO CARD */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
                    <div className="space-y-1">
                      <p className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{q.whatsapp}</span>
                      </p>
                      <p className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                        <Mail className="w-3 h-3 text-cyan-400" />
                        <span>{q.email}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chamar no WhatsApp</span>
                      </a>

                      <button
                        onClick={() => {
                          setQuoteToConvert(q);
                          setConvertModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        title="Cadastrar oficialmente como cliente mzTech"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>+ Cliente</span>
                      </button>

                      <button
                        onClick={() => handleDeleteQuote(q.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-500 hover:text-red-400 border border-slate-800 transition-colors"
                        title="Remover solicitação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* PAINEL CONSOLIDADO DE SITUAÇÃO FINANCEIRA DOS CLIENTES */}
      {/* ============================================================ */}
      {metrics?.financialMetrics && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <span>Situação Financeira da Base mzTech</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Controle em Tempo Real
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Visão consolidada de adimplência, cobranças pendentes e status de pagamentos.
                </p>
              </div>
            </div>

            <Link
              href="/admin/mztech/clientes"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
            >
              <span>Ver Fichas Financeiras & Sandbox</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Em Dia
              </span>
              <p className="text-2xl font-black text-white font-mono">
                {metrics.financialMetrics.paidClients}
              </p>
              <p className="text-[10px] text-slate-500">Clientes regulares</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Pendente
              </span>
              <p className="text-2xl font-black text-white font-mono">
                {metrics.financialMetrics.pendingClients}
              </p>
              <p className="text-[10px] text-slate-500">Aguardando compensação</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-orange-500/30 space-y-1">
              <span className="text-[11px] font-bold text-orange-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                Atrasado
              </span>
              <p className="text-2xl font-black text-white font-mono">
                {metrics.financialMetrics.overdueClients}
              </p>
              <p className="text-[10px] text-slate-500">Fatura vencida</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-red-500/30 space-y-1">
              <span className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Recusado
              </span>
              <p className="text-2xl font-black text-white font-mono">
                {metrics.financialMetrics.failedClients}
              </p>
              <p className="text-[10px] text-slate-500">Falha no cartão</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Cancelado
              </span>
              <p className="text-2xl font-black text-white font-mono">
                {metrics.financialMetrics.cancelledClients}
              </p>
              <p className="text-[10px] text-slate-500">Serviços cancelados</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SEÇÃO INFRAESTRUTURA & MÓDULOS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 e 2: Status da Infraestrutura Multi-Provedor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Infraestrutura de Nuvem Gerenciada</h3>
                  <p className="text-xs text-slate-400">Suporte Multi-Provedor (Railway, DigitalOcean, VPS Própria, Hetzner, AWS)</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Operação Normal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <p className="text-[11px] text-slate-400 uppercase font-bold">Provedor Principal</p>
                <p className="text-base font-bold text-white mt-1">Railway Cloud</p>
                <span className="text-[10px] text-emerald-400 font-mono">Uptime 99.9%</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <p className="text-[11px] text-slate-400 uppercase font-bold">Banco de Dados</p>
                <p className="text-base font-bold text-cyan-300 mt-1">PostgreSQL</p>
                <span className="text-[10px] text-slate-400 font-mono">Volumes Persistentes</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <p className="text-[11px] text-slate-400 uppercase font-bold">Sócios & Desenvolvedores</p>
                <p className="text-base font-bold text-white mt-1">Roberto & Morvan</p>
                <span className="text-[10px] text-cyan-400 font-mono">mzTech Full Stack</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 3: Links Rápidos */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Módulos mzTech
            </h4>
            <div className="space-y-1.5">
              <Link
                href="/admin/mztech/clientes"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  Gerenciar Clientes & Encerramentos
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>

              <Link
                href="/admin/mztech/projetos"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                  Controle de Projetos
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>

              <Link
                href="/admin/mztech/hospedagens"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  Hospedagens & Provedores
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>

              <Link
                href="/admin/mztech/contratos"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  Contratos & Termos Comerciais
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: NOVO ORÇAMENTO MANUAL */}
      {/* ============================================================ */}
      {newQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Novo Orçamento / Lead Manual</h3>
                  <p className="text-xs text-slate-400">Cadastre uma solicitação recebida via WhatsApp, telefone ou indicação.</p>
                </div>
              </div>
              <button
                onClick={() => setNewQuoteModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualQuote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-300">Nome do Contato *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João Silva"
                    value={newQuoteForm.name}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-300">Nome da Empresa</label>
                  <input
                    type="text"
                    placeholder="Ex: Silva Soluções"
                    value={newQuoteForm.company}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-300">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(31) 99999-9999"
                    value={newQuoteForm.whatsapp}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, whatsapp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-300">E-mail Comercial *</label>
                  <input
                    type="email"
                    required
                    placeholder="contato@empresa.com"
                    value={newQuoteForm.email}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-300">Sócio Responsável</label>
                  <select
                    value={newQuoteForm.selectedDev}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, selectedDev: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Roberto">💻 Roberto (Full Stack & Web)</option>
                    <option value="Morvan">🚀 Morvan (Sistemas & Cloud)</option>
                    <option value="Sem Preferência (Roberto ou Morvan)">🤝 Sem Preferência</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-300">Status Inicial</label>
                  <select
                    value={newQuoteForm.status}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, status: e.target.value as QuoteStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="NOVO">🟡 1. Novo Lead</option>
                    <option value="EM_CONTATO">💬 2. Em Negociação</option>
                    <option value="EM_ANDAMENTO">🚀 3. Serviço em Andamento</option>
                    <option value="CONCLUIDO">✅ 4. Serviço Finalizado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-300">Tipo de Projeto</label>
                  <input
                    type="text"
                    value={newQuoteForm.projectType}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, projectType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-300">Orçamento Estimado</label>
                  <input
                    type="text"
                    value={newQuoteForm.estimatedBudget}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, estimatedBudget: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-300">Anotações Internas do Sócio</label>
                <textarea
                  rows={3}
                  placeholder="Detalhes combinados, links de referências ou escopo..."
                  value={newQuoteForm.notes}
                  onChange={(e) => setNewQuoteForm({ ...newQuoteForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewQuoteModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20"
                >
                  Salvar Orçamento no Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CONVERSÃO RÁPIDA EM CLIENTE OFICIAL */}
      {/* ============================================================ */}
      {convertModalOpen && quoteToConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Cadastrar como Cliente Oficial</h3>
                  <p className="text-xs text-slate-400">Adiciona à base de clientes mzTech e inicia o serviço.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setConvertModalOpen(false);
                  setQuoteToConvert(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {convertSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <span>{convertSuccess}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <p><strong className="text-white">Empresa / Razão:</strong> {quoteToConvert.company || quoteToConvert.name}</p>
                  <p><strong className="text-white">Responsável:</strong> {quoteToConvert.name}</p>
                  <p><strong className="text-white">WhatsApp:</strong> {quoteToConvert.whatsapp}</p>
                  <p><strong className="text-white">E-mail:</strong> {quoteToConvert.email}</p>
                  <p><strong className="text-white">Desenvolvedor:</strong> {quoteToConvert.selectedDev}</p>
                  <p><strong className="text-white">Projeto:</strong> {quoteToConvert.projectType}</p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Ao confirmar, o lead será registrado como cliente <strong>ATIVO</strong> com situação financeira <strong>EM DIA</strong> no módulo de Clientes da mzTech, e a solicitação avançará para <strong>🚀 SERVIÇO EM ANDAMENTO</strong>.
                </p>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setConvertModalOpen(false);
                      setQuoteToConvert(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={converting}
                    onClick={handleConfirmConversion}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                  >
                    {converting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 stroke-[3]" />
                    )}
                    <span>Confirmar Cadastro</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
