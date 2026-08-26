'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  Github,
  Globe,
  Calendar,
  X,
  Check,
  Loader2,
  Server,
  UserPlus,
} from 'lucide-react';
import { MzProjectItem, MzClientItem, ProjectStatus } from '@/types/mztech';
import { formatDatePtBR } from '@/lib/utils';

export default function MzTechProjectsPage() {
  const [projects, setProjects] = useState<MzProjectItem[]>([]);
  const [clients, setClients] = useState<MzClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<MzProjectItem | null>(null);
  const [isCustomClient, setIsCustomClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    type: 'SITE_INSTITUCIONAL',
    status: 'PLANEJAMENTO' as ProjectStatus,
    startDate: '',
    deliveryDate: '',
    domain: '',
    hostingUrl: '',
    githubRepo: '',
    hostingPlatform: 'Railway',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, clientRes] = await Promise.all([
        fetch(`/api/mztech/projects${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`),
        fetch('/api/mztech/clients'),
      ]);

      if (projRes.ok) {
        const pData = await projRes.json();
        setProjects(pData.projects || []);
      }
      if (clientRes.ok) {
        const cData = await clientRes.json();
        setClients(cData.clients || []);
      }
    } catch (err) {
      console.error('Erro ao buscar projetos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setIsCustomClient(false);
    setNewClientName('');
    setFormData({
      clientId: clients.length > 0 ? clients[0].id : '',
      name: '',
      type: 'SITE_INSTITUCIONAL',
      status: 'PLANEJAMENTO',
      startDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      domain: '',
      hostingUrl: '',
      githubRepo: '',
      hostingPlatform: 'Railway',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (project: MzProjectItem) => {
    setEditingProject(project);
    setIsCustomClient(false);
    setNewClientName('');
    setFormData({
      clientId: project.clientId,
      name: project.name,
      type: project.type,
      status: project.status,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      deliveryDate: project.deliveryDate
        ? new Date(project.deliveryDate).toISOString().split('T')[0]
        : '',
      domain: project.domain || '',
      hostingUrl: project.hostingUrl || '',
      githubRepo: project.githubRepo || '',
      hostingPlatform: project.hostingPlatform || 'Railway',
      notes: project.notes || '',
    });
    setModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCustomClient && !newClientName.trim()) {
      alert('Por favor, informe o nome do cliente / empresa.');
      return;
    }
    if (!isCustomClient && !formData.clientId) {
      alert('Selecione um cliente ou digite um novo nome.');
      return;
    }
    if (!formData.name) {
      alert('Informe o nome do projeto.');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingProject
        ? `/api/mztech/projects/${editingProject.id}`
        : '/api/mztech/projects';
      const method = editingProject ? 'PATCH' : 'POST';

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
        alert(data.error || 'Erro ao salvar projeto.');
        return;
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      alert('Erro de conexão ao salvar projeto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );

    try {
      const res = await fetch(`/api/mztech/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        alert('Erro ao salvar alteração de status.');
        loadData();
      }
    } catch (e) {
      alert('Erro de conexão ao alterar status.');
      loadData();
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir o projeto "${name}"?`)) return;

    try {
      const res = await fetch(`/api/mztech/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        alert('Erro ao excluir projeto.');
      }
    } catch (err) {
      alert('Erro ao excluir projeto.');
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'PRODUCAO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Produção / Entregue
          </span>
        );
      case 'DESENVOLVIMENTO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Desenvolvimento
          </span>
        );
      case 'TESTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            Testes / Homologação
          </span>
        );
      case 'MANUTENCAO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
            Manutenção
          </span>
        );
      case 'PLANEJAMENTO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Planejamento
          </span>
        );
      case 'ENCERRADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
            Encerrado / Entregue
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderGit2 className="w-7 h-7 text-cyan-400" />
            <span>Controle de Projetos</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Projetos desenvolvidos, repositórios, links de hospedagem e status de produção.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-md shadow-cyan-500/10 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Projeto</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-2xl border border-slate-800 overflow-x-auto">
        {[
          { id: 'ALL', label: 'Todos os Projetos' },
          { id: 'PRODUCAO', label: 'Em Produção' },
          { id: 'DESENVOLVIMENTO', label: 'Desenvolvimento' },
          { id: 'TESTE', label: 'Em Testes' },
          { id: 'MANUTENCAO', label: 'Manutenção' },
          { id: 'PLANEJAMENTO', label: 'Planejamento' },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => setStatusFilter(st.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === st.id
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Tabela de Projetos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Carregando projetos...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-medium">Nenhum projeto encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Projeto & Cliente</th>
                  <th className="px-6 py-4">Tipo & Stack</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Hospedagem & Links</th>
                  <th className="px-6 py-4">Prazos</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Projeto & Cliente */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-white text-base">{p.name}</p>
                      <p className="text-xs text-cyan-400 mt-0.5">
                        Cliente: <strong>{p.client?.companyName || 'mzTech'}</strong>
                      </p>
                      {p.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-1 max-w-xs truncate">
                          {p.notes}
                        </p>
                      )}
                    </td>

                    {/* Tipo & Stack */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
                        {p.type}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <Server className="w-3 h-3 text-slate-400" />
                        <span>Plataforma: {p.hostingPlatform}</span>
                      </p>
                    </td>

                    {/* Status de Entrega com Seletor Rápido */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <select
                          value={p.status}
                          onChange={(e) => handleQuickStatusChange(p.id, e.target.value as ProjectStatus)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer transition-colors ${
                            p.status === 'PRODUCAO'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                              : p.status === 'DESENVOLVIMENTO'
                              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                              : p.status === 'TESTE'
                              ? 'bg-purple-950/80 text-purple-300 border-purple-500/50'
                              : p.status === 'MANUTENCAO'
                              ? 'bg-blue-950/80 text-blue-300 border-blue-500/50'
                              : p.status === 'ENCERRADO'
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                          }`}
                        >
                          <option value="PLANEJAMENTO">📋 1. Planejamento</option>
                          <option value="DESENVOLVIMENTO">▶ 2. Em Desenvolvimento</option>
                          <option value="TESTE">🧪 3. Em Testes / Homologação</option>
                          <option value="PRODUCAO">🚀 4. Entregue / Em Produção</option>
                          <option value="MANUTENCAO">🛡️ 5. Em Manutenção Contínua</option>
                          <option value="ENCERRADO">✅ 6. Encerrado / Concluído</option>
                        </select>
                        <p className="text-[10px] text-slate-500 font-mono">Status no Portal do Cliente</p>
                      </div>
                    </td>

                    {/* Links */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs space-y-1">
                      {p.hostingUrl && (
                        <a
                          href={p.hostingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{p.hostingUrl}</span>
                        </a>
                      )}
                      {p.githubRepo && (
                        <a
                          href={p.githubRepo}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Repositório GitHub</span>
                        </a>
                      )}
                      {p.domain && (
                        <p className="text-slate-300 flex items-center gap-1 font-mono text-[11px]">
                          <Globe className="w-3 h-3 text-emerald-400" />
                          <span>{p.domain}</span>
                        </p>
                      )}
                    </td>

                    {/* Prazos */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                      {p.startDate && (
                        <p>
                          Início: <span className="text-slate-200">{formatDatePtBR(p.startDate)}</span>
                        </p>
                      )}
                      {p.deliveryDate && (
                        <p>
                          Entrega:{' '}
                          <span className="text-emerald-400 font-medium">
                            {formatDatePtBR(p.deliveryDate)}
                          </span>
                        </p>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
                        title="Editar Projeto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p.id, p.name)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                        title="Remover Projeto"
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

      {/* Modal Projeto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg text-white">
                  {editingProject ? 'Editar Projeto' : 'Novo Projeto mzTech'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Campo Cliente com Opção de Digitar Nome ou Selecionar */}
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
                      <UserPlus className="w-3 h-3" />
                      <span>{isCustomClient ? 'Selecionar Existente' : 'Digitar Novo Nome'}</span>
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
                          {c.companyName} ({c.contactName})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Nome do Projeto */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Nome do Projeto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mazzoni Barbershop"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Tipo de Projeto
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="SITE_INSTITUCIONAL">Site Institucional</option>
                    <option value="SISTEMA_WEB">Sistema Web Personalizado</option>
                    <option value="SISTEMA_AGENDAMENTO">Site + Sistema de Agendamento</option>
                    <option value="LANDING_PAGE">Landing Page de Alta Conversão</option>
                    <option value="ECOMMERCE">E-commerce / Loja Online</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ProjectStatus })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="PLANEJAMENTO">📋 1. Planejamento & Setup</option>
                    <option value="DESENVOLVIMENTO">▶ 2. Em Desenvolvimento</option>
                    <option value="TESTE">🧪 3. Em Testes / Homologação</option>
                    <option value="PRODUCAO">🚀 4. Entregue / Em Produção</option>
                    <option value="MANUTENCAO">🛡️ 5. Em Manutenção Contínua</option>
                    <option value="ENCERRADO">✅ 6. Encerrado / Concluído</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    URL da Aplicação
                  </label>
                  <input
                    type="url"
                    placeholder="https://exemplo.up.railway.app"
                    value={formData.hostingUrl}
                    onChange={(e) => setFormData({ ...formData, hostingUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Domínio Próprio
                  </label>
                  <input
                    type="text"
                    placeholder="empresa.com.br"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Repositório GitHub
                  </label>
                  <input
                    type="text"
                    placeholder="https://github.com/mztech/projeto"
                    value={formData.githubRepo}
                    onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Plataforma</label>
                  <input
                    type="text"
                    placeholder="Railway"
                    value={formData.hostingPlatform}
                    onChange={(e) => setFormData({ ...formData, hostingPlatform: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Data de Entrega
                  </label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Observações Técnicas
                </label>
                <textarea
                  rows={2}
                  placeholder="Stack: Next.js, Prisma, PostgreSQL..."
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
                  <span>Salvar Projeto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
