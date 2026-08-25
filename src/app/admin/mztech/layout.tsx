import React from 'react';
import type { Metadata } from 'next';
import MzLayoutWrapper from '@/components/mztech/MzLayoutWrapper';

export const metadata: Metadata = {
  title: 'mzTech | Base Operacional & Gestão de Clientes',
  description: 'Painel administrativo da mzTech para controle de clientes, projetos, hospedagem, contratos e backups.',
};

export default function MzTechAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MzLayoutWrapper>{children}</MzLayoutWrapper>;
}
