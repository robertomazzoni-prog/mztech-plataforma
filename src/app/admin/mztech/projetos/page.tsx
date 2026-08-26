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
import { MzProjectItem, MzClientItem, ProjectStatus, MzPortfolioItem } from '@/types/mztech';
import { formatDatePtBR } from '@/lib/utils';
import { Sparkles, Eye, ShieldCheck, CheckCircle2, ArrowRight, RefreshCw, Wand2 } from 'lucide-react';

export default function MzTechProjectsPage() {
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'PORTFOLIO'>('PROJECTS');

  // Projetos Operacionais
  const [projects, setProjects] = useState<MzProjectItem[]>([]);
  const [clients, setClients] = useState<MzClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Portfólio Inteligente
  const [portfolioItems, setPortfolioItems] = useState<MzPortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [extractingUrl, setExtractingUrl] = useState(false);
  const [extractUrlInput, setExtractUrlInput] = useState('');
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<MzPortfolioItem | null>(null);

  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    category: 'Site + Sistema de Agendamento',
    description: '',
    url: '',
    displayUrl: '',
    tagline: 'ELEVE SEU ESTILO AO NÍVEL MÁXIMO',
    subheadline: 'Presença Digital & Soluções Web mzTech',
    previewImage: '',
    favicon: '',
    featuresText: 'Agendamento online 24h\nConfirmação via WhatsApp\nPainel administrativo financeiro\nGestão de equipe e serviços',
    badge: 'Em Produção',
    infrastructure: 'Infraestrutura Railway',
    featured: false,
    active: true,
  });

  // Modal State de Projetos
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
      const [projRes, clientRes, portRes] = await Promise.all([
        fetch(`/api/mztech/projects${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`),
        fetch('/api/mztech/clients'),
        fetch('/api/mztech/portfolio?all=true'),
      ]);

      if (projRes.ok) {
        const pData = await projRes.json();
        setProjects(pData.projects || []);
      }
      if (clientRes.ok) {
        const cData = await clientRes.json();
        setClients(cData.clients || []);
      }
      if (portRes.ok) {
        const portData = await portRes.json();
        setPortfolioItems(portData.portfolio || []);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  // Função Inteligente: Extrair Metadados do Site via URL
  const handleAutoExtract = async (urlToExtract?: string) => {
    const raw = (urlToExtract || extractUrlInput).trim();
    if (!raw) {
      alert('Por favor, informe a URL do site (ex: https://meusite.com.br).');
      return;
    }

    setExtractingUrl(true);
    try {
      const res = await fetch('/api/mztech/portfolio/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: raw }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Não foi possível extrair os dados automaticamente.');
        return;
      }

      const d = json.data;
      setPortfolioForm({
        title: d.title || 'Novo Projeto',
        category: d.category || 'Site Institucional Profissional',
        description: d.description || '',
        url: d.url || raw,
        displayUrl: d.displayUrl || raw.replace(/^https?:\/\//i, ''),
        tagline: d.tagline || 'PRESENÇA DIGITAL DE ALTA PERFORMANCE',
        subheadline: d.subheadline || 'Soluções Web sob Medida mzTech',
        previewImage: d.previewImage || '',
        favicon: d.favicon || '',
        featuresText: (d.features || []).join('\n'),
        badge: d.badge || 'Em Produção',
        infrastructure: d.infrastructure || 'Infraestrutura Railway',
        featured: false,
        active: true,
      });
    } catch (e) {
      alert('Erro de conexão ao extrair dados do site.');
    } finally {
      setExtractingUrl(false);
    }
  };

  const handleOpenSmartPortfolioModal = (initialUrl?: string) => {
    setEditingPortfolioItem(null);
    setExtractUrlInput(initialUrl || '');
    setPortfolioForm({
      title: '',
      category: 'Site + Sistema de Agendamento',
      description: '',
      url: initialUrl || '',
      displayUrl: initialUrl ? initialUrl.replace(/^https?:\/\//i, '') : '',
      tagline: 'ELEVE SEU ESTILO AO NÍVEL MÁXIMO',
      subheadline: 'Presença Digital & Soluções Web mzTech',
      previewImage: '',
      favicon: '',
      featuresText: 'Agendamento online 24h\nConfirmação via WhatsApp\nPainel administrativo financeiro\nGestão de equipe e serviços',
      badge: 'Em Produção',
      infrastructure: 'Infraestrutura Railway',
      featured: false,
      active: true,
    });
    setPortfolioModalOpen(true);

    if (initialUrl) {
      handleAutoExtract(initialUrl);
    }
  };

  const handleOpenEditPortfolioModal = (item: MzPortfolioItem) => {
    setEditingPortfolioItem(item);
    setExtractUrlInput(item.url);
    setPortfolioForm({
      title: item.title,
      category: item.category,
      description: item.description,
      url: item.url,
      displayUrl: item.displayUrl || item.url.replace(/^https?:\/\//i, ''),
      tagline: item.tagline || 'PRESENÇA DIGITAL DE ALTA PERFORMANCE',
      subheadline: item.subheadline || 'Soluções Web sob Medida mzTech',
      previewImage: item.previewImage || '',
      favicon: item.favicon || '',
      featuresText: (item.features || []).join('\n'),
      badge: item.badge || 'Em Produção',
      infrastructure: item.infrastructure || 'Infraestrutura Railway',
      featured: Boolean(item.featured),
      active: item.active !== false,
    });
    setPortfolioModalOpen(true);
  };

  const handleSavePortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioForm.title.trim() || !portfolioForm.url.trim()) {
      alert('Informe o título e a URL do projeto.');
      return;
    }

    setSubmitting(true);
    try {
      const features = portfolioForm.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        title: portfolioForm.title.trim(),
        category: portfolioForm.category.trim(),
        description: portfolioForm.description.trim(),
        url: portfolioForm.url.trim(),
        displayUrl: portfolioForm.displayUrl.trim() || portfolioForm.url.replace(/^https?:\/\//i, ''),
        tagline: portfolioForm.tagline.trim(),
        subheadline: portfolioForm.subheadline.trim(),
        previewImage: portfolioForm.previewImage.trim() || null,
        favicon: portfolioForm.favicon.trim() || null,
        features: features.length > 0 ? features : ['Design Responsivo', 'WhatsApp Integrado'],
        badge: portfolioForm.badge.trim(),
        infrastructure: portfolioForm.infrastructure.trim(),
        featured: portfolioForm.featured,
        active: portfolioForm.active,
      };

      const url = editingPortfolioItem
        ? `/api/mztech/portfolio/${editingPortfolioItem.id}`
        : '/api/mztech/portfolio';
      const method = editingPortfolioItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar projeto no portfólio.');
        return;
      }

      setPortfolioModalOpen(false);
      loadData();
    } catch (err) {
      alert('Erro de conexão ao salvar item no portfólio.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePortfolioActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/mztech/portfolio/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (res.ok) {
        setPortfolioItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, active: !currentActive } : item))
        );
      }
    } catch (e) {
      alert('Erro ao alterar visibilidade.');
    }
  };

  const handleDeletePortfolioItem = async (id: string, title: string) => {
    if (!confirm(`Deseja realmente remover "${title}" do portfólio do site?`)) return;

    try {
      const res = await fetch(`/api/mztech/portfolio/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPortfolioItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        alert('Erro ao excluir item do portfólio.');
      }
    } catch (e) {
      alert('Erro ao excluir item do portfólio.');
    }
  };

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
      {/* Header com Seletor de Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <FolderGit2 className="w-7 h-7 text-cyan-400" />
              <span>Projetos & Portfólio</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              mzTech Studio
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie o fluxo de desenvolvimento de projetos e os cases exibidos no portfólio da página inicial.
          </p>
        </div>

        {/* Botão de Ação Primária dependendo da Aba */}
        {activeTab === 'PROJECTS' ? (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-md shadow-cyan-500/10 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
        ) : (
          <button
            onClick={() => handleOpenSmartPortfolioModal()}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
          >
            <Wand2 className="w-4 h-4" />
            <span>⚡ Importar via Link</span>
          </button>
        )}
      </div>

      {/* Seletor de Abas Principais */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('PROJECTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PROJECTS'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FolderGit2 className="w-4 h-4 text-cyan-400" />
          <span>Projetos Operacionais ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PORTFOLIO')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PORTFOLIO'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>⚡ Portfólio Inteligente (Home) ({portfolioItems.length})</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* ABA 1: PROJETOS OPERACIONAIS */}
      {/* ============================================================ */}
      {activeTab === 'PROJECTS' && (
        <div className="space-y-6">
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
                          {/* Botão de Enviar Direto ao Portfólio */}
                          {(p.hostingUrl || p.domain) && (
                            <button
                              onClick={() => handleOpenSmartPortfolioModal(p.hostingUrl || `https://${p.domain}`)}
                              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                              title="Adicionar automaticamente este site ao Portfólio Inteligente"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                              <span>+ Portfólio</span>
                            </button>
                          )}

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
        </div>
      )}

      {/* ============================================================ */}
      {/* ABA 2: PORTFÓLIO INTELIGENTE (VITRINE DO SITE) */}
      {/* ============================================================ */}
      {activeTab === 'PORTFOLIO' && (
        <div className="space-y-6">
          {/* Caixa de Importação Rápida via Link */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-5 sm:p-6 rounded-3xl border border-cyan-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-base text-white">Importador Inteligente de Portfólio</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Cole o link de qualquer site ou sistema que a mzTech colocou em produção. O sistema extrai título, tags, headlines e gera o case automaticamente.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Globe className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="https://exemplo-cliente.com.br ou app.railway.app"
                  value={extractUrlInput}
                  onChange={(e) => setExtractUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAutoExtract();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-white text-xs font-mono focus:outline-none transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={() => handleOpenSmartPortfolioModal(extractUrlInput)}
                disabled={extractingUrl}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all shrink-0"
              >
                {extractingUrl ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{extractingUrl ? 'Extraindo Dados...' : '⚡ Extrair e Adicionar'}</span>
              </button>
            </div>
          </div>

          {/* Grid de Cases do Portfólio */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className={`bg-slate-900 border ${
                  item.active ? 'border-slate-800 hover:border-cyan-500/40' : 'border-red-900/30 opacity-75'
                } rounded-3xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  {/* Header do Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {item.badge || 'Em Produção'}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-white">{item.title}</h4>
                    </div>

                    {/* Switch Ativo / Inativo na Home */}
                    <button
                      onClick={() => handleTogglePortfolioActive(item.id, item.active)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                        item.active
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title={item.active ? 'Clique para ocultar da Home' : 'Clique para exibir na Home'}
                    >
                      {item.active ? '🟢 Exibindo no Site' : '⚪ Oculto'}
                    </button>
                  </div>

                  {/* Descrição */}
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  {/* Funcionalidades */}
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Recursos em Destaque:</p>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                      {item.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-1.5 truncate">
                          <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mockup Preview do Browser */}
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 shadow-inner">
                    <div className="bg-slate-900 rounded-lg p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                        <span className="font-mono text-cyan-400 truncate max-w-[200px]">
                          {item.displayUrl || item.url}
                        </span>
                        <span className="text-emerald-400 font-semibold font-mono text-[10px]">100% Online</span>
                      </div>
                      <div className="p-3 rounded-md bg-slate-950 border border-slate-800 text-center space-y-1">
                        <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">{item.title}</p>
                        <p className="text-xs font-bold text-white uppercase">{item.tagline || 'PRESENÇA DIGITAL'}</p>
                        <p className="text-[10px] text-slate-400">{item.subheadline || item.category}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer do Card com Ações */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                  >
                    <span>Abrir Site do Projeto</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditPortfolioModal(item)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
                      title="Editar Item do Portfólio"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePortfolioItem(item.id, item.title)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                      title="Excluir do Portfólio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: PROJETO OPERACIONAL */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* MODAL 2: PORTFÓLIO INTELIGENTE (IMPORTAR / EDITAR CASE) */}
      {/* ============================================================ */}
      {portfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg text-white">
                  {editingPortfolioItem ? 'Editar Case do Portfólio' : 'Adicionar ao Portfólio Inteligente'}
                </h3>
              </div>
              <button
                onClick={() => setPortfolioModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de URL com Extração Automática */}
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 space-y-2">
              <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" />
                <span>Link do Site (Extração Automática)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://exemplo.com.br"
                  value={extractUrlInput}
                  onChange={(e) => setExtractUrlInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAutoExtract()}
                  disabled={extractingUrl}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                >
                  {extractingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>{extractingUrl ? 'Analisando...' : 'Preencher com IA'}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSavePortfolioItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Título / Nome do Case *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mazzoni Barbershop"
                    value={portfolioForm.title}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Categoria / Tipo *</label>
                  <select
                    value={portfolioForm.category}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Site + Sistema de Agendamento">Site + Sistema de Agendamento</option>
                    <option value="Site Institucional Profissional">Site Institucional Profissional</option>
                    <option value="E-commerce & Catálogo Online">E-commerce & Catálogo Online</option>
                    <option value="Sistema Web & Painel Administrativo">Sistema Web & Painel Administrativo</option>
                    <option value="Cardápio Digital & Delivery">Cardápio Digital & Delivery</option>
                    <option value="Landing Page de Alta Conversão">Landing Page de Alta Conversão</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">Descrição do Case *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva a plataforma, tecnologias e o que foi entregue..."
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">URL do Projeto (Produção) *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://exemplo.com.br"
                    value={portfolioForm.url}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, url: e.target.value, displayUrl: e.target.value.replace(/^https?:\/\//i, '') })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Infraestrutura</label>
                  <input
                    type="text"
                    placeholder="Ex: Infraestrutura Railway"
                    value={portfolioForm.infrastructure}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, infrastructure: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Headline / Tagline (Mockup)</label>
                  <input
                    type="text"
                    placeholder="Ex: ELEVE SEU ESTILO AO NÍVEL MÁXIMO"
                    value={portfolioForm.tagline}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, tagline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Subheadline (Mockup)</label>
                  <input
                    type="text"
                    placeholder="Ex: Agendamento de Horários & Presença Digital"
                    value={portfolioForm.subheadline}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, subheadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Funcionalidades Chave (1 por linha)
                </label>
                <textarea
                  rows={4}
                  placeholder="Agendamento online 24h&#10;Confirmação via WhatsApp&#10;Painel financeiro&#10;Gestão de equipe"
                  value={portfolioForm.featuresText}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, featuresText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
                  <input
                    type="checkbox"
                    checked={portfolioForm.active}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, active: e.target.checked })}
                    className="rounded text-cyan-500 focus:ring-cyan-400 w-4 h-4"
                  />
                  <span>Exibir no Portfólio da Home</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
                  <input
                    type="checkbox"
                    checked={portfolioForm.featured}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, featured: e.target.checked })}
                    className="rounded text-cyan-500 focus:ring-cyan-400 w-4 h-4"
                  />
                  <span>Destacar como Principal</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPortfolioModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Salvar no Portfólio 🚀</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
