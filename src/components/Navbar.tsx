'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Scissors,
  Calendar,
  User,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  Clock,
  Sparkles,
  Terminal,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Início', href: '/' },
    { name: 'Serviços & Preços', href: '/#servicos' },
    { name: 'Nossa Equipe', href: '/#equipe' },
    { name: 'Agendar Horário', href: '/agendar', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-dark-900/90 backdrop-blur-md border-b border-dark-700/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Marca */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform duration-300">
              <Scissors className="w-6 h-6 text-dark-950 transform -rotate-45" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-serif font-black tracking-wider text-gold-gradient uppercase block">
                Mazzoni
              </span>
              <span className="text-[10px] tracking-[0.25em] text-zinc-400 uppercase font-semibold block -mt-1">
                Barbershop
              </span>
            </div>
          </Link>

          {/* Links Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  link.highlight
                    ? 'px-4 py-2 rounded-full btn-gold text-dark-950 font-bold shadow-md hover:shadow-gold'
                    : pathname === link.href
                    ? 'text-gold-400 font-semibold'
                    : 'text-zinc-300 hover:text-gold-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Área do Usuário (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-1.5 rounded-full bg-dark-800 border border-gold-500/30 hover:border-gold-500/60 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-sm border border-gold-500/40">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left pr-2">
                    <p className="text-xs font-semibold text-zinc-200 leading-tight max-w-[120px] truncate">
                      {user.name.split(' ')[0]}
                    </p>
                    <span className="text-[10px] text-gold-400 font-medium leading-none">
                      {user.role === 'ADMIN' ? 'Admin' : user.role === 'BARBER' ? 'Barbeiro' : 'Cliente'}
                    </span>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-dark-850 border border-dark-700 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-dark-700">
                      <p className="text-xs text-zinc-400">Conectado como</p>
                      <p className="text-sm font-semibold text-zinc-200 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/meus-agendamentos"
                      className="flex items-center px-4 py-2.5 text-sm text-zinc-300 hover:text-gold-400 hover:bg-dark-800 transition-colors"
                    >
                      <Calendar className="w-4 h-4 mr-3 text-gold-400" />
                      Meus Agendamentos
                    </Link>

                    {(user.role === 'ADMIN' || user.role === 'BARBER') && (
                      <>
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2.5 text-sm text-gold-300 hover:text-gold-200 hover:bg-dark-800 transition-colors font-medium"
                        >
                          <Shield className="w-4 h-4 mr-3 text-gold-400" />
                          Painel da Barbearia
                        </Link>
                        {user.role === 'ADMIN' && (
                          <>
                            {/* Link Central mzTech */}
                            <Link
                              href="/admin/mztech"
                              className="flex items-center px-4 py-2 text-sm text-cyan-300 hover:text-cyan-200 hover:bg-cyan-950/30 transition-colors font-semibold bg-cyan-500/10 border-y border-cyan-500/20 my-1"
                            >
                              <Terminal className="w-4 h-4 mr-3 text-cyan-400" />
                              <span>Base Operacional mzTech</span>
                            </Link>

                            <Link
                              href="/admin/equipe"
                              className="flex items-center px-4 py-2 text-sm text-zinc-300 hover:text-gold-400 hover:bg-dark-800 transition-colors"
                            >
                              <Users className="w-4 h-4 mr-3 text-gold-400" />
                              Gestão de Equipe
                            </Link>
                            <Link
                              href="/admin/servicos"
                              className="flex items-center px-4 py-2 text-sm text-zinc-300 hover:text-gold-400 hover:bg-dark-800 transition-colors"
                            >
                              <Scissors className="w-4 h-4 mr-3 text-gold-400" />
                              Gestão de Serviços
                            </Link>
                            <Link
                              href="/admin/configuracoes"
                              className="flex items-center px-4 py-2 text-sm text-zinc-300 hover:text-gold-400 hover:bg-dark-800 transition-colors"
                            >
                              <Sparkles className="w-4 h-4 mr-3 text-gold-400" />
                              Personalizar Textos do Site
                            </Link>
                          </>
                        )}
                      </>
                    )}

                    <Link
                      href="/admin/perfil"
                      className="flex items-center px-4 py-2 text-sm text-zinc-300 hover:text-gold-400 hover:bg-dark-800 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3 text-gold-400" />
                      Minha Conta & Senha
                    </Link>

                    <div className="border-t border-dark-700 my-1"></div>

                    <button
                      onClick={() => logout()}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sair da Conta
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-300 hover:text-gold-300 px-3 py-2 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-dark-800 border border-gold-500/40 text-gold-300 hover:bg-gold-500/10 hover:border-gold-400 transition-all"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>

          {/* Botão Menu Mobile */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-dark-800"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-900 border-b border-dark-700 px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
                link.highlight
                  ? 'btn-gold text-dark-950 font-bold text-center'
                  : 'text-zinc-300 hover:bg-dark-800 hover:text-gold-400'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t border-dark-700 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 bg-dark-800 rounded-lg">
                  <p className="text-sm font-semibold text-zinc-200">{user.name}</p>
                  <p className="text-xs text-gold-400">{user.role}</p>
                </div>
                <Link
                  href="/meus-agendamentos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-dark-800"
                >
                  <Calendar className="w-4 h-4 mr-3 text-gold-400" />
                  Meus Agendamentos
                </Link>
                {(user.role === 'ADMIN' || user.role === 'BARBER') && (
                  <>
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-lg text-sm text-gold-300 hover:bg-dark-800"
                    >
                      <Shield className="w-4 h-4 mr-3 text-gold-400" />
                      Painel da Barbearia
                    </Link>
                    {user.role === 'ADMIN' && (
                      <>
                        <Link
                          href="/admin/mztech"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center px-3 py-2 rounded-lg text-sm text-cyan-300 font-bold bg-cyan-950/40 border border-cyan-500/30"
                        >
                          <Terminal className="w-4 h-4 mr-3 text-cyan-400" />
                          Base Operacional mzTech
                        </Link>
                        <Link
                          href="/admin/equipe"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-dark-800"
                        >
                          <Users className="w-4 h-4 mr-3 text-gold-400" />
                          Gestão de Equipe
                        </Link>
                        <Link
                          href="/admin/servicos"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-dark-800"
                        >
                          <Scissors className="w-4 h-4 mr-3 text-gold-400" />
                          Gestão de Serviços
                        </Link>
                        <Link
                          href="/admin/configuracoes"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-dark-800"
                        >
                          <Sparkles className="w-4 h-4 mr-3 text-gold-400" />
                          Personalizar Textos do Site
                        </Link>
                      </>
                    )}
                  </>
                )}
                <Link
                  href="/admin/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-dark-800"
                >
                  <User className="w-4 h-4 mr-3 text-gold-400" />
                  Minha Conta & Senha
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 text-left"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sair
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-lg bg-dark-800 text-zinc-200 font-medium hover:bg-dark-750"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-lg bg-gold-500 text-dark-950 font-bold hover:bg-gold-400"
                >
                  Cadastre-se
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
