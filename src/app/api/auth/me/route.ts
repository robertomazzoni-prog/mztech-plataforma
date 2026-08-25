import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getUserFromRequest(req);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
        },
      });

      return NextResponse.json({ user: user || session });
    } catch {
      // Se o banco estiver indisponível no momento, preserva a sessão válida do JWT
      return NextResponse.json({ user: session });
    }
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
