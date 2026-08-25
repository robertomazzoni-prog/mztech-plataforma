'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BarbershopLayout from '@/components/BarbershopLayout';
import { ServiceItem } from '@/types';
import {
  Scissors,
  Plus,
  ArrowLeft,
  Clock,
  Sparkles,
  Loader2,
  X,
  CheckCircle,
  Trash2,
  Power,
  AlertCircle,
  Upload,
  Camera,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminServicosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal Novo Serviço
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('CORTE');
  const [price, setPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [popular, setPopular] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/services?all=true');
      const data = await res.json();
      if (res.ok) {
        setServices(data.services || []);
      }
    } catch (err) {
      console.error('Erro ao buscar serviços:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== 'ADMIN' && user.role !== 'BARBER')) {
        router.push('/login');
      } else {
        loadServices();
      }
    }
  }, [user, authLoading, router]);

  // Upload e Redimensionamento automático de foto do PC
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 700;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setImageUrl(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          price,
          durationMinutes,
          description,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop',
          popular,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName('');
        setPrice('');
        setDescription('');
        setImageUrl('');
        setPopular(false);
        loadServices();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao cadastrar serviço.');
      }
    } catch (err) {
      alert('Erro de conexão ao criar serviço.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (service: ServiceItem) => {
    try {
      const newStatus = !service.active;
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newStatus }),
      });

      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, active: newStatus } : s))
        );
      } else {
        alert('Não foi possível alterar o status do serviço.');
      }
    } catch (err) {
      alert('Erro ao comunicar com o servidor.');
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover o serviço "${name}"?`)) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'Serviço atualizado com sucesso.');
        loadServices();
      } else {
        alert(data.error || 'Erro ao excluir o serviço.');
      }
    } catch (err) {
      alert('Erro de conexão ao remover o serviço.');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-3 bg-dark-950">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
        <p className="text-zinc-400 text-sm">Carregando serviços...</p>
      </div>
    );
  }

  return (
    <BarbershopLayout>
      <div className="min-h-screen bg-dark-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-dark-800">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Dashboard</span>
            </Link>
            <h1 className="text-3xl font-serif font-black text-white">
              Gestão de Serviços & Atendimentos
            </h1>
            <p className="text-zinc-400 text-sm">
              Cadastre novos cortes, tratamentos de barba, pigmentação e combos, ou remova os que não deseja
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-gold px-5 py-3 rounded-xl font-bold text-dark-950 text-sm flex items-center gap-2 shadow-gold self-start sm:self-auto hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Serviço</span>
          </button>
        </div>

        {/* Lista de Serviços */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
            <p className="text-zinc-400 text-sm">Carregando serviços...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 bg-dark-900 border border-dark-750 rounded-2xl space-y-3">
            <Scissors className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-zinc-300 font-medium">Nenhum serviço cadastrado.</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-gold px-4 py-2 rounded-xl text-xs font-bold text-dark-950 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Serviço</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const isActive = service.active !== false;

              return (
                <div
                  key={service.id}
                  className={`bg-dark-900 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                    isActive
                      ? 'border-dark-750 hover:border-gold-500/40'
                      : 'border-red-500/30 opacity-70 bg-dark-950'
                  }`}
                >
                  <div className="relative h-44 w-full overflow-hidden bg-dark-800">
                    <img
                      src={
                        service.imageUrl ||
                        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop'
                      }
                      alt={service.name}
                      className={`w-full h-full object-cover ${!isActive ? 'grayscale' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/30 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-dark-950/80 text-gold-300 border border-gold-500/20">
                        {service.category}
                      </span>
                      {service.popular && isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-dark-950 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Destaque
                        </span>
                      )}
                      {!isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/90 text-white">
                          Inativo
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-dark-950/80 px-3 py-1 rounded-md border border-gold-500/30">
                      <span className="text-gold-400 font-bold font-serif text-base">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-white mb-1.5">{service.name}</h3>
                      <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                        {service.description || 'Sem descrição cadastrada.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-dark-800 flex items-center justify-between">
                      <div className="flex items-center text-xs text-zinc-400">
                        <Clock className="w-3.5 h-3.5 mr-1 text-gold-400" />
                        <span>{service.durationMinutes} min</span>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex items-center gap-2">
                        {/* Botão Ativar/Pausar */}
                        <button
                          onClick={() => handleToggleStatus(service)}
                          className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                            isActive
                              ? 'border-dark-750 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40'
                              : 'border-green-800/40 text-green-400 hover:bg-green-500/10'
                          }`}
                          title={isActive ? 'Desativar do Site' : 'Ativar no Site'}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{isActive ? 'Pausar' : 'Ativar'}</span>
                        </button>

                        {/* Botão Excluir */}
                        <button
                          onClick={() => handleDeleteService(service.id, service.name)}
                          disabled={deletingId === service.id}
                          className="p-2 rounded-lg bg-dark-800 hover:bg-red-950/60 hover:text-red-400 text-zinc-400 border border-dark-700 transition-colors disabled:opacity-50"
                          title="Remover Serviço"
                        >
                          {deletingId === service.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Adicionar Serviço */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-dark-900 border border-gold-500/30 rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-dark-800">
                <div className="flex items-center space-x-2">
                  <Scissors className="w-5 h-5 text-gold-400" />
                  <h3 className="font-serif font-bold text-lg text-white">Adicionar Novo Serviço</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateService} className="space-y-4 mt-4">
                
                {/* UPLOAD DIRETO DE FOTO DO PC */}
                <div className="p-4 rounded-2xl bg-dark-850 border border-dark-750">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Foto / Imagem do Serviço
                  </label>

                  <div className="flex items-center gap-4">
                    {/* Preview da Foto */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-dark-800 border border-gold-500/40 flex-shrink-0">
                      <img
                        src={imageUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop'}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Escolher foto do PC / Celular</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="px-2.5 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-zinc-400 hover:text-zinc-200 text-xs font-medium border border-dark-700"
                        >
                          {showUrlInput ? 'Ocultar Link' : 'Colar link'}
                        </button>
                      </div>

                      <p className="text-[10px] text-zinc-400">
                        Selecione qualquer foto do seu computador ou celular.
                      </p>

                      {showUrlInput && (
                        <input
                          type="url"
                          placeholder="https://..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-1.5 text-white text-xs mt-1"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-zinc-300">Nome do Serviço *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pigmentação de Barba & Contorno"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase text-zinc-300">Categoria *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-gold-400"
                    >
                      <option value="CORTE">Corte</option>
                      <option value="BARBA">Barba</option>
                      <option value="PIGMENTACAO">Pigmentação</option>
                      <option value="COMBO">Combo Especial</option>
                      <option value="TRATAMENTO">Tratamento / Outros</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase text-zinc-300">Preço (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="55.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase text-zinc-300">Duração (Minutos) *</label>
                    <input
                      type="number"
                      required
                      placeholder="30"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
                    />
                  </div>

                  <div className="space-y-1 flex flex-col justify-end">
                    <label className="flex items-center space-x-2 bg-dark-800 border border-dark-700 px-3.5 py-2.5 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={popular}
                        onChange={(e) => setPopular(e.target.checked)}
                        className="rounded text-gold-500 focus:ring-0"
                      />
                      <span className="text-xs text-zinc-300 font-medium">Destacar (Popular)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-zinc-300">Descrição do Serviço</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva as técnicas, produtos e benefícios deste atendimento..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-dark-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-dark-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold px-6 py-2.5 rounded-xl text-xs font-bold text-dark-950 flex items-center gap-2 shadow-gold"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>Salvar Serviço</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        </div>
      </div>
    </BarbershopLayout>
  );
}
