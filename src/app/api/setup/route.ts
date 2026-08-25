import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const hasDbUrl = !!process.env.DATABASE_URL;
    if (!hasDbUrl) {
      return NextResponse.json({
        ok: false,
        error: 'Variável DATABASE_URL não está configurada no Railway.',
      }, { status: 500 });
    }

    // 1. Testar conexão com o banco
    const userCount = await prisma.user.count().catch(() => -1);

    if (userCount === -1) {
      return NextResponse.json({
        ok: false,
        error: 'Tabelas não encontradas no PostgreSQL ou falha de conexão com DATABASE_URL.',
      }, { status: 500 });
    }

    // 2. Se não houver usuários, criar admin e cliente padrão
    if (userCount === 0) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const clientPassword = await bcrypt.hash('cliente123', 10);

      await prisma.user.create({
        data: {
          name: 'Lucas Mazzoni (Admin)',
          email: 'admin@mazzoni.com',
          password: adminPassword,
          phone: '(11) 99999-8888',
          role: 'ADMIN',
        },
      });

      await prisma.user.create({
        data: {
          name: 'Matheus Oliveira',
          email: 'cliente@exemplo.com',
          password: clientPassword,
          phone: '(11) 98765-4321',
          role: 'CLIENT',
        },
      });

      // Barbeiro padrão
      const barber = await prisma.barber.create({
        data: {
          name: 'Lucas Mazzoni',
          bio: 'Fundador e mestre barbeiro.',
          avatarUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop',
          specialties: 'Visagismo, Fade Navalhado, Pigmentação de Barba',
          workingHoursStart: '09:00',
          workingHoursEnd: '20:00',
          lunchStart: '13:00',
          lunchEnd: '14:00',
          workingDays: '1,2,3,4,5,6',
        },
      });

      // Serviços padrão
      await prisma.service.create({
        data: {
          name: 'Corte Degradê / Fade Moderno',
          category: 'CORTE',
          description: 'Degradê na zero ou navalha, acabamento milimétrico.',
          price: 55.00,
          durationMinutes: 45,
          popular: true,
        },
      });

      await prisma.service.create({
        data: {
          name: 'Barba com Toalha Quente',
          category: 'BARBA',
          description: 'Modelagem da barba com navalhete e toalha quente.',
          price: 45.00,
          durationMinutes: 35,
          popular: true,
        },
      });

      await prisma.service.create({
        data: {
          name: 'Pigmentação de Barba',
          category: 'PIGMENTACAO',
          description: 'Preenchimento de falhas e realce da densidade.',
          price: 40.00,
          durationMinutes: 30,
          popular: true,
        },
      });

      return NextResponse.json({
        ok: true,
        message: 'Banco populado com sucesso! Usuários admin e cliente criados.',
        adminEmail: 'admin@mazzoni.com',
      });
    }

    return NextResponse.json({
      ok: true,
      message: 'Banco conectado e operacional.',
      totalUsers: userCount,
    });
  } catch (error: any) {
    console.error('Erro no setup:', error);
    return NextResponse.json({
      ok: false,
      error: error.message || 'Erro de conexão com o banco de dados.',
    }, { status: 500 });
  }
}
