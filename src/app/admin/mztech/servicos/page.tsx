'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Sparkles,
  DollarSign,
  Tag,
  Check,
  Globe,
  Server,
  Wrench,
  ShieldCheck,
  Clock,
  RefreshCw,
  Search,
} from 'lucide-react';
import { MzServiceItem, ServiceType, ServiceRecurrence } from '@/types/mztech';
import { formatCurrency } from '@/lib/utils';

export default function MzTechServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'DESENVOLVIMENTO' as ServiceType,
    price: '',
    recurrence: 'UNICA' as ServiceRecurrence,
    status: 'ATIVO',
    active: true,
    features: [''] as string[],
  });
  const [submitting, setSubmitting] = useState(false);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mztech/services?all=true');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (err) {
      console.error('Erro ao buscar serviços mzTech:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      type: 'DESENVOLVIMENTO',
      price: '',
      recurrence: 'UNICA',
      status: 'ATIVO',
      active: true,
      features: ['Design responsivo e exclusivo', 'Otimizado para celulares'],
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      type: service.type || 'DESENVOLVIMENTO',
      price: service.price !== undefined ? service.price.toString() : '',
      recurrence: service.recurrence || 'UNICA',
      status: service.status || 'ATIVO',
      active: service.active !== false,
      features: Array.isArray(service.features) && service.features.length > 0 ? service.features : [''],
    });
    setModalOpen(true);
  };

  const handleAddFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.features];
      updated[index] = value;
      return { ...prev, features: updated };
    });
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Preencha o nome e o valor do serviço.');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingService
        ? `/api/mztech/services/${editingService.id}`
        : '/api/mztech/services';
      const method = editingService ? 'PATCH' : 'POST';

      const validFeatures = formData.features.filter((f) => f.trim().length > 0);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: validFeatures,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar serviço.');
        return;
      }

      setModalOpen(false);
      loadServices();
    } catch (err) {
      alert('Erro de conexão ao salvar serviço.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover o serviço "${name}" do catálogo da mzTech?`)) return;

    try {
      setServices((prev) => prev.filter((s) => s.id !== id));
      const res = await fetch(`/api/mztech/services/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        loadServices();
        alert('Erro ao excluir serviço.');
      } else {
        loadServices();
      }
    } catch (err) {
      loadServices();
      alert('Erro ao excluir serviço.');
    }
  };

  const handleToggleActive = async (service: any) => {
    const newActive = !service.active;
    const newStatus = newActive ? 'ATIVO' : 'INATIVO';

    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, active: newActive, status: newStatus } : s))
    );

    try {
      await fetch(`/api/mztech/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive, status: newStatus }),
      });
    } catch (err) {
      loadServices();
    }
  };

  // Filtragem de serviços
  const filteredServices = services.filter((s) => {
    if (filterType !== 'ALL' && s.type !== filterType) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = s.name?.toLowerCase().includes(q);
      const matchDesc = s.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const countAll = services.length;
  const countDev = services.filter((s) => s.type === 'DESENVOLVIMENTO').length;
  const countHosp = services.filter((s) => s.type === 'HOSPEDAGEM').length;
  const countManut = services.filter((s) => s.type === 'MANUTENCAO' || s.type === 'SUPORTE').length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>mzTech Portfólio & Tabela de Preços</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Catálogo de Serviços & Planos mzTech</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Gerencie os tipos de projetos, valores de desenvolvimento, planos de hospedagem e contratos de manutenção oferecidos aos clientes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={loadServices}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Recarregar Catálogo"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Serviço</span>
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'ALL'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Todos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
              {countAll}
            </span>
          </button>

          <button
            onClick={() => setFilterType('DESENVOLVIMENTO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'DESENVOLVIMENTO'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-indigo-400 hover:bg-indigo-500/10'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Sites & Sistemas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
              {countDev}
            </span>
          </button>

          <button
            onClick={() => setFilterType('HOSPEDAGEM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'HOSPEDAGEM'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Hospedagem</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
              {countHosp}
            </span>
          </button>

          <button
            onClick={() => setFilterType('MANUTENCAO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'MANUTENCAO'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Manutenção & Suporte</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
              {countManut}
            </span>
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar serviço ou plano..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      {/* Grid de Serviços */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Carregando catálogo de serviços...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-slate-950/50 rounded-3xl border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-slate-300 font-bold text-sm">Nenhum serviço encontrado no catálogo.</p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Primeiro Serviço</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const isMonthly = service.recurrence === 'MENSAL';
            return (
              <div
                key={service.id}
                className={`bg-slate-900/90 border rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300 relative overflow-hidden ${
                  service.active !== false
                    ? 'border-slate-800 hover:border-cyan-500/50 hover:shadow-cyan-500/5'
                    : 'border-slate-800/50 opacity-60 bg-slate-950/40'
                }`}
              >
                <div className="space-y-4">
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
                        service.type === 'DESENVOLVIMENTO'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : service.type === 'HOSPEDAGEM'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {service.type === 'DESENVOLVIMENTO' && '💻 Desenvolvimento'}
                      {service.type === 'HOSPEDAGEM' && '☁️ Hospedagem'}
                      {service.type === 'MANUTENCAO' && '🛠️ Manutenção'}
                      {service.type === 'SUPORTE' && '🛡️ Suporte Dedicado'}
                    </span>

                    <button
                      onClick={() => handleToggleActive(service)}
                      title={service.active !== false ? 'Clique para desativar' : 'Clique para ativar'}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                        service.active !== false
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                      }`}
                    >
                      {service.active !== false ? '● Ativo' : '○ Inativo'}
                    </button>
                  </div>

                  {/* Nome e Preço */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-extrabold text-white leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {service.description}
                    </p>
                  </div>

                  {/* Valor de Referência */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        {isMonthly ? 'Cobrança Recorrente' : 'Valor do Projeto'}
                      </span>
                      <span className="text-xl font-extrabold text-cyan-400 font-mono">
                        {formatCurrency(service.price)}
                      </span>
                      {isMonthly && (
                        <span className="text-xs text-slate-400 font-medium ml-1">/mês</span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                      {isMonthly ? 'Recorrente' : 'Taxa Única'}
                    </span>
                  </div>

                  {/* Benefícios / Features */}
                  {Array.isArray(service.features) && service.features.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <p className="text-[10px] uppercase font-bold text-slate-500">
                        O que está incluso:
                      </p>
                      <ul className="space-y-1.5">
                        {service.features.map((feat: string, i: number) => (
                          <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Ações de Edição e Exclusão */}
                <div className="flex items-center gap-2 pt-5 mt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenEditModal(service)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar Serviço</span>
                  </button>

                  <button
                    onClick={() => handleDeleteService(service.id, service.name)}
                    title="Excluir Serviço"
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE SERVIÇO */}
      {/* ============================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">
                    {editingService ? 'Editar Serviço / Plano' : 'Cadastrar Novo Serviço'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Defina nome, preço de tabela, recorrência e benefícios incluídos.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-300">
                  Nome do Serviço / Plano *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Landing Page de Alta Conversão ou Plano Hospedagem"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-300">
                    Categoria *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="DESENVOLVIMENTO">Desenvolvimento</option>
                    <option value="HOSPEDAGEM">Hospedagem</option>
                    <option value="MANUTENCAO">Manutenção</option>
                    <option value="SUPORTE">Suporte Dedicado</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-300">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Ex: 890.00 ou 79.90"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-300">
                    Recorrência
                  </label>
                  <select
                    value={formData.recurrence}
                    onChange={(e: any) => setFormData({ ...formData, recurrence: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="UNICA">Taxa Única (Projeto)</option>
                    <option value="MENSAL">Mensal Recorrente</option>
                    <option value="ANUAL">Anual Recorrente</option>
                  </select>
                </div>

              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-300">
                  Descrição Completa
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explique o que este serviço entrega ao cliente..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Construtor Dinâmico de Benefícios / Itens Inclusos */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Itens / Benefícios Inclusos</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        placeholder={`Benefício #${idx + 1} (ex: Certificado SSL incluso)`}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        disabled={formData.features.length <= 1}
                        className="p-2 rounded-xl text-slate-500 hover:text-red-400 disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Ativo */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="serviceActive"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      active: e.target.checked,
                      status: e.target.checked ? 'ATIVO' : 'INATIVO',
                    })
                  }
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-400"
                />
                <label htmlFor="serviceActive" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Disponível para orçamentos e contratos ativos
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
