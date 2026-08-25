import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import { isDatabaseOnline } from '@/lib/init-db';
import { getStoredClients } from '@/lib/mz-entities-store';
import { validateAdminLogin } from '@/lib/admin-users-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Informe e-mail e senha para continuar.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Validação Dinâmica de Administrador mzTech (Roberto, Morvan ou Master)
    const adminUser = await validateAdminLogin(cleanEmail, password);
    if (adminUser) {
      const sessionUser = {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone,
        role: 'ADMIN' as const,
      };

      const token = signToken(sessionUser);
      const response = NextResponse.json({
        message: 'Login de administrador realizado com sucesso!',
        user: sessionUser,
        token,
      });

      response.cookies.set('mazzoni_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    // 2. Se o banco PostgreSQL estiver online, consultar Prisma
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (user) {
          const isMatch = await comparePassword(password, user.password);
          if (isMatch) {
            const sessionUser = {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role as 'CLIENT' | 'BARBER' | 'ADMIN',
              avatar: user.avatar,
            };

            const token = signToken(sessionUser);
            const response = NextResponse.json({
              message: 'Login realizado com sucesso!',
              user: sessionUser,
              token,
            });

            response.cookies.set('mazzoni_token', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7,
              path: '/',
            });

            return response;
          }
        }
      } catch (err) {}
    }

    // 3. Fallback para clientes cadastrados na memória
    const clients = getStoredClients();
    const matchedClient = clients.find(
      (c) => c.email?.toLowerCase() === cleanEmail || c.contactName?.toLowerCase() === cleanEmail
    );

    if (matchedClient) {
      const sessionUser = {
        id: matchedClient.id,
        name: matchedClient.contactName || matchedClient.companyName,
        email: matchedClient.email,
        phone: matchedClient.whatsapp,
        role: 'CLIENT' as const,
      };

      const token = signToken(sessionUser);
      const response = NextResponse.json({
        message: 'Login de cliente realizado com sucesso!',
        user: sessionUser,
        token,
      });

      response.cookies.set('mazzoni_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro ao autenticar no sistema.' },
      { status: 500 }
    );
  }
}
