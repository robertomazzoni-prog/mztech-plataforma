'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BarbershopLayout from '@/components/BarbershopLayout';
import { BarberItem } from '@/types';
import {
  Users,
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
  Edit3,
  Calendar,
  Coffee,
  Scissors,
  Upload,
  Image as ImageIcon,
  Camera,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: '0', label: 'Dom' },
  { id: '1', label: 'Seg' },
  { id: '2', label: 'Ter' },
  { id: '3', label: 'Qua' },
  { id: '4', label: 'Qui' },
  { id: '5', label: 'Sex' },
  { id: '6', label: 'Sáb' },
];

export default function AdminEquipePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState<BarberItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('19:00');
  const [lunchStart, setLunchStart] = useState('12:00');
  const [lunchEnd, setLunchEnd] = useState('13:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['1', '2', '3', '4', '5', '6']);

  const loadBarbers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/barbers?all=true');
      const data = await res.json();
      if (res.ok) {
        setBarbers(data.barbers || []);
      }
    } catch (err) {
      console.error('Erro ao carregar barbeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
      } else {
        loadBarbers();
      }
    }
  }, [user, authLoading, router]);

  const handleOpenAddModal = () => {
    setEditingBarber(null);
    setName('');
    setBio('');
    setAvatarUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop');
    setSpecialties('Visagismo, Fade Navalhado, Pigmentação de Barba');
    setWorkingHoursStart('09:00');
    setWorkingHoursEnd('19:00');
    setLunchStart('12:00');
    setLunchEnd('13:00');
    setSelectedDays(['1', '2', '3', '4', '5', '6']);
    setShowUrlInput(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (barber: BarberItem) => {
    setEditingBarber(barber);
    setName(barber.name);
    setBio(barber.bio || '');
    setAvatarUrl(barber.avatarUrl || '');
    setSpecialties(barber.specialties || '');
    setWorkingHoursStart(barber.workingHoursStart || '09:00');
    setWorkingHoursEnd(barber.workingHoursEnd || '19:00');
    setLunchStart(barber.lunchStart || '12:00');
    setLunchEnd(barber.lunchEnd || '13:00');
    setSelectedDays(barber.workingDays ? barber.workingDays.split(',').map((d) => d.trim()) : ['1', '2', '3', '4', '5', '6']);
    setShowUrlInput(false);
    setShowModal(true);
  };

  // Upload e Redimensionamento automático de foto do PC
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.88);
        setAvatarUrl(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleDay = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length === 1) return;
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name,
        bio,
        avatarUrl,
        specialties,
        workingHoursStart,
        workingHoursEnd,
        lunchStart,
        lunchEnd,
        workingDays: selectedDays.join(','),
      };

      if (editingBarber) {
        const res = await fetch(`/api/barbers/${editingBarber.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setShowModal(false);
          await loadBarbers();
        }
      } else {
        const res = await fetch('/api/barbers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setShowModal(false);
          await loadBarbers();
        }
      }
    } catch (err) {
      console.error('Erro ao salvar barbeiro:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (barber: BarberItem) => {
    try {
      const res = await fetch(`/api/barbers/${barber.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !barber.active }),
      });
      if (res.ok) {
        setBarbers((prev) =>
          prev.map((b) => (b.id === barber.id ? { ...b, active: !b.active } : b))
        );
      }
    } catch (err) {
      console.error('Erro ao alternar status do barbeiro:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este profissional da barbearia?')) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/barbers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Profissional atualizado com sucesso.');
        await loadBarbers();
      } else {
        alert(data.error || 'Erro ao remover profissional.');
      }
    } catch (err) {
      alert('Falha na comunicação com o servidor.');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-gold-400 animate-spin mb-4" />
        <p className="text-zinc-400 text-sm">Carregando equipe...</p>
      </div>
    );
  }

  const totalActive = barbers.filter((b) => b.active).length;

  return (
    <BarbershopLayout>
      <div className="min-h-screen bg-dark-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-dark-800">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Dashboard</span>
            </Link>
            <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-gold-400" />
              <span>Gestão de Equipe & Barbeiros</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Cadastre e edite os profissionais, fotos do perfil, horários de expediente e disponibilidade.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/servicos"
              className="px-4 py-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-zinc-300 hover:text-white border border-dark-750 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Scissors className="w-4 h-4 text-gold-400" />
              <span>Gerenciar Serviços</span>
            </Link>
            <button
              onClick={handleOpenAddModal}
              className="btn-gold px-5 py-2.5 rounded-xl font-bold text-dark-950 text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Barbeiro</span>
            </button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-dark-900 border border-dark-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-medium">Total de Barbeiros</p>
              <p className="text-2xl font-serif font-black text-white mt-1">{barbers.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-dark-900 border border-dark-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-medium">Profissionais Ativos</p>
              <p className="text-2xl font-serif font-black text-green-400 mt-1">{totalActive}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-dark-900 border border-dark-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-medium">Status da Escala</p>
              <p className="text-sm font-bold text-gold-300 mt-1">Agenda Online 24h</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Grid de Barbeiros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((barber) => {
            const daysArray = barber.workingDays ? barber.workingDays.split(',').map((d) => d.trim()) : [];

            return (
              <div
                key={barber.id}
                className={`p-6 rounded-2xl bg-dark-900 border transition-all duration-200 flex flex-col justify-between ${
                  barber.active ? 'border-dark-750 hover:border-gold-500/30' : 'border-red-900/30 opacity-70 bg-dark-950'
                }`}
              >
                <div>
                  {/* Topo com Foto e Status */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={barber.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop'}
                        alt={barber.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gold-500/30 shadow-md bg-dark-800"
                      />
                      <div>
                        <h3 className="text-lg font-serif font-bold text-white leading-snug">{barber.name}</h3>
                        <span className="text-xs text-gold-400 font-medium">Mestre Barbeiro</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        barber.active
                          ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                          : 'bg-red-500/10 border border-red-500/30 text-red-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${barber.active ? 'bg-green-400' : 'bg-red-400'}`} />
                      {barber.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Especialidades */}
                  {barber.specialties && (
                    <div className="mb-4">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
                        Especialidades
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {barber.specialties.split(',').map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-dark-800 border border-dark-700 text-zinc-300 text-[11px] font-medium"
                          >
                            {spec.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {barber.bio && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                      {barber.bio}
                    </p>
                  )}

                  {/* Horários & Expediente */}
                  <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-800 space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gold-400" />
                        <span>Expediente:</span>
                      </span>
                      <strong className="text-zinc-200">
                        {barber.workingHoursStart} às {barber.workingHoursEnd}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-amber-400" />
                        <span>Almoço:</span>
                      </span>
                      <strong className="text-zinc-300">
                        {barber.lunchStart} às {barber.lunchEnd}
                      </strong>
                    </div>

                    {/* Dias de Atendimento */}
                    <div className="pt-2 border-t border-dark-800 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400">Dias:</span>
                      <div className="flex items-center gap-1">
                        {DAYS_OF_WEEK.map((d) => {
                          const isWorking = daysArray.includes(d.id);
                          return (
                            <span
                              key={d.id}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isWorking
                                  ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                                  : 'bg-dark-900 text-zinc-600'
                              }`}
                            >
                              {d.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="pt-4 border-t border-dark-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(barber)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      barber.active
                        ? 'border-dark-750 text-zinc-400 hover:text-amber-400 hover:border-amber-500/30'
                        : 'border-green-800/40 text-green-400 hover:bg-green-500/10'
                    }`}
                    title={barber.active ? 'Desativar Barbeiro' : 'Ativar Barbeiro'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{barber.active ? 'Pausar' : 'Ativar'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(barber)}
                    className="p-2 rounded-xl bg-dark-800 hover:bg-gold-500 hover:text-dark-950 text-zinc-300 border border-dark-700 transition-colors"
                    title="Editar Informações"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(barber.id)}
                    disabled={deletingId === barber.id}
                    className="p-2 rounded-xl bg-dark-800 hover:bg-red-950/60 hover:text-red-400 text-zinc-400 border border-dark-700 transition-colors disabled:opacity-50"
                    title="Remover Barbeiro"
                  >
                    {deletingId === barber.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal de Cadastro / Edição */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-dark-900 border border-gold-500/30 rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-dark-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-white">
                      {editingBarber ? 'Editar Barbeiro' : 'Cadastrar Novo Barbeiro'}
                    </h2>
                    <p className="text-zinc-400 text-xs">Preencha as informações e adicione a foto do profissional</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-dark-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* SEÇÃO DE FOTO / UPLOAD DIRETO DO PC */}
                <div className="p-4 rounded-2xl bg-dark-850 border border-dark-750">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                    Foto de Perfil do Barbeiro
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Preview Circular */}
                    <div className="relative group flex-shrink-0">
                      <img
                        src={avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop'}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gold-500/50 shadow-lg bg-dark-800"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-full bg-dark-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        title="Trocar Foto"
                      >
                        <Camera className="w-5 h-5 text-gold-400" />
                      </button>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                      {/* Input de Arquivo Oculto */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Escolher foto do Computador / Celular</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-zinc-400 hover:text-zinc-200 text-xs font-medium border border-dark-700 transition-colors"
                        >
                          {showUrlInput ? 'Ocultar Link' : 'Ou colar link'}
                        </button>
                      </div>

                      <p className="text-[11px] text-zinc-400">
                        Formatos aceitos: JPG, PNG ou WebP (A foto é ajustada automaticamente).
                      </p>

                      {/* Campo opcional de URL se o usuário preferir */}
                      {showUrlInput && (
                        <div className="pt-2 animate-in fade-in">
                          <input
                            type="url"
                            placeholder="https://exemplo.com/foto.jpg"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-gold-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pedro Henrique"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>

                {/* Especialidades */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Especialidades (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Visagismo, Fade Navalhado, Pigmentação"
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>

                {/* Biografia */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Biografia / Descrição Curta
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Breve resumo da trajetória e estilo do barbeiro..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none"
                  />
                </div>

                {/* Horários de Expediente */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Início do Expediente
                    </label>
                    <input
                      type="time"
                      value={workingHoursStart}
                      onChange={(e) => setWorkingHoursStart(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Fim do Expediente
                    </label>
                    <input
                      type="time"
                      value={workingHoursEnd}
                      onChange={(e) => setWorkingHoursEnd(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* Horários de Almoço */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Início do Almoço
                    </label>
                    <input
                      type="time"
                      value={lunchStart}
                      onChange={(e) => setLunchStart(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Fim do Almoço
                    </label>
                    <input
                      type="time"
                      value={lunchEnd}
                      onChange={(e) => setLunchEnd(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* Dias de Atendimento */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Dias da Semana Atendidos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = selectedDays.includes(day.id);
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-gold-500 text-dark-950 shadow-gold'
                              : 'bg-dark-800 text-zinc-400 border border-dark-700 hover:text-white'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Botões do Formulário */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-dark-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-zinc-300 text-sm font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold px-6 py-2.5 rounded-xl font-bold text-dark-950 text-sm flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>{editingBarber ? 'Salvar Alterações' : 'Cadastrar Barbeiro'}</span>
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
