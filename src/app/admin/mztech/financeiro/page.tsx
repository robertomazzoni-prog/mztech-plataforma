'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CreditCard,
  QrCode,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  Building,
  FileText,
  Check,
  X,
  Loader2,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { MzPaymentItem, MzSubscriptionItem, PaymentStatus, PaymentMethod } from '@/types/mztech';
import { formatCurrency, formatDatePtBR } from '@/lib/utils';

export default function MzTechFinanceiroPage() {
  const [payments, setPayments] = useState<MzPaymentItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<MzSubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Aba ativa: 'PAGAMENTOS' | 'COBRANCAS' | 'RECORRENCIAS' | 'INADIMPLENCIA'
  const [activeTab, setActiveTab] = useState<'PAGAMENTOS' | 'COBRANCAS' | 'RECORRENCIAS' | 'INADIMPLENCIA'>('PAGAMENTOS');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal de Nova Cobrança
  const [newChargeModalOpen, setNewChargeModalOpen] = useState(false);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [chargeForm, setChargeForm] = useState({
    clientId: '',
    title: 'Desenvolvimento de Módulo Sob Demanda',
    amount: '500.00',
    paymentMethod: 'CREDIT_CARD' as PaymentMethod,
    paymentType: 'TAXA_INICIAL',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadFinancialData = async () => {
    try {
      setRefreshing(true);
      const [payRes, subRes, clientRes] = await Promise.all([
        fetch('/api/mztech/payments'),
        fetch('/api/mztech/subscriptions'),
        fetch('/api/mztech/clients'),
      ]);

      if (payRes.ok) {
        const pData = await payRes.json();
        setPayments(pData.payments || []);
      }
      if (subRes.ok) {
        const sData = await subRes.json();
        setSubscriptions(sData.subscriptions || []);
      }
      if (clientRes.ok) {
        const cData = await clientRes.json();
        setClientsList(cData.clients || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  const handleConfirmPayment = async (paymentId: string) => {
    if (!confirm('Confirmar o recebimento manual deste pagamento?')) return;
    try {
      const res = await fetch('/api/mztech/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: paymentId, action: 'CONFIRM_PAID' }),
      });
      if (res.ok) {
        loadFinancialData();
      }
    } catch (err) {
      alert('Erro ao confirmar pagamento.');
    }
  };

  const handleDeletePayment = async (paymentId: string, transactionId?: string) => {
    if (!confirm(`Deseja realmente excluir a cobrança ${transactionId || paymentId}?`)) return;
    try {
      setPayments((prev) => prev.filter((p) => p.id !== paymentId && p.transactionId !== paymentId));
      await fetch(`/api/mztech/payments?id=${paymentId}`, {
        method: 'DELETE',
      });
      loadFinancialData();
    } catch (err) {
      loadFinancialData();
    }
  };

  const handleDeleteSubscription = async (subId: string, planName?: string) => {
    if (!confirm(`Deseja realmente cancelar/excluir a assinatura ${planName || subId}?`)) return;
    try {
      setSubscriptions((prev) => prev.filter((s) => s.id !== subId));
      await fetch(`/api/mztech/subscriptions?id=${subId}`, {
        method: 'DELETE',
      });
      loadFinancialData();
    } catch (err) {
      loadFinancialData();
    }
  };

  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeForm.clientId || !chargeForm.amount) {
      alert('Selecione o cliente e informe o valor.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/mztech/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...chargeForm,
          dueDate: new Date(chargeForm.dueDate).toISOString(),
        }),
      });

      if (res.ok) {
        setNewChargeModalOpen(false);
        loadFinancialData();
      } else {
        const d = await res.json();
        alert(d.error || 'Erro ao criar cobrança.');
      }
    } catch (err) {
      alert('Erro de conexão ao criar cobrança.');
    } finally {
      setSubmitting(false);
    }
  };

  // Cálculos de KPIs
  const paidPayments = payments.filter((p) => p.status === 'PAID');
  const totalPaidRevenue = paidPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const totalPendingRevenue = pendingPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const overduePayments = payments.filter((p) => p.status === 'OVERDUE' || p.status === 'FAILED');
  const totalOverdueRevenue = overduePayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'ACTIVE');
  const totalMRR = activeSubscriptions.reduce((acc, s) => acc + (s.amount || 0), 0);

  // Filtragem
  const filteredPayments = payments.filter((p) => {
    if (activeTab === 'COBRANCAS') {
      if (p.status !== 'PENDING' && p.status !== 'OVERDUE') return false;
    }
    if (activeTab === 'INADIMPLENCIA') {
      if (p.status !== 'OVERDUE' && p.status !== 'FAILED') return false;
    }
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchClient = p.client?.companyName?.toLowerCase().includes(q) || p.client?.contactName?.toLowerCase().includes(q);
      const matchTxn = p.transactionId?.toLowerCase().includes(q);
      const matchTitle = p.title?.toLowerCase().includes(q);
      if (!matchClient && !matchTxn && !matchTitle) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Gestão Financeira & Cobranças</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Gateway Ativo (Sandbox / Live)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitore pagamentos, faturas pendentes, assinaturas recorrentes e controle de inadimplência da mzTech.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadFinancialData}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Atualizar Dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              if (clientsList.length > 0) {
                setChargeForm((prev) => ({ ...prev, clientId: clientsList[0].id }));
              }
              setNewChargeModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Cobrança</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono font-medium block">Total Recebido (Pago)</span>
          <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
            {formatCurrency(totalPaidRevenue)}
          </span>
          <span className="text-[10px] text-slate-500">{paidPayments.length} transações confirmadas</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono font-medium block">Receita Recorrente (MRR)</span>
          <span className="text-xl font-bold text-cyan-400 font-mono mt-1 block">
            {formatCurrency(totalMRR)}/mês
          </span>
          <span className="text-[10px] text-slate-500">{activeSubscriptions.length} assinaturas ativas</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono font-medium block">Cobranças Pendentes</span>
          <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">
            {formatCurrency(totalPendingRevenue)}
          </span>
          <span className="text-[10px] text-slate-500">{pendingPayments.length} aguardando pagamento</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono font-medium block">Inadimplência / Atrasadas</span>
          <span className="text-xl font-bold text-red-400 font-mono mt-1 block">
            {formatCurrency(totalOverdueRevenue)}
          </span>
          <span className="text-[10px] text-slate-500">{overduePayments.length} faturas com atraso/falha</span>
        </div>
      </div>

      {/* Navegação por Abas Financeiras */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => {
              setActiveTab('PAGAMENTOS');
              setStatusFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'PAGAMENTOS'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos Pagamentos ({payments.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('COBRANCAS');
              setStatusFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'COBRANCAS'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            Cobranças Pendentes ({pendingPayments.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('RECORRENCIAS');
              setStatusFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'RECORRENCIAS'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            Recorrências / Assinaturas ({subscriptions.length || clientsList.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('INADIMPLENCIA');
              setStatusFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'INADIMPLENCIA'
                ? 'bg-red-500/20 text-red-300 font-semibold border border-red-500/30'
                : 'text-slate-400 hover:text-red-300'
            }`}
          >
            Inadimplência ({overduePayments.length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, ID da transação..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-56 sm:w-64"
          />
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Carregando informações financeiras...</p>
        </div>
      ) : activeTab === 'RECORRENCIAS' ? (
        
        /* TABELA DE RECORRÊNCIAS / ASSINATURAS */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-3 px-4 font-semibold">Cliente / Empresa</th>
                  <th className="py-3 px-4 font-semibold">Plano Contratado</th>
                  <th className="py-3 px-4 font-semibold">Valor Recorrente</th>
                  <th className="py-3 px-4 font-semibold">Periodicidade</th>
                  <th className="py-3 px-4 font-semibold">Forma de Cobrança</th>
                  <th className="py-3 px-4 font-semibold">Próxima Cobrança</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 space-y-1">
                      <p className="text-xs font-semibold text-slate-400">Nenhuma assinatura recorrente ativa no momento.</p>
                      <p className="text-[11px] text-slate-500">
                        As assinaturas e cobranças mensais são ativadas após a assinatura digital do contrato pelo cliente.
                      </p>
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <strong className="text-white block">{s.client?.companyName || 'Cliente'}</strong>
                        <span className="text-[11px] text-slate-400">{s.client?.contactName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{s.planName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                        {formatCurrency(s.amount)}/mês
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{s.periodicity}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {s.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'PIX'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {s.nextBillingDate ? formatDatePtBR(s.nextBillingDate) : 'Em 30 dias'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ● {s.status === 'ACTIVE' ? 'Ativa' : s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteSubscription(s.id, s.planName)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors"
                          title="Cancelar / Excluir Assinatura"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* TABELA DE PAGAMENTOS / COBRANÇAS / INADIMPLÊNCIA */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-3 px-4 font-semibold">ID Transação</th>
                  <th className="py-3 px-4 font-semibold">Cliente / Empresa</th>
                  <th className="py-3 px-4 font-semibold">Título da Cobrança</th>
                  <th className="py-3 px-4 font-semibold">Valor</th>
                  <th className="py-3 px-4 font-semibold">Método</th>
                  <th className="py-3 px-4 font-semibold">Vencimento</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      Nenhum registro encontrado para esta visualização.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const isPaid = p.status === 'PAID';
                    const isPending = p.status === 'PENDING';
                    const isOverdue = p.status === 'OVERDUE' || p.status === 'FAILED';

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-cyan-400">
                          {p.transactionId || `#${p.id.substring(0, 8)}`}
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-white block">{p.client?.companyName || 'Cliente mzTech'}</strong>
                          <span className="text-[11px] text-slate-400">{p.client?.contactName}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-[220px] truncate">
                          {p.title || 'Cobrança mzTech'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-200">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {p.paymentMethod === 'PIX' ? 'PIX' : 'Cartão de Crédito'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {formatDatePtBR(p.dueDate)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isPaid
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : isPending
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : isOverdue
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isPaid && '● Pago'}
                            {isPending && '○ Pendente'}
                            {isOverdue && '✕ Atrasado / Falha'}
                            {!isPaid && !isPending && !isOverdue && p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPending && (
                              <button
                                onClick={() => handleConfirmPayment(p.id)}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 text-[11px] font-semibold transition-colors border border-slate-700 whitespace-nowrap"
                                title="Marcar como Pago Manualmente"
                              >
                                Confirmar Recebimento
                              </button>
                            )}
                            {isPaid && (
                              <span className="text-[11px] font-mono text-emerald-400 whitespace-nowrap">
                                Recebido {p.paidAt ? formatDatePtBR(p.paidAt) : ''}
                              </span>
                            )}
                            <button
                              onClick={() => handleDeletePayment(p.id, p.transactionId)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors"
                              title="Excluir Cobrança"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE CRIAÇÃO DE NOVA COBRANÇA */}
      {/* ============================================================ */}
      {newChargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Criar Nova Cobrança</h3>
              <button
                onClick={() => setNewChargeModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCharge} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Cliente Destinatário *</label>
                <select
                  required
                  value={chargeForm.clientId}
                  onChange={(e) => setChargeForm({ ...chargeForm, clientId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Selecione o Cliente...</option>
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contactName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Título / Descrição da Cobrança *</label>
                <input
                  type="text"
                  required
                  value={chargeForm.title}
                  onChange={(e) => setChargeForm({ ...chargeForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={chargeForm.amount}
                    onChange={(e) => setChargeForm({ ...chargeForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Método de Pagamento</label>
                  <select
                    value={chargeForm.paymentMethod}
                    onChange={(e: any) => setChargeForm({ ...chargeForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="CREDIT_CARD">Cartão de Crédito</option>
                    <option value="PIX">PIX</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Data de Vencimento *</label>
                <input
                  type="date"
                  required
                  value={chargeForm.dueDate}
                  onChange={(e) => setChargeForm({ ...chargeForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewChargeModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  {submitting ? 'Gerando...' : 'Criar Cobrança'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
