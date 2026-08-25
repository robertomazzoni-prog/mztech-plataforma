import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ensureDatabaseReady } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date'); // YYYY-MM-DD
    const barberId = searchParams.get('barberId');
    const serviceId = searchParams.get('serviceId');

    if (!date || !barberId) {
      return NextResponse.json(
        { error: 'Parâmetros "date" e "barberId" são obrigatórios.' },
        { status: 400 }
      );
    }

    // 1. Buscar barbeiro
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
    });

    if (!barber) {
      return NextResponse.json({ error: 'Barbeiro não encontrado.' }, { status: 404 });
    }

    // 2. Verificar dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay();
    const isSunday = dayOfWeek === 0;

    const allowedDays = barber.workingDays ? barber.workingDays.split(',').map((d) => d.trim()) : ['0','1','2','3','4','5','6'];
    if (!isSunday && !allowedDays.includes(dayOfWeek.toString())) {
      return NextResponse.json({
        slots: [],
        message: 'O barbeiro não atende neste dia da semana.',
      });
    }

    // 3. Buscar serviço para obter duração
    let serviceDuration = 30; // default 30 min
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (service) {
        serviceDuration = service.durationMinutes;
      }
    }

    // 4. Buscar agendamentos existentes neste dia para este barbeiro
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      include: {
        service: true,
      },
    });

    // 5. Configurar horários de atendimento:
    // SE FOR DOMINGO: Disponível SOMENTE das 08:00 às 12:00
    // SE FOR OUTRO DIA: Utiliza horários configurados do barbeiro
    let startMinutes: number;
    let endMinutes: number;
    let lunchStartMinutes: number;
    let lunchEndMinutes: number;

    if (isSunday) {
      startMinutes = 8 * 60;   // 08:00
      endMinutes = 12 * 60;   // 12:00
      lunchStartMinutes = 9999;
      lunchEndMinutes = 9999;
    } else {
      const [startH, startM] = barber.workingHoursStart.split(':').map(Number);
      const [endH, endM] = barber.workingHoursEnd.split(':').map(Number);
      const [lunchStartH, lunchStartM] = barber.lunchStart.split(':').map(Number);
      const [lunchEndH, lunchEndM] = barber.lunchEnd.split(':').map(Number);

      startMinutes = startH * 60 + startM;
      endMinutes = endH * 60 + endM;
      lunchStartMinutes = lunchStartH * 60 + lunchStartM;
      lunchEndMinutes = lunchEndH * 60 + lunchEndM;
    }

    // Verificar se a data é hoje para filtrar horários passados
    const now = new Date();
    const isToday =
      targetDate.getFullYear() === now.getFullYear() &&
      targetDate.getMonth() === now.getMonth() &&
      targetDate.getDate() === now.getDate();
    const currentMinutesOfDay = now.getHours() * 60 + now.getMinutes();

    // Mapear ocupação dos agendamentos existentes em minutos
    const bookedIntervals = existingAppointments.map((app) => {
      const [h, m] = app.timeSlot.split(':').map(Number);
      const appStart = h * 60 + m;
      const appDuration = app.service?.durationMinutes || 30;
      return {
        start: appStart,
        end: appStart + appDuration,
      };
    });

    const slots = [];
    const step = 30; // intervalos de 30 minutos

    for (let timeMin = startMinutes; timeMin < endMinutes; timeMin += step) {
      const slotEnd = timeMin + serviceDuration;
      const hours = Math.floor(timeMin / 60);
      const mins = timeMin % 60;
      const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

      let available = true;
      let reason: string | undefined = undefined;

      // Verifica se ultrapassa o fim do expediente
      if (slotEnd > endMinutes) {
        available = false;
        reason = 'Ultrapassa o horário de fechamento';
      }

      // Verifica se conflita com o horário de almoço
      if (!isSunday && timeMin < lunchEndMinutes && slotEnd > lunchStartMinutes) {
        available = false;
        reason = 'Intervalo de Almoço';
      }

      // Verifica se já passou o horário de hoje
      if (isToday && timeMin <= currentMinutesOfDay + 15) {
        available = false;
        reason = 'Horário já passou';
      }

      // Verifica conflito com outros agendamentos
      if (available) {
        const hasConflict = bookedIntervals.some((app) => {
          return timeMin < app.end && slotEnd > app.start;
        });

        if (hasConflict) {
          available = false;
          reason = 'Já reservado';
        }
      }

      slots.push({
        time: timeStr,
        available,
        reason,
      });
    }

    return NextResponse.json({ slots });
  } catch (error: any) {
    console.error('Erro ao calcular horários disponíveis:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar disponibilidade.' },
      { status: 500 }
    );
  }
}
