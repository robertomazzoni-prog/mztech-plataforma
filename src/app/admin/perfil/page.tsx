'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BarbershopLayout from '@/components/BarbershopLayout';
import {
  User,
  Shield,
  Lock,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import { formatPhoneNumber } from '@/lib/utils';

export default function AdminProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }

    // Se estiver tentando alterar a senha
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setErrorMessage('Informe a senha atual para confirmar a alteração de senha.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('A nova senha e a confirmação não coincidem.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Erro ao atualizar dados.');
        return;
      }

      setSuccessMessage('Dados atualizados com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshUser();
    } catch (err) {
      setErrorMessage('Erro de conexão ao salvar alterações.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-dark-950">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin mb-3" />
        <p className="text-zinc-400 text-sm">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <BarbershopLayout>
      <div className="min-h-screen bg-dark-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-dark-800">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Dashboard</span>
            </Link>
            <h1 className="text-3xl font-serif font-black text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-gold-400" />
              <span>Minha Conta & Segurança</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Altere seu nome de exibição, e-mail de login e senha de acesso ao sistema.
            </p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* CARD 1: DADOS PESSOAIS */}
          <div className="bg-dark-900 border border-dark-750 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-4 pb-4 border-b border-dark-800">
              <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-400 flex items-center justify-center text-xl font-bold font-serif shadow-inner">
                {name ? name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-white">Dados do Administrador</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold-500/10 text-gold-400 border border-gold-500/20 mt-1">
                  <Shield className="w-3 h-3" />
                  {user?.role === 'ADMIN' ? 'Administrador Geral / Dono' : 'Barbeiro'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nome */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold-400" />
                  <span>Nome Completo *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              {/* E-mail */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gold-400" />
                  <span>E-mail de Login *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@mazzoni.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gold-400" />
                  <span>Telefone / WhatsApp</span>
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: ALTERAÇÃO DE SENHA */}
          <div className="bg-dark-900 border border-dark-750 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="pb-4 border-b border-dark-800">
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-gold-400" />
                <span>Alterar Senha de Acesso</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Deixe em branco se não desejar alterar sua senha atual.
              </p>
            </div>

            <div className="space-y-4">
              {/* Senha Atual */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gold-400" />
                  <span>Senha Atual (Necessária para alterar)</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    placeholder="Digite sua senha atual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm pr-12 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Nova Senha */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm pr-12 focus:outline-none focus:border-gold-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Nova Senha */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <Link
              href="/admin"
              className="px-6 py-3 rounded-xl bg-dark-850 hover:bg-dark-800 text-zinc-300 text-sm font-semibold border border-dark-750 transition-colors"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="btn-gold px-8 py-3 rounded-xl font-bold text-dark-950 text-sm flex items-center gap-2 shadow-gold hover:scale-105 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Salvar Alterações</span>
            </button>
          </div>

        </form>

        </div>
      </div>
    </BarbershopLayout>
  );
}
