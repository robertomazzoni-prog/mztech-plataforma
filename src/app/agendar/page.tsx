'use client';

import React, { Suspense } from 'react';
import BookingWizard from '@/components/BookingWizard';
import { Scissors, Loader2 } from 'lucide-react';
import BarbershopLayout from '@/components/BarbershopLayout';

export default function AgendarPage() {
  return (
    <BarbershopLayout>
      <div className="min-h-[85vh] bg-dark-950 py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold uppercase tracking-wider">
              <Scissors className="w-3.5 h-3.5" />
              Agendamento Rápido & Seguro
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-black text-white uppercase tracking-tight">
              Reserve seu Horário na <span className="text-gold-gradient">Mazzoni</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
              Siga os passos abaixo para escolher o seu serviço, barbeiro de preferência, data e horário ideal.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                <p className="text-sm text-zinc-400">Carregando sistema de agendamento...</p>
              </div>
            }
          >
            <BookingWizard />
          </Suspense>
        </div>
      </div>
    </BarbershopLayout>
  );
}
