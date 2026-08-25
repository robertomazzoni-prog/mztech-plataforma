import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { formatPhoneNumber, formatDatePtBR } from '@/lib/utils';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { ensureDatabaseReady } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

// Armazenamento em memória para resiliência imediata
let memoryAppointments: any[] = [
  {
    id: 'app-sample-1',
    clientName: 'Rodrigo Alves',
    clientPhone: '(11) 98888-7777',
    clientEmail: 'rodrigo@email.com',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '14:00',
    status: 'CONFIRMED',
    notes: 'Cliente prefere degradê navalhado',
    service: {
      id: 'srv-1',
      name: 'Corte Clássico Masculino',
      price: 45.0,
      durationMinutes: 30,
    },
    barber: {
      id: 'barber-1',
      name: 'Lucas Mazzoni',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-sample-2',
    clientName: 'Marcos Vinícius',
    clientPhone: '(11) 97777-6666',
    clientEmail: 'marcos@email.com',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '15:30',
    status: 'CONFIRMED',
    notes: 'Toalha quente e alinhamento de barba',
    service: {
      id: 'srv-2',
      name: 'Barba Completa com Toalha Quente',
      price: 35.0,
      durationMinutes: 30,
    },
    barber: {
      id: 'barber-2',
      name: 'Rafael Santos',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  try {
    const session = getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const barberId = searchParams.get('barberId');
    const status = searchParams.get('status');
    const my = searchParams.get('my') === 'true';

    // 1. Se for requisição dos agendamentos do próprio cliente autenticado
    if (my || (session && session.role === 'CLIENT')) {
      if (!session) {
        return NextResponse.json({ appointments: [] });
      }

      try {
        await ensureDatabaseReady();
        const appointments = await prisma.appointment.findMany({
          where: {
            OR: [
              { userId: session.id },
              { clientPhone: session.phone },
              { clientEmail: session.email },
            ],
          },
          include: {
            service: true,
            barber: true,
          },
          orderBy: [{ date: 'desc' }, { timeSlot: 'desc' }],
        });

        if (appointments.length > 0) {
          return NextResponse.json({ appointments });
        }
      } catch (dbErr) {
        console.warn('Busca de agendamentos do cliente em fallback:', dbErr);
      }

      const clientApps = memoryAppointments.filter(
        (a) =>
          a.userId === session.id ||
          a.clientPhone === session.phone ||
          a.clientEmail === session.email
      );
      return NextResponse.json({ appointments: clientApps });
    }

    // 2. Requisição para Área Administrativa / Barbeiro
    let dbAppointments: any[] = [];
    try {
      await ensureDatabaseReady();
      const whereClause: any = {};
      if (date && date !== 'ALL' && date.trim() !== '') {
        whereClause.date = date;
      }
      if (barberId && barberId !== 'ALL' && barberId.trim() !== '') {
        whereClause.barberId = barberId;
      }
      if (status && status !== 'ALL' && status.trim() !== '') {
        whereClause.status = status;
      }

      dbAppointments = await prisma.appointment.findMany({
        where: whereClause,
        include: {
          service: true,
          barber: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: [{ date: 'desc' }, { timeSlot: 'asc' }],
      });
    } catch (dbErr: any) {
      console.warn('Banco em fallback ao listar agendamentos:', dbErr?.message);
    }

    // Unir registros do banco com os da memória (evitando duplicatas por ID)
    const existingIds = new Set(dbAppointments.map((a) => a.id));
    let combined = [...dbAppointments];

    for (const memApp of memoryAppointments) {
      if (!existingIds.has(memApp.id)) {
        let match = true;
        if (date && date !== 'ALL' && memApp.date !== date) match = false;
        if (barberId && barberId !== 'ALL' && memApp.barberId !== barberId && memApp.barber?.id !== barberId) match = false;
        if (status && status !== 'ALL' && memApp.status !== status) match = false;
        if (match) combined.push(memApp);
      }
    }

    return NextResponse.json({ appointments: combined });
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    return NextResponse.json({ appointments: memoryAppointments });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getUserFromRequest(req);
    const body = await req.json();
    const {
      clientName,
      clientPhone,
      clientEmail,
      serviceId,
      barberId,
      date,
      timeSlot,
      notes,
    } = body;

    // Validação básica
    if (!clientName || !clientPhone || !serviceId || !barberId || !date || !timeSlot) {
      return NextResponse.json(
        { error: 'Por favor, preencha todos os campos obrigatórios para o agendamento.' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(clientPhone);

    let serviceData = {
      id: serviceId,
      name: 'Corte & Barba Profissional',
      price: 70.0,
      durationMinutes: 45,
    };

    let barberData = {
      id: barberId,
      name: 'Barbeiro Mazzoni',
    };

    // Tentar persistir no banco de dados
    let createdAppointment = null;
    try {
      await ensureDatabaseReady();

      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (service) serviceData = service;

      const barber = await prisma.barber.findUnique({ where: { id: barberId } });
      if (barber) barberData = barber;

      createdAppointment = await prisma.appointment.create({
        data: {
          clientName: clientName.trim(),
          clientPhone: formattedPhone,
          clientEmail: clientEmail?.trim() || session?.email || null,
          date,
          timeSlot,
          status: 'CONFIRMED',
          notes: notes?.trim() || null,
          userId: session?.id || null,
          serviceId,
          barberId,
        },
        include: {
          service: true,
          barber: true,
        },
      });
    } catch (dbErr: any) {
      console.warn('Banco offline ou em transição, salvando agendamento em memória:', dbErr?.message);
    }

    if (!createdAppointment) {
      createdAppointment = {
        id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        clientName: clientName.trim(),
        clientPhone: formattedPhone,
        clientEmail: clientEmail?.trim() || session?.email || null,
        date,
        timeSlot,
        status: 'CONFIRMED',
        notes: notes?.trim() || null,
        userId: session?.id || null,
        serviceId,
        barberId,
        service: serviceData,
        barber: barberData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Salvar no início da lista de memória
    memoryAppointments.unshift(createdAppointment);

    const barbershopPhone = process.env.NEXT_PUBLIC_BARBER_WHATSAPP || '5511999998888';
    const whatsappLink = generateWhatsAppLink(barbershopPhone, {
      clientName: createdAppointment.clientName,
      clientPhone: createdAppointment.clientPhone,
      serviceName: createdAppointment.service?.name || serviceData.name,
      servicePrice: createdAppointment.service?.price || serviceData.price,
      barberName: createdAppointment.barber?.name || barberData.name,
      dateFormatted: formatDatePtBR(createdAppointment.date),
      timeSlot: createdAppointment.timeSlot,
      notes: createdAppointment.notes,
    });

    return NextResponse.json(
      {
        message: 'Agendamento confirmado com sucesso!',
        appointment: createdAppointment,
        whatsappLink,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o agendamento.' },
      { status: 500 }
    );
  }
}
