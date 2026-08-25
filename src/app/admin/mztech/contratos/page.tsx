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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modais
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [viewDocModalOpen, setViewDocModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<MzContractItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Formulário Estruturado em 4 Seções
  const [formData, setFormData] = useState({
    id: '',
    // Seção 1: Identificação
    clientId: '',
    newClientName: '',
    projectId: '',
    contractNumber: '',
    title: 'Contrato de Prestação de Serviços Digitais & Políticas Comerciais',
    status: 'RASCUNHO' as ContractStatus,

    // Seção 2: Condições Comerciais
    totalDevPrice: '1200.00',
    monthlyPrice: '79.90',
    discount: '0.00',
    dueDay: '10',
    paymentMethod: 'Cartão de Crédito (Recorrência Mensal Automática)',
    periodicity: 'Mensal',

    // Seção 3: Serviços e Condições Técnicas
    scopeDevelopment: 'Desenvolvimento de site/sistema sob medida em Next.js e TypeScript.',
    scopeHosting: 'Hospedagem em nuvem Railway com certificado SSL incluso.',
    scopeMaintenance: 'Manutenção preventiva e suporte prioritário via WhatsApp.',
    scopeSupport: 'Atendimento direto com os sócios Roberto e Morvan.',
    codeOwnershipType: 'PROPRIEDADE_CLIENTE' as CodeOwnershipType,
    backupRetentionDays: '30',
    migrationExcluded: true,

    // Seção 4: Cláusulas
    content: DEFAULT_CONTRACT_TEMPLATE,
    termsVersion: 'v2.0-2026',
    notes: '',
  });

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [contRes, clientRes, projRes] = await Promise.all([
        fetch('/api/mztech/contracts'),
        fetch('/api/mztech/clients'),
        fetch('/api/mztech/projects'),
      ]);

      if (contRes.ok) {
        const cData = await contRes.json();
        setContracts(cData.contracts || []);
      }
      if (clientRes.ok) {
        const clData = await clientRes.json();
        setClients(clData.clients || []);
      }
      if (projRes.ok) {
        const pData = await projRes.json();
        setProjects(pData.projects || []);
      }
    } catch (err) {
      console.error('Erro ao buscar contratos:', err);
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
      contractNumber: contract.contractNumber || '',
      title: contract.title,
      status: contract.status,

      totalDevPrice: (contract.totalDevPrice || 0).toString(),
      monthlyPrice: (contract.monthlyPrice || 79.9).toString(),
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

  const handlePrintDoc = () => {
    window.print();
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
            <h1 className="text-xl font-bold text-white tracking-tight">Gestão de Contratos Jurídicos & Termos</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {contracts.length} emitidos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Instrumentos formais com snapshots imutáveis, discriminação de valores, cláusulas técnicas e aceite digital.
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
            Ativos ({contracts.filter((c) => c.status === 'ATIVO').length})
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
                  <th className="py-3 px-4 font-semibold">Valor Inicial</th>
                  <th className="py-3 px-4 font-semibold">Mensalidade</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Data Emissão</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredContracts.map((c) => {
                  const isActive = c.status === 'ATIVO';
                  const isAwaitingPay = c.status === 'AGUARDANDO_PAGAMENTO';

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-cyan-400">
                        {c.contractNumber || `#${c.id.substring(0, 8)}`}
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-white block">{c.client?.companyName || 'Cliente mzTech'}</strong>
                        <span className="text-[11px] text-slate-400">{c.client?.contactName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">
                        {c.project?.name || c.title}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        {formatCurrency(c.totalDevPrice)}
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-400">
                        {formatCurrency(c.monthlyPrice)}/mês
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isAwaitingPay
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isActive && '● Ativo'}
                          {isAwaitingPay && '○ Aguardando Pagamento'}
                          {!isActive && !isAwaitingPay && c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {formatDatePtBR(c.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        
                        {/* Visualizar Documento Formal */}
                        <button
                          onClick={() => handleOpenViewDoc(c)}
                          className="px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-semibold text-[11px] border border-cyan-500/30 inline-flex items-center gap-1 transition-colors"
                          title="Visualizar Contrato Formal"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Visualizar</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <input
                    type="text"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
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
                  onClick={handlePrintDoc}
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
                    CNPJ / Titular: Roberto Mazzoni & Morvan • Belo Horizonte / MG
                  </p>
                  <p className="text-[11px] text-slate-400">
                    E-mail: robertomazzoni956@gmail.com • WhatsApp: (31) 98684-7049
                  </p>
                </div>
                <div className="text-right sm:text-right">
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
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">CONTRATADA</span>
                  <strong className="text-white block">mzTech Soluções Digitais</strong>
                  <p className="text-[11px] text-slate-400">Prestação de serviços de tecnologia, desenvolvimento de software, hospedagem gerenciada e manutenção contínua.</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">CONTRATANTE</span>
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

              {/* Área de Assinatura / Aceite Digital */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="border border-dashed border-slate-800 rounded-lg p-3 text-center space-y-1">
                  <p className="font-bold text-white">mzTech Soluções Digitais</p>
                  <p className="text-[10px] text-slate-400">Roberto Mazzoni & Morvan</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                    <Check className="w-3 h-3" /> Assinado pelo Prestador
                  </span>
                </div>

                <div className="border border-dashed border-slate-800 rounded-lg p-3 text-center space-y-1">
                  <p className="font-bold text-white">{selectedContract.client?.companyName || 'Contratante'}</p>
                  <p className="text-[10px] text-slate-400">{selectedContract.client?.contactName}</p>
                  {selectedContract.acceptedOnline ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                      <ShieldCheck className="w-3 h-3" /> Aceite Digital em {formatDatePtBR(selectedContract.acceptedAt || '')}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-mono">
                      Aguardando Aceite / Assinatura do Cliente
                    </span>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
