'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Building,
  CreditCard,
  ShieldCheck,
  Calendar,
  Check,
  Layers,
  ArrowUpRight,
  ExternalLink,
  Phone,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { formatCurrency, formatDatePtBR } from '@/lib/utils';
import { MzDashboardMetrics, MzQuoteItem } from '@/types/mztech';

export default function MzTechDashboardPage() {
  const [metrics, setMetrics] = useState<MzDashboardMetrics | null>(null);
  const [pendingQuotes, setPendingQuotes] = useState<MzQuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setRefreshing(true);
      const [dashRes, quotesRes] = await Promise.all([
        fetch('/api/mztech/dashboard'),
        fetch('/api/mztech/quotes?status=AGUARDANDO_ANALISE'),
      ]);

      if (dashRes.ok) {
        const d = await dashRes.json();
        setMetrics(d);
      }
      if (quotesRes.ok) {
        const q = await quotesRes.json();
        setPendingQuotes(q.quotes || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleQuickApprove = async (quoteId: string, devName: string = 'Roberto') => {
    if (!confirm('Aprovar este orçamento e gerar contrato/cobrança automaticamente?')) return;
    setApprovingId(quoteId);
    try {
      const res = await fetch(`/api/mztech/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE', adminName: devName }),
      });
      if (res.ok) {
        const d = await res.json();
        setSuccessToast(`Orçamento aprovado! Contrato ${d.contract?.contractNumber || ''} gerado.`);
        loadDashboard();
        setTimeout(() => setSuccessToast(null), 5000);
      }
    } catch (err) {
      alert('Erro ao aprovar orçamento.');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Visão Geral & Indicadores mzTech</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhamento em tempo real de vendas, contratos, fluxo financeiro e projetos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboard}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Atualizar Indicadores"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/mztech/orcamentos"
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Ver Fila de Orçamentos</span>
          </Link>
        </div>
      </div>

      {successToast && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI Primary Metrics Strip (6 Indicadores Centrais) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <Link
          href="/admin/mztech/orcamentos"
          className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all block group"
        >
          <span className="text-[10px] uppercase font-mono font-medium text-slate-400 block">
            Orçamentos Pendentes
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {metrics?.pendingQuotesCount || 0}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </div>
          <span className="text-[10px] text-slate-500">Aguardando análise</span>
        </Link>

        <Link
          href="/admin/mztech/contratos"
          className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all block group"
        >
          <span className="text-[10px] uppercase font-mono font-medium text-slate-400 block">
            Contratos Ativos
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {metrics?.activeContractsCount || 0}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </div>
          <span className="text-[10px] text-slate-500">Com vigência regular</span>
        </Link>

        <Link
          href="/admin/mztech/financeiro"
          className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all block group"
        >
          <span className="text-[10px] uppercase font-mono font-medium text-slate-400 block">
            Pagamentos Pendentes
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {metrics?.pendingPaymentsCount || 0}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
          </div>
          <span className="text-[10px] text-slate-500">Aguardando gateway</span>
        </Link>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono font-medium text-slate-400 block">
            Receita Inicial Aprovada
          </span>
          <span className="text-lg font-bold font-mono text-white mt-1 block">
            {formatCurrency(metrics?.initialRevenueApproved || 0)}
          </span>
          <span className="text-[10px] text-slate-500">Desenvolvimento aprovado</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono font-medium text-slate-400 block">
            Receita Recorrente (MRR)
          </span>
          <span className="text-lg font-bold font-mono text-cyan-400 mt-1 block">
            {formatCurrency(metrics?.monthlyRecurringRevenue ?? 0)}/mês
          </span>
          <span className="text-[10px] text-slate-500">Hospedagens & Manutenções</span>
        </div>

        <Link
          href="/admin/mztech/clientes"
          className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all block group"
        >
          <span className="text-[10px] uppercase font-mono font-medium text-slate-400 block">
            Clientes Ativos
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {metrics?.activeClients || 0}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
          </div>
          <span className="text-[10px] text-slate-500">{metrics?.totalClients || 0} cadastrados</span>
        </Link>

      </div>

      {/* Seção Central: Orçamentos em Aberto + Linha do Tempo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Orçamentos Aguardando Análise (2 Colunas) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Orçamentos Aguardando Análise</h2>
              {pendingQuotes.length > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold">
                  {pendingQuotes.length} novos
                </span>
              )}
            </div>
            <Link
              href="/admin/mztech/orcamentos"
              className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingQuotes.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">Nenhum orçamento pendente de análise!</p>
              <p className="text-[11px] text-slate-500">Todas as propostas recebidas já foram analisadas ou aprovadas.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800/60 overflow-hidden">
              {pendingQuotes.slice(0, 5).map((q) => (
                <div key={q.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-cyan-400 font-bold">{q.quoteNumber || `#${q.id.substring(0, 8)}`}</span>
                      <strong className="text-xs text-white">{q.name}</strong>
                      {q.company && <span className="text-[11px] text-slate-400">({q.company})</span>}
                      {q.selectedDev && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {q.selectedDev}
                        </span>
                      )}
                    </div>

                    {/* Dados de Contato Direto do Cliente (WhatsApp e Email) */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {q.whatsapp && (
                        <a
                          href={`https://wa.me/55${q.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono font-medium hover:underline"
                          title="Conversar no WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{q.whatsapp}</span>
                        </a>
                      )}

                      {q.email && (
                        <a
                          href={`mailto:${q.email}`}
                          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 truncate max-w-[200px]"
                          title="Enviar E-mail"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{q.email}</span>
                        </a>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="text-slate-300">{q.projectType}</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-mono font-semibold text-emerald-400">
                        {q.finalPrice > 0 ? formatCurrency(q.finalPrice) : (q.initialDevPrice > 0 ? formatCurrency(q.initialDevPrice) : 'A Definir')}
                      </span>
                      {q.monthlyPrice > 0 && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="font-mono text-cyan-400">{formatCurrency(q.monthlyPrice)}/mês</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {q.whatsapp && (
                      <a
                        href={`https://wa.me/55${q.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Abrir WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}
                    <Link
                      href="/admin/mztech/orcamentos"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      Detalhes
                    </Link>
                    <button
                      onClick={() => handleQuickApprove(q.id, q.selectedDev || 'Roberto')}
                      disabled={approvingId === q.id}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all hover:scale-[1.02]"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Aceitar Serviço</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Próximas Cobranças Recorrentes */}
          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Próximas Cobranças & Recorrências</h2>
              <Link
                href="/admin/mztech/financeiro"
                className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Painel Financeiro</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3 font-semibold">Cliente</th>
                    <th className="py-2.5 px-3 font-semibold">Valor</th>
                    <th className="py-2.5 px-3 font-semibold">Vencimento</th>
                    <th className="py-2.5 px-3 font-semibold">Método</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {(!metrics?.upcomingBillings || metrics.upcomingBillings.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        Nenhuma cobrança agendada no momento.
                      </td>
                    </tr>
                  ) : (
                    metrics.upcomingBillings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-white">{b.clientName}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-cyan-400">
                          {formatCurrency(b.amount)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {formatDatePtBR(b.dueDate)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {b.paymentMethod === 'PIX' ? 'PIX' : 'Cartão'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Pendente
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Linha do Tempo de Atividades Recentes (Auditoria) */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Linha do Tempo de Atividades</span>
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5">
            {(!metrics?.recentActivities || metrics.recentActivities.length === 0) ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhuma atividade registrada recentemente.</p>
            ) : (
              metrics.recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs pb-3 border-b border-slate-800/60 last:border-0 last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <div className="space-y-0.5 flex-1">
                    <p className="text-slate-200 leading-snug">
                      {act.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>{act.actor}</span>
                      <span>•</span>
                      <span>{formatDatePtBR(act.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Card Resumo de Infraestrutura */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Status da Infraestrutura</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">100% ONLINE</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Railway Cloud Multi-Container com sincronização contínua e backups com retenção de 30 dias.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
