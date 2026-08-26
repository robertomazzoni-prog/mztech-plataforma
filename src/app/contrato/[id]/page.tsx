'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  Printer,
  X,
  Check,
  Building,
  UserCheck,
  Loader2,
  Terminal,
  Calendar,
  AlertCircle,
  Sparkles,
  PenTool,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency, formatDatePtBR } from '@/lib/utils';
import { MzContractItem } from '@/types/mztech';

export default function PublicContractSignPage({ params }: { params: { id: string } }) {
  const [contract, setContract] = useState<MzContractItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);

  // Formulário de Assinatura do Cliente
  const [signerName, setSignerName] = useState('');
  const [signerDocument, setSignerDocument] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Canvas de Assinatura Manuscrita
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignatureDrawing, setHasSignatureDrawing] = useState(false);

  const loadContract = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/mztech/contracts/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setContract(data.contract);
        if (data.contract?.client?.contactName) {
          setSignerName(data.contract.client.contactName);
        }
        if (data.contract?.client?.cnpjCpf) {
          setSignerDocument(data.contract.client.cnpjCpf);
        }
        if (data.contract?.clientSigned || data.contract?.acceptedOnline) {
          setSignSuccess(true);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar contrato:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContract();
  }, [params.id]);

  // Controles do Canvas de Assinatura
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#38bdf8'; // Cyan text color
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignatureDrawing(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignatureDrawing(false);
  };

  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) {
      alert('Por favor, informe seu nome completo.');
      return;
    }
    if (!acceptTerms) {
      alert('Por favor, confirme a concordância com os termos do contrato.');
      return;
    }

    let signatureDataUrl = null;
    if (canvasRef.current && hasSignatureDrawing) {
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/mztech/contracts/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SIGN_CLIENT',
          clientName: signerName.trim(),
          clientDocument: signerDocument.trim(),
          clientSignatureDataUrl: signatureDataUrl,
        }),
      });

      if (res.ok) {
        setSignSuccess(true);
        loadContract();
      } else {
        const d = await res.json();
        alert(d.error || 'Erro ao registrar assinatura.');
      }
    } catch (err) {
      alert('Erro de conexão ao assinar contrato.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Carregando Instrumento Contratual mzTech...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h1 className="text-xl font-bold text-white">Contrato Não Localizado</h1>
        <p className="text-xs text-slate-400 max-w-sm">
          Este contrato pode ter sido alterado ou o link expirou. Entre em contato com nossa equipe técnica.
        </p>
        <Link href="/" className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold">
          Voltar ao Site
        </Link>
      </div>
    );
  }

  const isAlreadySignedByClient = contract.clientSigned || contract.acceptedOnline;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans py-8 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500 selection:text-slate-950">
      
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">mzTech Soluções Digitais</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  ASSINATURA DIGITAL
                </span>
              </div>
              <p className="text-xs text-slate-400">Portal Seguro de Formalização Contratual Eletrônica</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Banner de Sucesso quando assinado */}
        {isAlreadySignedByClient && (
          <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Contrato Assinado Digitalmente com Sucesso!</h3>
                <p className="text-xs text-emerald-300/90">
                  Assinatura registrada para {contract.clientSignedBy || contract.client?.contactName} em {formatDatePtBR(contract.clientSignedAt || contract.acceptedAt || '')}.
                </p>
              </div>
            </div>

            <Link
              href={`/pagamento/${contract.id}`}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pagar Agora (PIX / Cartão)</span>
            </Link>
          </div>
        )}

        {/* DOCUMENTO FORMAL EM TELA */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl text-xs text-slate-300 leading-relaxed font-sans">
          
          {/* Cabeçalho */}
          <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-black text-white">
                mz<span className="text-cyan-400">Tech</span> Soluções Digitais & Desenvolvimento
              </h1>
              <p className="text-[11px] text-slate-400">
                Roberto Mazzoni & Morvan • Belo Horizonte / MG
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                E-mail: robertomazzoni956@gmail.com • WhatsApp: (31) 98684-7049
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-cyan-400 font-bold text-xs inline-block">
                {contract.contractNumber || 'CTR-2026-0001'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Data de Emissão: {formatDatePtBR(contract.createdAt)}
              </span>
            </div>
          </div>

          {/* Qualificação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">CONTRATADA (PRESTADORA)</span>
              <strong className="text-white block">mzTech Soluções Digitais</strong>
              <p className="text-[11px] text-slate-400">Sócios: Roberto Mazzoni & Morvan</p>
              <p className="text-[11px] text-slate-400 font-mono">WhatsApp: (31) 98684-7049 / (31) 99359-7136</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">CONTRATANTE (CLIENTE)</span>
              <strong className="text-white block">{contract.client?.companyName || 'Cliente mzTech'}</strong>
              <p className="text-[11px] text-slate-400">Responsável: {contract.client?.contactName || 'Não informado'}</p>
              <p className="text-[11px] text-slate-400 font-mono">
                Contato: {contract.client?.whatsapp} • {contract.client?.email}
              </p>
            </div>
          </div>

          {/* Valores */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Serviço Contratado</th>
                  <th className="py-2.5 px-3">Modalidade</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr>
                  <td className="py-2.5 px-3 font-sans text-white">{contract.title}</td>
                  <td className="py-2.5 px-3 text-slate-400">Desenvolvimento Sob Demanda</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                    {contract.totalDevPrice > 0 ? formatCurrency(contract.totalDevPrice) : 'A Definir / Proposta'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-white">Hospedagem em Nuvem & Manutenção Mensal</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {contract.monthlyPrice > 0 ? `Mensalidade (Vencimento dia ${contract.dueDay || 10})` : 'Plano Selecionado'}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-bold ${contract.monthlyPrice > 0 ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {contract.monthlyPrice > 0 ? `${formatCurrency(contract.monthlyPrice)}/mês` : 'Não Contratada (Apenas Dev)'}
                  </td>
                </tr>
                {contract.snapshot?.hasDomain && (
                  <tr>
                    <td className="py-2.5 px-3 font-sans text-white">Domínio Próprio & Configuração DNS</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {contract.snapshot.hasDomain.toLowerCase().includes('sim') || contract.snapshot.hasDomain.toLowerCase().includes('já possuo')
                        ? 'Cliente Já Possui Domínio (Apontamento Incluso)'
                        : contract.snapshot.hasDomain}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                      Incluso no Projeto
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-2.5 px-3 font-sans text-white">Forma de Pagamento Acordada</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-sans font-semibold">
                    {contract.paymentMethod || contract.snapshot?.paymentMethod || 'Cartão de Crédito / PIX'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300 font-sans">
                    Condição Formal
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cláusulas */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] font-mono tracking-wider">
              Cláusulas & Condições Gerais:
            </h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] leading-relaxed text-slate-300 max-h-72 overflow-y-auto whitespace-pre-line">
              {contract.content}
            </div>
          </div>

          {/* ÁREA DE ASSINATURA DUPLA (PRESTADOR + CLIENTE) */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h4 className="text-xs uppercase font-mono font-bold text-slate-400">
              Assinaturas Digitais do Instrumento Contratual:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Box da mzTech (Prestador) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">PRESTADOR</span>
                <p className="font-bold text-white text-xs">mzTech Soluções Digitais</p>
                <p className="text-[11px] text-slate-400">
                  {contract.providerSignedBy || 'Roberto Mazzoni & Morvan'}
                </p>

                {contract.providerSignatureDataUrl && (
                  <div className="p-2 bg-slate-900 rounded-lg max-w-[180px] mx-auto border border-slate-800">
                    <img src={contract.providerSignatureDataUrl} alt="Rubrica Prestador" className="h-10 mx-auto object-contain" />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80">
                  {contract.providerSigned ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Assinado em {formatDatePtBR(contract.providerSignedAt || '')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Aguardando Assinatura do Prestador</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Box do Cliente (Contratante) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">CONTRATANTE</span>
                <p className="font-bold text-white text-xs">{contract.client?.companyName || 'Empresa Cliente'}</p>
                <p className="text-[11px] text-slate-400">
                  {contract.clientSignedBy || contract.client?.contactName || 'Responsável'}
                </p>

                {contract.clientSignatureDataUrl && (
                  <div className="p-2 bg-slate-900 rounded-lg max-w-[180px] mx-auto border border-slate-800">
                    <img src={contract.clientSignatureDataUrl} alt="Rubrica Cliente" className="h-10 mx-auto object-contain" />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80">
                  {isAlreadySignedByClient ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Assinado em {formatDatePtBR(contract.clientSignedAt || contract.acceptedAt || '')}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-amber-400">
                      Aguardando Assinatura do Cliente
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Certificado de Autenticidade */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[10px] font-mono text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Autenticação Digital Eletrônica mzTech Segura</span>
              </div>
              <div>
                Hash do Certificado: <strong className="text-slate-300">{contract.signatureCertificateHash || `MZ-CERT-${contract.id.substring(0, 8).toUpperCase()}-2026`}</strong>
              </div>
            </div>
          </div>

        </div>

        {/* FORMULÁRIO DE ASSINATURA DO CLIENTE (SE AINDA NÃO ASSINADO) */}
        {!isAlreadySignedByClient && (
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <PenTool className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-base text-white">Assinar Instrumento Contratual Online</h3>
            </div>

            <form onSubmit={handleSignContract} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Nome Completo do Assinante / Responsável *</label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">CPF ou CNPJ (Opcional)</label>
                  <input
                    type="text"
                    value={signerDocument}
                    onChange={(e) => setSignerDocument(e.target.value)}
                    placeholder="000.000.000-00 ou 00.000.000/0001-00"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Rubrica Manuscrita no Canvas (Opcional) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Desenhar Assinatura / Rubrica na Tela (Mouse ou Dedo no Celular)</span>
                  </label>
                  {hasSignatureDrawing && (
                    <button
                      type="button"
                      onClick={clearSignatureCanvas}
                      className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Limpar Rubrica</span>
                    </button>
                  )}
                </div>

                <div className="p-2 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center relative touch-none">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-28 bg-slate-900/60 rounded-xl cursor-crosshair border border-dashed border-slate-800"
                  />
                  {!hasSignatureDrawing && (
                    <span className="absolute text-[11px] text-slate-500 pointer-events-none">
                      Toque ou clique aqui para desenhar sua assinatura
                    </span>
                  )}
                </div>
              </div>

              {/* Checkbox de Aceite Legal */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0 focus:outline-none"
                  />
                  <span className="text-slate-300 text-xs leading-relaxed">
                    Declaro que li, compreendi e concordo integralmente com todas as cláusulas deste contrato de prestação de serviços digitais, autorizando a formalização por meio de assinatura eletrônica vinculante.
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !acceptTerms}
                  className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                  <span>Confirmar e Assinar Contrato Digitalmente</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
