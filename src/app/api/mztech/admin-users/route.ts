import { NextRequest, NextResponse } from 'next/server';
import { getStoredAdminUsers, updateAdminUser } from '@/lib/admin-users-store';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const users = getStoredAdminUsers();
    // Retorna os usuários sem o hash da senha por segurança
    const safeUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      partner: u.partner,
      updatedAt: u.updatedAt,
    }));

    return NextResponse.json({ users: safeUsers });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao listar administradores.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getUserFromRequest(req);
    // Permite alteração se autenticado como admin
    if (session && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem alterar credenciais.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, name, email, phone, newPassword } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do administrador é obrigatório.' },
        { status: 400 }
      );
    }

    if (email && !email.includes('@')) {
      return NextResponse.json(
        { error: 'Informe um e-mail válido.' },
        { status: 400 }
      );
    }

    if (newPassword && newPassword.length < 4) {
      return NextResponse.json(
        { error: 'A nova senha deve conter pelo menos 4 caracteres.' },
        { status: 400 }
      );
    }

    const updated = await updateAdminUser(id, {
      name,
      email,
      phone,
      newPassword: newPassword || undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Administrador não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Credenciais atualizadas com sucesso!',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        partner: updated.partner,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar credenciais de admin:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a atualização das credenciais.' },
      { status: 500 }
    );
  }
}
