import { NextRequest, NextResponse } from 'next/server';
import { extractSiteMetadata } from '@/lib/portfolio-extractor';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = getUserFromRequest(req);
    if (session && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso restrito para administradores.' }, { status: 403 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { error: 'Por favor, informe a URL do site (ex: https://meusite.com.br).' },
        { status: 400 }
      );
    }

    const extracted = await extractSiteMetadata(url);

    return NextResponse.json({
      success: true,
      data: extracted,
    });
  } catch (error: any) {
    console.error('Erro na extração inteligente de metadados:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao extrair dados do site.' },
      { status: 500 }
    );
  }
}
