'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  AlertCircle,
  Eye,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Zap,
  Layers,
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
import { DEFAULT_CONTRACT_TEMPLATE } from '@/data/mztech-constants';

export default function MzTechContractsPage() {
  const [contracts, setContracts] = useState<MzContractItem[]>([]);
  const [clients, setClients] = useState<MzClientItem[]>([]);
  const [projects, setProjects] = useState<MzProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<MzContractItem | null>(null);
  const [isCustomClient, setIsCustomClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: 'PLAN_HOSP_MANUT',
    title: '',
    content: DEFAULT_CONTRACT_TEMPLATE,
    totalDevPrice: '1200.00',
    monthlyPrice: '79.90',
    paymentMethod: 'Cartão de Crédito (Recorrência Mensal)',
    termsVersion: 'v2.0-2026',
    codeOwnershipType: 'PROPRIEDADE_CLIENTE' as CodeOwnershipType,
    backupRetentionDays: '30',
    migrationExcluded: true,
    status: 'RASCUNHO' as ContractStatus,
    signedAt: '',
    notes: 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
  });
  const [submitting, setSubmitting] = useState(false);

  // Modal Visualização do Contrato
  const [viewingContract, setViewingContract] = useState<MzContractItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
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
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingContract(null);
    setFormData({
      clientId: clients.length > 0 ? clients[0].id : '',
      projectId: 'PLAN_HOSP_MANUT',
      title: 'Contrato de Prestação de Serviços Digitais & Políticas Comerciais',
      content: DEFAULT_CONTRACT_TEMPLATE,
      totalDevPrice: '1200.00',
      monthlyPrice: '79.90',
      paymentMethod: 'Cartão de Crédito (Recorrência Mensal)',
      termsVersion: 'v2.0-2026',
      codeOwnershipType: 'PROPRIEDADE_CLIENTE',
      backupRetentionDays: '30',
      migrationExcluded: true,
      status: 'RASCUNHO',
      signedAt: '',
      notes: 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (contract: MzContractItem) => {
    setEditingContract(contract);
    setFormData({
      clientId: contract.clientId,
      projectId: contract.projectId || '',
      title: contract.title,
      content: contract.content,
      totalDevPrice: contract.totalDevPrice.toString(),
      monthlyPrice: contract.monthlyPrice.toString(),
      paymentMethod: contract.paymentMethod || 'Cartão de Crédito (Recorrência Mensal)',
      termsVersion: contract.termsVersion,
      codeOwnershipType: contract.codeOwnershipType || 'PROPRIEDADE_CLIENTE',
      backupRetentionDays: (contract.backupRetentionDays || 30).toString(),
      migrationExcluded: contract.migrationExcluded !== undefined ? contract.migrationExcluded : true,
      status: contract.status,
      signedAt: contract.signedAt ? new Date(contract.signedAt).toISOString().split('T')[0] : '',
      notes: contract.notes || '',
    });
    setModalOpen(true);
  };

  // Manipulador de mudança de Plano ou Projeto vinculado
  const handlePlanOrProjectChange = (val: string) => {
    let updatedMonthly = formData.monthlyPrice;
    let planNote = formData.notes;

    if (val === 'PLAN_HOSP_MANUT') {
      updatedMonthly = '79.90';
      planNote = 'Plano Hospedagem + Manutenção (R$ 79,90/mês)';
    } else if (val === 'PLAN_HOSP') {
      updatedMonthly = '39.90';
      planNote = 'Plano Hospedagem Cloud (R$ 39,90/mês)';
    } else if (val === 'PLAN_DEV_ONLY') {
      updatedMonthly = '0.00';
      planNote = 'Apenas Desenvolvimento (Sem Mensalidade)';
    } else if (val === 'PLAN_CUSTOM') {
      planNote = 'Plano Sob Medida / Sistema Dedicado';
    } else {
      const selectedProj = projects.find((p) => p.id === val);
      if (selectedProj) {
        planNote = `Projeto: ${selectedProj.name}`;
      }
    }

    setFormData((prev) => ({
      ...prev,
      projectId: val,
      monthlyPrice: updatedMonthly,
      notes: planNote,
    }));
  };

  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCustomClient && !newClientName.trim()) {
      alert('Informe o nome do novo cliente / empresa.');
      return;
    }
    if (!isCustomClient && !formData.clientId) {
      alert('Selecione o cliente ou digite um novo nome.');
      return;
    }
    if (!formData.title) {
      alert('Informe o título do contrato.');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingContract
        ? `/api/mztech/contracts/${editingContract.id}`
        : '/api/mztech/contracts';
      const method = editingContract ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        newClientName: isCustomClient ? newClientName.trim() : undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar contrato.');
        return;
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      alert('Erro de conexão ao salvar contrato.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContract = async (id: string, title: string) => {
    if (!confirm(`Deseja realmente excluir o contrato "${title}"?`)) return;

    try {
      const res = await fetch(`/api/mztech/contracts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        alert('Erro ao excluir contrato.');
      }
    } catch (err) {
      alert('Erro ao excluir contrato.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-cyan-400" />
            <span>Gestão de Contratos mzTech</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Contratos com 12 cláusulas oficiais, planos vinculados, opções com Cartão de Crédito e políticas de entrega.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-md shadow-cyan-500/10 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Gerar Novo Contrato</span>
        </button>
      </div>

      {/* Alerta de Diretrizes Comerciais e Contratuais */}
      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white">Cláusulas Contratuais & Pagamento:</p>
          <p className="text-slate-300 mt-0.5 leading-relaxed">
            • <strong>Formas de Pagamento:</strong> Cartão de Crédito (Recorrente/Parcelado), PIX, Boleto Bancário ou Misto.<br />
            • <strong>Planos Disponíveis:</strong> Hospedagem + Manutenção (R$ 79,90) | Hospedagem Cloud (R$ 39,90) | Dev Único | Sob Medida.<br />
            • <strong>Encerramento:</strong> Entrega formal de ativos (código e dump). A nova hospedagem é responsabilidade do cliente.
          </p>
        </div>
      </div>

      {/* Tabela de Contratos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Carregando contratos...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-medium">Nenhum contrato gerado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Título & Cliente</th>
                  <th className="px-6 py-4">Plano / Projeto</th>
                  <th className="px-6 py-4">Valores & Pagamento</th>
                  <th className="px-6 py-4">Regime do Código</th>
                  <th className="px-6 py-4">Versão & Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Título & Cliente */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-white text-base">{c.title}</p>
                      <p className="text-xs text-cyan-400 mt-0.5">
                        Cliente: <strong>{c.client?.companyName}</strong> ({c.client?.contactName})
                      </p>
                    </td>

                    {/* Plano / Projeto */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300">
                      <p className="font-semibold text-white">
                        {c.project?.name || c.notes || 'Plano mzTech'}
                      </p>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Retenção: {c.backupRetentionDays || 30} dias
                      </span>
                    </td>

                    {/* Valores & Pagamento */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs space-y-0.5">
                      <p className="text-slate-300">
                        Dev Inicial: <strong className="text-white">{formatCurrency(c.totalDevPrice)}</strong>
                      </p>
                      <p className="text-emerald-400 font-semibold">
                        Mensalidade: {formatCurrency(c.monthlyPrice)}/mês
                      </p>
                      <p className="text-[11px] text-cyan-300 flex items-center gap-1 font-mono">
                        <CreditCard className="w-3 h-3 text-cyan-400" />
                        <span>{c.paymentMethod || 'Cartão de Crédito / PIX'}</span>
                      </p>
                    </td>

                    {/* Regime do Código */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                        {c.codeOwnershipType || 'PROPRIEDADE_CLIENTE'}
                      </span>
                    </td>

                    {/* Status & Versão */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[10px] block w-fit mb-1">
                        {c.termsVersion}
                      </span>
                      {c.status === 'ASSINADO' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Assinado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-300 font-semibold text-xs">
                          <Clock className="w-3.5 h-3.5" /> {c.status}
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => setViewingContract(c)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
                        title="Visualizar / Imprimir Contrato"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
                        title="Editar Contrato"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteContract(c.id, c.title)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                        title="Remover Contrato"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Visualização & Impressão do Contrato */}
      {viewingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
              <div>
                <h3 className="font-bold text-lg text-white">{viewingContract.title}</h3>
                <p className="text-xs text-cyan-400">
                  Cliente: {viewingContract.client?.companyName} • Versão: {viewingContract.termsVersion}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={() => setViewingContract(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cabeçalho do Documento */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
              <p>
                <strong>CONTRATADA:</strong> mzTech Soluções Digitais (contato@mztech.com.br)
              </p>
              <p>
                <strong>CONTRATANTE:</strong> {viewingContract.client?.companyName} (Resp:{' '}
                {viewingContract.client?.contactName} • Tel: {viewingContract.client?.whatsapp})
              </p>
              <p>
                <strong>PLANO / PROJETO:</strong> {viewingContract.project?.name || viewingContract.notes || 'Plano mzTech'}
              </p>
              <p>
                <strong>VALOR DESENVOLVIMENTO:</strong> {formatCurrency(viewingContract.totalDevPrice)}
              </p>
              <p>
                <strong>MENSALIDADE (Hospedagem & Manutenção):</strong>{' '}
                {formatCurrency(viewingContract.monthlyPrice)}/mês
              </p>
              <p>
                <strong>REGIME DO CÓDIGO:</strong> {viewingContract.codeOwnershipType}
              </p>
              <p>
                <strong>RETENÇÃO DE BACKUP:</strong> {viewingContract.backupRetentionDays || 30} dias
              </p>
              <p>
                <strong>FORMA DE PAGAMENTO:</strong> {viewingContract.paymentMethod}
              </p>
            </div>

            {/* Texto das Cláusulas */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 font-serif text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              {viewingContract.content}
            </div>

            <div className="flex justify-end border-t border-slate-800 pt-4 print:hidden">
              <button
                onClick={() => setViewingContract(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulário de Criação/Edição de Contrato */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg text-white">
                  {editingContract ? 'Editar Contrato' : 'Gerar Novo Contrato mzTech'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-slate-400">Cliente *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomClient(!isCustomClient);
                        if (!isCustomClient) {
                          setFormData((prev) => ({ ...prev, clientId: 'NEW' }));
                        } else {
                          setFormData((prev) => ({ ...prev, clientId: clients[0]?.id || '' }));
                        }
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold hover:underline flex items-center gap-1 transition-colors"
                    >
                      <span>{isCustomClient ? 'Selecionar Existente' : '+ Digitar Nome'}</span>
                    </button>
                  </div>

                  {isCustomClient ? (
                    <input
                      type="text"
                      required
                      placeholder="Digite o nome da empresa / cliente..."
                      value={newClientName}
                      onChange={(e) => {
                        setNewClientName(e.target.value);
                        setFormData((prev) => ({ ...prev, clientId: 'NEW' }));
                      }}
                      className="w-full bg-slate-950 border border-cyan-500/60 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400 font-medium"
                      autoFocus
                    />
                  ) : (
                    <select
                      required
                      value={formData.clientId}
                      onChange={(e) => {
                        if (e.target.value === 'NEW') {
                          setIsCustomClient(true);
                          setFormData({ ...formData, clientId: 'NEW' });
                        } else {
                          setFormData({ ...formData, clientId: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">Selecione o Cliente</option>
                      <option value="NEW" className="text-cyan-400 font-bold bg-slate-900">
                        ✍️ + Digitar Nome de Novo Cliente...
                      </option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName} ({c.contactName})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Plano / Projeto Vinculado */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Plano / Projeto Vinculado *</span>
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => handlePlanOrProjectChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400 font-medium"
                  >
                    <optgroup label="⭐ Planos Oficiais mzTech">
                      <option value="PLAN_HOSP_MANUT">
                        Plano Hospedagem + Manutenção (R$ 79,90/mês)
                      </option>
                      <option value="PLAN_HOSP">
                        Plano Hospedagem Cloud (R$ 39,90/mês)
                      </option>
                      <option value="PLAN_DEV_ONLY">
                        Apenas Desenvolvimento (Sem Mensalidade - R$ 0,00)
                      </option>
                      <option value="PLAN_CUSTOM">
                        Plano Sob Medida / Sistema Dedicado
                      </option>
                    </optgroup>

                    {projects.length > 0 && (
                      <optgroup label="📂 Projetos Específicos do Cliente">
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            Projeto: {p.name}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    <optgroup label="Outros">
                      <option value="">Geral / Sem vínculo específico</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Título do Contrato *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Valor Dev Inicial (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalDevPrice}
                    onChange={(e) => setFormData({ ...formData, totalDevPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Mensalidade (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ContractStatus })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="RASCUNHO">Rascunho</option>
                    <option value="EMITIDO">Emitido para Assinatura</option>
                    <option value="ASSINADO">Assinado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Regime de Propriedade do Código
                  </label>
                  <select
                    value={formData.codeOwnershipType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        codeOwnershipType: e.target.value as CodeOwnershipType,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="PROPRIEDADE_CLIENTE">Propriedade do Cliente</option>
                    <option value="LICENCA_USO">Licença de Uso</option>
                    <option value="MISTO">Misto (Cliente + Bibliotecas mzTech)</option>
                    <option value="PROPRIEDADE_MZTECH">Propriedade mzTech (SaaS)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Retenção de Backups (Dias)
                  </label>
                  <input
                    type="number"
                    value={formData.backupRetentionDays}
                    onChange={(e) => setFormData({ ...formData, backupRetentionDays: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Formas de Pagamento com Opções de Cartão e PIX */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Forma de Pagamento Acordada *</span>
                  </label>
                  <span className="text-[10px] text-cyan-400">Selecione ou edite abaixo</span>
                </div>

                {/* Dropdown com opções completas de pagamento */}
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="Cartão de Crédito (Recorrência Mensal)">
                    💳 Cartão de Crédito (Recorrência Mensal)
                  </option>
                  <option value="Cartão de Crédito (À Vista ou Parcelado)">
                    💳 Cartão de Crédito (À Vista ou Parcelado)
                  </option>
                  <option value="Cartão de Crédito + PIX">
                    💳 + ⚡ Cartão de Crédito + PIX
                  </option>
                  <option value="PIX / Transferência Bancária">
                    ⚡ PIX / Transferência Bancária
                  </option>
                  <option value="Boleto Bancário Mensal">
                    📄 Boleto Bancário Mensal
                  </option>
                  <option value="PIX / Cartão de Crédito / Boleto">
                    🌐 PIX / Cartão de Crédito / Boleto (Flexível)
                  </option>
                  <option value="Outro (Personalizado)">
                    ✏️ Outro (Especificar manualmente)
                  </option>
                </select>

                {/* Chips de Seleção Rápida */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, paymentMethod: 'Cartão de Crédito (Recorrência Mensal)' })
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <CreditCard className="w-3 h-3 text-cyan-400" />
                    <span>Cartão Recorrente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, paymentMethod: 'Cartão de Crédito + PIX' })
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Cartão + PIX</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, paymentMethod: 'PIX / Transferência Bancária' })
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span>PIX Direto</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Texto Completo das Cláusulas do Contrato (Editável)
                </label>
                <textarea
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 flex items-center gap-2 shadow-md shadow-cyan-500/10"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Salvar Contrato</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
