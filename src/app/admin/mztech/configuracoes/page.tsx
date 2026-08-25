'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Phone,
  Mail,
  QrCode,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Globe,
  Plus,
  Trash2,
  Star,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { formatPhoneNumber } from '@/lib/utils';
import { CompanyEmailItem, CompanyPixItem } from '@/lib/mz-settings-store';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('mzTech');
  const [legalName, setLegalName] = useState('mzTech Soluções Digitais & Desenvolvimento');
  const [tagline, setTagline] = useState('Tecnologia que coloca sua empresa no digital.');
  
  // E-mails dinâmicos
  const [emails, setEmails] = useState<CompanyEmailItem[]>([
    {
      id: 'email-1',
      address: 'robertomazzoni956@gmail.com',
      label: 'E-mail Principal & Atendimento',
      isPrimary: true,
    },
  ]);

  // Chaves Pix dinâmicas
  const [pixKeys, setPixKeys] = useState<CompanyPixItem[]>([
    {
      id: 'pix-1',
      key: 'robertomazzoni956@gmail.com',
      type: 'EMAIL',
      holder: 'Roberto (Sócio mzTech)',
      bank: 'Nubank / Inter',
      isPrimary: true,
    },
  ]);

  // Sócios
  const [robertoName, setRobertoName] = useState('Roberto');
  const [robertoPhone, setRobertoPhone] = useState('(31) 98684-7049');
  
  const [morvanName, setMorvanName] = useState('Morvan');
  const [morvanPhone, setMorvanPhone] = useState('(31) 99359-7136');

  // Horário
  const [workingHours, setWorkingHours] = useState('Segunda a Sexta, 08h às 19h • Sábados, 09h às 14h');

  const loadSettings = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch('/api/mztech/settings');
      const data = await res.json();
      if (res.ok && data.settings) {
        const s = data.settings;
        setName(s.name || 'mzTech');
        setLegalName(s.legalName || 'mzTech Soluções Digitais & Desenvolvimento');
        setTagline(s.tagline || 'Tecnologia que coloca sua empresa no digital.');
        setRobertoName(s.robertoName || 'Roberto');
        setRobertoPhone(s.robertoPhone || '(31) 98684-7049');
        setMorvanName(s.morvanName || 'Morvan');
        setMorvanPhone(s.morvanPhone || '(31) 99359-7136');
        setWorkingHours(s.workingHours || 'Segunda a Sexta, 08h às 19h • Sábados, 09h às 14h');

        if (Array.isArray(s.emails) && s.emails.length > 0) {
          setEmails(s.emails);
        } else if (s.email) {
          setEmails([
            {
              id: 'email-1',
              address: s.email,
              label: 'E-mail Principal & Atendimento',
              isPrimary: true,
            },
          ]);
        }

        if (Array.isArray(s.pixKeys) && s.pixKeys.length > 0) {
          setPixKeys(s.pixKeys);
        } else if (s.pixKey) {
          setPixKeys([
            {
              id: 'pix-1',
              key: s.pixKey,
              type: 'EMAIL',
              holder: 'Roberto (Sócio mzTech)',
              bank: 'Conta Principal',
              isPrimary: true,
            },
          ]);
        }
      }
    } catch (err) {
      setErrorMsg('Erro ao buscar configurações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Manipuladores de E-mails
  const handleAddEmail = () => {
    const newId = `email-${Date.now()}`;
    setEmails((prev) => [
      ...prev,
      {
        id: newId,
        address: '',
        label: prev.length === 0 ? 'E-mail Principal' : prev.length === 1 ? 'Financeiro & Cobrança' : 'Suporte Técnico',
        isPrimary: prev.length === 0,
      },
    ]);
  };

  const handleRemoveEmail = (id: string) => {
    if (emails.length <= 1) {
      alert('É necessário manter pelo menos um e-mail cadastrado.');
      return;
    }
    const itemToRemove = emails.find((e) => e.id === id);
    const updated = emails.filter((e) => e.id !== id);
    if (itemToRemove?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    setEmails(updated);
  };

  const handleUpdateEmail = (id: string, field: 'address' | 'label', value: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleSetPrimaryEmail = (id: string) => {
    setEmails((prev) =>
      prev.map((e) => ({
        ...e,
        isPrimary: e.id === id,
      }))
    );
  };

  // Manipuladores de Chaves Pix
  const handleAddPixKey = () => {
    const newId = `pix-${Date.now()}`;
    setPixKeys((prev) => [
      ...prev,
      {
        id: newId,
        key: '',
        type: 'EMAIL',
        holder: prev.length === 0 ? 'Roberto' : 'Morvan',
        bank: 'Nubank / Inter',
        isPrimary: prev.length === 0,
      },
    ]);
  };

  const handleRemovePixKey = (id: string) => {
    if (pixKeys.length <= 1) {
      alert('É necessário manter pelo menos uma chave Pix cadastrada.');
      return;
    }
    const itemToRemove = pixKeys.find((p) => p.id === id);
    const updated = pixKeys.filter((p) => p.id !== id);
    if (itemToRemove?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    setPixKeys(updated);
  };

  const handleUpdatePixKey = (
    id: string,
    field: 'key' | 'type' | 'holder' | 'bank',
    value: string
  ) => {
    setPixKeys((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSetPrimaryPixKey = (id: string) => {
    setPixKeys((prev) =>
      prev.map((p) => ({
        ...p,
        isPrimary: p.id === id,
      }))
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    const validEmails = emails.filter((e) => e.address.trim().length > 0);
    if (validEmails.length === 0) {
      setErrorMsg('Por favor, informe ao menos um e-mail válido.');
      return;
    }

    const validPixKeys = pixKeys.filter((p) => p.key.trim().length > 0);
    if (validPixKeys.length === 0) {
      setErrorMsg('Por favor, informe ao menos uma chave Pix válida.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const primaryEmail = validEmails.find((e) => e.isPrimary)?.address || validEmails[0].address;
      const primaryPix = validPixKeys.find((p) => p.isPrimary)?.key || validPixKeys[0].key;

      const res = await fetch('/api/mztech/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          legalName,
          tagline,
          email: primaryEmail,
          emails: validEmails,
          robertoName,
          robertoPhone,
          robertoWhatsapp: robertoPhone.replace(/\D/g, ''),
          morvanName,
          morvanPhone,
          morvanWhatsapp: morvanPhone.replace(/\D/g, ''),
          pixKey: primaryPix,
          pixKeys: validPixKeys,
          workingHours,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao salvar configurações.');
        return;
      }

      setSuccessMsg('Configurações salvas com sucesso! As novas chaves Pix e e-mails já estão ativos no sistema.');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 5000);
    } catch (err) {
      setErrorMsg('Erro de conexão ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>mzTech Enterprise Configs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Configurações & Canais de Pagamento</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Gerencie múltiplos <strong>e-mails</strong> de atendimento, <strong>chaves Pix</strong> de recebimento, telefones dos sócios e dados da empresa.
          </p>
        </div>

        <div className="relative z-10 flex-shrink-0">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recarregar</span>
          </button>
        </div>
      </div>

      {/* Notificações */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center gap-3 shadow-lg animate-pulse">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Carregando configurações...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* ============================================================ */}
          {/* BLOCO 1: E-MAILS DE CONTATO & NOTIFICAÇÕES (MÚLTIPLOS) */}
          {/* ============================================================ */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>E-mails Oficiais & Notificações</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                      {emails.length} {emails.length === 1 ? 'cadastrado' : 'cadastrados'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Adicione e-mails para atendimento geral, suporte técnico e setor financeiro.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddEmail}
                className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Mais um E-mail</span>
              </button>
            </div>

            {/* Lista de E-mails */}
            <div className="space-y-3">
              {emails.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.isPrimary
                      ? 'bg-slate-950 border-cyan-500/40 ring-1 ring-cyan-500/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    
                    {/* Badge / Indicador Principal */}
                    <div className="flex items-center gap-2 min-w-[140px]">
                      {item.isPrimary ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          <Star className="w-3 h-3 fill-cyan-300 text-cyan-300" />
                          PRINCIPAL
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryEmail(item.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                        >
                          <Star className="w-3 h-3" />
                          Tornar Principal
                        </button>
                      )}
                    </div>

                    {/* Campo de Endereço de E-mail */}
                    <div className="flex-1">
                      <input
                        type="email"
                        required
                        value={item.address}
                        onChange={(e) => handleUpdateEmail(item.id, 'address', e.target.value)}
                        placeholder="ex: contato@mztech.com.br ou seuemail@gmail.com"
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>

                    {/* Campo de Rótulo / Finalidade */}
                    <div className="w-full md:w-56">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleUpdateEmail(item.id, 'label', e.target.value)}
                        placeholder="Rótulo (ex: Financeiro, Suporte)"
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Botão Remover */}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(item.id)}
                      title="Remover E-mail"
                      disabled={emails.length <= 1}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all self-end md:self-auto disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* BLOCO 2: CHAVES PIX & PAGAMENTOS (MÚLTIPLAS) */}
          {/* ============================================================ */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Chaves Pix & Recebimentos</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      {pixKeys.length} {pixKeys.length === 1 ? 'chave ativa' : 'chaves ativas'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure chaves Pix do Roberto, Morvan ou da empresa para faturas e orçamentos.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddPixKey}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Mais uma Chave Pix</span>
              </button>
            </div>

            {/* Lista de Chaves Pix */}
            <div className="space-y-4">
              {pixKeys.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    item.isPrimary
                      ? 'bg-slate-950 border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.isPrimary ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          CHAVE PADRÃO DE FATURAS
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryPixKey(item.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                        >
                          <Star className="w-3 h-3" />
                          Definir como Chave Padrão
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.key && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.key, item.id)}
                          className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
                        >
                          {copiedKey === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar Chave</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemovePixKey(item.id)}
                        disabled={pixKeys.length <= 1}
                        title="Remover Chave Pix"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    
                    {/* Tipo de Chave */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Tipo de Chave
                      </label>
                      <select
                        value={item.type}
                        onChange={(e: any) => handleUpdatePixKey(item.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-400"
                      >
                        <option value="EMAIL">E-mail</option>
                        <option value="PHONE">Telefone / Celular</option>
                        <option value="CPF_CNPJ">CPF / CNPJ</option>
                        <option value="RANDOM">Chave Aleatória (EVP)</option>
                      </select>
                    </div>

                    {/* Valor da Chave Pix */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Chave Pix *
                      </label>
                      <input
                        type="text"
                        required
                        value={item.key}
                        onChange={(e) => handleUpdatePixKey(item.id, 'key', e.target.value)}
                        placeholder="Digite o Pix (e-mail, CPF, celular ou código)"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    {/* Titular / Favorecido */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Titular / Sócio
                      </label>
                      <input
                        type="text"
                        value={item.holder}
                        onChange={(e) => handleUpdatePixKey(item.id, 'holder', e.target.value)}
                        placeholder="Ex: Roberto / Morvan"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    {/* Instituição / Banco */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Banco / App
                      </label>
                      <input
                        type="text"
                        value={item.bank || ''}
                        onChange={(e) => handleUpdatePixKey(item.id, 'bank', e.target.value)}
                        placeholder="Ex: Nubank, Inter"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* BLOCO 3: TELEFONES & WHATSAPP DOS SÓCIOS */}
          {/* ============================================================ */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Telefones & WhatsApp dos Sócios</h3>
                <p className="text-xs text-slate-400">
                  Estes números recebem as notificações de orçamentos e são exibidos no rodapé do site.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Roberto */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Sócio Roberto
                  </span>
                  <a
                    href={`https://wa.me/55${robertoPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Testar WhatsApp
                  </a>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    value={robertoName}
                    onChange={(e) => setRobertoName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Telefone / WhatsApp com DDD
                  </label>
                  <input
                    type="text"
                    value={robertoPhone}
                    onChange={(e) => setRobertoPhone(formatPhoneNumber(e.target.value))}
                    placeholder="(31) 98684-7049"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Morvan */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Sócio Morvan
                  </span>
                  <a
                    href={`https://wa.me/55${morvanPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Testar WhatsApp
                  </a>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    value={morvanName}
                    onChange={(e) => setMorvanName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Telefone / WhatsApp com DDD
                  </label>
                  <input
                    type="text"
                    value={morvanPhone}
                    onChange={(e) => setMorvanPhone(formatPhoneNumber(e.target.value))}
                    placeholder="(31) 99359-7136"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* BLOCO 4: HORÁRIO & IDENTIDADE INSTITUCIONAL */}
          {/* ============================================================ */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Horário & Identidade da Empresa</h3>
                <p className="text-xs text-slate-400">
                  Horário de atendimento ao cliente e informações gerais da marca.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-300">
                  Horário de Atendimento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="Segunda a Sexta, 08h às 19h • Sábados, 09h às 14h"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-300">
                    Nome da Marca
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="mzTech"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-300">
                    Razão Social / Nome Comercial
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="mzTech Soluções Digitais & Desenvolvimento"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Salvar Geral */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Salvar Todas as Configurações (E-mails, Chaves Pix e Contatos)</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
