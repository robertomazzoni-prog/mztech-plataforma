import React from 'react';
import Link from 'next/link';
import { Clock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { ServiceItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ServiceCardProps {
  service: ServiceItem;
  onSelect?: (service: ServiceItem) => void;
  selected?: boolean;
}

export default function ServiceCard({ service, onSelect, selected = false }: ServiceCardProps) {
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'CORTE':
        return 'Corte de Cabelo';
      case 'BARBA':
        return 'Barba & Barbaterapia';
      case 'PIGMENTACAO':
        return 'Pigmentação HD';
      case 'COMBO':
        return 'Combo Especial';
      default:
        return 'Tratamento';
    }
  };

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden bg-dark-900 border transition-all duration-300 flex flex-col ${
        selected
          ? 'border-gold-500 shadow-gold-lg ring-1 ring-gold-500 scale-[1.02]'
          : 'border-dark-750 hover:border-gold-500/50 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {/* Imagem com Overlay */}
      <div className="relative h-48 w-full overflow-hidden bg-dark-800">
        <img
          src={
            service.imageUrl ||
            'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop'
          }
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

        {/* Badges de Topo */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-dark-950/80 backdrop-blur-md text-gold-300 border border-gold-500/20">
            {getCategoryLabel(service.category)}
          </span>

          {service.popular && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-dark-950 shadow-md">
              <Sparkles className="w-3 h-3" />
              Destaque
            </span>
          )}
        </div>

        {/* Duração & Preço Sobreposto */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-300 bg-dark-950/70 backdrop-blur-md px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-gold-400" />
            <span>{service.durationMinutes} min</span>
          </div>

          <div className="text-right bg-dark-950/80 backdrop-blur-md px-3 py-1 rounded-md border border-gold-500/30">
            <span className="text-lg font-bold text-gold-gradient font-serif">
              {formatCurrency(service.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-lg text-white group-hover:text-gold-300 transition-colors">
            {service.name}
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed line-clamp-2">
            {service.description}
          </p>
        </div>

        {/* Ação */}
        <div>
          {onSelect ? (
            <button
              onClick={() => onSelect(service)}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                selected
                  ? 'bg-gold-500 text-dark-950 shadow-gold'
                  : 'bg-dark-800 text-zinc-200 hover:bg-gold-500 hover:text-dark-950 border border-dark-700 hover:border-gold-500'
              }`}
            >
              {selected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-dark-950" />
                  Serviço Selecionado
                </>
              ) : (
                'Selecionar Serviço'
              )}
            </button>
          ) : (
            <Link
              href={`/agendar?serviceId=${service.id}`}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-dark-800 text-zinc-200 hover:bg-gold-500 hover:text-dark-950 border border-dark-700 hover:border-gold-500 transition-all duration-200 group/btn"
            >
              <span>Agendar Agora</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
