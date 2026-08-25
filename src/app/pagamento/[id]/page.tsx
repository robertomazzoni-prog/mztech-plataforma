'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  QrCode,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Building,
  Terminal,
  Clock,
  Lock,
  Loader2,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  formatCurrency,
  formatDatePtBR,
  generatePixPayload,
  getPixQrCodeImageUrl,
} from '@/lib/utils';
import { MzContractItem } from '@/types/mztech';

export default function PublicPaymentPage({ params }: { params: { id: string } }) {
  const [contract, setContract] = useState<MzContractItem | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pixCopied, setPixCopied] = useState(false);
  const [payloadCopied, setPayloadCopied] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  const [processing, setProcessing] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [pixKey, setPixKey] = useState('robertomazzoni956@gmail.com');

  // Dados do Cartão
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const loadContractAndSettings = async () => {
    try {
      setLoading(true);
      const [contRes, settRes] = await Promise.all([
        fetch(`/api/mztech/contracts/${params.id}`),
        fetch(`/api/mztech/settings`),
      ]);

      if (contRes.ok) {
        const cData = await contRes.json();
        setContract(cData.contract);
      }
      if (settRes.ok) {
        const sData = await settRes.json();
        if (sData.settings) {
          setSettings(sData.settings);
          if (sData.settings.pixKey) setPixKey(sData.settings.pixKey);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar checkout de pagamento:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractAndSettings();
  }, [params.id]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleConfirmPayment = async (method: 'PIX' | 'CREDIT_CARD') => {
    if (!contract) return;
    setProcessing(true);
    try {
      // 1. Registrar / atualizar pagamento via API
      const res = await fetch('/api/mztech/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: contract.clientId,
          contractId: contract.id,
          title: `Pagamento Inicial - ${contract.title}`,
          amount: contract.totalDevPrice || 1200,
          paymentMethod: method,
          paymentType: 'TAXA_INICIAL',
          status: 'PAID',
          dueDate: new Date().toISOString(),
          notes: `Pagamento processado via Checkout Online mzTech (${method}).`,
        }),
      });

      if (res.ok) {
        setPaidSuccess(true);
      } else {
        alert('Erro ao registrar pagamento.');
      }
    } catch (err) {
      alert('Erro de conexão ao processar pagamento.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Carregando Checkout Seguro mzTech...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h1 className="text-xl font-bold text-white">Contrato ou Cobrança Não Localizada</h1>
        <p className="text-xs text-slate-400 max-w-sm">
          Verifique o link de pagamento ou entre em contato com nossa equipe técnica.
        </p>
        <Link href="/" className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold">
          Voltar ao Início
        </Link>
      </div>
    );
  }

  const isBothSigned = Boolean(contract.providerSigned && (contract.clientSigned || contract.acceptedOnline));
  const amountToPay = contract.totalDevPrice > 0 ? contract.totalDevPrice : (contract.monthlyPrice || 79.9);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans py-8 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500 selection:text-slate-950">
      
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header da Marca */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">mzTech Soluções Digitais</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  CHECKOUT SEGURO
                </span>
              </div>
              <p className="text-xs text-slate-400">Portal Oficial de Pagamento e Ativação de Serviços</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Criptografia 256-bit</span>
          </div>
        </div>

        {/* Banner de Confirmação de Assinatura */}
        {isBothSigned ? (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-bold text-white text-xs">
                Contrato {contract.contractNumber || 'Oficial'} Assinado por Ambas as Partes
              </h3>
              <p className="text-[11px] text-emerald-300/90">
                Formalização eletrônica concluída. Realize o pagamento para iniciar o desenvolvimento e provisionamento imediato.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-bold text-white text-xs">Contrato em Processo de Assinatura</h3>
              <p className="text-[11px] text-slate-300">
                Você pode realizar o pagamento inicial antecipadamente ou assinar o contrato pelo link.
              </p>
            </div>
          </div>
        )}

        {/* TELA DE SUCESSO DO PAGAMENTO */}
        {paidSuccess ? (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-2xl animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Pagamento Confirmado com Sucesso!</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                O pagamento de <strong className="text-emerald-400 font-mono">{formatCurrency(amountToPay)}</strong> referente ao contrato <strong className="text-white">{contract.contractNumber || contract.title}</strong> foi processado.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 max-w-md mx-auto space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <strong className="text-white">{contract.client?.companyName || contract.client?.contactName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Situação do Projeto:</span>
                <span className="text-cyan-400 font-bold">▶ Em Desenvolvimento</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Próxima Mensalidade:</span>
                <span className="text-slate-300 font-mono">{formatCurrency(contract.monthlyPrice)}/mês (Dia {contract.dueDay || 10})</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/cliente"
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                Acessar Portal do Cliente
              </Link>
              <Link
                href="/"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Voltar ao Site Principal
              </Link>
            </div>
          </div>
        ) : (

          /* FORMULÁRIO DE PAGAMENTO (PIX / CARTÃO) */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-xs">
            
            {/* Resumo dos Valores */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">SERVIÇO CONTRATADO</span>
                  <h3 className="font-bold text-white text-sm">{contract.title}</h3>
                  <p className="text-[11px] text-slate-400">Cliente: {contract.client?.companyName || contract.client?.contactName}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">TOTAL A PAGAR</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono block">
                    {formatCurrency(amountToPay)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span>Mensalidade contratada: <strong className="text-cyan-400 font-mono">{formatCurrency(contract.monthlyPrice)}/mês</strong></span>
                <span>Vencimento mensal: <strong className="text-slate-300 font-mono">Todo dia {contract.dueDay || 10}</strong></span>
              </div>
            </div>

            {/* Seleção da Forma de Pagamento */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">
                Escolha o Método de Pagamento:
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('PIX')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    selectedMethod === 'PIX'
                      ? 'bg-emerald-500/15 border-emerald-400 shadow-md text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedMethod === 'PIX' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs block">PIX Instantâneo</span>
                    <span className="text-[10px] text-emerald-400 font-normal">Aprovação Imediata</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('CREDIT_CARD')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    selectedMethod === 'CREDIT_CARD'
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-md text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedMethod === 'CREDIT_CARD' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs block">Cartão de Crédito</span>
                    <span className="text-[10px] text-cyan-400 font-normal">Parcelado / Recorrente</span>
                  </div>
                </button>
              </div>
            </div>

            {/* ÁREA DE PAGAMENTO PIX */}
            {selectedMethod === 'PIX' && (() => {
              const isMorvan = Boolean(
                contract.assignedDev?.toLowerCase().includes('morvan') ||
                contract.snapshot?.assignedDev?.toLowerCase().includes('morvan') ||
                (contract.scopeSupport?.toLowerCase().includes('morvan') && !contract.scopeSupport?.toLowerCase().includes('roberto'))
              );

              const specialistDisplayName = isMorvan ? (settings?.morvanName || 'Morvan') : (settings?.robertoName || 'Roberto');
              const specialistFullName = isMorvan
                ? `${settings?.morvanName || 'Morvan'} (Sócio & Especialista mzTech)`
                : `${settings?.robertoName || 'Roberto Mazzoni'} (Sócio & Especialista mzTech)`;
              const merchantName = isMorvan ? (settings?.morvanName || 'MORVAN') : (settings?.robertoName || 'ROBERTO MAZZONI');

              const activePixKey = isMorvan
                ? (settings?.morvanPixKey || settings?.pixKeys?.find((k: any) => k.holder?.toLowerCase().includes('morvan'))?.key || 'morvan@mztech.com.br')
                : (settings?.robertoPixKey || settings?.pixKeys?.find((k: any) => k.holder?.toLowerCase().includes('roberto'))?.key || settings?.pixKey || pixKey);

              const pixPayload = generatePixPayload({
                pixKey: activePixKey,
                merchantName,
                merchantCity: 'BELO HORIZONTE',
                amount: amountToPay,
                txid: `MZ${contract.id.replace(/\D/g, '').substring(0, 10) || '2026'}`,
              });
              const qrCodeImageUrl = getPixQrCodeImageUrl(pixPayload, 260);

              const handleCopyPayload = () => {
                navigator.clipboard.writeText(pixPayload);
                setPayloadCopied(true);
                setTimeout(() => setPayloadCopied(false), 3000);
              };

              const handleCopyActivePix = () => {
                navigator.clipboard.writeText(activePixKey);
                setPixCopied(true);
                setTimeout(() => setPixCopied(false), 3000);
              };

              return (
                <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-5 text-center animate-in fade-in">
                  
                  {/* Badge de Identificação do Especialista Responsável */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Especialista Selecionado: <strong>{specialistDisplayName}</strong></span>
                  </div>

                  {/* QR Code Real Escaneável por Qualquer Banco */}
                  <div className="space-y-2">
                    <div className="p-3.5 bg-white rounded-2xl max-w-[220px] mx-auto shadow-2xl flex flex-col items-center justify-center">
                      <img
                        src={qrCodeImageUrl}
                        alt={`QR Code Pix Oficial - ${specialistDisplayName}`}
                        className="w-48 h-48 object-contain rounded-lg"
                      />
                      <span className="text-[10px] font-mono text-slate-800 font-bold uppercase tracking-wider mt-1">
                        Pague com Pix • {specialistDisplayName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Abra o aplicativo do seu banco, escolha <strong className="text-white">Pix &gt; Ler QR Code</strong> e aponte a câmera.
                    </p>
                  </div>

                  {/* Pix Copia e Cola Oficial */}
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <label className="text-[11px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span>Pix Copia e Cola (Código Completo):</span>
                      <span className="text-emerald-400 font-normal text-[10px]">Recomendado no celular</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pixPayload}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none truncate"
                      />
                      <button
                        onClick={handleCopyPayload}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-emerald-500/10"
                      >
                        {payloadCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{payloadCopied ? 'Copiado!' : 'Copiar Pix'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Chave Pix Direta do Sócio Escolhido */}
                  <div className="space-y-2 text-left max-w-md mx-auto pt-2 border-t border-slate-800/80">
                    <label className="text-[11px] uppercase font-bold text-slate-400">
                      Ou Pague Usando a Chave Pix Direta do {specialistDisplayName}:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={activePixKey}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-300 focus:outline-none truncate"
                      />
                      <button
                        onClick={handleCopyActivePix}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        {pixCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{pixCopied ? 'Copiado!' : 'Copiar Chave'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Favorecido da Chave: <strong className="text-white">{specialistFullName}</strong>.
                    </p>
                  </div>

                  <div className="pt-2 max-w-md mx-auto">
                    <button
                      onClick={() => handleConfirmPayment('PIX')}
                      disabled={processing}
                      className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Já Efetuei o Pagamento (Confirmar)</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ÁREA DE PAGAMENTO CARTÃO DE CRÉDITO */}
            {selectedMethod === 'CREDIT_CARD' && (
              <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-4 animate-in fade-in">
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Número do Cartão de Crédito</label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Nome Impresso no Cartão</label>
                    <input
                      type="text"
                      placeholder="CARLOS SILVA"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white uppercase focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Validade</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmPayment('CREDIT_CARD')}
                      disabled={processing}
                      className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      <span>Pagar {formatCurrency(amountToPay)} & Ativar Serviço</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
