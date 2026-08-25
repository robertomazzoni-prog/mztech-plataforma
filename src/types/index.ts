export type Role = 'CLIENT' | 'BARBER' | 'ADMIN';

export type ServiceCategory = 'CORTE' | 'BARBA' | 'PIGMENTACAO' | 'COMBO' | 'TRATAMENTO' | 'OUTROS';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string | null;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string | null;
  popular?: boolean;
  active?: boolean;
}

export interface BarberItem {
  id: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  specialties?: string | null;
  workingHoursStart: string;
  workingHoursEnd: string;
  lunchStart: string;
  lunchEnd: string;
  workingDays: string;
  active?: boolean;
}

export interface AppointmentItem {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  notes?: string | null;
  userId?: string | null;
  user?: UserSession | null;
  serviceId: string;
  service: ServiceItem;
  barberId: string;
  barber: BarberItem;
  createdAt?: string | Date;
}

export interface AvailableSlot {
  time: string; // e.g. "09:30"
  available: boolean;
  reason?: string;
}
