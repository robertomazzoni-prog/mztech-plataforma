'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Terminal,
  FolderGit2,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone,
  Mail,
  MessageSquare,
  QrCode,
  CreditCard,
  Copy,
  Check,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  User,
  ArrowRight,
  Plus,
  X,
  Play,
  Calendar,
  LogOut,
} from 'lucide-react';
import { formatCurrency, formatDatePtBR } from '@/lib/utils';
import { MzClientItem, MzProjectItem, MzQuoteItem } from '@/types/mztech';

export default function ClientPortalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);
  const [selectedClientEmail, setSelectedClientEmail] = useState<string>('');

  // Modais de Pagamento
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const loadClientData = async (email?: string) => {
    try {
      setLoading(true);
      const url = email
        ? `/api/mztech/client-portal?email=${encodeURIComponent(email)}`
        : '/api/mztech/client-portal';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setClientData(data);
        if (data.client?.email) {
          setSelectedClientEmail(data.client.email);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados da conta do cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let savedEmail = undefined;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mztech_client_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          savedEmail = parsed.email;
        } catch (e) {}
      }
    }
    loadClientData(savedEmail);
  }, []);

  const handleLogout = async () => {
    if (!confirm('Deseja realmente encerrar a sessão da sua Área do Cliente?')) return;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mztech_client_session');
    }
    router.push('/cliente/login');
  };

  const handleSwitchAccount = (email: string) => {
    setSelectedClientEmail(email);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mztech_client_session', JSON.stringify({ email }));
    }
    loadClientData(email);
  };

  const handleOpenPixModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPixModalOpen(true);
    setPaymentSuccess(false);
    setPixCopied(false);
  };

  const handleCopyPix = () => {
    if (selectedInvoice?.pixQrCodeText) {
      navigator.clipboard.writeText(selectedInvoice.pixQrCodeText);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2500);
    }
  };

  const handleSimulatePayment = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      if (selectedInvoice) {
        setClientData((prev: any) => {
          if (!prev) return prev;
          const updatedInvoices = prev.invoices.map((inv: any) =>
            inv.id === selectedInvoice.id
              ? { ...inv, status: 'PAID', paidAt: new Date().toISOString() }
              : inv
          );
          return {
            ...prev,
            client: { ...prev.client, financialStatus: 'EM_DIA' },
            invoices: updatedInvoices,
          };
        });
      }
      setTimeout(() => {
        setPixModalOpen(false);
        setCardModalOpen(false);
        setPaymentSuccess(false);
      }, 1200);
    }, 1000);
  };

  if (loading && !clientData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Carregando sua Área do Cliente mzTech...</p>
        </div>
      </div>
    );
  }

  const client: MzClientItem = clientData?.client;
  const projects: MzProjectItem[] = clientData?.projects || [];
  const quotes: MzQuoteItem[] = clientData?.quotes || [];
  const invoices = clientData?.invoices || [];
  const availableClients = clientData?.availableClients || [];

  if (!loading && !client) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 pb-20">
        <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  mz<span className="text-cyan-400">Tech</span>
                </span>
                <span className="block text-[10px] uppercase font-bold text-cyan-400 font-mono tracking-wider">
                  Área do Cliente
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/cliente/login"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <span>Fazer Login</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 pt-16 text-center space-y-6">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Nenhum cliente cadastrado no momento</h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Para registrar seu projeto e acessar o portal do cliente, envie uma solicitação de orçamento no site oficial ou faça login com sua conta cadastrada.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/#orcamento"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Solicitar Orçamento Agora</span>
              </Link>
              <Link
                href="/cliente/login"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
              >
                <span>Entrar com E-mail Cadastrado</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const pendingInvoices = invoices.filter((inv: any) => inv.status === 'PENDING');
  const paidInvoices = invoices.filter((inv: any) => inv.status === 'PAID');

  const devAssigned = client?.notes?.includes('Morvan')
    ? 'Morvan'
    : 'Roberto';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 pb-20">
      
      {/* Top Navbar do Portal do Cliente */}
      <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  mz<span className="text-cyan-400">Tech</span>
                </span>
                <span className="block text-[10px] uppercase font-bold text-cyan-400 font-mono tracking-wider">
                  Área do Cliente
                </span>
              </div>
            </Link>
          </div>

          {/* Seletor de Conta / Perfil do Cliente */}
          <div className="flex items-center gap-3">
            {availableClients.length > 1 && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedClientEmail}
                  onChange={(e) => handleSwitchAccount(e.target.value)}
                  className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
                >
                  {availableClients.map((c: any) => (
                    <option key={c.id} value={c.email} className="bg-slate-900 text-white">
                      {c.companyName || c.contactName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Link
              href="/#orcamento"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Solicitar Novo Projeto</span>
            </Link>

            <Link
              href="/admin"
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold transition-colors"
              title="Acesso Administrativo mzTech OPS"
            >
              OPS Admin
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Encerrar Sessão e Fazer Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Banner de Boas-Vindas & Ficha do Cliente */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Painel do Cliente mzTech • Conta Ativa
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Olá, {client?.contactName || 'Cliente'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Empresa vinculada: <strong className="text-white">{client?.companyName}</strong> • Acompanhe seus projetos, faturas e orçamentos em tempo real.
              </p>
            </div>

            {/* Card do Sócio Responsável (Roberto & Morvan) */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-4 min-w-[280px]">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-lg">
                {devAssigned === 'Morvan' ? 'M' : 'R'}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400">Seu Desenvolvedor Dedicado:</p>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{devAssigned}</span>
                  <span className="text-[10px] font-mono font-normal text-cyan-400">(Sócio mzTech)</span>
                </p>
                <a
                  href={`https://wa.me/55${client?.whatsapp?.replace(/\D/g, '') || '31999999999'}?text=${encodeURIComponent(`Olá ${devAssigned}! Estou no meu Portal do Cliente mzTech e gostaria de tirar uma dúvida.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline mt-0.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Falar com {devAssigned} no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 1. SEÇÃO DE FATURAS & COBRANÇAS (COM ALERTA DE VENCIMENTO) */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Controle Financeiro & Faturas</span>
            </h2>
            <span className="text-xs text-slate-400">
              Situação da Conta:{' '}
              <strong className={client?.financialStatus === 'EM_DIA' ? 'text-emerald-400' : 'text-amber-400'}>
                {client?.financialStatus === 'EM_DIA' ? '🟢 EM DIA' : '🟡 FATURA PENDENTE'}
              </strong>
            </span>
          </div>

          {/* Destaque de Faturas Prestes a Vencer */}
          {pendingInvoices.length > 0 ? (
            <div className="space-y-3">
              {pendingInvoices.map((inv: any) => (
                <div
                  key={inv.id}
                  className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Fatura Prestes a Vencer • Vencimento em {inv.daysUntilDue} dias ({formatDatePtBR(inv.dueDate)})</span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{inv.title}</h3>
                    <p className="text-xs text-slate-400">
                      Plano contratado: <strong className="text-slate-300">{inv.planName}</strong>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="text-right sm:text-right">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">Valor da Fatura</span>
                      <p className="text-3xl font-black text-white font-mono text-emerald-400">
                        {formatCurrency(inv.amount)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPixModal(inv)}
                        className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Pagar com Pix</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setCardModalOpen(true);
                        }}
                        className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
                      >
                        <CreditCard className="w-4 h-4 text-cyan-400" />
                        <span>Cartão</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Sua conta está 100% em dia!</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Não há faturas pendentes ou vencidas neste momento. Todos os seus serviços e hospedagens estão operando normalmente.
                </p>
              </div>
            </div>
          )}

          {/* Histórico de Faturas Pagas */}
          {paidInvoices.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Histórico de Faturas Pagas
              </h4>
              <div className="space-y-2">
                {paidInvoices.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-white">{inv.title}</p>
                      <p className="text-slate-400 text-[11px]">
                        Vencimento: {formatDatePtBR(inv.dueDate)} • Pago via Pix
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white">{formatCurrency(inv.amount)}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Pago</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 2. SEÇÃO: MEUS PROJETOS & STATUS EM TEMPO REAL */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <FolderGit2 className="w-5 h-5 text-cyan-400" />
              <span>Meus Projetos & Sistemas em Andamento</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Total de Projetos: <strong className="text-white">{projects.length}</strong>
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">Nenhum projeto ativo cadastrado no momento.</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Assim que sua proposta for finalizada com Roberto ou Morvan, o projeto aparecerá aqui com monitoramento online.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((proj) => {
                const isProduction = proj.status === 'PRODUCAO';
                return (
                  <div
                    key={proj.id}
                    className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-6 space-y-4 transition-all shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          {proj.type}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1">{proj.name}</h3>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                          isProduction
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse'
                        }`}
                      >
                        {isProduction ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>Em Produção</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            <span>Em Desenvolvimento</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs space-y-2 text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Infraestrutura:</span>
                        <span className="font-semibold text-white flex items-center gap-1">
                          <Server className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{proj.hostingPlatform || 'Railway Cloud'}</span>
                        </span>
                      </div>

                      {proj.domain && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Domínio Oficial:</span>
                          <span className="font-mono text-cyan-300">{proj.domain}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Backups Gerenciados:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Ativo (Retenção 30 dias)</span>
                        </span>
                      </div>
                    </div>

                    {proj.notes && (
                      <p className="text-xs text-slate-400 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                        "{proj.notes}"
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      {proj.hostingUrl ? (
                        <a
                          href={proj.hostingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-2 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Acessar Projeto Online</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">Deploy em andamento</span>
                      )}

                      <a
                        href={`https://wa.me/55${client?.whatsapp?.replace(/\D/g, '') || '31999999999'}?text=${encodeURIComponent(`Olá! Gostaria de falar sobre o projeto "${proj.name}".`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-cyan-300 underline"
                      >
                        Suporte do Projeto
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 3. SEÇÃO: MINHAS SOLICITAÇÕES DE ORÇAMENTO */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Minhas Solicitações de Orçamento</span>
            </h2>
            <Link
              href="/#orcamento"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline flex items-center gap-1"
            >
              <span>+ Solicitar Outro Orçamento</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {quotes.length === 0 ? (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <p className="text-sm font-bold text-white">Nenhum orçamento pendente.</p>
              <p className="text-xs text-slate-400">
                Você pode solicitar um novo site institucional, sistema sob medida ou landing page a qualquer momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotes.map((q) => (
                <div
                  key={q.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white text-base">{q.projectType}</h4>
                      <p className="text-xs text-slate-400">
                        Desenvolvedor Escolhido:{' '}
                        <strong className="text-cyan-300">{q.selectedDev}</strong>
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${
                        q.status === 'NOVO'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : q.status === 'EM_ANDAMENTO'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : q.status === 'CONCLUIDO'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {q.status === 'NOVO' && '🟡 Novo'}
                      {q.status === 'EM_CONTATO' && '💬 Em Contato'}
                      {q.status === 'EM_ANDAMENTO' && '🚀 Em Andamento'}
                      {q.status === 'CONCLUIDO' && '✅ Finalizado'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1 text-slate-300">
                    <p>
                      <strong>Plano:</strong> {q.needsHosting}
                    </p>
                    {q.estimatedBudget && (
                      <p>
                        <strong>Orçamento Estimado:</strong> {q.estimatedBudget} •{' '}
                        <strong>Prazo:</strong> {q.desiredDeadline || 'A combinar'}
                      </p>
                    )}
                    {q.projectDescription && (
                      <p className="text-slate-400 italic pt-1 border-t border-slate-800 line-clamp-2">
                        "{q.projectDescription}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ============================================================ */}
      {/* MODAL DE PAGAMENTO PIX */}
      {/* ============================================================ */}
      {pixModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-white text-left">Pagar com Pix</h3>
              </div>
              <button
                onClick={() => setPixModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h4 className="text-xl font-bold text-white">Pagamento Pix Aprovado!</h4>
                <p className="text-xs text-slate-400">
                  Sua fatura foi compensada com sucesso e sua conta está 100% em dia.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-xs text-slate-400">{selectedInvoice.title}</p>
                  <p className="text-3xl font-black text-emerald-400 font-mono">
                    {formatCurrency(selectedInvoice.amount)}
                  </p>
                </div>

                {/* QR Code Simulado em SVG */}
                <div className="p-4 bg-white rounded-2xl max-w-[200px] mx-auto shadow-xl flex items-center justify-center">
                  <div className="w-40 h-40 bg-slate-950 rounded-lg p-2 flex flex-col items-center justify-center text-white space-y-2">
                    <QrCode className="w-24 h-24 text-white" />
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">mzTech Pix Pay</span>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[11px] uppercase font-bold text-slate-400">Pix Copia e Cola:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedInvoice.pixQrCodeText}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-300 focus:outline-none truncate"
                    />
                    <button
                      onClick={handleCopyPix}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
                    >
                      {pixCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSimulatePayment}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simular Confirmação Pix (Sandbox)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE PAGAMENTO VIA CARTÃO */}
      {/* ============================================================ */}
      {cardModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Pagamento no Cartão</h3>
              </div>
              <button
                onClick={() => setCardModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-center">
              <p className="text-xs text-slate-400">{selectedInvoice.title}</p>
              <p className="text-2xl font-black text-cyan-400 font-mono">
                {formatCurrency(selectedInvoice.amount)}
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSimulatePayment(); }} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Número do Cartão</label>
                <input
                  type="text"
                  placeholder="•••• •••• •••• 4242"
                  defaultValue="4000 1234 5678 4242"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Validade</label>
                  <input
                    type="text"
                    placeholder="12/28"
                    defaultValue="12/28"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    defaultValue="888"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 mt-4 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Pagar Fatura com Cartão</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
