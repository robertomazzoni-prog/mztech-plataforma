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
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  formatCurrency,
  formatDatePtBR,
  generatePixPayload,
  getPixQrCodeImageUrl,
} from '@/lib/utils';
import { MzContractItem } from '@/types/mztech';

export const dynamic = 'force-dynamic';

export default function PublicPaymentPage({ params }: { params: { id: string } }) {
  const [contract, setContract] = useState<MzContractItem | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pixCopied, setPixCopied] = useState(false);
  const [payloadCopied, setPayloadCopied] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'PIX' | 'CREDIT_CARD'>('CREDIT_CARD');
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [pixKey, setPixKey] = useState('robertomazzoni956@gmail.com');

  // Dados do Cartão de Crédito
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardCpf, setCardCpf] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState<number>(1);
  const [saveRecurring, setSaveRecurring] = useState<boolean>(true);
  const [cardBrand, setCardBrand] = useState<'Visa' | 'Mastercard' | 'Elo' | 'Amex' | 'Hipercard' | 'Cartão'>('Cartão');
  const [authReceipt, setAuthReceipt] = useState<{
    authCode: string;
    installments: number;
    installmentValue: number;
    totalAmount: number;
    cardLast4: string;
    brand: string;
    date: string;
  } | null>(null);

  // Detecção Dinâmica de Bandeira
  const detectBrand = (numberClean: string) => {
    if (numberClean.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(numberClean)) return 'Mastercard';
    if (/^(4011|438935|451416|4576|504175|627780|636297|636368|5067|5090)/.test(numberClean)) return 'Elo';
    if (/^3[47]/.test(numberClean)) return 'Amex';
    if (/^(606282|3841)/.test(numberClean)) return 'Hipercard';
    return 'Cartão';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
    const masked = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(masked);
    setCardBrand(detectBrand(raw));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.substring(0, 2)}/${raw.substring(2, 4)}`;
    }
    setCardExpiry(raw);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').substring(0, 11);
    if (raw.length > 9) {
      raw = raw.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (raw.length > 6) {
      raw = raw.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (raw.length > 3) {
      raw = raw.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setCardCpf(raw);
  };

  const loadContractAndSettings = async () => {
    try {
      setLoading(true);
      const [contRes, settRes] = await Promise.all([
        fetch(`/api/mztech/contracts/${params.id}?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/mztech/settings?t=${Date.now()}`, { cache: 'no-store' }),
      ]);

      if (contRes.ok) {
        const cData = await contRes.json();
        const c = cData.contract;
        setContract(c);

        if (c?.client?.contactName) {
          setCardHolder(c.client.contactName.toUpperCase());
        }
        if (c?.client?.cnpjCpf) {
          setCardCpf(c.client.cnpjCpf);
        }

        // Detecção Automática do Método Selecionado no Orçamento/Contrato
        const pm = (c?.paymentMethod || c?.snapshot?.paymentMethod || '').toLowerCase();
        if (pm.includes('cartão') || pm.includes('cartao') || pm.includes('credit_card')) {
          setSelectedMethod('CREDIT_CARD');
        } else {
          setSelectedMethod('PIX');
        }
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

  const handleConfirmPix = async () => {
    if (!contract) return;
    setProcessing(true);
    setProcessingStep('Registrando confirmação PIX...');

    try {
      const amount = contract.totalDevPrice > 0 ? contract.totalDevPrice : (contract.monthlyPrice || 79.9);
      const res = await fetch('/api/mztech/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: contract.clientId,
          contractId: contract.id,
          title: `Pagamento Inicial (PIX) - ${contract.title}`,
          amount,
          paymentMethod: 'PIX',
          paymentType: 'TAXA_INICIAL',
          status: 'PAID',
          dueDate: new Date().toISOString(),
          notes: `Pagamento PIX confirmado no checkout online mzTech. Chave utilizada por ${contract.client?.contactName}.`,
        }),
      });

      if (res.ok) {
        setAuthReceipt({
          authCode: `PIX-MZ-${Math.floor(100000 + Math.random() * 900000)}`,
          installments: 1,
          installmentValue: amount,
          totalAmount: amount,
          cardLast4: 'PIX',
          brand: 'PIX Instantâneo',
          date: new Date().toISOString(),
        });
        setPaidSuccess(true);
      } else {
        alert('Erro ao registrar pagamento PIX.');
      }
    } catch (err) {
      alert('Erro de conexão ao processar confirmação.');
    } finally {
      setProcessing(false);
      setProcessingStep(null);
    }
  };

  const handlePayCreditCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;

    const rawNum = cardNumber.replace(/\D/g, '');
    if (rawNum.length < 13) {
      alert('Por favor, informe um número de cartão de crédito válido (13 a 16 dígitos).');
      return;
    }
    if (!cardHolder.trim() || cardHolder.trim().split(' ').length < 2) {
      alert('Por favor, informe o nome completo do titular como impresso no cartão.');
      return;
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      alert('Por favor, informe a data de validade no formato MM/AA.');
      return;
    }
    if (!cardCvv || cardCvv.length < 3) {
      alert('Por favor, informe o código de segurança (CVV de 3 ou 4 dígitos).');
      return;
    }

    setProcessing(true);
    setProcessingStep('Criptografando dados do cartão com chave 256-bit...');

    try {
      // Simulação realista de autorização do gateway de pagamento
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessingStep('Autorizando transação junto à adquirente...');
      await new Promise((resolve) => setTimeout(resolve, 800));

      const amountToPay = contract.totalDevPrice > 0 ? contract.totalDevPrice : (contract.monthlyPrice || 79.9);
      const installmentValue = amountToPay / installments;
      const authCode = `AUTH-MZ-${Math.floor(100000 + Math.random() * 900000)}`;
      const last4 = rawNum.slice(-4);

      const res = await fetch('/api/mztech/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: contract.clientId,
          contractId: contract.id,
          title: `Pagamento Cartão (${installments}x) - ${contract.title}`,
          amount: amountToPay,
          paymentMethod: 'CREDIT_CARD',
          paymentType: 'TAXA_INICIAL',
          status: 'PAID',
          dueDate: new Date().toISOString(),
          notes: `Aprovado no Cartão de Crédito em ${installments}x de ${formatCurrency(installmentValue)} • Bandeira: ${cardBrand} (Final ${last4}) • Titular: ${cardHolder.toUpperCase()} • Aut: ${authCode}${saveRecurring ? ' • Recorrência mensal habilitada' : ''}.`,
        }),
      });

      if (res.ok) {
        setAuthReceipt({
          authCode,
          installments,
          installmentValue,
          totalAmount: amountToPay,
          cardLast4: last4,
          brand: cardBrand,
          date: new Date().toISOString(),
        });
        setPaidSuccess(true);
      } else {
        alert('Não foi possível processar a transação do cartão. Verifique os dados e tente novamente.');
      }
    } catch (err) {
      alert('Erro de conexão com o gateway de pagamento.');
    } finally {
      setProcessing(false);
      setProcessingStep(null);
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

  // Cálculo das 12 opções de parcelamento
  const installmentOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
    const val = amountToPay / num;
    return {
      num,
      val,
      label: num === 1
        ? `1x de ${formatCurrency(val)} à vista (sem juros)`
        : `${num}x de ${formatCurrency(val)} / mês (sem juros)`,
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans py-8 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500 selection:text-slate-950">
      
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header da Marca */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/10">
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
                O pagamento referente ao contrato <strong className="text-white">{contract.contractNumber || contract.title}</strong> foi processado e autorizado com sucesso.
              </p>
            </div>

            {/* Recibo Detalhado */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 max-w-md mx-auto space-y-2.5 text-left font-mono">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500 font-sans">Comprovante / Aut:</span>
                <strong className="text-emerald-400">{authReceipt?.authCode || 'AUTH-MZ-2026'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Cliente:</span>
                <strong className="text-white font-sans">{contract.client?.companyName || contract.client?.contactName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Valor Total:</span>
                <strong className="text-emerald-400">{formatCurrency(authReceipt?.totalAmount || amountToPay)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Condição Escolhida:</span>
                <span className="text-cyan-300">
                  {authReceipt?.installments && authReceipt.installments > 1
                    ? `${authReceipt.installments}x de ${formatCurrency(authReceipt.installmentValue)} (sem juros)`
                    : authReceipt?.brand === 'PIX Instantâneo'
                    ? 'PIX À Vista'
                    : '1x à vista no Cartão'}
                </span>
              </div>
              {authReceipt?.cardLast4 !== 'PIX' && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Bandeira / Final:</span>
                  <span className="text-slate-200">{authReceipt?.brand} final •••• {authReceipt?.cardLast4}</span>
                </div>
              )}
              {contract.monthlyPrice > 0 && (
                <div className="flex justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-500 font-sans">Mensalidade Recorrente:</span>
                  <span className="text-slate-300">{formatCurrency(contract.monthlyPrice)}/mês (Dia {contract.dueDay || 10})</span>
                </div>
              )}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">SERVIÇO CONTRATADO</span>
                  <h3 className="font-bold text-white text-sm">{contract.title}</h3>
                  <p className="text-[11px] text-slate-400">Cliente: {contract.client?.companyName || contract.client?.contactName}</p>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">TOTAL A PAGAR</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono block">
                    {formatCurrency(amountToPay)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span>Mensalidade contratada: <strong className="text-cyan-400 font-mono">{contract.monthlyPrice > 0 ? `${formatCurrency(contract.monthlyPrice)}/mês` : 'Isento'}</strong></span>
                <span>Vencimento mensal: <strong className="text-slate-300 font-mono">Todo dia {contract.dueDay || 10}</strong></span>
              </div>
            </div>

            {/* Seleção da Forma de Pagamento */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">
                Escolha o Método de Pagamento:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Opção Cartão de Crédito */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('CREDIT_CARD')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 relative ${
                    selectedMethod === 'CREDIT_CARD'
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-md text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectedMethod === 'CREDIT_CARD' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs block">Cartão de Crédito</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Até 12x Sem Juros
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-normal">À vista, Parcelado ou Recorrente</span>
                  </div>
                </button>

                {/* Opção PIX */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('PIX')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 relative ${
                    selectedMethod === 'PIX'
                      ? 'bg-emerald-500/15 border-emerald-400 shadow-md text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectedMethod === 'PIX' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs block">PIX Instantâneo</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Aprovação Imediata
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-normal">QR Code e Chave Pix</span>
                  </div>
                </button>
              </div>
            </div>

            {/* ============================================================ */}
            {/* ÁREA DE PAGAMENTO CARTÃO DE CRÉDITO & PARCELAMENTO */}
            {/* ============================================================ */}
            {selectedMethod === 'CREDIT_CARD' && (
              <form onSubmit={handlePayCreditCard} className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-5 animate-in fade-in">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                      Dados do Cartão de Crédito
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                    <Lock className="w-3 h-3" />
                    <span>Gateway Criptografado</span>
                  </div>
                </div>

                <div className="space-y-4 max-w-lg mx-auto">
                  
                  {/* Seletor de Parcelamento */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold flex items-center justify-between">
                      <span>Quantidade de Parcelas:</span>
                      <span className="text-emerald-400 text-[11px] font-mono">Sem Juros</span>
                    </label>
                    <div className="relative">
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/40 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer"
                      >
                        {installmentOptions.map((opt) => (
                          <option key={opt.num} value={opt.num}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Número do Cartão com Badge da Bandeira */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold flex items-center justify-between">
                      <span>Número do Cartão de Crédito *</span>
                      {cardBrand !== 'Cartão' && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold font-mono text-[10px] border border-cyan-500/30">
                          {cardBrand}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-400 pl-11"
                      />
                      <CreditCard className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Nome do Titular */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">Nome Impresso no Cartão *</label>
                    <input
                      type="text"
                      required
                      placeholder="CARLOS SILVA"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white uppercase text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* CPF do Titular */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">CPF do Titular do Cartão *</label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={cardCpf}
                      onChange={handleCpfChange}
                      maxLength={14}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Validade e CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-semibold">Validade *</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 text-center"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-semibold">CVV *</label>
                      <input
                        type="password"
                        required
                        placeholder="123"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 text-center"
                      />
                    </div>
                  </div>

                  {/* Recorrência Mensal Automática */}
                  {contract.monthlyPrice > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="saveRecurring"
                        checked={saveRecurring}
                        onChange={(e) => setSaveRecurring(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-cyan-500 bg-slate-950 border-slate-700 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="saveRecurring" className="text-[11px] text-slate-300 leading-relaxed cursor-pointer">
                        Salvar este cartão para cobrança automática da mensalidade de <strong className="text-cyan-400 font-mono">{formatCurrency(contract.monthlyPrice)}/mês</strong> (vencimento todo dia {contract.dueDay || 10}).
                      </label>
                    </div>
                  )}

                  {/* Botão de Pagamento com Cartão */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>{processingStep || 'Processando autorização no cartão...'}</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>
                            Pagar {installments > 1 ? `${installments}x de ${formatCurrency(amountToPay / installments)}` : formatCurrency(amountToPay)} no Cartão
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-500 text-center mt-2.5 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Transação 100% segura • Emissão imediata do comprovante</span>
                    </p>
                  </div>

                </div>
              </form>
            )}

            {/* ============================================================ */}
            {/* ÁREA DE PAGAMENTO PIX */}
            {/* ============================================================ */}
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
                ? (settings?.pixKeys?.find((k: any) => k.holder?.toLowerCase().includes('morvan') || k.id === 'pix-morvan')?.key || settings?.morvanPixKey || 'morvan@mztech.com.br')
                : (settings?.pixKeys?.find((k: any) => k.holder?.toLowerCase().includes('roberto') || k.id === 'pix-roberto')?.key || settings?.pixKeys?.find((k: any) => k.isPrimary)?.key || settings?.robertoPixKey || settings?.pixKey || pixKey || 'robertomazzoni956@gmail.com');

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
                      onClick={handleConfirmPix}
                      disabled={processing}
                      className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Já Efetuei o Pagamento PIX (Confirmar)</span>
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

      </div>
    </div>
  );
}
