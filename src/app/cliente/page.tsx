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
  ChevronRight,
  Shield,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatDatePtBR, generatePixPayload, getPixQrCodeImageUrl } from '@/lib/utils';
import { MzClientItem, MzProjectItem, MzQuoteItem, MzContractItem } from '@/types/mztech';

export default function ClientPortalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);
  const [selectedClientEmail, setSelectedClientEmail] = useState<string>('');

  // Modais de Pagamento
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<MzContractItem | null>(null);
  const [acceptingContract, setAcceptingContract] = useState(false);
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

  const handleSimulatePayment = async () => {
    setPaymentSuccess(true);
    try {
      if (selectedInvoice && selectedInvoice.id) {
        await fetch('/api/mztech/payments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedInvoice.id, action: 'CONFIRM_PAID' }),
        });
      }
    } catch (e) {}

    setTimeout(() => {
      loadClientData(selectedClientEmail);
      setTimeout(() => {
        setPixModalOpen(false);
        setCardModalOpen(false);
        setPaymentSuccess(false);
      }, 1200);
    }, 1000);
  };

  // Aceite Digital de Contrato em 1 clique
  const handleAcceptContractOnline = async (contractId: string) => {
    setAcceptingContract(true);
    try {
      const res = await fetch(`/api/mztech/contracts/${contractId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACCEPT_ONLINE',
          clientName: clientData?.client?.contactName || 'Cliente',
        }),
      });

      if (res.ok) {
        alert('Contrato aceito e assinado digitalmente com sucesso!');
        setContractModalOpen(false);
        loadClientData(selectedClientEmail);
      } else {
        alert('Erro ao registrar aceite digital.');
      }
    } catch (e) {
      alert('Erro de conexão ao assinar contrato.');
    } finally {
      setAcceptingContract(false);
    }
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

  const client = clientData?.client;
  const projects: MzProjectItem[] = clientData?.projects || [];
  const quotes: MzQuoteItem[] = clientData?.quotes || [];
  const contracts: MzContractItem[] = clientData?.contracts || [];
  const invoices = clientData?.invoices || [];
  const availableClients = clientData?.availableClients || [];

  const pendingInvoices = invoices.filter((i: any) => i.status === 'PENDING' || i.status === 'OVERDUE');
  const paidInvoices = invoices.filter((i: any) => i.status === 'PAID');
  const unacceptedContract = contracts.find((c) => !c.acceptedOnline && c.status !== 'CANCELADO');

  // Helper dinâmico para mapear o status de entrega definido no Controle de Projetos
  const getProjectStatusInfo = (status?: string) => {
    switch (status) {
      case 'PRODUCAO':
        return {
          label: '🚀 Entregue / Em Produção',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          stepText: '6. Entregue e Ativo em Produção 🚀',
          step5Done: true,
          step6Done: true,
        };
      case 'TESTE':
        return {
          label: '🧪 Em Fase de Testes & Homologação',
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          stepText: '5. Em Fase de Testes & Homologação',
          step5Done: true,
          step6Done: false,
        };
      case 'DESENVOLVIMENTO':
        return {
          label: '▶ Em Desenvolvimento Técnico',
          badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          stepText: '5. Em Desenvolvimento Técnico',
          step5Done: true,
          step6Done: false,
        };
      case 'MANUTENCAO':
        return {
          label: '🛡️ Em Manutenção & Suporte Ativo',
          badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          stepText: '6. Ativo sob Manutenção Contínua',
          step5Done: true,
          step6Done: true,
        };
      case 'ENCERRADO':
        return {
          label: '✅ Projeto Concluído & Entregue',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          stepText: '6. Projeto Concluído & Entregue com Sucesso',
          step5Done: true,
          step6Done: true,
        };
      case 'PLANEJAMENTO':
      default:
        return {
          label: '📋 Planejamento & Setup Inicial',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          stepText: '4. Setup & Planejamento Inicial',
          step5Done: false,
          step6Done: false,
        };
    }
  };

  const primaryProject = projects[0];
  const projectStatusInfo = getProjectStatusInfo(primaryProject?.status);
  const hasAcceptedOrPaid = contracts.some((c) => c.acceptedOnline || c.status === 'ATIVO') || paidInvoices.length > 0;

  const currentStepperStatusText = primaryProject
    ? projectStatusInfo.stepText
    : hasAcceptedOrPaid
    ? '4. Aceite / Pagamento Confirmado'
    : contracts.length > 0
    ? '3. Contrato Gerado'
    : quotes.length > 0
    ? '2. Análise Comercial'
    : '1. Orçamento Enviado';

  // Desenvolvedor Responsável
  const devAssigned = quotes[0]?.selectedDev || 'Roberto';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">
                mz<span className="text-cyan-400">Tech</span>
              </span>
            </Link>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              PORTAL DO CLIENTE
            </span>
          </div>

          <div className="flex items-center gap-3">
            {availableClients.length > 1 && (
              <select
                value={selectedClientEmail}
                onChange={(e) => handleSwitchAccount(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              >
                {availableClients.map((c: any) => (
                  <option key={c.id} value={c.email}>
                    {c.companyName} ({c.contactName})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
              title="Encerrar Sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner de Boas-Vindas & Ficha do Cliente */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ambiente Seguro mzTech • Painel do Cliente</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Olá, <span className="text-cyan-400">{client?.contactName || 'Cliente'}</span>!
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl">
                Empresa: <strong className="text-slate-200">{client?.companyName || 'Sua Empresa'}</strong> • Acompanhe propostas, contratos, faturas e o status em tempo real do seu projeto.
              </p>
            </div>

            {/* Card do Sócio Responsável */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 self-start md:self-auto min-w-[240px]">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                {devAssigned[0]}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold font-mono">
                  Sócio Especialista Responsável:
                </p>
                <p className="text-sm font-bold text-white">
                  {devAssigned} <span className="text-xs text-cyan-400 font-normal">(Sócio mzTech)</span>
                </p>
                <a
                  href={`https://wa.me/${devAssigned.includes('Morvan') ? '5531993597136' : '5531986847049'}?text=Ol%C3%A1%20${devAssigned}%2C%20sou%20cliente%20da%20mzTech%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline mt-0.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Falar no WhatsApp Oficial</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* NOVO: STEPPER DE PROGRESSÃO DO SERVIÇO (6 ETAPAS) */}
        {/* ============================================================ */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Progresso do Fluxo Comercial & Entrega</span>
            </h3>
            <span className="text-[11px] text-cyan-400 font-mono font-bold">
              Status Atual: {currentStepperStatusText}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { step: '1', title: 'Orçamento Enviado', done: true },
              { step: '2', title: 'Análise Comercial', done: quotes.length > 0 },
              { step: '3', title: 'Contrato Gerado', done: contracts.length > 0 },
              { step: '4', title: 'Aceite / Pagamento', done: hasAcceptedOrPaid },
              {
                step: '5',
                title: primaryProject?.status === 'TESTE' ? 'Fase de Testes' : 'Desenvolvimento',
                done: Boolean(primaryProject && (primaryProject.status === 'DESENVOLVIMENTO' || primaryProject.status === 'TESTE' || primaryProject.status === 'PRODUCAO' || primaryProject.status === 'MANUTENCAO' || primaryProject.status === 'ENCERRADO')),
              },
              {
                step: '6',
                title: 'Produção / Entregue',
                done: Boolean(primaryProject && (primaryProject.status === 'PRODUCAO' || primaryProject.status === 'MANUTENCAO' || primaryProject.status === 'ENCERRADO')),
              },
            ].map((st) => (
              <div
                key={st.step}
                className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                  st.done
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
              >
                <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-[10px] mx-auto ${
                  st.done ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {st.done ? '✓' : st.step}
                </span>
                <p className="text-[11px] font-semibold block leading-tight">{st.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* ALERTA: CONTRATO AGUARDANDO ACEITE DIGITAL DO CLIENTE */}
        {/* ============================================================ */}
        {unacceptedContract && (
          <div className="p-5 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Instrumento Contratual Disponível para Assinatura</span>
              </div>
              <h3 className="font-bold text-white text-base">
                Contrato {unacceptedContract.contractNumber || 'Oficial'} • {unacceptedContract.title}
              </h3>
              <p className="text-xs text-slate-300">
                Revise os termos de desenvolvimento, hospedagem, cláusulas de retenção de backup e realize seu aceite online com 1 clique.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedContract(unacceptedContract);
                setContractModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 whitespace-nowrap transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ler e Aceitar Contrato Online</span>
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* 1. SEÇÃO DE FATURAS & COBRANÇAS */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Faturas & Pagamentos</span>
            </h2>
            <span className="text-xs text-slate-400">
              Situação Financeira:{' '}
              <strong className={client?.financialStatus === 'EM_DIA' ? 'text-emerald-400' : 'text-amber-400'}>
                {client?.financialStatus === 'EM_DIA' ? '🟢 EM DIA' : '🟡 FATURA PENDENTE'}
              </strong>
            </span>
          </div>

          {pendingInvoices.length > 0 ? (
            <div className="space-y-3">
              {pendingInvoices.map((inv: any) => (
                <div
                  key={inv.id}
                  className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Fatura Pendente • Vencimento: {formatDatePtBR(inv.dueDate)}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{inv.title}</h3>
                    <p className="text-xs text-slate-400">
                      Forma de Cobrança: <strong className="text-slate-300">{inv.paymentMethod || 'Cartão / Pix'}</strong>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">Valor</span>
                      <p className="text-3xl font-black text-emerald-400 font-mono">
                        {formatCurrency(inv.amount)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPixModal(inv)}
                        className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
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
                  Não há faturas pendentes neste momento. Todos os seus serviços e hospedagens estão operando normalmente.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 2. SEÇÃO DE PROJETOS EM ANDAMENTO */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <FolderGit2 className="w-5 h-5 text-cyan-400" />
              <span>Projetos & Infraestrutura Cloud</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Total: <strong className="text-white">{projects.length}</strong>
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">Nenhum projeto em andamento no momento.</p>
              <p className="text-xs text-slate-400">Assim que a proposta for aprovada, o projeto aparecerá aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((proj) => {
                const statusInfo = getProjectStatusInfo(proj.status);
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
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.label}
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
                          <span className="text-slate-400">Domínio:</span>
                          <span className="font-mono text-cyan-300">{proj.domain}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Backups:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Retenção de 30 dias</span>
                        </span>
                      </div>
                    </div>

                    {proj.hostingUrl && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <a
                          href={proj.hostingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Acessar Projeto Online</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* ============================================================ */}
      {/* MODAL DE LEITURA E ACEITE DO CONTRATO DIGITAL */}
      {/* ============================================================ */}
      {contractModalOpen && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-cyan-400" />
                <h3 className="font-bold text-xl text-white">
                  Contrato de Prestação de Serviços Digitais
                </h3>
              </div>
              <button
                onClick={() => setContractModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Contrato Nº:</span>
                <strong className="text-cyan-400 font-mono">{selectedContract.contractNumber || 'CTR-2026'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valor Inicial de Desenvolvimento:</span>
                <span className="text-emerald-400 font-mono font-bold">{formatCurrency(selectedContract.totalDevPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mensalidade de Hospedagem & Suporte:</span>
                <span className="text-white font-mono font-bold">{formatCurrency(selectedContract.monthlyPrice)}/mês</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-slate-300 text-xs leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
              {selectedContract.content}
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-[11px] text-slate-400">
                Ao clicar em aceitar, seu endereço de IP e horário serão registrados como assinatura digital vinculante.
              </p>

              <button
                onClick={() => handleAcceptContractOnline(selectedContract.id)}
                disabled={acceptingContract}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {acceptingContract ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>Confirmar e Assinar Digitalmente</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h4 className="text-xl font-bold text-white">Pagamento Pix Aprovado!</h4>
                <p className="text-xs text-slate-400">
                  Sua fatura foi compensada com sucesso e sua conta está 100% em dia.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                  <p className="text-xs text-slate-400">{selectedInvoice.title}</p>
                  <p className="text-3xl font-black text-emerald-400 font-mono">
                    {formatCurrency(selectedInvoice.amount)}
                  </p>
                </div>

                {/* QR Code Real Escaneável */}
                {(() => {
                  const pixPayload = generatePixPayload({
                    pixKey: 'robertomazzoni956@gmail.com',
                    merchantName: 'ROBERTO MAZZONI',
                    merchantCity: 'BELO HORIZONTE',
                    amount: selectedInvoice.amount,
                    txid: `MZ${selectedInvoice.id.replace(/\D/g, '').substring(0, 10) || '2026'}`,
                  });
                  const qrUrl = getPixQrCodeImageUrl(pixPayload, 220);

                  return (
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-2xl max-w-[200px] mx-auto shadow-xl flex flex-col items-center justify-center">
                        <img src={qrUrl} alt="QR Code Pix" className="w-44 h-44 object-contain rounded-lg" />
                        <span className="text-[9px] font-mono text-slate-800 font-bold uppercase tracking-wider mt-1">
                          Escaneie no seu Banco
                        </span>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-[11px] uppercase font-bold text-slate-400">Pix Copia e Cola:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={pixPayload}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-cyan-300 focus:outline-none truncate"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(pixPayload);
                              setPixCopied(true);
                              setTimeout(() => setPixCopied(false), 3000);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-all shadow-md shadow-emerald-500/10"
                          >
                            {pixCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{pixCopied ? 'Copiado!' : 'Copiar Pix'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-2">
                  <button
                    onClick={handleSimulatePayment}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Pagamento Realizado</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE PAGAMENTO COM CARTÃO */}
      {/* ============================================================ */}
      {cardModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Pagamento no Cartão de Crédito</h3>
              </div>
              <button
                onClick={() => setCardModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <p className="text-xs text-slate-400">{selectedInvoice.title}</p>
              <p className="text-3xl font-black text-cyan-400 font-mono">{formatCurrency(selectedInvoice.amount)}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Número do Cartão</label>
                <input
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Validade</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleSimulatePayment}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md mt-2 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Pagar e Ativar Mensalidade Recorrente</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
