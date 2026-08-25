import { cleanPhoneDigits } from './utils';

interface WhatsAppAppointmentData {
  clientName: string;
  clientPhone: string;
  serviceName: string;
  servicePrice: number;
  barberName: string;
  dateFormatted: string;
  timeSlot: string;
  notes?: string | null;
}

export function generateWhatsAppMessage(data: WhatsAppAppointmentData): string {
  let message = `💈 *NOVO AGENDAMENTO - MAZZONI BARBERSHOP* 💈\n\n`;
  message += `👤 *Cliente:* ${data.clientName}\n`;
  message += `📱 *WhatsApp:* ${data.clientPhone}\n`;
  message += `✂️ *Serviço:* ${data.serviceName} (R$ ${data.servicePrice.toFixed(2)})\n`;
  message += `💈 *Barbeiro:* ${data.barberName}\n`;
  message += `📅 *Data:* ${data.dateFormatted}\n`;
  message += `⏰ *Horário:* ${data.timeSlot}\n`;

  if (data.notes && data.notes.trim()) {
    message += `📝 *Observação:* ${data.notes.trim()}\n`;
  }

  message += `\n✨ _Agendamento realizado via Sistema Online Mazzoni Barbershop._\n`;
  message += `_Favor confirmar disponibilidade e comparecer 5 minutos antes._`;

  return message;
}

export function generateWhatsAppLink(
  barberPhone: string,
  appointmentData: WhatsAppAppointmentData
): string {
  const cleanNumber = cleanPhoneDigits(barberPhone);
  const text = generateWhatsAppMessage(appointmentData);
  const encoded = encodeURIComponent(text);

  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}

export function generateDirectClientLink(clientPhone: string, appointmentData: WhatsAppAppointmentData): string {
  const cleanNumber = cleanPhoneDigits(clientPhone);
  const text = generateWhatsAppMessage(appointmentData);
  const encoded = encodeURIComponent(text);

  return `https://api.whatsapp.com/send?phone=55${cleanNumber}&text=${encoded}`;
}
