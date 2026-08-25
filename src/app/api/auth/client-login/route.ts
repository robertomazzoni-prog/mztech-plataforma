import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import { signToken } from '@/lib/auth';
import { getStoredClients } from '@/lib/mz-entities-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Por favor, informe seu e-mail comercial ou nome cadastrado.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const clients = getStoredClients();

    // 1. Procurar cliente na base mzTech
    let matchedClient = clients.find(
      (c) =>
        c.email?.toLowerCase() === cleanEmail ||
        c.companyName?.toLowerCase() === cleanEmail ||
        c.contactName?.toLowerCase() === cleanEmail ||
        c.whatsapp?.replace(/\D/g, '').includes(cleanEmail.replace(/\D/g, ''))
    );

    // 2. Se não encontrou na memória e o banco estiver online, busca no Prisma
    if (!matchedClient) {
      const dbOnline = await isDatabaseOnline();
      if (dbOnline) {
        try {
          const dbClient = await prisma.mzClient.findFirst({
            where: {
              OR: [
                { email: { equals: cleanEmail, mode: 'insensitive' } },
                { companyName: { equals: cleanEmail, mode: 'insensitive' } },
                { contactName: { equals: cleanEmail, mode: 'insensitive' } },
              ],
            },
          });
          if (dbClient) {
            matchedClient = {
              id: dbClient.id,
              companyName: dbClient.companyName,
              contactName: dbClient.contactName,
              email: dbClient.email,
              whatsapp: dbClient.whatsapp,
              domain: dbClient.domain,
              status: dbClient.status as any,
              financialStatus: dbClient.financialStatus as any,
              codeDelivered: false,
              backupDelivered: false,
              createdAt: dbClient.createdAt?.toISOString() || new Date().toISOString(),
              updatedAt: dbClient.updatedAt?.toISOString() || new Date().toISOString(),
            };
          }
        } catch (err) {}
      }
    }

    if (!matchedClient) {
      return NextResponse.json(
        {
          error:
            'Nenhuma conta de cliente localizada com este e-mail ou contato. Solicite um orçamento no site para registrar sua empresa.',
        },
        { status: 404 }
      );
    }

    const sessionUser = {
      id: matchedClient.id,
      name: matchedClient.contactName || matchedClient.companyName,
      email: matchedClient.email,
      phone: matchedClient.whatsapp,
      role: 'CLIENT' as const,
      companyName: matchedClient.companyName,
    };

    const token = signToken(sessionUser);
    const response = NextResponse.json({
      message: 'Login de cliente realizado com sucesso!',
      user: sessionUser,
      client: matchedClient,
      token,
    });

    response.cookies.set('mazzoni_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Erro no login do cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o login do cliente.' },
      { status: 500 }
    );
  }
}
