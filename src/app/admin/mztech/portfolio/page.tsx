'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Globe,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Eye,
  EyeOff,
  Star,
  RefreshCw,
  Search,
  Sliders,
  Layers,
  ArrowRight,
  Zap,
  Info,
  Laptop,
} from 'lucide-react';
import { MzPortfolioItem } from '@/types/mztech';

export default function AdminPortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<MzPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [extractUrl, setExtractUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [quickAddSuccess, setQuickAddSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado do Modal de Edição / Criação Manual
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MzPortfolioItem | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Site Institucional Profissional',
    description: '',
    url: '',
    displayUrl: '',
    tagline: 'PRESENÇA DIGITAL DE ALTA PERFORMANCE',
    subheadline: 'Soluções Web sob Medida mzTech',
    previewImage: '',
    favicon: '',
    featuresText: 'Design Exclusivo & Responsivo\nIntegração Direta com WhatsApp\nOtimização de SEO e Velocidade\nInfraestrutura em Nuvem Gerenciada',
    badge: 'Em Produção',
    infrastructure: 'Infraestrutura Railway',
    featured: false,
    active: true,
  });

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mztech/portfolio?all=true');
      const json = await res.json();
      if (json.portfolio) {
        setPortfolioItems(json.portfolio);
      }
    } catch (err) {
      console.error('Erro ao carregar portfólio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  // 1. ADIÇÃO INTELIGENTE INSTANTÂNEA COM 1 CLIQUE
  const handleQuickAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = extractUrl.trim();
    if (!raw) {
      alert('Por favor, digite ou cole a URL do site (ex: https://meusite.com.br ou app.meusite.com).');
      return;
    }

    setExtracting(true);
    setQuickAddSuccess(null);

    try {
      // Passo A: Extração Inteligente de Metadados via Crawler
      const extractRes = await fetch('/api/mztech/portfolio/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: raw }),
      });

      const extractJson = await extractRes.json();
      if (!extractRes.ok) {
        alert(extractJson.error || 'Não foi possível extrair os dados automaticamente da URL.');
        setExtracting(false);
        return;
      }

      const d = extractJson.data;

      // Passo B: Salva diretamente no Portfólio Oficial
      const payload = {
        title: d.title || 'Novo Projeto mzTech',
        category: d.category || 'Site Institucional Profissional',
        description: d.description || 'Projeto corporativo moderno e responsivo desenvolvido pela mzTech.',
        url: d.url || (raw.startsWith('http') ? raw : `https://${raw}`),
        displayUrl: d.displayUrl || raw.replace(/^https?:\/\//i, ''),
        tagline: d.tagline || 'PRESENÇA DIGITAL DE ALTA PERFORMANCE',
        subheadline: d.subheadline || 'Soluções Web sob Medida mzTech',
        previewImage: d.previewImage || null,
        favicon: d.favicon || null,
        features: Array.isArray(d.features) && d.features.length > 0
          ? d.features
          : ['Design Responsivo', 'WhatsApp Integrado', 'Hospedagem em Nuvem'],
        badge: d.badge || 'Em Produção',
        infrastructure: d.infrastructure || 'Infraestrutura Railway',
        featured: true,
        active: true,
      };

      const saveRes = await fetch('/api/mztech/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const saveJson = await saveRes.json();
      if (!saveRes.ok) {
        alert(saveJson.error || 'Erro ao salvar projeto no portfólio.');
        setExtracting(false);
        return;
      }

      // Sucesso
      setQuickAddSuccess(`✅ Projeto "${payload.title}" adicionado com sucesso ao portfólio!`);
      setExtractUrl('');
      await loadPortfolio();
    } catch (err: any) {
      alert('Erro ao conectar com o serviço de extração inteligente.');
    } finally {
      setExtracting(false);
    }
  };

  // 2. ABRIR MODAL COM EXTRAÇÃO PRÉVIA (PARA REVISAR/EDITAR ANTES DE SALVAR)
  const handleOpenExtractAndEdit = async () => {
    const raw = extractUrl.trim();
    if (!raw) {
      handleOpenNewModal();
      return;
    }

    setExtracting(true);
    try {
      const res = await fetch('/api/mztech/portfolio/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: raw }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const d = json.data;
        setEditingItem(null);
        setFormData({
          title: d.title || '',
          category: d.category || 'Site Institucional Profissional',
          description: d.description || '',
          url: d.url || (raw.startsWith('http') ? raw : `https://${raw}`),
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
        setModalOpen(true);
      } else {
        handleOpenNewModal(raw);
      }
    } catch (e) {
      handleOpenNewModal(raw);
    } finally {
      setExtracting(false);
    }
  };

  const handleOpenNewModal = (initialUrl = '') => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'Site Institucional Profissional',
      description: '',
      url: initialUrl ? (initialUrl.startsWith('http') ? initialUrl : `https://${initialUrl}`) : '',
      displayUrl: initialUrl ? initialUrl.replace(/^https?:\/\//i, '') : '',
      tagline: 'PRESENÇA DIGITAL DE ALTA PERFORMANCE',
      subheadline: 'Soluções Web sob Medida mzTech',
      previewImage: '',
      favicon: '',
      featuresText: 'Design Exclusivo & Responsivo\nIntegração Direta com WhatsApp\nOtimização de SEO e Velocidade\nInfraestrutura em Nuvem Gerenciada',
      badge: 'Em Produção',
      infrastructure: 'Infraestrutura Railway',
      featured: false,
      active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: MzPortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description,
      url: item.url,
      displayUrl: item.displayUrl || item.url.replace(/^https?:\/\//i, ''),
      tagline: item.tagline || '',
      subheadline: item.subheadline || '',
      previewImage: item.previewImage || '',
      favicon: item.favicon || '',
      featuresText: (item.features || []).join('\n'),
      badge: item.badge || 'Em Produção',
      infrastructure: item.infrastructure || 'Infraestrutura Railway',
      featured: Boolean(item.featured),
      active: item.active !== false,
    });
    setModalOpen(true);
  };

  // 3. SALVAR ITEM (CRIAR OU ATUALIZAR)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) {
      alert('Preencha ao menos o Título e a URL do projeto.');
      return;
    }

    setFormSubmitting(true);
    try {
      const features = formData.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        url: formData.url.trim(),
        displayUrl: formData.displayUrl.trim() || formData.url.replace(/^https?:\/\//i, ''),
        tagline: formData.tagline.trim(),
        subheadline: formData.subheadline.trim(),
        previewImage: formData.previewImage.trim() || null,
        favicon: formData.favicon.trim() || null,
        features,
        badge: formData.badge.trim(),
        infrastructure: formData.infrastructure.trim(),
        featured: formData.featured,
        active: formData.active,
      };

      const endpoint = editingItem
        ? `/api/mztech/portfolio/${editingItem.id}`
        : '/api/mztech/portfolio';
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Erro ao salvar projeto.');
        return;
      }

      setModalOpen(false);
      setQuickAddSuccess(editingItem ? 'Projeto atualizado!' : 'Projeto adicionado ao portfólio!');
      await loadPortfolio();
    } catch (err) {
      alert('Erro ao salvar alterações no portfólio.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // 4. ATIVAR/DESATIVAR NA HOME
  const handleToggleActive = async (item: MzPortfolioItem) => {
    try {
      const nextActive = !item.active;
      const res = await fetch(`/api/mztech/portfolio/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive }),
      });
      if (res.ok) {
        setPortfolioItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, active: nextActive } : i))
        );
      }
    } catch (err) {
      alert('Erro ao atualizar status do projeto.');
    }
  };

  // 5. MARCAR DESTAQUE
  const handleToggleFeatured = async (item: MzPortfolioItem) => {
    try {
      const nextFeatured = !item.featured;
      const res = await fetch(`/api/mztech/portfolio/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: nextFeatured }),
      });
      if (res.ok) {
        setPortfolioItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, featured: nextFeatured } : i))
        );
      }
    } catch (err) {
      alert('Erro ao atualizar destaque do projeto.');
    }
  };

  // 6. EXCLUIR ITEM
  const handleDeleteItem = async (item: MzPortfolioItem) => {
    if (!confirm(`Deseja realmente remover "${item.title}" do portfólio público?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/mztech/portfolio/${item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPortfolioItems((prev) => prev.filter((i) => i.id !== item.id));
      } else {
        alert('Erro ao excluir projeto.');
      }
    } catch (err) {
      alert('Erro ao excluir projeto.');
    }
  };

  const filteredItems = portfolioItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Portfólio Inteligente do Site
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Gerencie os projetos exibidos na página inicial da mzTech. Adicione novos projetos em 1 clique colando apenas o link.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mztech#portfolio"
            target="_blank"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors"
          >
            <Laptop className="w-4 h-4 text-blue-400" />
            <span>Ver no Site Oficial</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => handleOpenNewModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Manual</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BARRA DE ADIÇÃO RÁPIDA POR URL (SISTEMA INTELIGENTE) */}
      {/* ============================================================ */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Crawler com IA Automática
            </span>
            <h2 className="text-lg font-bold text-white">
              Adicionar Site ao Portfólio Instantaneamente
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Cole a URL de qualquer site ou sistema que a mzTech desenvolveu. Nosso sistema inteligente acessa a página, extrai automaticamente o título, descrição, logotipo/favicon, categoria, tags de recursos e publica direto na home.
          </p>

          <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Globe className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                value={extractUrl}
                onChange={(e) => setExtractUrl(e.target.value)}
                placeholder="Cole aqui a URL do site (ex: https://meusite.com.br ou https://cliente.up.railway.app)"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                disabled={extracting}
              />
            </div>

            <button
              type="submit"
              disabled={extracting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
            >
              {extracting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Analisando & Adicionando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>⚡ Adicionar com 1 Clique</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenExtractAndEdit}
              disabled={extracting}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Revisar antes de Salvar</span>
            </button>
          </form>

          {quickAddSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {quickAddSuccess}
              </span>
              <button
                onClick={() => setQuickAddSuccess(null)}
                className="text-emerald-300 hover:underline text-[11px] ml-4"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* LISTAGEM DE PROJETOS DO PORTFÓLIO */}
      {/* ============================================================ */}
      <div className="space-y-4">
        
        {/* Barra de Filtro / Busca */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Projetos cadastrados:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {portfolioItems.length}
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, categoria ou URL..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs">Carregando portfólio...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 space-y-3">
            <Globe className="w-10 h-10 mx-auto text-slate-600" />
            <h3 className="text-base font-bold text-slate-300">Nenhum projeto encontrado</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? 'Nenhum projeto corresponde ao termo pesquisado.'
                : 'Cole a URL de um site acima para adicionar seu primeiro projeto ao portfólio.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border ${
                  item.active ? 'border-slate-800 bg-slate-900/70' : 'border-slate-800/40 bg-slate-950/40 opacity-60'
                } flex flex-col justify-between overflow-hidden shadow-xl hover:border-slate-700 transition-all group`}
              >
                {/* Topo do Card */}
                <div className="p-5 space-y-4">
                  
                  {/* Badges e Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 truncate max-w-[200px]">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.featured && (
                        <span className="p-1 text-amber-400 bg-amber-400/10 rounded" title="Em Destaque">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                        item.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.active ? 'Ativo na Home' : 'Oculto'}
                      </span>
                    </div>
                  </div>

                  {/* Título e Favicon */}
                  <div className="flex items-start gap-3">
                    {item.favicon ? (
                      <img
                        src={item.favicon}
                        alt=""
                        className="w-6 h-6 rounded-md bg-slate-800 p-0.5 object-contain flex-shrink-0 mt-0.5"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Recursos / Features Pills */}
                  {item.features && item.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.features.slice(0, 3).map((feat, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50 truncate max-w-full"
                        >
                          • {feat}
                        </span>
                      ))}
                      {item.features.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-slate-500 font-mono">
                          +{item.features.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Rodapé do Card com Ações */}
                <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  
                  {/* Link do Projeto */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 truncate max-w-[150px]"
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{item.displayUrl || item.url.replace(/^https?:\/\//i, '')}</span>
                  </a>

                  {/* Botões de Ação */}
                  <div className="flex items-center gap-1.5">
                    
                    {/* Toggle Destaque */}
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      title={item.featured ? 'Remover Destaque' : 'Marcar como Destaque'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        item.featured
                          ? 'bg-amber-400/20 text-amber-400 border-amber-400/30'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-400'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-amber-400' : ''}`} />
                    </button>

                    {/* Toggle Ativo na Home */}
                    <button
                      onClick={() => handleToggleActive(item)}
                      title={item.active ? 'Ocultar da Home' : 'Exibir na Home'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        item.active
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-emerald-400'
                      }`}
                    >
                      {item.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      title="Editar Detalhes"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Excluir */}
                    <button
                      onClick={() => handleDeleteItem(item)}
                      title="Remover do Portfólio"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL DE EDIÇÃO / CRIAÇÃO COMPLETA */}
      {/* ============================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">
                  {editingItem ? 'Editar Projeto do Portfólio' : 'Adicionar Novo Projeto'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Título do Projeto *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Mazzoni Barbershop"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Categoria *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Site + Sistema de Agendamento"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Resumo do projeto desenvolvido e suas vantagens..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">URL Completa de Acesso *</label>
                  <input
                    type="text"
                    required
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        url: e.target.value,
                        displayUrl: e.target.value.replace(/^https?:\/\//i, ''),
                      })
                    }
                    placeholder="https://exemplo.com.br"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Domínio de Exibição</label>
                  <input
                    type="text"
                    value={formData.displayUrl}
                    onChange={(e) => setFormData({ ...formData, displayUrl: e.target.value })}
                    placeholder="exemplo.com.br"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Favicon / Ícone (URL)</label>
                  <input
                    type="text"
                    value={formData.favicon}
                    onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                    placeholder="https://exemplo.com/favicon.ico"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Infraestrutura</label>
                  <input
                    type="text"
                    value={formData.infrastructure}
                    onChange={(e) => setFormData({ ...formData, infrastructure: e.target.value })}
                    placeholder="Infraestrutura Railway"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Recursos & Diferenciais (1 por linha)
                </label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="Agendamento online 24h&#10;Confirmação via WhatsApp&#10;Painel financeiro"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 outline-none text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-0"
                  />
                  <span>Exibir Ativo na Página Inicial</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-0"
                  />
                  <span>Marcar em Destaque</span>
                </label>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  {formSubmitting ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Adicionar ao Portfólio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
