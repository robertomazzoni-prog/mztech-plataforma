'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  AlertCircle,
  ShieldCheck,
  Search,
} from 'lucide-react';
import {
  MzMaintenanceItem,
  MzClientItem,
  MzProjectItem,
  MaintenanceType,
  MaintenanceStatus,
} from '@/types/mztech';
import { formatDatePtBR } from '@/lib/utils';

export default function MzTechMaintenancesPage() {
  const [maintenances, setMaintenances] = useState<MzMaintenanceItem[]>([]);
  const [clients, setClients] = useState<MzClientItem[]>([]);
  const [projects, setProjects] = useState<MzProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<MzMaintenanceItem | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    date: '',
    type: 'CORRECAO' as MaintenanceType,
    description: '',
    responsible: 'mzTech Equipe',
    status: 'CONCLUIDO' as MaintenanceStatus,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintRes, clientRes, projRes] = await Promise.all([
        fetch(`/api/mztech/maintenances${typeFilter !== 'ALL' ? `?type=${typeFilter}` : ''}`),
        fetch('/api/mztech/clients'),
        fetch('/api/mztech/projects'),
      ]);

      if (maintRes.ok) {
        const mData = await maintRes.json();
        setMaintenances(mData.maintenances || []);
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
      console.error('Erro ao buscar manutenções:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter]);

  const handleOpenCreateModal = () => {
    setEditingMaintenance(null);
    setFormData({
      clientId: clients.length > 0 ? clients[0].id : '',
      projectId: projects.length > 0 ? projects[0].id : '',
      date: new Date().toISOString().split('T')[0],
      type: 'ATUALIZACAO',
      description: '',
      responsible: 'mzTech Equipe',
      status: 'CONCLUIDO',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (m: MzMaintenanceItem) => {
    setEditingMaintenance(m);
    setFormData({
      clientId: m.clientId,
      projectId: m.projectId || '',
      date: m.date ? new Date(m.date).toISOString().split('T')[0] : '',
      type: m.type,
      description: m.description,
      responsible: m.responsible,
      status: m.status,
      notes: m.notes || '',
    });
    setModalOpen(true);
  };

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.description) {
      alert('Selecione o cliente e informe a descrição da manutenção.');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingMaintenance
        ? `/api/mztech/maintenances/${editingMaintenance.id}`
        : '/api/mztech/maintenances';
      const method = editingMaintenance ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar manutenção.');
        return;
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      alert('Erro de conexão ao salvar manutenção.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMaintenance = async (id: string) => {
    if (!confirm('Deseja realmente excluir este registro de manutenção?')) return;

    try {
      const res = await fetch(`/api/mztech/maintenances/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        alert('Erro ao excluir manutenção.');
      }
    } catch (err) {
      alert('Erro ao excluir manutenção.');
    }
  };

  const getTypeBadge = (type: MaintenanceType) => {
    switch (type) {
      case 'CORRECAO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Correção
          </span>
        );
      case 'ATUALIZACAO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Atualização
          </span>
        );
      case 'ALTERACAO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Alteração
          </span>
        );
      case 'SUPORTE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
            Suporte
          </span>
        );
      case 'SEGURANCA':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Segurança
          </span>
        );
      default:
        return <span>{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="w-7 h-7 text-cyan-400" />
            <span>Histórico de Manutenções</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Controle de correções técnicas, atualizações de dependências, suporte e alterações pontuais.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-md shadow-cyan-500/10 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Manutenção</span>
        </button>
      </div>

      {/* Filtros de Tipo */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-2xl border border-slate-800 overflow-x-auto">
        {[
          { id: 'ALL', label: 'Todos os Tipos' },
          { id: 'CORRECAO', label: 'Correções' },
          { id: 'ATUALIZACAO', label: 'Atualizações' },
          { id: 'ALTERACAO', label: 'Pequenas Alterações' },
          { id: 'SUPORTE', label: 'Suporte' },
          { id: 'SEGURANCA', label: 'Segurança & SSL' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTypeFilter(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              typeFilter === t.id
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabela de Manutenções */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Carregando histórico...</p>
          </div>
        ) : maintenances.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Wrench className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-medium">Nenhum registro de manutenção encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Cliente & Projeto</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Descrição da Atividade</th>
                  <th className="px-6 py-4">Responsável & Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {maintenances.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Data */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-300">
                      {formatDatePtBR(m.date)}
                    </td>

                    {/* Cliente & Projeto */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-white text-sm">
                        {m.client?.companyName || 'Cliente mzTech'}
                      </p>
                      <p className="text-xs text-cyan-400 mt-0.5">
                        {m.project?.name || 'Projeto Geral'}
                      </p>
                    </td>

                    {/* Tipo */}
                    <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(m.type)}</td>

                    {/* Descrição */}
                    <td className="px-6 py-4 text-xs">
                      <p className="text-slate-200 font-medium leading-relaxed max-w-md">
                        {m.description}
                      </p>
                      {m.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5 max-w-md">
                          Obs: {m.notes}
                        </p>
                      )}
                    </td>

                    {/* Responsável & Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <p className="text-slate-300 font-semibold">{m.responsible}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        {m.status}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(m)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
                        title="Editar Registro"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMaintenance(m.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                        title="Remover Registro"
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

      {/* Modal Manutenção */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg text-white">
                  {editingMaintenance ? 'Editar Manutenção' : 'Registrar Atividade de Manutenção'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaintenance} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Cliente *</label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Selecione o Cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Projeto</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Geral / Sem vínculo</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Data *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Tipo *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as MaintenanceType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="CORRECAO">Correção</option>
                    <option value="ATUALIZACAO">Atualização</option>
                    <option value="ALTERACAO">Pequena Alteração</option>
                    <option value="SUPORTE">Suporte</option>
                    <option value="SEGURANCA">Segurança</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as MaintenanceStatus })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="CONCLUIDO">Concluído</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">Responsável Técnico</label>
                <input
                  type="text"
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">Descrição da Atividade *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Atualização de pacotes de segurança, correção de alinhamento visual..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">Observações Adicionais</label>
                <textarea
                  rows={2}
                  placeholder="Notas internas..."
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
                  <span>Salvar Registro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
