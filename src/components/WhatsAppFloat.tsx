'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

export default function WhatsAppFloat() {
  const [whatsapp, setWhatsapp] = useState('5531991985648');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.whatsapp) {
          const clean = String(data.settings.whatsapp).replace(/\D/g, '');
          if (clean) setWhatsapp(clean);
        }
      })
      .catch(() => {});
  }, []);

  const text = encodeURIComponent('Olá Mazzoni Barbershop! Gostaria de tirar uma dúvida sobre serviços ou horários.');

  return (
    <aside aria-label="Suporte WhatsApp" className="fixed bottom-6 right-6 z-50 group">
      <a
        href={`https://wa.me/${whatsapp}?text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3.5 rounded-full shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 transform group-hover:scale-105"
        aria-label="Falar no WhatsApp da Mazzoni Barbershop"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageSquare className="w-5 h-5 fill-current" />
        <span className="font-semibold text-sm hidden sm:inline-block">Dúvidas? WhatsApp</span>
      </a>
    </aside>
  );
}
