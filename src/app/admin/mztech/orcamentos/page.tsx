'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  UserCheck,
  Calendar,
  Building,
  Phone,
  Mail,
  CreditCard,
  QrCode,
  Layers,
  ArrowRight,
  Edit2,
  Trash2,
  X,
  Check,
  Loader2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { MzQuoteItem, QuoteStatus, PaymentMethodChoice } from '@/types/mztech';
import { formatCurrency, formatDatePtBR } from '@/lib/utils';

export default function MzTechOrcamentosPage() {
  const [quotes, setQuotes] = useState<MzQuoteItem[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [devFilter, setDevFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modais e Detalhes
  const [selectedQuote, setSelectedQuote] = useState<MzQuoteItem | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Formulário de Edição / Criação
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    company: '',
    cnpjCpf: '',
    whatsapp: '',
    email: '',
    selectedDev: 'Roberto',
    projectType: 'Site Institucional Profissional',
    initialDevPrice: '1200.00',
    monthlyPrice: '79.90',
    discount: '0.00',
    finalPrice: '1200.00',
    paymentMethodChoice: 'CREDIT_CARD_RECURRING' as PaymentMethodChoice,
    billingPeriodicity: 'MENSAL',
    dueDay: '10',
    hasDomain: 'Não informado',
    needsHosting: 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
    projectDescription: '',
    desiredDeadline: '15 a 30 dias',
    status: 'AGUARDANDO_ANALISE' as QuoteStatus,
    notes: '',
  });

  const loadQuotes = async () => {
    try {
      setRefreshing(true);
      const [quotesRes, servRes] = await Promise.all([
        fetch('/api/mztech/quotes'),
        fetch('/api/mztech/services?all=true').catch(() => null),
      ]);

      if (quotesRes.ok) {
        const data = await quotesRes.json();
        setQuotes(data.quotes || []);
      }
      if (servRes && servRes.ok) {
        const sData = await servRes.json();
        setAvailableServices(sData.services || []);
      }
    } catch (err) {
      console.error('Erro ao buscar orçamentos e serviços:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const handleOpenView = (quote: MzQuoteItem) => {
    setSelectedQuote(quote);
    setViewModalOpen(true);
  };

  const handleOpenEdit = (quote: MzQuoteItem) => {
    setSelectedQuote(quote);
    setFormData({
      id: quote.id,
      name: quote.name,
      company: quote.company || '',
      cnpjCpf: quote.cnpjCpf || '',
      whatsapp: quote.whatsapp,
      email: quote.email,
      selectedDev: quote.selectedDev || 'Roberto',
      projectType: quote.projectType,
      initialDevPrice: (quote.initialDevPrice !== undefined ? quote.initialDevPrice : 0).toString(),
      monthlyPrice: (quote.monthlyPrice !== undefined ? quote.monthlyPrice : 0).toString(),
      discount: (quote.discount || 0).toString(),
      finalPrice: (quote.finalPrice !== undefined ? quote.finalPrice : quote.initialDevPrice || 0).toString(),
      paymentMethodChoice: quote.paymentMethodChoice || 'CREDIT_CARD_RECURRING',
      billingPeriodicity: quote.billingPeriodicity || 'MENSAL',
      dueDay: (quote.dueDay || 10).toString(),
      hasDomain: quote.hasDomain || 'Não informado',
      needsHosting: quote.needsHosting || 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
      projectDescription: quote.projectDescription || '',
      desiredDeadline: quote.desiredDeadline || '15 a 30 dias',
      status: quote.status,
      notes: quote.notes || '',
    });
    setEditModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFormData({
      id: '',
      name: '',
      company: '',
      cnpjCpf: '',
      whatsapp: '',
      email: '',
      selectedDev: 'Roberto',
      projectType: 'Site Institucional Profissional',
      initialDevPrice: '1500.00',
      monthlyPrice: '79.90',
      discount: '0.00',
      finalPrice: '1500.00',
      paymentMethodChoice: 'CREDIT_CARD_RECURRING',
      billingPeriodicity: 'MENSAL',
      dueDay: '10',
      hasDomain: 'Não informado',
      needsHosting: 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
      projectDescription: '',
      desiredDeadline: '20 dias',
      status: 'AGUARDANDO_ANALISE',
      notes: '',
    });
    setNewModalOpen(true);
  };

  // Ação Principal: ACEITAR SERVIÇO / APROVAR
  const handleApproveQuote = async (quoteId: string, adminName: string = 'Roberto') => {
    if (!confirm('Deseja aprovar este orçamento comercial? O sistema irá criar automaticamente o Cliente, o Projeto, gerar o Contrato e preparar a Cobrança.')) {
      return;
    }

    setProcessingAction(true);
    try {
      const res = await fetch(`/api/mztech/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE', adminName }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao aprovar orçamento.');
        return;
      }

      setActionSuccessMessage(
        `Orçamento aprovado! Contrato ${data.contract?.contractNumber || ''} gerado automaticamente.`
      );
      loadQuotes();
      if (selectedQuote && selectedQuote.id === quoteId) {
        setViewModalOpen(false);
      }
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err) {
      alert('Erro de conexão ao aprovar orçamento.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectQuote = async (quoteId: string) => {
    if (!confirm('Deseja marcar este orçamento como Recusado?')) return;
    setProcessingAction(true);
    try {
      await fetch(`/api/mztech/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT' }),
      });
      loadQuotes();
      setViewModalOpen(false);
    } catch (err) {
      alert('Erro ao recusar orçamento.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteQuote = async (quoteId: string, quoteNumber?: string) => {
    if (!confirm(`Deseja realmente excluir o orçamento ${quoteNumber || quoteId}?`)) return;
    try {
      setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
      await fetch(`/api/mztech/quotes/${quoteId}`, { method: 'DELETE' });
      loadQuotes();
    } catch (err) {
      loadQuotes();
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp || !formData.email) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    setProcessingAction(true);
    try {
      const url = formData.id ? `/api/mztech/quotes/${formData.id}` : '/api/mztech/quotes';
      const method = formData.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setEditModalOpen(false);
        setNewModalOpen(false);
        loadQuotes();
      } else {
        const d = await res.json();
        alert(d.error || 'Erro ao salvar.');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar.');
    } finally {
      setProcessingAction(false);
    }
  };

  // Filtragem
  const filteredQuotes = quotes.filter((q) => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'AGUARDANDO_ANALISE' && q.status !== 'AGUARDANDO_ANALISE' && q.status !== 'NOVO' && q.status !== 'EM_CONTATO') return false;
      if (statusFilter === 'EM_ANALISE' && q.status !== 'EM_ANALISE') return false;
      if (statusFilter === 'APROVADO' && q.status !== 'APROVADO' && q.status !== 'CONCLUIDO' && q.status !== 'EM_ANDAMENTO') return false;
      if (statusFilter === 'RECUSADO' && q.status !== 'RECUSADO') return false;
      if (statusFilter === 'CANCELADO' && q.status !== 'CANCELADO' && q.status !== 'ARQUIVADO') return false;
    }
    if (devFilter !== 'ALL') {
      if (!q.selectedDev?.toLowerCase().includes(devFilter.toLowerCase())) return false;
    }
    if (searchQuery.trim() !== '') {
      const qLower = searchQuery.toLowerCase();
      const matchName = q.name?.toLowerCase().includes(qLower);
      const matchComp = q.company?.toLowerCase().includes(qLower);
      const matchNum = q.quoteNumber?.toLowerCase().includes(qLower);
      const matchServ = q.projectType?.toLowerCase().includes(qLower);
      if (!matchName && !matchComp && !matchNum && !matchServ) return false;
    }
    return true;
  });

  const countAll = quotes.length;
  const countAguardando = quotes.filter((q) => q.status === 'AGUARDANDO_ANALISE' || q.status === 'NOVO' || q.status === 'EM_CONTATO').length;
  const countAprovados = quotes.filter((q) => q.status === 'APROVADO' || q.status === 'CONCLUIDO' || q.status === 'EM_ANDAMENTO').length;
  const countRecusados = quotes.filter((q) => q.status === 'RECUSADO').length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Gestão Comercial & Orçamentos</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {countAll} propostas
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe propostas recebidas, analise condições comerciais e aprove serviços para geração automática de contrato.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadQuotes}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Atualizar Lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Orçamento</span>
          </button>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Barra de Filtros e Pesquisa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
        
        {/* Abas de Status */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({countAll})
          </button>

          <button
            onClick={() => setStatusFilter('AGUARDANDO_ANALISE')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              statusFilter === 'AGUARDANDO_ANALISE'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            Aguardando Análise ({countAguardando})
          </button>

          <button
            onClick={() => setStatusFilter('APROVADO')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              statusFilter === 'APROVADO'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            Aprovados ({countAprovados})
          </button>

          <button
            onClick={() => setStatusFilter('RECUSADO')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              statusFilter === 'RECUSADO'
                ? 'bg-red-500/20 text-red-300 font-semibold border border-red-500/30'
                : 'text-red-400/80 hover:text-red-300'
            }`}
          >
            Recusados ({countRecusados})
          </button>
        </div>

        {/* Responsável e Busca */}
        <div className="flex items-center gap-2">
          <select
            value={devFilter}
            onChange={(e) => setDevFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">Todos Sócios</option>
            <option value="Roberto">Roberto</option>
            <option value="Morvan">Morvan</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente, serviço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Tabela Profissional Densa */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Carregando orçamentos comerciais...</p>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-dashed border-slate-800 space-y-2">
          <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Nenhum orçamento encontrado.</p>
          <p className="text-xs text-slate-500">Ajuste os filtros ou cadastre um novo orçamento.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-3 px-4 font-semibold">Número</th>
                  <th className="py-3 px-4 font-semibold">Cliente / Empresa</th>
                  <th className="py-3 px-4 font-semibold">Serviço</th>
                  <th className="py-3 px-4 font-semibold">Valor Inicial</th>
                  <th className="py-3 px-4 font-semibold">Mensalidade</th>
                  <th className="py-3 px-4 font-semibold">Forma Pagto</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Resp.</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredQuotes.map((q) => {
                  const isApproved = q.status === 'APROVADO' || q.status === 'CONCLUIDO' || q.status === 'EM_ANDAMENTO';
                  const isPending = q.status === 'AGUARDANDO_ANALISE' || q.status === 'NOVO' || q.status === 'EM_CONTATO';
                  const isRejected = q.status === 'RECUSADO';

                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-cyan-400">
                        {q.quoteNumber || `#${q.id.substring(0, 8)}`}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{q.name}</div>
                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                          {q.company && <span className="font-medium text-slate-300">{q.company} •</span>}
                          {q.whatsapp && (
                            <a
                              href={`https://wa.me/55${q.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 hover:underline font-mono inline-flex items-center gap-1"
                              title="Conversar no WhatsApp"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{q.whatsapp}</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">
                        {q.projectType}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-200">
                        {formatCurrency(q.finalPrice || q.initialDevPrice || 0)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {q.monthlyPrice ? `${formatCurrency(q.monthlyPrice)}/mês` : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px] font-medium">
                        {q.paymentMethodChoice === 'CREDIT_CARD_RECURRING' && (
                          <span className="inline-flex items-center gap-1 text-cyan-300">
                            <CreditCard className="w-3 h-3 text-cyan-400" /> Cartão Recorrente
                          </span>
                        )}
                        {q.paymentMethodChoice === 'CREDIT_CARD' && (
                          <span className="inline-flex items-center gap-1 text-cyan-300">
                            <CreditCard className="w-3 h-3 text-cyan-400" /> Cartão Parcelado
                          </span>
                        )}
                        {q.paymentMethodChoice === 'PIX' && (
                          <span className="inline-flex items-center gap-1 text-emerald-300">
                            <QrCode className="w-3 h-3 text-emerald-400" /> PIX
                          </span>
                        )}
                        {q.paymentMethodChoice === 'CARD_PLUS_PIX' && (
                          <span className="inline-flex items-center gap-1 text-purple-300">
                            <CreditCard className="w-3 h-3 text-purple-400" /> Cartão + PIX
                          </span>
                        )}
                        {!q.paymentMethodChoice && 'A Combinar'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isPending
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : isRejected
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isApproved && '● Aprovado'}
                          {isPending && '○ Aguardando'}
                          {isRejected && '✕ Recusado'}
                          {!isApproved && !isPending && !isRejected && q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {q.selectedDev || 'Roberto'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        
                        {/* Ação Primária: Aceitar Serviço se pendente */}
                        {isPending && (
                          <button
                            onClick={() => handleApproveQuote(q.id, q.selectedDev || 'Roberto')}
                            disabled={processingAction}
                            className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                            title="Aprovar Orçamento e Gerar Contrato"
                          >
                            <Check className="w-3 h-3" />
                            <span>Aceitar Serviço</span>
                          </button>
                        )}

                        {/* Visualizar Detalhes */}
                        <button
                          onClick={() => handleOpenView(q)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Visualizar Proposta"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                          title="Editar Orçamento"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Excluir */}
                        <button
                          onClick={() => handleDeleteQuote(q.id, q.quoteNumber)}
                          className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE VISUALIZAÇÃO DETALHADA DO ORÇAMENTO (4 BLOCOS) */}
      {/* ============================================================ */}
      {viewModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
                  {selectedQuote.quoteNumber?.substring(3) || 'MZ'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">
                      Proposta Comercial {selectedQuote.quoteNumber || `#${selectedQuote.id.substring(0, 8)}`}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        selectedQuote.status === 'APROVADO' || selectedQuote.status === 'CONCLUIDO'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : selectedQuote.status === 'RECUSADO'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {selectedQuote.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Solicitado em {formatDatePtBR(selectedQuote.createdAt)} • Responsável: {selectedQuote.selectedDev || 'Roberto'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid dos 4 Blocos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* BLOCO 1: DADOS DO CLIENTE */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  <span>1. Dados do Cliente</span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500">Nome:</span> <strong className="text-white">{selectedQuote.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Empresa:</span> <span className="text-slate-300">{selectedQuote.company || 'Pessoa Física'}</span>
                  </div>
                  {selectedQuote.cnpjCpf && (
                    <div>
                      <span className="text-slate-500">CPF/CNPJ:</span> <span className="text-slate-300 font-mono">{selectedQuote.cnpjCpf}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">WhatsApp:</span> <span className="text-cyan-400 font-mono">{selectedQuote.whatsapp}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">E-mail:</span> <span className="text-slate-300">{selectedQuote.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Domínio Próprio:</span>
                    {selectedQuote.hasDomain?.toLowerCase().includes('sim') || selectedQuote.hasDomain?.toLowerCase().includes('já possuo') ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <Globe className="w-3.5 h-3.5" />
                        <span>
                          Sim, já possui domínio registrado: <strong className="text-white underline">{selectedQuote.customDomain || (selectedQuote.hasDomain.includes('(') ? selectedQuote.hasDomain.substring(selectedQuote.hasDomain.indexOf('(') + 1, selectedQuote.hasDomain.indexOf(')')) : 'Configuração DNS Inclusa')}</strong>
                        </span>
                      </span>
                    ) : selectedQuote.hasDomain?.toLowerCase().includes('não') ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Não possui (Registro de novo domínio com auxílio mzTech)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Globe className="w-3.5 h-3.5" />
                        <span>{selectedQuote.hasDomain || 'A definir na proposta'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* BLOCO 2: SERVIÇO SOLICITADO */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2. Serviço & Escopo</span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500">Tipo:</span> <strong className="text-white">{selectedQuote.projectType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Hospedagem:</span> <span className="text-slate-300">{selectedQuote.needsHosting}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Situação de Domínio:</span>{' '}
                    <strong className={selectedQuote.hasDomain?.toLowerCase().includes('sim') || selectedQuote.hasDomain?.toLowerCase().includes('já possuo') ? 'text-emerald-400' : 'text-cyan-400'}>
                      {selectedQuote.hasDomain?.toLowerCase().includes('sim') || selectedQuote.hasDomain?.toLowerCase().includes('já possuo')
                        ? 'Cliente com domínio próprio ativo'
                        : selectedQuote.hasDomain || 'Novo registro necessário'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Prazo Desejado:</span> <span className="text-slate-300">{selectedQuote.desiredDeadline || '20 dias'}</span>
                  </div>
                  {selectedQuote.projectDescription && (
                    <div className="pt-1 text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800">
                      "{selectedQuote.projectDescription}"
                    </div>
                  )}
                </div>
              </div>

              {/* BLOCO 3: CONDIÇÕES COMERCIAIS */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3. Condições Comerciais</span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Valor de Desenvolvimento:</span>
                    <strong className="text-cyan-400 font-mono">
                      {selectedQuote.initialDevPrice > 0 ? formatCurrency(selectedQuote.initialDevPrice) : 'A Definir / Proposta'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mensalidade (Hosp.+Manut.):</span>
                    <span className="text-slate-300 font-mono">
                      {selectedQuote.monthlyPrice > 0 ? `${formatCurrency(selectedQuote.monthlyPrice)}/mês` : 'Isento (Apenas Dev)'}
                    </span>
                  </div>
                  {selectedQuote.discount ? (
                    <div className="flex justify-between text-emerald-400">
                      <span>Desconto Aplicado:</span>
                      <span className="font-mono">- {formatCurrency(selectedQuote.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                    <span className="text-slate-300">Valor Final Inicial:</span>
                    <span className="text-emerald-400 font-mono">
                      {selectedQuote.finalPrice > 0 ? formatCurrency(selectedQuote.finalPrice) : 'A Definir na Proposta'}
                    </span>
                  </div>
                </div>
              </div>

              {/* BLOCO 4: FORMA DE PAGAMENTO ESCOLHIDA */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                  <span>4. Forma de Pagamento</span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500">Método Selecionado:</span>
                    <div className="font-semibold text-white mt-0.5">
                      {selectedQuote.paymentMethodChoice === 'CREDIT_CARD_RECURRING' && 'Cartão de Crédito Recorrente (Mensalidade Automática)'}
                      {selectedQuote.paymentMethodChoice === 'PIX' && 'PIX (À Vista / Recorrente)'}
                      {selectedQuote.paymentMethodChoice === 'CREDIT_CARD' && 'Cartão de Crédito'}
                      {selectedQuote.paymentMethodChoice === 'CARD_PLUS_PIX' && 'Entrada PIX + Mensalidade no Cartão'}
                      {!selectedQuote.paymentMethodChoice && 'A Combinar'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Periodicidade:</span> <span className="text-slate-300">{selectedQuote.billingPeriodicity || 'Mensal'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Dia de Vencimento:</span> <span className="text-slate-300">Todo dia {selectedQuote.dueDay || 10}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Ações do Orçamento */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {selectedQuote.linkedContractId ? (
                  <Link
                    href={`/admin/mztech/contratos`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ver Contrato Vinculado</span>
                  </Link>
                ) : null}

                {selectedQuote.linkedClientId ? (
                  <Link
                    href={`/admin/mztech/clientes`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Ver Cliente</span>
                  </Link>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                {selectedQuote.status !== 'APROVADO' && selectedQuote.status !== 'CONCLUIDO' && (
                  <button
                    onClick={() => handleRejectQuote(selectedQuote.id)}
                    disabled={processingAction}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors"
                  >
                    Recusar Proposta
                  </button>
                )}

                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    handleOpenEdit(selectedQuote);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Editar Condições
                </button>

                {selectedQuote.status !== 'APROVADO' && selectedQuote.status !== 'CONCLUIDO' && (
                  <button
                    onClick={() => handleApproveQuote(selectedQuote.id, selectedQuote.selectedDev || 'Roberto')}
                    disabled={processingAction}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
                  >
                    {processingAction ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Aceitar Serviço & Gerar Contrato</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE ORÇAMENTO */}
      {/* ============================================================ */}
      {(editModalOpen || newModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                {formData.id ? 'Editar Proposta Comercial' : 'Cadastrar Novo Orçamento'}
              </h3>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setNewModalOpen(false);
                }}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Nome do Contato *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Carlos Silva"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Empresa / Negócio</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Ex: Mazzoni Barber"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="(31) 98684-7049"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cliente@email.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Sócio Responsável</label>
                  <select
                    value={formData.selectedDev}
                    onChange={(e) => setFormData({ ...formData, selectedDev: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Roberto">Roberto</option>
                    <option value="Morvan">Morvan</option>
                  </select>
                </div>
              </div>

              {/* Valores Comerciais */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Valor Inicial */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Valor Inicial (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.initialDevPrice}
                      onChange={(e) => setFormData({ ...formData, initialDevPrice: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Mensalidade (R$/mês) com Seletor de Planos */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold flex items-center justify-between">
                      <span>Mensalidade (R$/mês)</span>
                    </label>

                    <div className="space-y-1.5">
                      <select
                        value={
                          Number(formData.monthlyPrice) === 79.9
                            ? '79.90|||Plano Hospedagem + Manutenção (R$ 79,90/mês)'
                            : Number(formData.monthlyPrice) === 39.9
                            ? '39.90|||Plano Hospedagem Gerenciada (R$ 39,90/mês)'
                            : Number(formData.monthlyPrice) === 149.9
                            ? '149.90|||Plano Manutenção & Suporte Dedicado (R$ 149,90/mês)'
                            : Number(formData.monthlyPrice) === 0
                            ? '0.00|||Isento / Sem Mensalidade'
                            : 'CUSTOM'
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== 'CUSTOM') {
                            const [price, name] = val.split('|||');
                            setFormData((prev) => ({
                              ...prev,
                              monthlyPrice: price,
                              needsHosting: name,
                            }));
                          }
                        }}
                        className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-[11px] focus:outline-none focus:border-cyan-400 font-medium"
                      >
                        <option value="79.90|||Plano Hospedagem + Manutenção (R$ 79,90/mês)">
                          ⭐ Hospedagem + Manutenção (R$ 79,90/mês)
                        </option>
                        <option value="39.90|||Plano Hospedagem Gerenciada (R$ 39,90/mês)">
                          🌐 Hospedagem Gerenciada (R$ 39,90/mês)
                        </option>
                        <option value="149.90|||Plano Manutenção & Suporte Dedicado (R$ 149,90/mês)">
                          🛡️ Suporte & Manutenção Dedicada (R$ 149,90/mês)
                        </option>
                        <option value="0.00|||Isento / Sem Mensalidade">
                          ⚪ Isento / Sem Mensalidade (R$ 0,00)
                        </option>
                        {availableServices
                          .filter(
                            (s) =>
                              (s.recurrence === 'MENSAL' ||
                                s.type === 'HOSPEDAGEM' ||
                                s.type === 'MANUTENCAO' ||
                                s.type === 'SUPORTE') &&
                              s.price !== 79.9 &&
                              s.price !== 39.9 &&
                              s.price !== 149.9
                          )
                          .map((s) => (
                            <option key={s.id} value={`${s.price}|||${s.name} (R$ ${s.price}/mês)`}>
                              📦 {s.name} (R$ {s.price}/mês)
                            </option>
                          ))}
                        <option value="CUSTOM">✍️ Digitar Outro Valor Personalizado...</option>
                      </select>

                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-[11px]">
                          R$
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.monthlyPrice}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              monthlyPrice: e.target.value,
                              needsHosting:
                                Number(e.target.value) === 0
                                  ? 'Isento / Sem Mensalidade'
                                  : prev.needsHosting,
                            }))
                          }
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Forma de Pagamento */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Forma de Pagamento</label>
                    <select
                      value={formData.paymentMethodChoice}
                      onChange={(e: any) =>
                        setFormData({ ...formData, paymentMethodChoice: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="CREDIT_CARD_RECURRING">Cartão de Crédito Recorrente (Mensal)</option>
                      <option value="CREDIT_CARD">Cartão de Crédito (Parcelado em até 12x)</option>
                      <option value="PIX">PIX (À Vista / Chave Oficial)</option>
                      <option value="CARD_PLUS_PIX">Entrada PIX + Mensalidade no Cartão</option>
                    </select>
                  </div>
                </div>

                {/* Atalhos Rápidos de 1 Clique */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Planos Rápidos:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        monthlyPrice: '79.90',
                        needsHosting: 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
                      }))
                    }
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                      Number(formData.monthlyPrice) === 79.9
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    ⭐ Completo (R$ 79,90)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        monthlyPrice: '39.90',
                        needsHosting: 'Plano Hospedagem Gerenciada (R$ 39,90/mês)',
                      }))
                    }
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                      Number(formData.monthlyPrice) === 39.9
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    🌐 Hospedagem (R$ 39,90)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        monthlyPrice: '149.90',
                        needsHosting: 'Plano Manutenção & Suporte Dedicado (R$ 149,90/mês)',
                      }))
                    }
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                      Number(formData.monthlyPrice) === 149.9
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    🛡️ Dedicado (R$ 149,90)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        monthlyPrice: '0.00',
                        needsHosting: 'Isento / Sem Mensalidade',
                      }))
                    }
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                      Number(formData.monthlyPrice) === 0
                        ? 'bg-slate-800 text-white border-slate-600'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    ⚪ Isento (R$ 0)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Serviço / Tipo de Projeto</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={formData.projectType}
                    onChange={(e) => {
                      const val = e.target.value;
                      let initialPrice = formData.initialDevPrice;
                      if (val === 'Landing Page de Alta Conversão') initialPrice = '890.00';
                      else if (val === 'Site Institucional Profissional') initialPrice = '1500.00';
                      else if (val === 'Sistema Web & Painel Administrativo') initialPrice = '2900.00';
                      else if (val === 'Site + Sistema de Agendamento') initialPrice = '1800.00';

                      setFormData({
                        ...formData,
                        projectType: val,
                        initialDevPrice: initialPrice,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Site Institucional Profissional">Site Institucional Profissional (R$ 1.500)</option>
                    <option value="Landing Page de Alta Conversão">Landing Page de Alta Conversão (R$ 890)</option>
                    <option value="Site + Sistema de Agendamento">Site + Sistema de Agendamento (R$ 1.800)</option>
                    <option value="Sistema Web & Painel Administrativo">Sistema Web & Painel Administrativo (R$ 2.900)</option>
                    <option value="E-commerce / Loja Online">E-commerce / Loja Online (R$ 2.500)</option>
                    <option value="Cardápio Digital & Delivery">Cardápio Digital & Delivery (R$ 1.200)</option>
                    <option value="Outro">Outro (Digitar Nome Abaixo)</option>
                  </select>

                  <input
                    type="text"
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    placeholder="Nome customizado do serviço..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Observações Comerciais</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Anotações internas sobre a negociação..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setNewModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processingAction}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  {processingAction ? 'Salvando...' : 'Salvar Orçamento'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
