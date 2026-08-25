'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  MessageSquare,
  Mail,
  Globe,
  Calendar,
  X,
  Check,
  AlertCircle,
  FolderGit2,
  Server,
  Loader2,
  RefreshCw,
  ShieldAlert,
  FileCheck2,
  Archive,
  UserX,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  QrCode,
  DollarSign,
  Play,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  MzClientItem,
  ClientStatus,
  ClientFinancialStatus,
  PaymentStatus,
  SubscriptionStatus,
} from '@/types/mztech';
import { formatDatePtBR, formatCurrency, cleanPhoneDigits } from '@/lib/utils';

export default function MzTechClientsPage() {
  const [clients, setClients] = useState<MzClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [financialFilter, setFinancialFilter] = useState<string>('ALL');

  // Modal State (Criar / Editar)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<MzClientItem | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    whatsapp: '',
    email: '',
    domain: '',
    status: 'ATIVO' as ClientStatus,
    financialStatus: 'EM_DIA' as ClientFinancialStatus,
    startDate: '',
    notes: '',
  });

  // Modal Financeiro & Histórico
  const [financialModalOpen, setFinancialModalOpen] = useState(false);
  const [selectedClientFinancial, setSelectedClientFinancial] = useState<MzClientItem | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<{
    action: string;
    eventId: string;
    message: string;
    newStatus: string;
  } | null>(null);

  // Modal Encerramento & Entrega de Ativos
  const [terminationModalOpen, setTerminationModalOpen] = useState(false);
  const [terminatingClient, setTerminatingClient] = useState<MzClientItem | null>(null);
  const [terminationData, setTerminationData] = useState({
    status: 'ENCERRADO' as ClientStatus,
    cancellationDate: '',
    terminationEffectiveDate: '',
    cancellationReason: '',
    terminatedServices: 'Hospedagem, Manutenção Técnica e Suporte',
    codeDelivered: false,
    backupDelivered: false,
    deliveredAt: '',
    deliveredBy: 'Equipe mzTech',
    terminationNotes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const loadClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (financialFilter !== 'ALL') params.append('financialStatus', financialFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/mztech/clients?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [statusFilter, financialFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadClients();
  };

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setFormData({
      companyName: '',
      contactName: '',
      whatsapp: '',
      email: '',
      domain: '',
      status: 'ATIVO',
      financialStatus: 'EM_DIA',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (client: MzClientItem) => {
    setEditingClient(client);
    setFormData({
      companyName: client.companyName,
      contactName: client.contactName,
      whatsapp: client.whatsapp,
      email: client.email,
      domain: client.domain || '',
      status: client.status,
      financialStatus: client.financialStatus || 'EM_DIA',
      startDate: client.startDate ? new Date(client.startDate).toISOString().split('T')[0] : '',
      notes: client.notes || '',
    });
    setModalOpen(true);
  };

  const handleOpenFinancialModal = (client: MzClientItem) => {
    setSelectedClientFinancial(client);
    setSimulationLog(null);
    setFinancialModalOpen(true);
  };

  const handleOpenTerminationModal = (client: MzClientItem) => {
    setTerminatingClient(client);
    const today = new Date().toISOString().split('T')[0];
    setTerminationData({
      status: client.status === 'CANCELAMENTO_SOLICITADO' ? 'ENCERRADO' : (client.status as ClientStatus),
      cancellationDate: client.cancellationDate
        ? new Date(client.cancellationDate).toISOString().split('T')[0]
        : today,
      terminationEffectiveDate: client.terminationEffectiveDate
        ? new Date(client.terminationEffectiveDate).toISOString().split('T')[0]
        : today,
      cancellationReason: client.cancellationReason || '',
      terminatedServices: client.terminatedServices || 'Hospedagem, Manutenção Técnica e Suporte',
      codeDelivered: Boolean(client.codeDelivered),
      backupDelivered: Boolean(client.backupDelivered),
      deliveredAt: client.deliveredAt
        ? new Date(client.deliveredAt).toISOString().split('T')[0]
        : today,
      deliveredBy: client.deliveredBy || 'Equipe mzTech',
      terminationNotes: client.terminationNotes || '',
    });
    setTerminationModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactName || !formData.whatsapp || !formData.email) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingClient ? `/api/mztech/clients/${editingClient.id}` : '/api/mztech/clients';
      const method = editingClient ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar cliente.');
        return;
      }

      setModalOpen(false);
      loadClients();
    } catch (err) {
      alert('Erro de conexão ao salvar cliente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveTermination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminatingClient) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/mztech/clients/${terminatingClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(terminationData),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao registrar encerramento.');
        return;
      }

      setTerminationModalOpen(false);
      loadClients();
    } catch (err) {
      alert('Erro ao registrar encerramento do cliente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (
      !confirm(
        `Deseja realmente excluir o cliente "${name}"? Essa ação removerá o cliente e seus vínculos.`
      )
    ) {
      return;
    }

    try {
      setClients((prev) => prev.filter((c) => c.id !== id));
      const res = await fetch(`/api/mztech/clients/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        loadClients();
        alert('Erro ao excluir cliente.');
      } else {
        loadClients();
      }
    } catch (err) {
      loadClients();
      alert('Erro ao excluir cliente.');
    }
  };

  // Simulação de Eventos de Webhook em Sandbox
  const handleSimulateWebhook = async (
    action: string,
    eventIdOverride?: string
  ) => {
    if (!selectedClientFinancial) return;

    setSimulating(true);
    try {
      const sub = selectedClientFinancial.subscriptions?.[0];
      const res = await fetch('/api/mztech/payments/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          clientId: selectedClientFinancial.id,
          subscriptionId: sub?.id,
          eventIdOverride,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSimulationLog({
          action,
          eventId: data.eventId,
          message: data.result.message,
          newStatus: data.result.clientFinancialStatus || 'ATUALIZADO',
        });

        // Recarregar os clientes e atualizar a ficha aberta
        const updatedRes = await fetch(`/api/mztech/clients`);
        if (updatedRes.ok) {
          const uData = await updatedRes.json();
          setClients(uData.clients || []);
          const updatedClient = uData.clients?.find(
            (c: MzClientItem) => c.id === selectedClientFinancial.id
          );
          if (updatedClient) {
            setSelectedClientFinancial(updatedClient);
          }
        }
      } else {
        alert(data.error || 'Erro ao simular webhook.');
      }
    } catch (err) {
      alert('Erro de conexão ao simular evento de webhook.');
    } finally {
      setSimulating(false);
    }
  };

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case 'ATIVO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Ativo
          </span>
        );
      case 'CANCELAMENTO_SOLICITADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Cancelamento Solicitado
          </span>
        );
      case 'SUSPENSO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-3 h-3 text-red-400" />
            Suspenso
          </span>
        );
      case 'ENCERRADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <UserX className="w-3 h-3 text-slate-500" />
            Encerrado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getFinancialStatusBadge = (status?: ClientFinancialStatus) => {
    const s = status || 'EM_DIA';
    switch (s) {
      case 'EM_DIA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            PAGAMENTO EM DIA
          </span>
        );
      case 'PENDENTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            PAGAMENTO PENDENTE
          </span>
        );
      case 'ATRASADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
            PAGAMENTO ATRASADO
          </span>
        );
      case 'RECUSADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            PAGAMENTO RECUSADO
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <X className="w-3.5 h-3.5 text-slate-500" />
            ASSINATURA CANCELADA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
            {s}
          </span>
        );
    }
  };

  const getPaymentMethodBadge = (method?: string) => {
    if (method === 'PIX') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
          <QrCode className="w-3 h-3" />
          PIX
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
        <CreditCard className="w-3 h-3" />
        CARTÃO RECORRENTE
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-1">
            <Users className="w-3 h-3" />
            Módulo mzTech OPS
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Gerenciamento de Clientes & Financeiro
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Controle de status operacional, situação financeira em tempo real, assinaturas e webhooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/10 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por empresa, responsável, e-mail ou domínio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </form>

          {/* Filtros Operacionais */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
            {[
              { id: 'ALL', label: 'Todos Status' },
              { id: 'ATIVO', label: 'Ativos' },
              { id: 'CANCELAMENTO_SOLICITADO', label: 'Canc. Solicitado' },
              { id: 'ENCERRADO', label: 'Encerrados' },
              { id: 'SUSPENSO', label: 'Suspensos' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros Financeiros */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Situação Financeira:</span>
          </span>

          {[
            { id: 'ALL', label: 'Todos Financeiro' },
            { id: 'EM_DIA', label: '🟢 Em Dia' },
            { id: 'PENDENTE', label: '🟡 Pendente' },
            { id: 'ATRASADO', label: '🟠 Atrasado' },
            { id: 'RECUSADO', label: '🔴 Recusado' },
            { id: 'CANCELADO', label: '⚫ Cancelado' },
          ].map((fin) => (
            <button
              key={fin.id}
              onClick={() => setFinancialFilter(fin.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                financialFilter === fin.id
                  ? 'bg-slate-800 text-cyan-300 border-cyan-500/50 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {fin.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Clientes com Situação Financeira */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Carregando lista de clientes...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-medium">Nenhum cliente encontrado.</p>
            <p className="text-xs text-slate-500">Cadastre um novo cliente clicando no botão acima.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-4">Empresa & Responsável</th>
                  <th className="px-5 py-4">Contatos</th>
                  <th className="px-5 py-4">SITUAÇÃO FINANCEIRA</th>
                  <th className="px-5 py-4">Status Operacional</th>
                  <th className="px-5 py-4">Domínio Próprio</th>
                  <th className="px-5 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Empresa & Responsável */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-white text-sm sm:text-base">{c.companyName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Resp: {c.contactName}</p>
                      {c.startDate && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Início: {formatDatePtBR(c.startDate)}
                        </p>
                      )}
                    </td>

                    {/* Contatos */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <a
                        href={`https://wa.me/${cleanPhoneDigits(c.whatsapp)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{c.whatsapp}</span>
                      </a>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.email}</span>
                      </p>
                    </td>

                    {/* Situação Financeira (Coluna Principal Requisitada) */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getFinancialStatusBadge(c.financialStatus)}
                        {c.subscriptions && c.subscriptions.length > 0 && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                            <span>{formatCurrency(c.subscriptions[0].amount)}/mês</span>
                            <span>•</span>
                            <span className="text-cyan-400">{c.subscriptions[0].paymentMethod === 'PIX' ? 'Pix' : 'Cartão'}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status Operacional */}
                    <td className="px-5 py-4 whitespace-nowrap">{getStatusBadge(c.status)}</td>

                    {/* Domínio Próprio */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {c.domain ? (
                        <a
                          href={`https://${c.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>{c.domain}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Sem domínio</span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-4 whitespace-nowrap text-right space-x-1.5">
                      {/* Botão de Financeiro & Simulação de Webhook */}
                      <button
                        onClick={() => handleOpenFinancialModal(c)}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        title="Ver Informações de Pagamento & Simulação Sandbox"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="hidden sm:inline">Financeiro</span>
                      </button>

                      <button
                        onClick={() => handleOpenTerminationModal(c)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        title="Registrar Encerramento & Entrega de Ativos"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Encerramento</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
                        title="Editar Cliente"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(c.id, c.companyName)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                        title="Remover Cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETALHADO: FICHA FINANCEIRA DO CLIENTE & SIMULADOR SANDBOX */}
      {financialModalOpen && selectedClientFinancial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            
            {/* Header da Ficha */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <span>Informações de Pagamento & Assinatura</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cliente: <strong className="text-white">{selectedClientFinancial.companyName}</strong> ({selectedClientFinancial.contactName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFinancialModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SEÇÃO 1: INFORMAÇÕES DE PAGAMENTO (Ficha do Cliente) */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  <span>Ficha Financeira da Assinatura</span>
                </h4>
                {getFinancialStatusBadge(selectedClientFinancial.financialStatus)}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Plano Atual</p>
                  <p className="font-bold text-white mt-0.5">
                    {selectedClientFinancial.subscriptions?.[0]?.planName || 'Plano Hospedagem + Manutenção'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Valor Mensal</p>
                  <p className="font-bold text-emerald-400 mt-0.5">
                    {formatCurrency(selectedClientFinancial.subscriptions?.[0]?.amount || 79.90)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Método</p>
                  <div className="mt-1">
                    {getPaymentMethodBadge(selectedClientFinancial.subscriptions?.[0]?.paymentMethod)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Status Assinatura</p>
                  <p className="font-bold text-cyan-300 mt-0.5">
                    {selectedClientFinancial.subscriptions?.[0]?.status || 'ACTIVE'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-900">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Início da Assinatura</p>
                  <p className="text-slate-300 mt-0.5 font-medium">
                    {formatDatePtBR(selectedClientFinancial.subscriptions?.[0]?.startDate || selectedClientFinancial.startDate || new Date().toISOString())}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Próxima Cobrança</p>
                  <p className="text-slate-300 mt-0.5 font-medium">
                    {selectedClientFinancial.subscriptions?.[0]?.nextBillingDate
                      ? formatDatePtBR(selectedClientFinancial.subscriptions[0].nextBillingDate)
                      : 'Em 30 dias'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Gateway Conectado</p>
                  <p className="text-cyan-400 mt-0.5 font-mono text-[11px]">
                    {selectedClientFinancial.subscriptions?.[0]?.gateway || 'SANDBOX_MOCK'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">ID Assinatura Gateway</p>
                  <p className="text-slate-400 mt-0.5 font-mono text-[11px] truncate">
                    {selectedClientFinancial.subscriptions?.[0]?.gatewaySubscriptionId || 'sub_mock_2026'}
                  </p>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: HISTÓRICO DE PAGAMENTOS */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Histórico de Cobranças & Transações</span>
              </h4>

              {(!selectedClientFinancial.payments || selectedClientFinancial.payments.length === 0) ? (
                <p className="text-xs text-slate-500 italic py-3 text-center">
                  Nenhum registro de pagamento anterior encontrado para este cliente.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-[10px] uppercase text-slate-500 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Data Vencimento</th>
                        <th className="px-3 py-2">Valor</th>
                        <th className="px-3 py-2">Método</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Data Pagamento</th>
                        <th className="px-3 py-2 text-right">ID Gateway</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {selectedClientFinancial.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/40">
                          <td className="px-3 py-2.5 text-slate-300">{formatDatePtBR(p.dueDate)}</td>
                          <td className="px-3 py-2.5 font-bold text-white">{formatCurrency(p.amount)}</td>
                          <td className="px-3 py-2.5">{p.paymentMethod === 'PIX' ? 'Pix' : 'Cartão'}</td>
                          <td className="px-3 py-2.5">
                            {p.status === 'PAID' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                PAGO
                              </span>
                            ) : p.status === 'FAILED' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                                RECUSADO
                              </span>
                            ) : p.status === 'OVERDUE' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                ATRASADO
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                PENDENTE
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-slate-400">
                            {p.paidAt ? formatDatePtBR(p.paidAt) : '-'}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-500 text-[11px] truncate max-w-[120px]">
                            {p.gatewayPaymentId || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SEÇÃO 3: SIMULADOR DE WEBHOOK EM SANDBOX (Para Testes do Desenvolvedor) */}
            <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Simulador de Webhooks & Testes de Inadimplência (Sandbox)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Ambiente de Testes Local
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Dispare eventos simulados como se fossem enviados pelo gateway. O Webhook processará a requisição, validará a idempotência e atualizará o status financeiro do cliente em tempo real.
              </p>

              {/* Botões de Ação do Simulador */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={simulating}
                  onClick={() => handleSimulateWebhook('SIMULAR_APROVADO')}
                  className="px-3 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Pagamento Aprovado</span>
                </button>

                <button
                  type="button"
                  disabled={simulating}
                  onClick={() => handleSimulateWebhook('SIMULAR_RECUSADO')}
                  className="px-3 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>2. Recusa de Cartão</span>
                </button>

                <button
                  type="button"
                  disabled={simulating}
                  onClick={() => handleSimulateWebhook('SIMULAR_ATRASADO')}
                  className="px-3 py-2.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                  <span>3. Pagamento Atrasado</span>
                </button>

                <button
                  type="button"
                  disabled={simulating}
                  onClick={() => handleSimulateWebhook('SIMULAR_REGULARIZACAO')}
                  className="px-3 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>4. Regularização</span>
                </button>

                <button
                  type="button"
                  disabled={simulating}
                  onClick={() => handleSimulateWebhook('SIMULAR_CANCELAMENTO')}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                  <span>5. Cancelar Assinatura</span>
                </button>

                <button
                  type="button"
                  disabled={simulating}
                  onClick={() => handleSimulateWebhook('SIMULAR_APROVADO', 'evt_idempotence_fixed_id')}
                  className="px-3 py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  title="Envia o mesmo eventId para provar que a duplicação é descartada"
                >
                  <Play className="w-3.5 h-3.5 text-indigo-400" />
                  <span>6. Testar Idempotência</span>
                </button>
              </div>

              {/* Log do Evento Disparado */}
              {simulationLog && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs space-y-1 font-mono text-cyan-300">
                  <p className="font-bold flex items-center gap-1.5 text-white">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Evento Processado: {simulationLog.action}</span>
                  </p>
                  <p className="text-slate-400">ID do Evento: {simulationLog.eventId}</p>
                  <p className="text-emerald-400 font-bold">Nova Situação Financeira: {simulationLog.newStatus}</p>
                  <p className="text-slate-300 text-[11px]">{simulationLog.message}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Modal de Cadastro / Edição Básica */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg text-white">
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente mzTech'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mazzoni Barbershop"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Nome do Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas Mazzoni"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-8888"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="contato@empresa.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Domínio Próprio</label>
                  <input
                    type="text"
                    placeholder="empresa.com.br"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Status Operacional</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ClientStatus })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="CANCELAMENTO_SOLICITADO">Cancelamento Solicitado</option>
                    <option value="ENCERRADO">Encerrado</option>
                    <option value="SUSPENSO">Suspenso</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Situação Financeira</label>
                  <select
                    value={formData.financialStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, financialStatus: e.target.value as ClientFinancialStatus })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="EM_DIA">🟢 Pagamento em Dia</option>
                    <option value="PENDENTE">🟡 Pagamento Pendente</option>
                    <option value="ATRASADO">🟠 Pagamento Atrasado</option>
                    <option value="RECUSADO">🔴 Pagamento Recusado</option>
                    <option value="CANCELADO">⚫ Assinatura Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">Observações Internas</label>
                <textarea
                  rows={3}
                  placeholder="Anotações comerciais, plano acordado, particularidades..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/10 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Encerramento & Entrega de Ativos */}
      {terminationModalOpen && terminatingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">Encerramento de Cliente & Ativos</h3>
                  <p className="text-xs text-slate-400">Cliente: {terminatingClient.companyName}</p>
                </div>
              </div>
              <button
                onClick={() => setTerminationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTermination} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Status Operacional</label>
                  <select
                    value={terminationData.status}
                    onChange={(e) =>
                      setTerminationData({
                        ...terminationData,
                        status: e.target.value as ClientStatus,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="ENCERRADO">Encerrado Definitivamente</option>
                    <option value="CANCELAMENTO_SOLICITADO">Cancelamento em Andamento (Aviso Prévio)</option>
                    <option value="SUSPENSO">Suspenso Temporariamente</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Data do Cancelamento</label>
                  <input
                    type="date"
                    value={terminationData.cancellationDate}
                    onChange={(e) =>
                      setTerminationData({ ...terminationData, cancellationDate: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">Motivo do Cancelamento</label>
                <input
                  type="text"
                  placeholder="Ex: Encerramento de atividades, migração para equipe interna..."
                  value={terminationData.cancellationReason}
                  onChange={(e) =>
                    setTerminationData({ ...terminationData, cancellationReason: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Checklist de Entrega de Ativos */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Checklist de Entrega de Ativos (Políticas mzTech)
                </p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={terminationData.codeDelivered}
                    onChange={(e) =>
                      setTerminationData({ ...terminationData, codeDelivered: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <div>
                    <p className="text-xs font-semibold text-white">Código-Fonte Entregue ao Cliente</p>
                    <p className="text-[11px] text-slate-500">Repositório GitHub ou arquivo compactado entregue</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={terminationData.backupDelivered}
                    onChange={(e) =>
                      setTerminationData({ ...terminationData, backupDelivered: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <div>
                    <p className="text-xs font-semibold text-white">Dump / Backup do Banco de Dados Entregue</p>
                    <p className="text-[11px] text-slate-500">Arquivo .dump exportado e fornecido de forma segura</p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTerminationModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/10 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Salvar Registro de Encerramento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
