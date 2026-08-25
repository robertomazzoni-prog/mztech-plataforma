'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  Clock,
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN';
  partner: 'Roberto' | 'Morvan' | 'Geral';
  updatedAt: string;
}

export default function AdminCredenciaisPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Formulários individuais por ID
  const [formData, setFormData] = useState<{
    [key: string]: {
      name: string;
      email: string;
      phone: string;
      newPassword: string;
      confirmPassword: string;
      showPassword: boolean;
    };
  }>({});

  const loadUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch('/api/mztech/admin-users');
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
        const forms: any = {};
        data.users.forEach((u: AdminUser) => {
          forms[u.id] = {
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            newPassword: '',
            confirmPassword: '',
            showPassword: false,
          };
        });
        setFormData(forms);
      } else {
        setErrorMsg(data.error || 'Erro ao carregar administradores.');
      }
    } catch (err) {
      setErrorMsg('Erro de conexão ao buscar credenciais.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (id: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (id: string) => {
    const data = formData[id];
    if (!data) return;

    if (!data.name.trim()) {
      setErrorMsg('O nome do administrador é obrigatório.');
      return;
    }

    if (!data.email.trim() || !data.email.includes('@')) {
      setErrorMsg('Informe um e-mail válido.');
      return;
    }

    if (data.newPassword) {
      if (data.newPassword.length < 4) {
        setErrorMsg('A nova senha deve ter pelo menos 4 caracteres.');
        return;
      }
      if (data.newPassword !== data.confirmPassword) {
        setErrorMsg('A confirmação de senha não confere com a nova senha digitada.');
        return;
      }
    }

    try {
      setSavingId(id);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch('/api/mztech/admin-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          newPassword: data.newPassword.trim() || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMsg(resData.error || 'Erro ao salvar credenciais.');
        return;
      }

      setSuccessMsg(`Credenciais de "${data.name}" atualizadas com sucesso! O novo login e senha já estão ativos.`);
      
      // Limpar campos de senha
      handleChange(id, 'newPassword', '');
      handleChange(id, 'confirmPassword', '');

      // Recarregar dados
      await loadUsers();

      setTimeout(() => {
        setSuccessMsg(null);
      }, 5000);
    } catch (err) {
      setErrorMsg('Erro de conexão ao salvar alterações.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Segurança & Controle de Acessos mzTech</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Credenciais & Senhas Administrativas</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Altere o e-mail de login e a senha dos sócios <strong>Roberto</strong> e <strong>Morvan</strong> ou da Central Master. As alterações têm efeito imediato no painel e na tela de login.
            </p>
          </div>

          <div className="relative z-10 flex-shrink-0">
            <button
              onClick={loadUsers}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar Lista</span>
            </button>
          </div>
        </div>

        {/* Notificações de Sucesso / Erro */}
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

        {/* Grid com os Cartões de Administradores */}
        {loading && users.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Carregando contas administrativas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {users.map((user) => {
              const currentForm = formData[user.id] || {
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                newPassword: '',
                confirmPassword: '',
                showPassword: false,
              };

              const isSaving = savingId === user.id;

              return (
                <div
                  key={user.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Badge de Sócio / Dev */}
                  <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-cyan-500/20">
                        {user.partner === 'Morvan' ? 'M' : user.partner === 'Roberto' ? 'R' : 'OPS'}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>{user.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                            {user.partner === 'Geral' ? 'Master' : 'Sócio'}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          ID: <span className="font-mono text-slate-500">{user.id}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Ativo
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(user.updatedAt).toLocaleDateString('pt-BR')}</span>
                      </p>
                    </div>
                  </div>

                  {/* Formulário de Edição */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave(user.id);
                    }}
                    className="space-y-4 py-5"
                  >
                    {/* Nome do Administrador */}
                    <div className="space-y-1.5">
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-300">
                        Nome de Identificação
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={currentForm.name}
                          onChange={(e) => handleChange(user.id, 'name', e.target.value)}
                          placeholder="Ex: Roberto"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm transition-colors"
                        />
                      </div>
                    </div>

                    {/* E-mail de Login */}
                    <div className="space-y-1.5">
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-300">
                        E-mail de Login Administrativo
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={currentForm.email}
                          onChange={(e) => handleChange(user.id, 'email', e.target.value)}
                          placeholder="exemplo@mztech.com.br"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm transition-colors"
                        />
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-1.5">
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-300">
                        WhatsApp / Notificações
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={currentForm.phone}
                          onChange={(e) => handleChange(user.id, 'phone', e.target.value)}
                          placeholder="(31) 99999-9999"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm transition-colors"
                        />
                      </div>
                    </div>

                    {/* Divisor de Nova Senha */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5" />
                          Alterar Senha de Acesso
                        </span>
                        <button
                          type="button"
                          onClick={() => handleChange(user.id, 'showPassword', !currentForm.showPassword)}
                          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          {currentForm.showPassword ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Ocultar</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Exibir</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-slate-400">
                            Nova Senha
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                            <input
                              type={currentForm.showPassword ? 'text' : 'password'}
                              value={currentForm.newPassword}
                              onChange={(e) => handleChange(user.id, 'newPassword', e.target.value)}
                              placeholder="Deixe em branco p/ manter"
                              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs transition-colors"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-slate-400">
                            Confirmar Nova Senha
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                            <input
                              type={currentForm.showPassword ? 'text' : 'password'}
                              value={currentForm.confirmPassword}
                              onChange={(e) => handleChange(user.id, 'confirmPassword', e.target.value)}
                              placeholder="Confirme a nova senha"
                              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        * Se não desejar alterar a senha atual deste administrador, basta deixar os campos de senha em branco.
                      </p>
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Salvar Credenciais de {user.name}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        )}

        {/* Card Informativo de Boas Práticas */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-xs text-slate-400 space-y-2">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Informações de Segurança & Acesso</span>
          </h4>
          <p>
            • Ao alterar o e-mail ou a senha de um sócio, o novo acesso passará a valer imediatamente na tela de login ([`/login`](/login)).
          </p>
          <p>
            • As senhas são criptografadas com o algoritmo <strong>BCrypt</strong> com salt rounds de alto nível de segurança, nunca sendo armazenadas em texto puro.
          </p>
        </div>
      </div>
    );
}
