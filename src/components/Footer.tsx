'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Scissors, MapPin, Phone, Clock, MessageSquare, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const [settings, setSettings] = useState({
    address: 'Rua VP-2 2993',
    phone: '(31) 99198-5648',
    whatsapp: '5531991985648',
    instagram: 'https://www.instagram.com/mazzoni_barbers/',
    hoursWeekday: '09:00 às 20:00',
    hoursSaturday: '09:00 às 19:00',
    hoursSunday: 'Fechado',
    footerAbout: 'Tradição, estilo e sofisticação no coração da cidade. Especialistas em visagismo masculino, cortes clássicos e modernos, tratamentos de barba e pigmentação de alta definição.',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings((prev) => ({
            ...prev,
            address: data.settings.address || prev.address,
            phone: data.settings.phone || prev.phone,
            whatsapp: data.settings.whatsapp || prev.whatsapp,
            instagram: data.settings.instagram || prev.instagram,
            hoursWeekday: data.settings.hoursWeekday || prev.hoursWeekday,
            hoursSaturday: data.settings.hoursSaturday || prev.hoursSaturday,
            hoursSunday: data.settings.hoursSunday || prev.hoursSunday,
            footerAbout: data.settings.footerAbout || prev.footerAbout,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const instagramHref = settings.instagram?.startsWith('http')
    ? settings.instagram
    : `https://instagram.com/${settings.instagram?.replace('@', '')}`;

  const cleanPhone = settings.phone?.replace(/\D/g, '') || '';
  const cleanWhatsapp = settings.whatsapp?.replace(/\D/g, '') || '5531991985648';

  return (
    <footer className="bg-dark-950 border-t border-dark-800 text-zinc-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Coluna 1: Sobre a Barbearia */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-dark-950 transform -rotate-45" />
              </div>
              <span className="text-xl font-serif font-black text-gold-gradient uppercase">
                Mazzoni Barbershop
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {settings.footerAbout}
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href={`https://wa.me/${cleanWhatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-dark-850 flex items-center justify-center text-zinc-300 hover:text-emerald-400 hover:bg-dark-800 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href={instagramHref}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-dark-850 flex items-center justify-center text-zinc-300 hover:text-pink-400 hover:bg-dark-800 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-dark-850 flex items-center justify-center text-zinc-300 hover:text-blue-400 hover:bg-dark-800 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div className="space-y-4">
            <h4 className="text-white font-serif font-semibold text-lg border-l-2 border-gold-500 pl-3">
              Links Rápidos
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-gold-400 transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/#servicos" className="hover:text-gold-400 transition-colors">
                  Catálogo de Serviços
                </Link>
              </li>
              <li>
                <Link href="/agendar" className="hover:text-gold-400 transition-colors font-medium text-gold-300">
                  Agendar um Horário
                </Link>
              </li>
              <li>
                <Link href="/meus-agendamentos" className="hover:text-gold-400 transition-colors">
                  Meus Agendamentos
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-gold-400 transition-colors">
                  Acesso Administrativo / Barbeiro
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Horários de Atendimento */}
          <div className="space-y-4">
            <h4 className="text-white font-serif font-semibold text-lg border-l-2 border-gold-500 pl-3">
              Horário de Atendimento
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-zinc-200 font-medium">Segunda a Sexta:</p>
                  <p className="text-zinc-400">{settings.hoursWeekday}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-zinc-200 font-medium">Sábado:</p>
                  <p className="text-zinc-400">{settings.hoursSaturday}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-zinc-400 font-medium">Domingo:</p>
                  <p className={settings.hoursSunday.toLowerCase().includes('fechado') ? 'text-red-400' : 'text-zinc-400'}>
                    {settings.hoursSunday}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 4: Onde Estamos */}
          <div className="space-y-4">
            <h4 className="text-white font-serif font-semibold text-lg border-l-2 border-gold-500 pl-3">
              Contato e Localização
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                <p className="text-zinc-300">
                  {settings.address}
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                <a
                  href={`tel:${cleanPhone}`}
                  className="text-zinc-300 hover:text-gold-400 transition-colors"
                >
                  {settings.phone}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Linha de Copyright */}
        <div className="border-t border-dark-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Mazzoni Barbershop. Todos os direitos reservados.</p>
          <p className="text-zinc-400">
            Sistema de Agendamento Profissional com Notificação WhatsApp
          </p>
        </div>
      </div>
    </footer>
  );
}
