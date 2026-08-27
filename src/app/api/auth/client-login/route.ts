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

    // 2. Se não encontrou na memória, busca no Prisma (mzClient, User ou MzQuote)
    const dbOnline = await isDatabaseOnline();
    if (!matchedClient && dbOnline) {
      try {
        const dbClient = await prisma.mzClient.findFirst({
          where: {
            OR: [
              { email: { equals: cleanEmail, mode: 'insensitive' } },
              { companyName: { equals: cleanEmail, mode: 'insensitive' } },
              { contactName: { equals: cleanEmail, mode: 'insensitive' } },
              { whatsapp: { contains: cleanEmail.replace(/\D/g, '') } },
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
        } else {
          // Busca em MzQuote para clientes com orçamento
          const dbQuote = await prisma.mzQuote.findFirst({
            where: {
              OR: [
                { email: { equals: cleanEmail, mode: 'insensitive' } },
                { company: { equals: cleanEmail, mode: 'insensitive' } },
                { name: { equals: cleanEmail, mode: 'insensitive' } },
                { whatsapp: { contains: cleanEmail.replace(/\D/g, '') } },
              ],
            },
          });
          if (dbQuote) {
            matchedClient = {
              id: dbQuote.linkedClientId || `client-quote-${dbQuote.id}`,
              companyName: dbQuote.company || dbQuote.name,
              contactName: dbQuote.name,
              email: dbQuote.email,
              whatsapp: dbQuote.whatsapp,
              domain: null,
              status: 'ATIVO',
              financialStatus: 'EM_DIA',
              codeDelivered: false,
              backupDelivered: false,
              createdAt: dbQuote.createdAt?.toISOString() || new Date().toISOString(),
              updatedAt: dbQuote.updatedAt?.toISOString() || new Date().toISOString(),
            };
          } else {
            // Busca na tabela de Usuários
            const dbUser = await prisma.user.findFirst({
              where: {
                OR: [
                  { email: { equals: cleanEmail, mode: 'insensitive' } },
                  { phone: { contains: cleanEmail.replace(/\D/g, '') } },
                ],
              },
            });
            if (dbUser) {
              matchedClient = {
                id: dbUser.id,
                companyName: dbUser.name || 'Cliente',
                contactName: dbUser.name || 'Cliente',
                email: dbUser.email,
                whatsapp: dbUser.phone || '',
                domain: null,
                status: 'ATIVO',
                financialStatus: 'EM_DIA',
                codeDelivered: false,
                backupDelivered: false,
                createdAt: dbUser.createdAt?.toISOString() || new Date().toISOString(),
                updatedAt: dbUser.updatedAt?.toISOString() || new Date().toISOString(),
              };
            }
          }
        }
      } catch (err) {}
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
