'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Printer,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  AlertCircle,
  Eye,
  DollarSign,
  ShieldCheck,
  CreditCard,
  Layers,
  Building,
  RefreshCw,
  Search,
  Filter,
  Check,
  Send,
  Sparkles,
  PenTool,
  Copy,
  ExternalLink,
  Lock,
} from 'lucide-react';
import {
  MzContractItem,
  MzClientItem,
  MzProjectItem,
  ContractStatus,
  CodeOwnershipType,
} from '@/types/mztech';
import { formatCurrency, formatDatePtBR } from '@/lib/utils';
import { DEFAULT_CONTRACT_TEMPLATE, MZTECH_INFO } from '@/data/mztech-constants';

export default function MzTechContractsPage() {
  const [contracts, setContracts] = useState<MzContractItem[]>([]);
  const [clients, setClients] = useState<MzClientItem[]>([]);
  const [projects, setProjects] = useState<MzProjectItem[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modais
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [viewDocModalOpen, setViewDocModalOpen] = useState(false);
  const [providerSignModalOpen, setProviderSignModalOpen] = useState(false);
  const [clientSignModalOpen, setClientSignModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<MzContractItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Toast e Feedback
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Dados para Assinatura do Prestador (Roberto ou Morvan)
  const [selectedProviderSigner, setSelectedProviderSigner] = useState<'Roberto Mazzoni' | 'Morvan'>('Roberto Mazzoni');

  // Dados para Assinatura Presencial do Cliente
  const [clientSignerName, setClientSignerName] = useState('');
  const [clientSignerDoc, setClientSignerDoc] = useState('');

  // Formulário Estruturado em 4 Seções
  const [formData, setFormData] = useState({
    id: '',
    clientId: '',
    newClientName: '',
    projectId: '',
    assignedDev: 'Roberto',
    contractNumber: '',
    title: 'Contrato de Prestação de Serviços Digitais & Políticas Comerciais',
    status: 'RASCUNHO' as ContractStatus,

    totalDevPrice: '1200.00',
    monthlyPrice: '79.90',
    discount: '0.00',
    dueDay: '10',
    paymentMethod: 'Cartão de Crédito (Recorrência Mensal Automática)',
    periodicity: 'Mensal',

    scopeDevelopment: 'Desenvolvimento de site/sistema sob medida em Next.js e TypeScript.',
    scopeHosting: 'Hospedagem em nuvem Railway com certificado SSL incluso.',
    scopeMaintenance: 'Manutenção preventiva e suporte prioritário via WhatsApp.',
    scopeSupport: 'Atendimento direto com os sócios Roberto e Morvan.',
    codeOwnershipType: 'PROPRIEDADE_CLIENTE' as CodeOwnershipType,
    backupRetentionDays: '30',
    migrationExcluded: true,

    content: DEFAULT_CONTRACT_TEMPLATE,
    termsVersion: 'v2.0-2026',
    notes: '',
  });

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [contRes, clientRes, projRes, payRes] = await Promise.all([
        fetch('/api/mztech/contracts'),
        fetch('/api/mztech/clients'),
        fetch('/api/mztech/projects'),
        fetch('/api/mztech/payments'),
      ]);

      if (contRes.ok) {
        const cData = await contRes.json();
        setContracts(cData.contracts || []);
        if (selectedContract) {
          const updated = (cData.contracts || []).find((c: any) => c.id === selectedContract.id);
          if (updated) setSelectedContract(updated);
        }
      }
      if (clientRes.ok) {
        const clData = await clientRes.json();
        setClients(clData.clients || []);
      }
      if (projRes.ok) {
        const pData = await projRes.json();
        setProjects(pData.projects || []);
      }
      if (payRes.ok) {
        const pyData = await payRes.json();
        setPayments(pyData.payments || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de contratos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setSelectedContract(null);
    setFormData({
      id: '',
      clientId: clients.length > 0 ? clients[0].id : '',
      newClientName: '',
      projectId: projects.length > 0 ? projects[0].id : '',
      assignedDev: 'Roberto',
      contractNumber: `CTR-2026-${(contracts.length + 1).toString().padStart(4, '0')}`,
      title: 'Contrato de Prestação de Serviços Digitais & Políticas Comerciais',
      status: 'RASCUNHO',

      totalDevPrice: '1200.00',
      monthlyPrice: '79.90',
      discount: '0.00',
      dueDay: '10',
      paymentMethod: 'Cartão de Crédito (Recorrência Mensal Automática)',
      periodicity: 'Mensal',

      scopeDevelopment: 'Desenvolvimento de site/sistema sob medida em Next.js e TypeScript.',
      scopeHosting: 'Hospedagem em nuvem Railway com certificado SSL incluso.',
      scopeMaintenance: 'Manutenção preventiva e suporte prioritário via WhatsApp.',
      scopeSupport: 'Atendimento direto com os sócios Roberto e Morvan.',
      codeOwnershipType: 'PROPRIEDADE_CLIENTE',
      backupRetentionDays: '30',
      migrationExcluded: true,

      content: DEFAULT_CONTRACT_TEMPLATE,
      termsVersion: 'v2.0-2026',
      notes: '',
    });
    setEditorModalOpen(true);
  };

  const handleOpenEdit = (contract: MzContractItem) => {
    setSelectedContract(contract);
    setFormData({
      id: contract.id,
      clientId: contract.clientId,
      newClientName: '',
      projectId: contract.projectId || '',
      assignedDev: contract.assignedDev || (contract as any).snapshot?.assignedDev || 'Roberto',
      contractNumber: contract.contractNumber || '',
      title: contract.title,
      status: contract.status,

      totalDevPrice: (contract.totalDevPrice !== undefined ? contract.totalDevPrice : 0).toString(),
      monthlyPrice: (contract.monthlyPrice !== undefined ? contract.monthlyPrice : 0).toString(),
      discount: (contract.discount || 0).toString(),
      dueDay: (contract.dueDay || 10).toString(),
      paymentMethod: contract.paymentMethod || 'Cartão de Crédito',
      periodicity: contract.periodicity || 'Mensal',

      scopeDevelopment: contract.scopeDevelopment || 'Desenvolvimento sob medida.',
      scopeHosting: contract.scopeHosting || 'Hospedagem em nuvem gerenciada.',
      scopeMaintenance: contract.scopeMaintenance || 'Manutenção preventiva e suporte.',
      scopeSupport: contract.scopeSupport || 'Suporte direto com a equipe mzTech.',
      codeOwnershipType: contract.codeOwnershipType || 'PROPRIEDADE_CLIENTE',
      backupRetentionDays: (contract.backupRetentionDays || 30).toString(),
      migrationExcluded: contract.migrationExcluded !== undefined ? contract.migrationExcluded : true,

      content: contract.content || DEFAULT_CONTRACT_TEMPLATE,
      termsVersion: contract.termsVersion || 'v2.0-2026',
      notes: contract.notes || '',
    });
    setEditorModalOpen(true);
  };

  const handleOpenViewDoc = (contract: MzContractItem) => {
    setSelectedContract(contract);
    setViewDocModalOpen(true);
  };

  // AÇÃO 1: ASSINAR COMO PRESTADOR (Roberto / Morvan)
  const handleSignAsProvider = async () => {
    if (!selectedContract) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/mztech/contracts/${selectedContract.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SIGN_PROVIDER',
          providerName: selectedProviderSigner,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        if (d.contract) {
          setSelectedContract(d.contract);
          setContracts((prev) => prev.map((c) => (c.id === d.contract.id || c.contractNumber === d.contract.contractNumber ? d.contract : c)));
        }
        setProviderSignModalOpen(false);
        setFeedbackToast(`Contrato assinado digitalmente por ${selectedProviderSigner}!`);
        loadData();
        setTimeout(() => setFeedbackToast(null), 5000);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Erro ao assinar contrato como prestador.');
      }
    } catch (e) {
      alert('Erro de conexão.');
    } finally {
      setSubmitting(false);
    }
  };

  // AÇÃO 2: ASSINATURA PRESENCIAL DO CLIENTE
  const handleSignAsClientDirect = async () => {
    if (!selectedContract || !clientSignerName.trim()) {
      alert('Informe o nome do assinante.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/mztech/contracts/${selectedContract.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SIGN_CLIENT',
          clientName: clientSignerName.trim(),
          clientDocument: clientSignerDoc.trim(),
        }),
      });

      if (res.ok) {
        const d = await res.json();
        if (d.contract) {
          setSelectedContract(d.contract);
          setContracts((prev) => prev.map((c) => (c.id === d.contract.id || c.contractNumber === d.contract.contractNumber ? d.contract : c)));
        }
        setClientSignModalOpen(false);
        setFeedbackToast('Assinatura do cliente registrada com sucesso!');
        loadData();
        setTimeout(() => setFeedbackToast(null), 5000);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Erro ao registrar assinatura.');
      }
    } catch (e) {
      alert('Erro de conexão.');
    } finally {
      setSubmitting(false);
    }
  };

  // AÇÃO 3: COPIAR LINK DE ASSINATURA PARA ENVIAR AO CLIENTE
  const handleCopySigningLink = (contractId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mztech.app';
    const signUrl = `${origin}/contrato/${contractId}`;
    navigator.clipboard.writeText(signUrl);
    setCopiedLink(true);
    setFeedbackToast('Link de assinatura digital copiado! Envie no WhatsApp do cliente.');
    setTimeout(() => {
      setCopiedLink(false);
      setFeedbackToast(null);
    }, 4000);
  };

  // AÇÃO 4: COPIAR LINK DE PAGAMENTO / CHECKOUT
  const handleCopyPaymentLink = (contractId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mztech.app';
    const payUrl = `${origin}/pagamento/${contractId}`;
    navigator.clipboard.writeText(payUrl);
    setFeedbackToast('Link de checkout de pagamento copiado! Envie para o cliente.');
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4000);
  };

  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || (!formData.clientId && !formData.newClientName)) {
      alert('Informe o cliente e o título do contrato.');
      return;
    }

    setSubmitting(true);
    try {
      const url = formData.id ? `/api/mztech/contracts/${formData.id}` : '/api/mztech/contracts';
      const method = formData.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setEditorModalOpen(false);
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || 'Erro ao salvar contrato.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContract = async (id: string, number?: string) => {
    if (!confirm(`Deseja realmente excluir o contrato ${number || id}?`)) return;
    try {
      setContracts((prev) => prev.filter((c) => c.id !== id));
      await fetch(`/api/mztech/contracts/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      loadData();
    }
  };

  // Filtragem
  const filteredContracts = contracts.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchClient = c.client?.companyName?.toLowerCase().includes(q) || c.client?.contactName?.toLowerCase().includes(q);
      const matchNum = c.contractNumber?.toLowerCase().includes(q);
      const matchTitle = c.title?.toLowerCase().includes(q);
      if (!matchClient && !matchNum && !matchTitle) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Gestão de Contratos & Assinaturas Digitais</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {contracts.length} emitidos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Emissão de instrumentos formais com assinatura digital dupla (Prestador e Cliente), certificação criptográfica e aceite online.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Atualizar Contratos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Contrato</span>
          </button>
        </div>
      </div>

      {feedbackToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({contracts.length})
          </button>

          <button
            onClick={() => setStatusFilter('ATIVO')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              statusFilter === 'ATIVO'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            Ativos / Assinados ({contracts.filter((c) => c.status === 'ATIVO').length})
          </button>

          <button
            onClick={() => setStatusFilter('AGUARDANDO_PAGAMENTO')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              statusFilter === 'AGUARDANDO_PAGAMENTO'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            Aguardando Pagamento ({contracts.filter((c) => c.status === 'AGUARDANDO_PAGAMENTO').length})
          </button>

          <button
            onClick={() => setStatusFilter('RASCUNHO')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              statusFilter === 'RASCUNHO'
                ? 'bg-slate-800 text-slate-200 font-semibold'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Rascunhos ({contracts.filter((c) => c.status === 'RASCUNHO').length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número, cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-56 sm:w-64"
          />
        </div>
      </div>

      {/* Tabela de Contratos */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Carregando contratos jurídicos...</p>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-dashed border-slate-800 space-y-2">
          <FileText className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Nenhum contrato encontrado.</p>
          <p className="text-xs text-slate-500">Aprove um orçamento comercial para gerar o contrato automaticamente.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-3 px-4 font-semibold">Número</th>
                  <th className="py-3 px-4 font-semibold">Cliente / Empresa</th>
                  <th className="py-3 px-4 font-semibold">Serviço / Projeto</th>
                  <th className="py-3 px-4 font-semibold">Sócio / Especialista</th>
                  <th className="py-3 px-4 font-semibold">Valor Inicial</th>
                  <th className="py-3 px-4 font-semibold">Mensalidade</th>
                  <th className="py-3 px-4 font-semibold">Assinatura Prestador</th>
                  <th className="py-3 px-4 font-semibold">Assinatura Cliente</th>
                  <th className="py-3 px-4 font-semibold">Status / Pagamento</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredContracts.map((c) => {
                  const isProviderSigned = Boolean(c.providerSigned);
                  const isClientSigned = Boolean(c.clientSigned || c.acceptedOnline);
                  const isPaid = (c.status === 'ATIVO' && (c.clientSigned || c.acceptedOnline)) || payments.some((p) => (p.contractId === c.id || p.clientId === c.clientId) && p.status === 'PAID');
                  const devName = c.assignedDev || (c as any).snapshot?.assignedDev || (c.providerSignedBy ? c.providerSignedBy.split(' ')[0] : 'Roberto');
                  const isMorvan = devName.toLowerCase().includes('morvan');

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-cyan-400">
                        {c.contractNumber || `#${c.id.substring(0, 8)}`}
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-white block">{c.client?.companyName || 'Cliente mzTech'}</strong>
                        <span className="text-[11px] text-slate-400">{c.client?.contactName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-[180px] truncate">
                        {c.project?.name || c.title}
                      </td>
                      <td className="py-3 px-4">
                        {isMorvan ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>Morvan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Roberto</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        {c.totalDevPrice > 0 ? formatCurrency(c.totalDevPrice) : 'A Definir'}
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-400">
                        {c.monthlyPrice > 0 ? `${formatCurrency(c.monthlyPrice)}/mês` : 'Isento (Dev)'}
                      </td>
                      <td className="py-3 px-4">
                        {isProviderSigned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Check className="w-3 h-3" /> {c.providerSignedBy?.split(' ')[0] || 'Prestador'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isClientSigned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" /> Assinado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Aguardando
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isPaid || c.status === 'ATIVO' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
                            <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                            <span>PAGO & ATIVO</span>
                          </span>
                        ) : isProviderSigned && isClientSigned ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                            <span>AGUARDANDO PAGTO</span>
                          </span>
                        ) : isClientSigned ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            Falta Prestador
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                            {c.status || 'RASCUNHO'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        
                        {/* Se o pagamento já foi identificado */}
                        {isPaid || c.status === 'ATIVO' ? (
                          <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 font-bold text-[11px] border border-emerald-500/30 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Pago</span>
                          </span>
                        ) : isProviderSigned && isClientSigned ? (
                          <button
                            onClick={() => handleCopyPaymentLink(c.id)}
                            className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-semibold text-[11px] border border-amber-500/30 inline-flex items-center gap-1 transition-colors"
                            title="Copiar Link de Pagamento Gerado"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Link Pagto</span>
                          </button>
                        ) : null}

                        {/* Visualizar e Assinar */}
                        <button
                          onClick={() => handleOpenViewDoc(c)}
                          className="px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-semibold text-[11px] border border-cyan-500/30 inline-flex items-center gap-1 transition-colors"
                          title="Visualizar e Assinar Contrato"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Documento</span>
                        </button>

                        {/* Copiar Link de Assinatura */}
                        <button
                          onClick={() => handleCopySigningLink(c.id)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                          title="Copiar Link de Assinatura Digital do Cliente"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Editar Contrato"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Excluir */}
                        <button
                          onClick={() => handleDeleteContract(c.id, c.contractNumber)}
                          className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE CONTRATO (4 SEÇÕES) */}
      {/* ============================================================ */}
      {editorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                {formData.id ? 'Editar Instrumento Contratual' : 'Criar Novo Contrato'}
              </h3>
              <button
                onClick={() => setEditorModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="space-y-5 text-xs">
              
              {/* SEÇÃO 1: IDENTIFICAÇÃO */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  <span>1. Identificação das Partes & Título</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Cliente *</label>
                    <select
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    >
                      {clients.map((cl) => (
                        <option key={cl.id} value={cl.id}>
                          {cl.companyName} ({cl.contactName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Sócio / Especialista *</label>
                    <select
                      value={formData.assignedDev}
                      onChange={(e) => setFormData({ ...formData, assignedDev: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/30 rounded-lg text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Roberto">Roberto Mazzoni</option>
                      <option value="Morvan">Morvan</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Status do Contrato</label>
                    <select
                      value={formData.status}
                      onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="RASCUNHO">Rascunho</option>
                      <option value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</option>
                      <option value="AGUARDANDO_ACEITE">Aguardando Aceite Digital</option>
                      <option value="ATIVO">Ativo / Assinado</option>
                      <option value="SUSPENSO">Suspenso</option>
                      <option value="CANCELADO">Cancelado</option>
                      <option value="ENCERRADO">Encerrado</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Título do Contrato</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* SEÇÃO 2: CONDIÇÕES COMERCIAIS */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2. Condições Comerciais & Pagamento</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Valor de Desenvolvimento (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.totalDevPrice}
                      onChange={(e) => setFormData({ ...formData, totalDevPrice: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Mensalidade (R$/mês)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthlyPrice}
                      onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Dia de Vencimento</label>
                    <input
                      type="number"
                      value={formData.dueDay}
                      onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Forma de Pagamento Contratada</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Cartão de Crédito (Parcelado em até 12x)">Cartão de Crédito (Parcelado em até 12x)</option>
                    <option value="Cartão de Crédito (Recorrência Mensal Automática)">Cartão de Crédito (Recorrência Mensal Automática)</option>
                    <option value="PIX (À Vista / Chave Oficial)">PIX (À Vista / Chave Oficial)</option>
                    <option value="Entrada PIX + Mensalidade no Cartão">Entrada PIX + Mensalidade no Cartão</option>
                  </select>
                </div>
              </div>

              {/* SEÇÃO 3: SERVIÇOS E CONDIÇÕES TÉCNICAS */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3. Serviços e Condições Técnicas</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Propriedade do Código-Fonte</label>
                    <select
                      value={formData.codeOwnershipType}
                      onChange={(e: any) => setFormData({ ...formData, codeOwnershipType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="PROPRIEDADE_CLIENTE">Propriedade Integral do Cliente</option>
                      <option value="LICENCA_USO">Licença de Uso Contínua</option>
                      <option value="MISTO">Misto (Customização + Core mzTech)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Retenção de Backup (Dias)</label>
                    <input
                      type="number"
                      value={formData.backupRetentionDays}
                      onChange={(e) => setFormData({ ...formData, backupRetentionDays: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 4: CLÁUSULAS */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>4. Texto do Contrato & Cláusulas Jurídicas</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, content: DEFAULT_CONTRACT_TEMPLATE })}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Restaurar Modelo Padrão
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditorModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  {submitting ? 'Salvando...' : 'Salvar Contrato'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VISUALIZADOR FORMAL DE DOCUMENTO (PRINTABLE / PDF STYLE) */}
      {/* ============================================================ */}
      {viewDocModalOpen && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Header de Ações */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {selectedContract.contractNumber || 'INSTRUMENTO FORMAL'}
                </span>
                <h3 className="font-bold text-white text-base">Visualização do Contrato mzTech</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopySigningLink(selectedContract.id)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-semibold text-xs border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link p/ Cliente'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Gerar PDF</span>
                </button>

                <button
                  onClick={() => setViewDocModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Documento Estilo Papel A4 Corporativo */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed font-sans shadow-inner">
              
              {/* Cabeçalho do Documento */}
              <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-extrabold text-white">
                    mz<span className="text-cyan-400">Tech</span> Soluções Digitais & Desenvolvimento
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Roberto Mazzoni & Morvan • Belo Horizonte / MG
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    E-mail: robertomazzoni956@gmail.com • WhatsApp: (31) 98684-7049
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-400 font-bold text-xs block">
                    {selectedContract.contractNumber || 'CTR-2026-0001'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Emitido em: {formatDatePtBR(selectedContract.createdAt)}
                  </span>
                </div>
              </div>

              {/* Qualificação das Partes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">CONTRATADA (PRESTADORA)</span>
                  <strong className="text-white block">mzTech Soluções Digitais</strong>
                  <p className="text-[11px] text-slate-400">Sócios: Roberto Mazzoni & Morvan</p>
                  <p className="text-[11px] text-slate-400 font-mono">Contato: (31) 98684-7049 / (31) 99359-7136</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">CONTRATANTE (CLIENTE)</span>
                  <strong className="text-white block">{selectedContract.client?.companyName || 'Empresa Cliente'}</strong>
                  <p className="text-[11px] text-slate-400">Responsável: {selectedContract.client?.contactName || 'Não informado'}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Contato: {selectedContract.client?.whatsapp} • {selectedContract.client?.email}</p>
                </div>
              </div>

              {/* Tabela de Discriminação de Valores */}
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Especificação do Serviço</th>
                      <th className="py-2.5 px-3">Modalidade</th>
                      <th className="py-2.5 px-3 text-right">Valor Contratado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-white">{selectedContract.title}</td>
                      <td className="py-2.5 px-3 text-slate-400">Taxa Única de Desenvolvimento</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                        {formatCurrency(selectedContract.totalDevPrice)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-white">Hospedagem em Nuvem & Manutenção Técnica</td>
                      <td className="py-2.5 px-3 text-slate-400">Recorrência Mensal (Venc. dia {selectedContract.dueDay || 10})</td>
                      <td className="py-2.5 px-3 text-right text-cyan-400 font-bold">
                        {formatCurrency(selectedContract.monthlyPrice)}/mês
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Termos e Cláusulas */}
              <div className="space-y-2">
                <h5 className="font-bold text-white uppercase text-[11px] font-mono tracking-wider">
                  Cláusulas e Condições de Fornecimento:
                </h5>
                <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 whitespace-pre-line font-mono text-[11px] leading-relaxed text-slate-300 max-h-60 overflow-y-auto">
                  {selectedContract.content}
                </div>
              </div>

              {/* ÁREA DE ASSINATURA DUPLA (INTERATIVA) */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h5 className="font-bold text-white uppercase text-[11px] font-mono tracking-wider">
                  Assinaturas Digitais do Instrumento:
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* BOX DO PRESTADOR (mzTech) */}
                  <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center space-y-2.5 bg-slate-900/40">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">PRESTADOR</span>
                    <p className="font-bold text-white">mzTech Soluções Digitais</p>
                    <p className="text-[11px] text-slate-400">
                      {selectedContract.providerSignedBy || 'Roberto Mazzoni & Morvan'}
                    </p>

                    {selectedContract.providerSigned ? (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-semibold space-y-0.5">
                        <div className="flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Assinado Digitalmente pelo Prestador</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {formatDatePtBR(selectedContract.providerSignedAt || '')}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] text-amber-400 font-mono block">
                          Pendente de assinatura do prestador
                        </span>
                        <button
                          onClick={() => setProviderSignModalOpen(true)}
                          className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm inline-flex items-center gap-1.5"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Assinar como Prestador</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* BOX DO CLIENTE (CONTRATANTE) */}
                  <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center space-y-2.5 bg-slate-900/40">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">CONTRATANTE</span>
                    <p className="font-bold text-white">{selectedContract.client?.companyName || 'Contratante'}</p>
                    <p className="text-[11px] text-slate-400">
                      {selectedContract.clientSignedBy || selectedContract.client?.contactName || 'Responsável'}
                    </p>

                    {selectedContract.clientSigned || selectedContract.acceptedOnline ? (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-semibold space-y-0.5">
                        <div className="flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Assinado Digitalmente pelo Cliente</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {formatDatePtBR(selectedContract.clientSignedAt || selectedContract.acceptedAt || '')}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] text-amber-400 font-mono block">
                          Aguardando Assinatura do Cliente
                        </span>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleCopySigningLink(selectedContract.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                          >
                            <Copy className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Copiar Link</span>
                          </button>
                          <button
                            onClick={() => {
                              setClientSignerName(selectedContract.client?.contactName || '');
                              setClientSignerDoc(selectedContract.client?.cnpjCpf || '');
                              setClientSignModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                          >
                            <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Assinar Agora</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Certificado de Autenticidade */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Autenticação Digital Eletrônica mzTech Segura</span>
                  </div>
                  <div>
                    Hash do Certificado: <strong className="text-slate-300">{selectedContract.signatureCertificateHash || `MZ-CERT-${selectedContract.id.substring(0, 8).toUpperCase()}-2026`}</strong>
                  </div>
                </div>

                {/* BLOCO DE LINK DE PAGAMENTO (GERADO AUTOMATICAMENTE QUANDO AMBOS ASSINAM) */}
                {Boolean(selectedContract.providerSigned && (selectedContract.clientSigned || selectedContract.acceptedOnline)) && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 border border-emerald-500/50 space-y-3 shadow-xl animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-white text-xs">
                              Link de Pagamento Gerado Automaticamente!
                            </h5>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              LIBERADO
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-200/90">
                            Ambas as partes assinaram. Envie o checkout de cobrança ao cliente para iniciar o projeto.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleCopyPaymentLink(selectedContract.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Link de Pagamento</span>
                        </button>

                        <a
                          href={`/pagamento/${selectedContract.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir Checkout</span>
                        </a>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="truncate pr-2">
                        {typeof window !== 'undefined' ? `${window.location.origin}/pagamento/${selectedContract.id}` : `/pagamento/${selectedContract.id}`}
                      </span>
                      <span className="text-emerald-400 font-bold shrink-0">
                        PIX / Cartão: {formatCurrency(selectedContract.totalDevPrice > 0 ? selectedContract.totalDevPrice : selectedContract.monthlyPrice)}
                      </span>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PARA O PRESTADOR (ROBERTO / MORVAN) ASSINAR */}
      {/* ============================================================ */}
      {providerSignModalOpen && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-cyan-400" />
                <span>Assinatura Digital do Prestador</span>
              </h3>
              <button onClick={() => setProviderSignModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Você está assinando o contrato <strong>{selectedContract.contractNumber || selectedContract.title}</strong> como representante legal da <strong>mzTech Soluções Digitais</strong>.
              </p>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Quem está assinando? *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProviderSigner('Roberto Mazzoni')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedProviderSigner === 'Roberto Mazzoni'
                        ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Roberto Mazzoni
                    <span className="text-[10px] text-cyan-400 block font-normal">Sócio & Dev</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProviderSigner('Morvan')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedProviderSigner === 'Morvan'
                        ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Morvan
                    <span className="text-[10px] text-cyan-400 block font-normal">Sócio & Dev</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSignAsProvider}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Confirmar Assinatura Digital do Prestador</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PARA ASSINATURA PRESENCIAL DO CLIENTE */}
      {/* ============================================================ */}
      {clientSignModalOpen && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Assinatura do Cliente / Contratante</span>
              </h3>
              <button onClick={() => setClientSignModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Nome Completo do Assinante *</label>
                <input
                  type="text"
                  required
                  value={clientSignerName}
                  onChange={(e) => setClientSignerName(e.target.value)}
                  placeholder="Ex: Carlos Silva"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">CPF ou CNPJ (Opcional)</label>
                <input
                  type="text"
                  value={clientSignerDoc}
                  onChange={(e) => setClientSignerDoc(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSignAsClientDirect}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Registrar Assinatura do Cliente</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
