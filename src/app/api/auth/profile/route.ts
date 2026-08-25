import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, comparePassword, hashPassword, signToken } from '@/lib/auth';
import { ensureDatabaseReady } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const session = getUserFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro no servidor.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const session = getUserFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, currentPassword, newPassword } = body;

    const userInDb = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!userInDb) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const dataToUpdate: any = {};

    // 1. Atualizar Nome
    if (name && name.trim()) {
      dataToUpdate.name = name.trim();
    }

    // 2. Atualizar E-mail
    if (email && email.trim() && email.trim().toLowerCase() !== userInDb.email.toLowerCase()) {
      const emailFormatted = email.trim().toLowerCase();
      // Verificar se já existe outra conta com este e-mail
      const emailConflict = await prisma.user.findFirst({
        where: {
          email: emailFormatted,
          id: { not: userInDb.id },
        },
      });
      if (emailConflict) {
        return NextResponse.json(
          { error: 'Este e-mail já está em uso por outra conta.' },
          { status: 400 }
        );
      }
      dataToUpdate.email = emailFormatted;
    }

    // 3. Atualizar Telefone
    if (phone !== undefined) {
      dataToUpdate.phone = phone ? phone.trim() : null;
    }

    // 4. Alterar Senha
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Por favor, informe a senha atual para definir uma nova senha.' },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await comparePassword(currentPassword, userInDb.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'A senha atual informada está incorreta.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'A nova senha deve conter no mínimo 6 caracteres.' },
          { status: 400 }
        );
      }

      dataToUpdate.password = await hashPassword(newPassword);
    }

    // Executar atualização
    const updatedUser = await prisma.user.update({
      where: { id: userInDb.id },
      data: dataToUpdate,
    });

    // Gerar novo token JWT atualizado
    const updatedSession = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role as any,
      phone: updatedUser.phone,
    };

    const token = signToken(updatedSession);

    const response = NextResponse.json({
      message: 'Perfil atualizado com sucesso!',
      user: updatedSession,
    });

    response.cookies.set({
      name: 'mazzoni_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao processar as alterações de perfil.' },
      { status: 500 }
    );
  }
}
