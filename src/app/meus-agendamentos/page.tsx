'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppointmentItem } from '@/types';
import {
  Calendar,
  Clock,
  Scissors,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import { formatCurrency, formatDatePtBR } from '@/lib/utils';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import BarbershopLayout from '@/components/BarbershopLayout';

export default function MeusAgendamentosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments?my=true');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao carregar agendamentos.');
      } else {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      setError('Falha de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchAppointments();
      }
    }
  }, [user, authLoading]);

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;

    try {
      setCancellingId(id);
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (res.ok) {
        fetchAppointments();
      } else {
        const data = await res.json();
        alert(data.error || 'Não foi possível cancelar o agendamento.');
      }
    } catch (err) {
      alert('Erro ao processar o cancelamento.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            Confirmado
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            Concluído
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            Pendente
          </span>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <BarbershopLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-dark-950">
          <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
          <p className="text-zinc-400 text-sm">Carregando seus agendamentos...</p>
        </div>
      </BarbershopLayout>
    );
  }

  const barberPhone = process.env.NEXT_PUBLIC_BARBER_WHATSAPP || '5511999998888';

  return (
    <BarbershopLayout>
      <div className="min-h-[85vh] bg-dark-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-dark-800">
            <div>
              <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">Painel do Cliente</span>
              <h1 className="text-3xl font-serif font-black text-white mt-1">
                Olá, {user?.name.split(' ')[0]}!
              </h1>
              <p className="text-zinc-400 text-sm">
                Gerencie seus atendimentos agendados na Mazzoni Barbershop
              </p>
            </div>

            <Link
              href="/agendar"
              className="btn-gold px-5 py-3 rounded-xl font-bold text-dark-950 text-sm flex items-center justify-center gap-2 shadow-gold hover:shadow-gold-lg self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </Link>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Lista de Agendamentos */}
          {appointments.length === 0 ? (
            <div className="bg-dark-900 border border-dark-750 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-dark-800 text-zinc-500 flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white">Você não tem agendamentos no momento</h3>
              <p className="text-zinc-400 text-sm max-w-md mx-auto">
                Que tal renovar seu corte de cabelo, alinhar a barba ou fazer uma pigmentação hoje mesmo?
              </p>
              <div className="pt-2">
                <Link
                  href="/agendar"
                  className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-dark-950 text-sm shadow-gold"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Agendar Primeiro Horário</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {appointments.map((app) => {
                const waLink = generateWhatsAppLink(barberPhone, {
                  clientName: app.clientName,
                  clientPhone: app.clientPhone,
                  serviceName: app.service.name,
                  servicePrice: app.service.price,
                  barberName: app.barber.name,
                  dateFormatted: formatDatePtBR(app.date),
                  timeSlot: app.timeSlot,
                  notes: app.notes,
                });

                return (
                  <div
                    key={app.id}
                    className="bg-dark-900 border border-dark-750 hover:border-gold-500/30 rounded-2xl p-6 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-dark-800 border border-gold-500/20 text-gold-400 flex items-center justify-center flex-shrink-0 mt-1">
                        <Scissors className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="font-serif font-bold text-lg text-white">
                            {app.service.name}
                          </h4>
                          {getStatusBadge(app.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-zinc-400 pt-1">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gold-400" />
                            Barbeiro: <strong className="text-zinc-200">{app.barber.name}</strong>
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gold-400" />
                            Data: <strong className="text-zinc-200">{formatDatePtBR(app.date)}</strong>
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gold-400" />
                            Horário: <strong className="text-gold-300 font-bold">{app.timeSlot}</strong>
                          </span>
                        </div>

                        {app.notes && (
                          <p className="text-xs text-zinc-500 pt-1 italic">
                            Obs: {app.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-dark-800">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-semibold">
                          Valor
                        </span>
                        <span className="font-serif font-bold text-gold-400 text-lg">
                          {formatCurrency(app.service.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          title="Enviar mensagem sobre este agendamento"
                          className="p-2.5 rounded-xl bg-dark-800 hover:bg-emerald-600 text-zinc-300 hover:text-white border border-dark-700 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>

                        {app.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelAppointment(app.id)}
                            disabled={cancellingId === app.id}
                            title="Cancelar Agendamento"
                            className="px-3.5 py-2.5 rounded-xl bg-dark-800 hover:bg-red-500/20 text-red-400 border border-dark-700 hover:border-red-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Cancelar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </BarbershopLayout>
  );
}
