'use client';

import React, { useState, useEffect } from 'react';
import {
  Server,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Globe,
  DollarSign,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  AlertTriangle,
  Archive,
} from 'lucide-react';
import { MzHostingItem, MzClientItem, MzProjectItem, HostingStatus, HostingProvider } from '@/types/mztech';
import { formatCurrency, formatDatePtBR } from '@/lib/utils';

export default function MzTechHostingsPage() {
  const [hostings, setHostings] = useState<MzHostingItem[]>([]);
  const [clients, setClients] = useState<MzClientItem[]>([]);
  const [projects, setProjects] = useState<MzProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHosting, setEditingHosting] = useState<MzHostingItem | null>(null);
  const [isCustomClient, setIsCustomClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    provider: 'Railway' as HostingProvider | string,
    serverType: 'Cloud App',
    url: '',
    customDomain: '',
    platformDomain: '',
    startDate: '',
    renewalDate: '',
    cancellationDate: '',
    monthlyPrice: '39.90',
    status: 'ATIVO' as HostingStatus,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hostRes, clientRes, projRes] = await Promise.all([
        fetch('/api/mztech/hostings'),
        fetch('/api/mztech/clients'),
        fetch('/api/mztech/projects'),
      ]);

      if (hostRes.ok) {
        const hData = await hostRes.json();
        setHostings(hData.hostings || []);
      }
      if (clientRes.ok) {
        const cData = await clientRes.json();
        setClients(cData.clients || []);
      }
      if (projRes.ok) {
        const pData = await projRes.json();
        setProjects(pData.projects || []);
      }
    } catch (err) {
      console.error('Erro ao carregar hospedagens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingHosting(null);
    setIsCustomClient(false);
    setNewClientName('');
    setFormData({
      clientId: clients.length > 0 ? clients[0].id : '',
      projectId: projects.length > 0 ? projects[0].id : '',
      provider: 'Railway',
      serverType: 'Cloud App',
      url: '',
      customDomain: '',
      platformDomain: '',
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: '',
      cancellationDate: '',
      monthlyPrice: '39.90',
      status: 'ATIVO',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (hosting: MzHostingItem) => {
    setEditingHosting(hosting);
    setIsCustomClient(false);
    setNewClientName('');
    setFormData({
      clientId: hosting.clientId,
      projectId: hosting.projectId || '',
      provider: hosting.provider || 'Railway',
      serverType: hosting.serverType || 'Cloud App',
      url: hosting.url || '',
      customDomain: hosting.customDomain || '',
      platformDomain: hosting.platformDomain || '',
      startDate: hosting.startDate
        ? new Date(hosting.startDate).toISOString().split('T')[0]
        : '',
      renewalDate: hosting.renewalDate
        ? new Date(hosting.renewalDate).toISOString().split('T')[0]
        : '',
      cancellationDate: hosting.cancellationDate
        ? new Date(hosting.cancellationDate).toISOString().split('T')[0]
        : '',
      monthlyPrice: hosting.monthlyPrice.toString(),
      status: hosting.status,
      notes: hosting.notes || '',
    });
    setModalOpen(true);
  };

  const handleSaveHosting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCustomClient && !newClientName.trim()) {
      alert('Informe o nome do novo cliente / empresa.');
      return;
    }
    if (!isCustomClient && !formData.clientId) {
      alert('Selecione o cliente ou digite um novo nome.');
      return;
    }
    if (!formData.url) {
      alert('Informe a URL da aplicação.');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingHosting
        ? `/api/mztech/hostings/${editingHosting.id}`
        : '/api/mztech/hostings';
      const method = editingHosting ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        newClientName: isCustomClient ? newClientName.trim() : undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar hospedagem.');
        return;
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      alert('Erro de conexão ao salvar hospedagem.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHosting = async (id: string) => {
    if (!confirm('Deseja realmente remover este registro de hospedagem?')) return;

    try {
      const res = await fetch(`/api/mztech/hostings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        alert('Erro ao excluir hospedagem.');
      }
    } catch (err) {
      alert('Erro ao excluir hospedagem.');
    }
  };

  const activeHostings = hostings.filter((h) => h.status === 'ATIVO');
  const totalMonthlyRevenue = activeHostings.reduce((sum, h) => sum + (h.monthlyPrice || 0), 0);

  const getStatusBadge = (status: HostingStatus) => {
    switch (status) {
      case 'ATIVO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Ativo
          </span>
        );
      case 'CANCELAMENTO_SOLICITADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Cancel. Solicitado
          </span>
        );
      case 'SUSPENSO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            Suspenso
          </span>
        );
      case 'ENCERRADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <Archive className="w-3 h-3" />
            Encerrado
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Server className="w-7 h-7 text-cyan-400" />
            <span>Controle de Hospedagens & Provedores</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gestão multi-provedor (Railway, DigitalOcean, VPS), distinção entre domínio próprio e endereço técnico.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-md shadow-cyan-500/10 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Hospedagem</span>
        </button>
      </div>

      {/* Info Card sobre a Infraestrutura Multi-Provedor */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-200">
              Arquitetura Flexível Multi-Provedor mzTech
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Suporta Railway, DigitalOcean, VPS Linux, Hetzner e AWS. O domínio próprio permanece sob titularidade do cliente e separado do endereço técnico.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">
            Faturamento Ativo (MRR)
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {formatCurrency(totalMonthlyRevenue)}/mês
          </span>
        </div>
      </div>

      {/* Tabela de Hospedagens */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Carregando hospedagens...</p>
          </div>
        ) : hostings.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Server className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-medium">Nenhuma hospedagem cadastrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Cliente & Projeto</th>
                  <th className="px-6 py-4">Provedor & Servidor</th>
                  <th className="px-6 py-4">Domínio Próprio vs Técnico</th>
                  <th className="px-6 py-4">Mensalidade</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {hostings.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Cliente & Projeto */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-white text-base">
                        {h.client?.companyName || 'Cliente mzTech'}
                      </p>
                      <p className="text-xs text-cyan-400 mt-0.5">
                        Projeto: {h.project?.name || 'Não vinculado'}
                      </p>
                      {h.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-1 max-w-xs truncate">
                          {h.notes}
                        </p>
                      )}
                    </td>

                    {/* Provedor & Servidor */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-semibold text-[11px]">
                        {h.provider || 'Railway'}
                      </span>
                      <p className="text-slate-400 text-[11px] mt-1">{h.serverType || 'Cloud App'}</p>
                    </td>

                    {/* Domínio Próprio vs Endereço Técnico */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs space-y-1">
                      {h.customDomain ? (
                        <p className="text-emerald-400 flex items-center gap-1 font-mono">
                          <Globe className="w-3 h-3" />
                          <span>{h.customDomain} (Próprio)</span>
                        </p>
                      ) : (
                        <p className="text-slate-500 italic text-[11px]">Sem domínio próprio</p>
                      )}

                      {h.platformDomain && (
                        <p className="text-slate-400 text-[11px] font-mono truncate max-w-[200px]">
                          Técnico: {h.platformDomain}
                        </p>
                      )}
                    </td>

                    {/* Mensalidade */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-emerald-400 text-base">
                        {formatCurrency(h.monthlyPrice)}
                        <span className="text-xs text-slate-400 font-normal">/mês</span>
                      </p>
                      {h.startDate && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Início: {formatDatePtBR(h.startDate)}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(h.status)}</td>

                    {/* Ações */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(h)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
                        title="Editar Hospedagem"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteHosting(h.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                        title="Remover Hospedagem"
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

      {/* Modal Hospedagem */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg text-white">
                  {editingHosting ? 'Editar Hospedagem' : 'Nova Hospedagem mzTech'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHosting} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-slate-400">Cliente *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomClient(!isCustomClient);
                        if (!isCustomClient) {
                          setFormData((prev) => ({ ...prev, clientId: 'NEW' }));
                        } else {
                          setFormData((prev) => ({ ...prev, clientId: clients[0]?.id || '' }));
                        }
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold hover:underline flex items-center gap-1 transition-colors"
                    >
                      <span>{isCustomClient ? 'Selecionar Existente' : '+ Digitar Nome'}</span>
                    </button>
                  </div>

                  {isCustomClient ? (
                    <input
                      type="text"
                      required
                      placeholder="Digite o nome da empresa / cliente..."
                      value={newClientName}
                      onChange={(e) => {
                        setNewClientName(e.target.value);
                        setFormData((prev) => ({ ...prev, clientId: 'NEW' }));
                      }}
                      className="w-full bg-slate-950 border border-cyan-500/60 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400 font-medium"
                      autoFocus
                    />
                  ) : (
                    <select
                      required
                      value={formData.clientId}
                      onChange={(e) => {
                        if (e.target.value === 'NEW') {
                          setIsCustomClient(true);
                          setFormData({ ...formData, clientId: 'NEW' });
                        } else {
                          setFormData({ ...formData, clientId: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">Selecione o Cliente</option>
                      <option value="NEW" className="text-cyan-400 font-bold bg-slate-900">
                        ✍️ + Digitar Nome de Novo Cliente...
                      </option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Projeto Vinculado
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Nenhum / Projeto Geral</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Provedor *</label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Railway">Railway</option>
                    <option value="DigitalOcean">DigitalOcean</option>
                    <option value="VPS Própria">VPS Própria</option>
                    <option value="Hetzner">Hetzner</option>
                    <option value="AWS">AWS</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Tipo de Servidor
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cloud App / VPS Ubuntu 24.04"
                    value={formData.serverType}
                    onChange={(e) => setFormData({ ...formData, serverType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">
                  URL da Aplicação *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://exemplo.up.railway.app"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Domínio Próprio (Cliente)
                  </label>
                  <input
                    type="text"
                    placeholder="empresa.com.br"
                    value={formData.customDomain}
                    onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Endereço Técnico da Plataforma
                  </label>
                  <input
                    type="text"
                    placeholder="empresa.up.railway.app"
                    value={formData.platformDomain}
                    onChange={(e) => setFormData({ ...formData, platformDomain: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Mensalidade (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as HostingStatus })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="CANCELAMENTO_SOLICITADO">CANCELAMENTO SOLICITADO</option>
                    <option value="ENCERRADO">ENCERRADO</option>
                    <option value="SUSPENSO">SUSPENSO</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Configurações de DNS, variáveis de ambiente, notas..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 flex items-center gap-2 shadow-md shadow-cyan-500/10"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Salvar Hospedagem</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
