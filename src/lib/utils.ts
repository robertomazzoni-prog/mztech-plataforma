import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPhoneNumber(value: string): string {
  // Remove tudo que não for dígito
  const cleaned = ('' + value).replace(/\D/g, '');
  
  if (cleaned.length <= 10) {
    // (11) 9999-9999
    const match = cleaned.match(/^(\d{2})(\d{4})(\d{0,4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}${match[3] ? '-' + match[3] : ''}`;
    }
  } else {
    // (11) 99999-9999
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{0,4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}${match[3] ? '-' + match[3] : ''}`;
    }
  }
  return value;
}

export function cleanPhoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatDatePtBR(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const cleanDay = parts[2].substring(0, 2);
      return `${cleanDay}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}
