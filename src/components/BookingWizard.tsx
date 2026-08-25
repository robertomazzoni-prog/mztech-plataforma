'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ServiceItem,
  BarberItem,
  AvailableSlot,
  AppointmentItem,
} from '@/types';
import {
  Scissors,
  User,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  FileText,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatPhoneNumber, cleanPhoneDigits, formatDatePtBR } from '@/lib/utils';
import confetti from 'canvas-confetti';

export default function BookingWizard() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get('serviceId');

  // Step state (1: Service, 2: Barber, 3: Date/Time, 4: Client Info, 5: Success Confirmation)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Data states
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Selection states
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('ALL');

  // Available slots for selected date & barber
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Client form states
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Submitting state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdAppointment, setCreatedAppointment] = useState<AppointmentItem | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string>('');

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setClientName(user.name || '');
      setClientPhone(user.phone || '');
      setClientEmail(user.email || '');
    }
  }, [user]);

  // Load Services and Barbers
  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingData(true);
        const [servicesRes, barbersRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/barbers'),
        ]);

        const servicesData = await servicesRes.json();
        const barbersData = await barbersRes.json();

        setServices(servicesData.services || []);
        setBarbers(barbersData.barbers || []);

        // If URL had a serviceId, pre-select it
        if (initialServiceId && servicesData.services) {
          const matched = servicesData.services.find((s: ServiceItem) => s.id === initialServiceId);
          if (matched) {
            setSelectedService(matched);
            setCurrentStep(2); // advance to barber selection
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [initialServiceId]);

  // Generate valid dates (Next 14 days, including Sundays)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Format day name e.g. "Segunda", "Terça", "Hoje", "Amanhã", "Dom"
      let dayLabel = '';
      if (i === 0) dayLabel = 'Hoje';
      else if (i === 1) dayLabel = 'Amanhã';
      else {
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        dayLabel = weekdays[date.getDay()];
      }

      dates.push({
        dateStr,
        dayNumber: day,
        monthName: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        dayLabel,
      });
    }
    return dates;
  };

  const availableDates = generateAvailableDates();

  // Initialize selectedDate with the first available date if not set
  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0].dateStr);
    }
  }, [availableDates, selectedDate]);

  // Fetch slots whenever selectedDate or selectedBarber or selectedService changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate || !selectedBarber || !selectedService) return;

      try {
        setLoadingSlots(true);
        setSlotsError(null);
        setSelectedTime('');

        const res = await fetch(
          `/api/appointments/available-slots?date=${selectedDate}&barberId=${selectedBarber.id}&serviceId=${selectedService.id}`
        );
        const data = await res.json();

        if (!res.ok) {
          setSlotsError(data.error || 'Não foi possível carregar os horários.');
          setAvailableSlots([]);
        } else {
          setAvailableSlots(data.slots || []);
        }
      } catch (err) {
        setSlotsError('Erro ao consultar disponibilidade.');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    if (currentStep === 3) {
      fetchSlots();
    }
  }, [selectedDate, selectedBarber, selectedService, currentStep]);

  // Handle Phone input change with auto-formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setClientPhone(formatted);
  };

  // Submit appointment
  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      setSubmitError('Dados de agendamento incompletos.');
      return;
    }

    if (!clientName.trim() || !clientPhone.trim()) {
      setSubmitError('Por favor, informe seu Nome e WhatsApp.');
      return;
    }

    if (cleanPhoneDigits(clientPhone).length < 10) {
      setSubmitError('Por favor, digite um número de WhatsApp válido com DDD.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload = {
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim() || undefined,
        serviceId: selectedService.id,
        barberId: selectedBarber.id,
        date: selectedDate,
        timeSlot: selectedTime,
        notes: notes.trim() || undefined,
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Falha ao realizar agendamento.');
        return;
      }

      setCreatedAppointment(data.appointment);
      setWhatsappLink(data.whatsappLink);
      setCurrentStep(5);

      // Trigger celebratory confetti effect
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#dfba73', '#c59b27', '#ffffff', '#10b981'],
        });
      } catch (e) {}
    } catch (err) {
      setSubmitError('Erro ao se comunicar com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredServices = services.filter((s) => {
    if (serviceCategoryFilter === 'ALL') return true;
    return s.category === serviceCategoryFilter;
  });

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Barra de Progresso das Etapas */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-dark-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-gold-500 to-amber-400 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((Math.min(currentStep, 4) - 1) / 3) * 100}%` }}
          />

          {[
            { step: 1, label: 'Serviço', icon: Scissors },
            { step: 2, label: 'Profissional', icon: User },
            { step: 3, label: 'Data & Hora', icon: CalendarIcon },
            { step: 4, label: 'Seus Dados', icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div
                key={item.step}
                className="flex flex-col items-center relative z-10 cursor-pointer"
                onClick={() => {
                  if (item.step < currentStep && currentStep !== 5) {
                    setCurrentStep(item.step);
                  }
                }}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gold-500 text-dark-950 shadow-gold'
                      : isCurrent
                      ? 'bg-dark-900 border-2 border-gold-400 text-gold-400 shadow-gold ring-4 ring-gold-500/20'
                      : 'bg-dark-800 text-zinc-500 border border-dark-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : <Icon className="w-5 h-5" />}
                </div>
                <span
                  className={`text-xs sm:text-sm mt-2 font-medium hidden sm:block ${
                    isCurrent ? 'text-gold-300 font-bold' : isCompleted ? 'text-zinc-300' : 'text-zinc-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conteúdo Principal por Etapas */}
      <div className="bg-dark-900/90 border border-dark-750 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        
        {/* ============================================================ */}
        {/* PASSO 1: ESCOLHA DO SERVIÇO */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center sm:text-left">
              <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Passo 1 de 4</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                Escolha o Serviço Desejado
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Selecione o corte, tratamento ou combo que você gostaria de realizar.
              </p>
            </div>

            {/* Filtros de Categoria */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-dark-800">
              {[
                { id: 'ALL', label: 'Todos os Serviços' },
                { id: 'COMBO', label: 'Combos VIP' },
                { id: 'CORTE', label: 'Cortes' },
                { id: 'BARBA', label: 'Barba' },
                { id: 'PIGMENTACAO', label: 'Pigmentação HD' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setServiceCategoryFilter(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    serviceCategoryFilter === cat.id
                      ? 'bg-gold-500 text-dark-950 shadow-gold'
                      : 'bg-dark-800 text-zinc-300 hover:bg-dark-750 hover:text-white border border-dark-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid de Serviços */}
            {loadingData ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                <p className="text-sm text-zinc-400">Carregando serviços da barbearia...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-dark-850 border transition-all duration-300 flex flex-col justify-between ${
                        isSelected
                          ? 'border-gold-500 ring-2 ring-gold-500 shadow-gold-lg scale-[1.02]'
                          : 'border-dark-750 hover:border-gold-500/50 hover:bg-dark-800'
                      }`}
                    >
                      <div className="relative h-40 w-full overflow-hidden">
                        <img
                          src={
                            service.imageUrl ||
                            'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop'
                          }
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-850 via-dark-850/40 to-transparent" />
                        
                        {isSelected && (
                          <div className="absolute top-3 right-3 bg-gold-500 text-dark-950 rounded-full p-1 shadow-lg">
                            <CheckCircle className="w-5 h-5 fill-current" />
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-xs text-zinc-300 bg-dark-950/80 backdrop-blur-md px-2.5 py-1 rounded-md flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gold-400" />
                            {service.durationMinutes} min
                          </span>
                          <span className="font-serif font-bold text-gold-400 text-base bg-dark-950/80 backdrop-blur-md px-3 py-1 rounded-md border border-gold-500/20">
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif font-bold text-white text-base group-hover:text-gold-300 transition-colors">
                            {service.name}
                          </h4>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-dark-800 flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isSelected ? 'text-gold-400' : 'text-zinc-400'}`}>
                            {isSelected ? '✓ Selecionado' : 'Clique para escolher'}
                          </span>
                          <span className="text-zinc-500">{service.category}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ações Passo 1 */}
            <div className="flex justify-end pt-6 border-t border-dark-800">
              <button
                disabled={!selectedService}
                onClick={() => setCurrentStep(2)}
                className="btn-gold px-8 py-3.5 rounded-xl font-bold text-dark-950 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-gold transition-all"
              >
                <span>Avançar para Barbeiro</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASSO 2: ESCOLHA DO BARBEIRO */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center sm:text-left">
              <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Passo 2 de 4</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                Escolha seu Profissional
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Selecione o barbeiro da sua preferência para realizar o serviço:{' '}
                <strong className="text-gold-300">{selectedService?.name}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbers.map((barber) => {
                const isSelected = selectedBarber?.id === barber.id;
                return (
                  <div
                    key={barber.id}
                    onClick={() => setSelectedBarber(barber)}
                    className={`group relative rounded-2xl p-6 cursor-pointer bg-dark-850 border transition-all duration-300 flex flex-col justify-between ${
                      isSelected
                        ? 'border-gold-500 ring-2 ring-gold-500 shadow-gold-lg scale-[1.02] bg-dark-800'
                        : 'border-dark-750 hover:border-gold-500/50 hover:bg-dark-800'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={
                            barber.avatarUrl ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop'
                          }
                          alt={barber.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gold-500/40"
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 bg-gold-500 text-dark-950 rounded-full p-0.5">
                            <CheckCircle className="w-4 h-4 fill-current" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-lg text-white group-hover:text-gold-300">
                          {barber.name}
                        </h4>
                        <span className="text-xs text-gold-400 font-medium">Barbeiro Especialista</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 mt-4 leading-relaxed line-clamp-3">
                      {barber.bio || 'Profissional com ampla experiência em cortes clássicos, degradê e cuidados masculinos.'}
                    </p>

                    {barber.specialties && (
                      <div className="mt-4 pt-3 border-t border-dark-750">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                          Especialidades
                        </span>
                        <p className="text-xs text-zinc-300 font-medium mt-0.5">{barber.specialties}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Ações Passo 2 */}
            <div className="flex items-center justify-between pt-6 border-t border-dark-800">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white bg-dark-800 hover:bg-dark-750 border border-dark-700 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>

              <button
                disabled={!selectedBarber}
                onClick={() => setCurrentStep(3)}
                className="btn-gold px-8 py-3.5 rounded-xl font-bold text-dark-950 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-gold"
              >
                <span>Avançar para Data & Horário</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASSO 3: DATA & HORÁRIO */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center sm:text-left">
              <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Passo 3 de 4</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                Selecione o Dia e Horário
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Atendimento com <strong className="text-gold-300">{selectedBarber?.name}</strong> •{' '}
                Duração estimada: <strong className="text-gold-300">{selectedService?.durationMinutes} min</strong>.
              </p>
            </div>

            {/* Seletor de Datas (Carrossel Horizontal) */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-gold-400" />
                Selecione o Dia
              </label>

              <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
                {availableDates.map((item) => {
                  const isSelected = selectedDate === item.dateStr;
                  return (
                    <button
                      key={item.dateStr}
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-20 sm:w-24 py-3 rounded-2xl border transition-all duration-200 ${
                        isSelected
                          ? 'bg-gold-500 text-dark-950 border-gold-400 shadow-gold scale-105 font-bold'
                          : 'bg-dark-850 text-zinc-300 border-dark-750 hover:border-gold-500/40 hover:bg-dark-800'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-semibold tracking-wider ${isSelected ? 'text-dark-950' : 'text-gold-400'}`}>
                        {item.dayLabel}
                      </span>
                      <span className="text-2xl font-serif font-bold my-0.5">{item.dayNumber}</span>
                      <span className={`text-[10px] uppercase ${isSelected ? 'text-dark-900' : 'text-zinc-400'}`}>
                        {item.monthName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid de Horários Livres */}
            <div className="space-y-3 pt-4 border-t border-dark-800">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gold-400" />
                  Horários Disponíveis ({formatDatePtBR(selectedDate)})
                </label>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold-400" />
                    Disponível
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-dark-700 border border-dark-600" />
                    Indisponível
                  </span>
                </div>
              </div>

              {loadingSlots ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <Loader2 className="w-7 h-7 text-gold-400 animate-spin" />
                  <p className="text-xs text-zinc-400">Verificando agenda do barbeiro...</p>
                </div>
              ) : slotsError ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {slotsError}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-10 bg-dark-850 rounded-2xl border border-dark-750">
                  <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400 font-medium">Nenhum horário disponível para esta data.</p>
                  <p className="text-xs text-zinc-500 mt-1">Tente selecionar outro dia no calendário acima.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        title={slot.reason}
                        className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200 flex flex-col items-center justify-center ${
                          !slot.available
                            ? 'bg-dark-850/40 text-zinc-600 border border-dark-800 cursor-not-allowed opacity-50 line-through'
                            : isSelected
                            ? 'bg-gold-500 text-dark-950 font-bold border border-gold-400 shadow-gold scale-105 ring-2 ring-gold-400/50'
                            : 'bg-dark-850 text-zinc-200 border border-dark-750 hover:border-gold-500 hover:text-gold-300 hover:bg-dark-800'
                        }`}
                      >
                        <span>{slot.time}</span>
                        {!slot.available && slot.reason && (
                          <span className="text-[9px] text-zinc-600 no-underline truncate max-w-full">
                            {slot.reason === 'Intervalo de Almoço' ? 'Almoço' : 'Ocupado'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ações Passo 3 */}
            <div className="flex items-center justify-between pt-6 border-t border-dark-800">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white bg-dark-800 hover:bg-dark-750 border border-dark-700 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>

              <button
                disabled={!selectedTime}
                onClick={() => setCurrentStep(4)}
                className="btn-gold px-8 py-3.5 rounded-xl font-bold text-dark-950 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-gold"
              >
                <span>Avançar para Seus Dados</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASSO 4: IDENTIFICAÇÃO E RESUMO */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center sm:text-left">
              <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Passo 4 de 4</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                Confirmação e Seus Dados
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Informe seu nome e WhatsApp para garantirmos a sua vaga na barbearia.
              </p>
            </div>

            {/* Card de Resumo do Agendamento */}
            <div className="bg-dark-850 border border-gold-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Resumo do Agendamento
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-xs text-zinc-400 block">Serviço</span>
                  <p className="font-semibold text-white">{selectedService?.name}</p>
                  <span className="text-xs text-gold-400">{formatCurrency(selectedService?.price || 0)}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 block">Barbeiro</span>
                  <p className="font-semibold text-white">{selectedBarber?.name}</p>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 block">Data</span>
                  <p className="font-semibold text-white">{formatDatePtBR(selectedDate)}</p>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 block">Horário</span>
                  <p className="font-semibold text-gold-400 text-lg font-serif">{selectedTime}</p>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Formulário de Identificação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold-400" />
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matheus Oliveira"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gold-400" />
                  WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  value={clientPhone}
                  maxLength={15}
                  onChange={handlePhoneChange}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gold-400" />
                  E-mail (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gold-400" />
                  Observações / Preferências (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Disfarce alto, sobrancelha na navalha..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm transition-colors"
                />
              </div>
            </div>

            {/* Ações Passo 4 */}
            <div className="flex items-center justify-between pt-6 border-t border-dark-800">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white bg-dark-800 hover:bg-dark-750 border border-dark-700 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>

              <button
                disabled={submitting || !clientName.trim() || !clientPhone.trim()}
                onClick={handleConfirmBooking}
                className="btn-gold px-8 py-3.5 rounded-xl font-bold text-dark-950 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-gold text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Confirmando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Concluir Agendamento</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASSO 5: SUCESSO & WHATSAPP */}
        {/* ============================================================ */}
        {currentStep === 5 && createdAppointment && (
          <div className="text-center py-6 space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/40 shadow-xl">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Agendamento Confirmado no Sistema!
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-white">
                Tudo Pronto, {createdAppointment.clientName.split(' ')[0]}!
              </h2>
              <p className="text-zinc-400 text-sm max-w-lg mx-auto">
                Seu horário está reservado. Para agilizar seu atendimento, você pode enviar os detalhes diretamente para o WhatsApp da barbearia.
              </p>
            </div>

            {/* Recibo com Detalhes */}
            <div className="max-w-md mx-auto bg-dark-850 border border-gold-500/30 rounded-2xl p-6 text-left space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-dark-750">
                <span className="text-xs text-zinc-400">Serviço</span>
                <span className="font-semibold text-white text-sm">{createdAppointment.service?.name}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-dark-750">
                <span className="text-xs text-zinc-400">Barbeiro</span>
                <span className="font-semibold text-white text-sm">{createdAppointment.barber?.name}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-dark-750">
                <span className="text-xs text-zinc-400">Data e Horário</span>
                <span className="font-bold text-gold-400 text-sm">
                  {formatDatePtBR(createdAppointment.date)} às {createdAppointment.timeSlot}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-zinc-400">Valor Total</span>
                <span className="font-serif font-black text-gold-gradient text-lg">
                  {formatCurrency(createdAppointment.service?.price || 0)}
                </span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5"
                >
                  <MessageSquare className="w-5 h-5 fill-current" />
                  <span>Enviar Confirmação no WhatsApp</span>
                </a>
              )}

              <button
                onClick={() => router.push('/meus-agendamentos')}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-dark-800 hover:bg-dark-750 text-zinc-200 border border-dark-700 font-semibold text-sm transition-colors"
              >
                Ver Meus Agendamentos
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
