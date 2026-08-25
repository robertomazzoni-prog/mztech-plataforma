import React from 'react';
import Link from 'next/link';
import {
  Scissors,
  Sparkles,
  Clock,
  ShieldCheck,
  Star,
  Coffee,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Phone,
  Calendar,
  Instagram,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import { ensureDatabaseReady } from '@/lib/init-db';
import ServiceCard from '@/components/ServiceCard';
import BarbershopLayout from '@/components/BarbershopLayout';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getHomeData() {
  try {
    await ensureDatabaseReady();
    const [services, barbers, settingsRows]: [any, any, any] = await Promise.all([
      prisma.service.findMany({
        where: { active: true },
        orderBy: [{ popular: 'desc' }, { price: 'asc' }],
      }),
      prisma.barber.findMany({
        where: { active: true },
      }),
      prisma.$queryRawUnsafe(`SELECT * FROM "SiteSetting" WHERE "id" = 'main-settings' LIMIT 1`).catch(() => []),
    ]);

    const defaultSettings = {
      heroBadge: 'Mazzoni Barbershop • Estilo & Precisão',
      heroTitle: 'ELEVE SEU ESTILO AO NÍVEL MÁXIMO',
      heroSubtitle: 'Especialistas em Cortes Modernos, Barba Alinhada e Pigmentação de Alta Definição.',
      stat1Number: '10k+',
      stat1Label: 'Cortes Realizados',
      stat2Number: 'Premium',
      stat2Label: 'Experiência Única',
      stat3Number: '100%',
      stat3Label: 'Pontualidade',
      stat4Number: 'Online',
      stat4Label: 'Agendamento 24h',
      comfortTitle: 'Conforto & Cortesia',
      comfortText: 'Ambiente climatizado e café cortesia em um espaço moderno pensado para o seu conforto.',
      address: 'Rua VP-2 2993',
      phone: '31991985648',
      whatsapp: '5531991985648',
      instagram: 'https://www.instagram.com/mazzoni_barbers/',
      diffTitle: 'Mais que um corte, uma experiência exclusiva',
      diffSubtitle: 'Por que escolher a Mazzoni?',
      diff1Title: 'Visagismo Personalizado',
      diff1Text: 'Analisamos a geometria do seu rosto e o tipo de cabelo para criar um corte sob medida que valorize seus traços.',
      diff2Title: 'Pigmentação de Alta Definição',
      diff2Text: 'Preenchimento de falhas de barba e acabamento degradê impecável com produtos hipoalergênicos e longa durabilidade.',
      diff3Title: 'Conforto & Cortesia',
      diff3Text: 'Ambiente climatizado e café cortesia em um espaço moderno pensado para o seu conforto.',
      hoursWeekday: '09:00 às 20:00',
      hoursSaturday: '09:00 às 19:00',
      hoursSunday: 'Fechado',
      footerAbout: 'Tradição, estilo e sofisticação no coração da cidade. Especialistas em visagismo masculino, cortes clássicos e modernos, tratamentos de barba e pigmentação de alta definição.',
      ctaTitle: 'Pronto para Renovar o Visual?',
      ctaSubtitle: 'Garanta seu horário com poucos cliques. Escolha o serviço, selecione seu barbeiro e receba a confirmação instantânea no seu WhatsApp.',
    };

    const settings = settingsRows && settingsRows.length > 0 ? { ...defaultSettings, ...settingsRows[0] } : defaultSettings;

    return { services, barbers, settings };
  } catch (err) {
    return {
      services: [],
      barbers: [],
      settings: {
        heroBadge: 'Mazzoni Barbershop • Estilo & Precisão',
        heroTitle: 'ELEVE SEU ESTILO AO NÍVEL MÁXIMO',
        heroSubtitle: 'Especialistas em Cortes Modernos, Barba Alinhada e Pigmentação de Alta Definição.',
        stat1Number: '10k+',
        stat1Label: 'Cortes Realizados',
        stat2Number: 'Premium',
        stat2Label: 'Experiência Única',
        stat3Number: '100%',
        stat3Label: 'Pontualidade',
        stat4Number: 'Online',
        stat4Label: 'Agendamento 24h',
        comfortTitle: 'Conforto & Cortesia',
        comfortText: 'Ambiente climatizado e café cortesia em um espaço moderno pensado para o seu conforto.',
        address: 'Rua VP-2 2993',
        phone: '31991985648',
        whatsapp: '5531991985648',
        instagram: 'https://www.instagram.com/mazzoni_barbers/',
        diffTitle: 'Mais que um corte, uma experiência exclusiva',
        diffSubtitle: 'Por que escolher a Mazzoni?',
        diff1Title: 'Visagismo Personalizado',
        diff1Text: 'Analisamos a geometria do seu rosto e o tipo de cabelo para criar um corte sob medida que valorize seus traços.',
        diff2Title: 'Pigmentação de Alta Definição',
        diff2Text: 'Preenchimento de falhas de barba e acabamento degradê impecável com produtos hipoalergênicos e longa durabilidade.',
        diff3Title: 'Conforto & Cortesia',
        diff3Text: 'Ambiente climatizado e café cortesia em um espaço moderno pensado para o seu conforto.',
        hoursWeekday: '09:00 às 20:00',
        hoursSaturday: '09:00 às 19:00',
        hoursSunday: 'Fechado',
        footerAbout: 'Tradição, estilo e sofisticação no coração da cidade.',
        ctaTitle: 'Pronto para Renovar o Visual?',
        ctaSubtitle: 'Garanta seu horário com poucos cliques.',
      },
    };
  }
}

export default async function BarbeariaPage() {
  const { services, barbers, settings } = await getHomeData();

  return (
    <BarbershopLayout>
      <div className="flex flex-col min-h-screen">
        
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-dark-950">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&h=1080&fit=crop"
              alt="Mazzoni Barbershop Interior"
              className="w-full h-full object-cover opacity-25 filter brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-dark-950/40" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-900/80 border border-gold-500/30 text-gold-300 text-xs sm:text-sm font-semibold tracking-wide shadow-gold mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>{settings.heroBadge}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-white uppercase leading-tight mb-6">
              {settings.heroTitle}
            </h1>

            <p className="text-zinc-300 text-base sm:text-xl max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
              {settings.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/agendar"
                className="btn-gold w-full sm:w-auto px-8 py-4 rounded-xl text-dark-950 font-bold text-base flex items-center justify-center gap-3 shadow-gold-lg hover:scale-105 transition-transform"
              >
                <Calendar className="w-5 h-5" />
                <span>Agendar Meu Horário</span>
              </Link>

              <Link
                href="#servicos"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-dark-900/80 hover:bg-dark-800 text-zinc-200 border border-gold-500/30 hover:border-gold-400 font-semibold text-base flex items-center justify-center gap-2 transition-colors"
              >
                <span>Ver Serviços & Preços</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 border-t border-dark-800/80 mt-16 max-w-4xl mx-auto">
              <div>
                <p className="text-2xl sm:text-3xl font-serif font-black text-gold-400">{settings.stat1Number}</p>
                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-medium">{settings.stat1Label}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-serif font-black text-gold-400">{settings.stat2Number}</p>
                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-medium">{settings.stat2Label}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-serif font-black text-gold-400">{settings.stat3Number}</p>
                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-medium">{settings.stat3Label}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-serif font-black text-gold-400">{settings.stat4Number}</p>
                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-medium">{settings.stat4Label}</p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO DE DIFERENCIAIS */}
        <section className="py-20 bg-dark-900 border-y border-dark-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                {settings.diffSubtitle}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-2">
                {settings.diffTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-dark-850 border border-dark-750 hover:border-gold-500/40 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-6 group-hover:bg-gold-500 group-hover:text-dark-950 transition-colors">
                  <Scissors className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-3">{settings.diff1Title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{settings.diff1Text}</p>
              </div>

              <div className="p-8 rounded-2xl bg-dark-850 border border-dark-750 hover:border-gold-500/40 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-6 group-hover:bg-gold-500 group-hover:text-dark-950 transition-colors">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-3">{settings.diff2Title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{settings.diff2Text}</p>
              </div>

              <div className="p-8 rounded-2xl bg-dark-850 border border-dark-750 hover:border-gold-500/40 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-6 group-hover:bg-gold-500 group-hover:text-dark-950 transition-colors">
                  <Coffee className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-3">{settings.diff3Title || settings.comfortTitle}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{settings.diff3Text || settings.comfortText}</p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO DE SERVIÇOS & PREÇOS */}
        <section id="servicos" className="py-24 bg-dark-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                  Menu de Atendimentos
                </span>
                <h2 className="text-3xl sm:text-5xl font-serif font-black text-white mt-2">
                  Nossos Serviços & Valores
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-xl">
                  Escolha o serviço desejado e clique para agendar instantaneamente no melhor horário para você.
                </p>
              </div>

              <Link
                href="/agendar"
                className="btn-gold px-6 py-3.5 rounded-xl font-bold text-dark-950 text-sm flex items-center gap-2 self-start md:self-auto shadow-md"
              >
                <span>Ir para Agendamento</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service: any) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>

        {/* SEÇÃO DOS BARBEIROS */}
        <section id="equipe" className="py-24 bg-dark-900 border-t border-dark-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                Profissionais Especialistas
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-2">
                Conheça Nossos Mestres Barbeiros
              </h2>
              <p className="text-zinc-400 text-sm mt-2">
                Equipe altamente treinada e dedicada a entregar a mais alta precisão em cada corte.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {barbers.map((barber: any) => (
                <div
                  key={barber.id}
                  className="bg-dark-850 border border-dark-750 rounded-3xl p-6 flex flex-col items-center text-center hover:border-gold-500/40 transition-all duration-300"
                >
                  <div className="relative mb-6">
                    <img
                      src={
                        barber.avatarUrl ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop'
                      }
                      alt={barber.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gold-500/30 shadow-xl"
                    />
                    <div className="absolute bottom-1 right-2 bg-gold-500 text-dark-950 p-1.5 rounded-full shadow-md">
                      <Scissors className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-xl text-white">{barber.name}</h3>
                  <span className="text-xs text-gold-400 font-semibold uppercase tracking-wider mt-1">
                    Mestre Barbeiro
                  </span>

                  <p className="text-xs text-zinc-400 mt-4 leading-relaxed line-clamp-3">
                    {barber.bio}
                  </p>

                  {barber.specialties && (
                    <div className="mt-6 pt-4 border-t border-dark-750 w-full">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
                        Especialidades
                      </span>
                      <span className="text-xs text-zinc-300 font-medium">{barber.specialties}</span>
                    </div>
                  )}

                  <Link
                    href="/agendar"
                    className="mt-6 w-full py-2.5 rounded-xl bg-dark-800 hover:bg-gold-500 hover:text-dark-950 text-zinc-300 font-semibold text-xs border border-dark-700 transition-all"
                  >
                    Agendar com {barber.name.split(' ')[0]}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BANNER FINAL CTA */}
        <section className="py-20 bg-gradient-to-b from-dark-900 to-dark-950 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <div className="inline-block p-4 rounded-3xl bg-dark-850 border border-gold-500/40 shadow-2xl space-y-6 sm:p-12">
              <h2 className="text-3xl sm:text-5xl font-serif font-black text-white">
                {settings.ctaTitle}
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base max-w-xl mx-auto">
                {settings.ctaSubtitle}
              </p>
              <div className="pt-2">
                <Link
                  href="/agendar"
                  className="btn-gold inline-flex items-center gap-3 px-10 py-4 rounded-xl text-dark-950 font-bold text-base shadow-gold-lg hover:scale-105 transition-transform"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Agendar Horário Agora</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </BarbershopLayout>
  );
}
