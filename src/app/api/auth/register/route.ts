import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { cleanPhoneDigits, formatPhoneNumber } from '@/lib/utils';
import { isDatabaseOnline } from '@/lib/init-db';
import { getStoredClients, saveStoredClients } from '@/lib/mz-entities-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      contactName,
      name,
      email,
      password,
      whatsapp,
      phone,
      domain,
    } = body;

    const finalContact = (contactName || name || '').trim();
    const finalCompany = (companyName || finalContact).trim();
    const finalPhone = (whatsapp || phone || '').trim();
    const finalEmail = (email || '').toLowerCase().trim();

    if (!finalContact || !finalEmail || !finalPhone || !password) {
      return NextResponse.json(
        { error: 'Por favor, preencha seu nome, empresa, e-mail, WhatsApp e senha.' },
        { status: 400 }
      );
    }

    if (cleanPhoneDigits(finalPhone).length < 10) {
      return NextResponse.json(
        { error: 'Informe um número de WhatsApp válido com DDD.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve conter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    const clients = getStoredClients();
    const existingClient = clients.find(
      (c) => c.email?.toLowerCase() === finalEmail
    );

    if (existingClient) {
      return NextResponse.json(
        { error: 'Já existe uma conta cadastrada com este e-mail. Faça login.' },
        { status: 409 }
      );
    }

    const nowStr = new Date().toISOString();
    const newClient = {
      id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      companyName: finalCompany,
      contactName: finalContact,
      whatsapp: formatPhoneNumber(finalPhone),
      email: finalEmail,
      domain: domain || null,
      status: 'ATIVO' as const,
      financialStatus: 'EM_DIA' as const,
      startDate: nowStr,
      notes: 'Cadastro realizado diretamente pelo Portal do Cliente mzTech.',
      codeDelivered: false,
      backupDelivered: false,
      projects: [],
      hostings: [],
      _count: { projects: 0, hostings: 0, maintenances: 0, backups: 0 },
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    clients.unshift(newClient);
    saveStoredClients(clients);

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        const hashedPassword = await hashPassword(password);
        await prisma.mzClient.create({
          data: {
            companyName: newClient.companyName,
            contactName: newClient.contactName,
            whatsapp: newClient.whatsapp,
            email: newClient.email,
            domain: newClient.domain,
            status: 'ATIVO',
            financialStatus: 'EM_DIA',
            notes: newClient.notes,
          },
        });

        await prisma.user.create({
          data: {
            name: newClient.contactName,
            email: newClient.email,
            password: hashedPassword,
            phone: newClient.whatsapp,
            role: 'CLIENT',
          },
        });
      } catch (err) {}
    }

    const sessionUser = {
      id: newClient.id,
      name: newClient.contactName,
      email: newClient.email,
      phone: newClient.whatsapp,
      role: 'CLIENT' as const,
      companyName: newClient.companyName,
    };

    const token = signToken(sessionUser);
    const response = NextResponse.json({
      message: 'Cadastro de cliente realizado com sucesso!',
      user: sessionUser,
      client: newClient,
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
    console.error('Erro no cadastro do cliente:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao cadastrar sua conta. Tente novamente.' },
      { status: 500 }
    );
  }
}
