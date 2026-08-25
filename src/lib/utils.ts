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

// ============================================================
// GERADOR OFICIAL DE PIX EMVCo (BR CODE) & QR CODE
// ============================================================

function formatPixField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16Pix(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PixPayloadOptions {
  pixKey: string;
  merchantName?: string;
  merchantCity?: string;
  amount?: number;
  txid?: string;
}

export function generatePixPayload(options: PixPayloadOptions): string {
  const {
    pixKey = 'robertomazzoni956@gmail.com',
    merchantName = 'ROBERTO MAZZONI',
    merchantCity = 'BELO HORIZONTE',
    amount,
    txid = '***',
  } = options;

  const cleanName = merchantName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .substring(0, 25);

  const cleanCity = merchantCity
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .substring(0, 15);

  const cleanTxid = txid.replace(/[^A-Za-z0-9]/g, '').substring(0, 25) || '***';

  let payload = formatPixField('00', '01');
  const gui = formatPixField('00', 'br.gov.bcb.pix');
  const key = formatPixField('01', pixKey);
  payload += formatPixField('26', gui + key);
  payload += formatPixField('52', '0000');
  payload += formatPixField('53', '986');

  if (amount && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    payload += formatPixField('54', formattedAmount);
  }

  payload += formatPixField('58', 'BR');
  payload += formatPixField('59', cleanName);
  payload += formatPixField('60', cleanCity);

  const txidField = formatPixField('05', cleanTxid);
  payload += formatPixField('62', txidField);

  payload += '6304';
  const checksum = crc16Pix(payload);
  payload += checksum;

  return payload;
}

export function getPixQrCodeImageUrl(payload: string, size = 260): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(payload)}`;
}
