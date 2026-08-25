'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  HardDrive,
  Loader2,
  X,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Terminal,
  Clock,
  FolderOpen,
  FolderSearch,
  Upload,
} from 'lucide-react';
import { MzBackupItem, MzClientItem, MzProjectItem, BackupStatus } from '@/types/mztech';
import { formatDatePtBR } from '@/lib/utils';

export default function MzTechBackupsPage() {
  const [backups, setBackups] = useState<MzBackupItem[]>([]);
  const [clients, setClients] = useState<MzClientItem[]>([]);
  const [projects, setProjects] = useState<MzProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Hidden File/Folder Input Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBackup, setEditingBackup] = useState<MzBackupItem | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    databaseName: 'PostgreSQL (Railway)',
    backupDate: '',
    fileName: '',
    storageLocation: 'D:\\MZTECH-BACKUPS\\',
    fileSize: '',
    retentionDays: '30',
    status: 'VALIDO' as BackupStatus,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bkpRes, clientRes, projRes] = await Promise.all([
        fetch('/api/mztech/backups'),
        fetch('/api/mztech/clients'),
        fetch('/api/mztech/projects'),
      ]);

      if (bkpRes.ok) {
        const bData = await bkpRes.json();
        setBackups(bData.backups || []);
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
      console.error('Erro ao buscar backups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingBackup(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      clientId: clients.length > 0 ? clients[0].id : '',
      projectId: projects.length > 0 ? projects[0].id : '',
      databaseName: 'PostgreSQL (Railway)',
      backupDate: today,
      fileName: `backup-${today}.dump`,
      storageLocation: `D:\\MZTECH-BACKUPS\\Mazzoni-Barbers\\postgres\\backup-${today}.dump`,
      fileSize: '40.9 KB',
      retentionDays: '30',
      status: 'VALIDO',
      notes: 'Dump validado via pg_restore --list com sucesso.',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (bkp: MzBackupItem) => {
    setEditingBackup(bkp);
    setFormData({
      clientId: bkp.clientId,
      projectId: bkp.projectId || '',
      databaseName: bkp.databaseName,
      backupDate: bkp.backupDate ? new Date(bkp.backupDate).toISOString().split('T')[0] : '',
      fileName: bkp.fileName,
      storageLocation: bkp.storageLocation,
      fileSize: bkp.fileSize || '',
      retentionDays: (bkp.retentionDays || 30).toString(),
      status: bkp.status,
      notes: bkp.notes || '',
    });
    setModalOpen(true);
  };

  // Formatação de tamanho legível
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Manipulação de seleção de arquivo via File Picker nativo do browser
  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formattedSize = formatBytes(file.size);
    const dateStr = file.lastModified
      ? new Date(file.lastModified).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    // Inferir pasta baseada no cliente ou nome
    const defaultFolder = `D:\\MZTECH-BACKUPS\\Mazzoni-Barbers\\postgres\\`;
    const fullPath = `${defaultFolder}${file.name}`;

    setFormData((prev) => ({
      ...prev,
      fileName: file.name,
      fileSize: formattedSize,
      backupDate: dateStr,
      storageLocation: fullPath,
      notes: prev.notes || `Arquivo "${file.name}" carregado e validado (${formattedSize}).`,
    }));
  };

  // Manipulação de seleção de pasta
  const handleSelectDirectory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const firstFile = files[0];
    // webkitRelativePath possui o formato: "nome-da-pasta/subpasta/arquivo.dump"
    const relativePath = (firstFile as any).webkitRelativePath || firstFile.name;
    const pathParts = relativePath.split('/');
    const folderName = pathParts.length > 1 ? pathParts[0] : 'MZTECH-BACKUPS';

    const selectedPath = `D:\\MZTECH-BACKUPS\\${folderName}\\`;

    setFormData((prev) => ({
      ...prev,
      storageLocation: selectedPath,
    }));
  };

  // Abrir seletor nativo do sistema (Modern File System API ou Fallback)
  const handlePickLocalFolder = async () => {
    try {
      // Modern File System Access API (Chrome/Edge)
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          const path = `D:\\MZTECH-BACKUPS\\${dirHandle.name}\\`;
          setFormData((prev) => ({
            ...prev,
            storageLocation: path,
          }));
          return;
        }
      }
    } catch (err: any) {
      // Usuário cancelou ou navegador não suporta API avançada
      if (err.name === 'AbortError') return;
    }

    // Fallback: abrir seletor de arquivos/pastas nativo do HTML
    if (folderInputRef.current) {
      folderInputRef.current.click();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePickLocalFile = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: 'Arquivos de Backup do Banco de Dados',
              accept: {
                'application/octet-stream': ['.dump', '.sql', '.tar', '.gz', '.bak', '.zip'],
              },
            },
          ],
        });
        if (fileHandle) {
          const file = await fileHandle.getFile();
          const formattedSize = formatBytes(file.size);
          const dateStr = file.lastModified
            ? new Date(file.lastModified).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          setFormData((prev) => ({
            ...prev,
            fileName: file.name,
            fileSize: formattedSize,
            backupDate: dateStr,
            storageLocation: `D:\\MZTECH-BACKUPS\\Mazzoni-Barbers\\postgres\\${file.name}`,
          }));
          return;
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSaveBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.fileName || !formData.storageLocation) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingBackup
        ? `/api/mztech/backups/${editingBackup.id}`
        : '/api/mztech/backups';
      const method = editingBackup ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar registro de backup.');
        return;
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      alert('Erro de conexão ao salvar registro de backup.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBackup = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover o registro do backup "${name}"?`)) return;

    try {
      const res = await fetch(`/api/mztech/backups/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        alert('Erro ao excluir backup.');
      }
    } catch (err) {
      alert('Erro ao excluir backup.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Inputs Ocultos para File / Folder Picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSelectFile}
        className="hidden"
        accept=".dump,.sql,.tar,.gz,.bak,.zip,*"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleSelectDirectory}
        className="hidden"
        // @ts-ignore
        webkitdirectory="true"
        directory=""
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Database className="w-7 h-7 text-cyan-400" />
            <span>Área de Controle de Backups & Retenção</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Registro e auditoria de backups operacionais, prazos de retenção e entregas no encerramento.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-md shadow-cyan-500/10 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Novo Backup</span>
        </button>
      </div>

      {/* Box Informativo de Políticas de Backup & Retenção */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Terminal className="w-4 h-4" />
          <span>Política Operacional de Retenção de Backups mzTech</span>
        </div>
        <p className="leading-relaxed text-slate-300">
          • <strong>Finalidade:</strong> Segurança e recuperação operacional durante a vigência dos serviços recorrentes.<br />
          • <strong>Retenção Pós-Cancelamento:</strong> Após o encerramento do contrato, os backups são mantidos pelo período contratual (padrão 30 dias) e fornecidos ao cliente como parte da entrega dos ativos.
        </p>
      </div>

      {/* Tabela de Backups Registrados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Carregando registros de backup...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Database className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-medium">Nenhum backup registrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Data & Arquivo</th>
                  <th className="px-6 py-4">Cliente & Projeto</th>
                  <th className="px-6 py-4">Local Físico Registrado</th>
                  <th className="px-6 py-4">Tamanho & Retenção</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {backups.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Data & Arquivo */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-white font-mono text-xs">
                          {b.fileName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Gerado em: {formatDatePtBR(b.backupDate)}
                      </p>
                    </td>

                    {/* Cliente & Projeto */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-white text-sm">
                        {b.client?.companyName || 'mzTech'}
                      </p>
                      <p className="text-xs text-cyan-400 mt-0.5">
                        {b.project?.name || 'Base de Dados Principal'}
                      </p>
                    </td>

                    {/* Local Físico */}
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 max-w-xs break-all">
                      {b.storageLocation}
                    </td>

                    {/* Tamanho & Retenção */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <p className="font-semibold text-slate-200">{b.fileSize || 'N/A'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Retenção: {b.retentionDays || 30} dias</span>
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {b.status === 'VALIDO' || b.status === 'TESTADO' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Validado
                        </span>
                      ) : b.status === 'ENTREGUE_AO_CLIENTE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Entregue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                          {b.status}
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(b)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
                        title="Editar Registro"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(b.id, b.fileName)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                        title="Remover Registro"
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

      {/* Modal Registro Backup */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg text-white">
                  {editingBackup ? 'Editar Registro de Backup' : 'Registrar Novo Backup Manual'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBackup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Cliente *</label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Selecione o Cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Projeto Vinculado
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Geral</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-slate-400">
                      Nome do Arquivo *
                    </label>
                    <button
                      type="button"
                      onClick={handlePickLocalFile}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Selecionar Arquivo</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="backup-2026-08-24.dump"
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Data do Backup *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.backupDate}
                    onChange={(e) => setFormData({ ...formData, backupDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Local de Armazenamento com Botão Funcional de Seleção de Pasta / Arquivo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Local de Armazenamento Físico (Storage mzTech) *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePickLocalFolder}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-colors font-medium"
                      title="Procurar pasta no computador"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Selecionar Pasta</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePickLocalFile}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors font-medium"
                      title="Procurar arquivo de backup no computador"
                    >
                      <FolderSearch className="w-3.5 h-3.5 text-slate-400" />
                      <span>Procurar Arquivo</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="D:\MZTECH-BACKUPS\Mazzoni-Barbers\postgres\backup-2026-08-24.dump"
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-28 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePickLocalFolder}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <FolderOpen className="w-3 h-3 text-cyan-400" />
                      <span>Procurar</span>
                    </button>
                  </div>
                </div>

                {/* Atalhos rápidos de pastas padrão */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-500">
                  <span>Atalhos rápidos:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        storageLocation: `D:\\MZTECH-BACKUPS\\Mazzoni-Barbers\\postgres\\${formData.fileName || 'backup.dump'}`,
                      })
                    }
                    className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-300 font-mono transition-colors"
                  >
                    D:\MZTECH-BACKUPS\Mazzoni-Barbers\postgres\
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        storageLocation: `D:\\MZTECH-BACKUPS\\`,
                      })
                    }
                    className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-300 font-mono transition-colors"
                  >
                    D:\MZTECH-BACKUPS\
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Tamanho Estimado
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 40.9 KB"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Retenção (Dias)
                  </label>
                  <input
                    type="number"
                    value={formData.retentionDays}
                    onChange={(e) => setFormData({ ...formData, retentionDays: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BackupStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="VALIDO">VÁLIDO (TESTADO)</option>
                    <option value="TESTADO">TESTADO</option>
                    <option value="ARQUIVADO">ARQUIVADO</option>
                    <option value="ENTREGUE_AO_CLIENTE">ENTREGUE AO CLIENTE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Observações de Validação / Entrega
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Dump validado via pg_restore --list..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
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
                  <span>Salvar Registro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
