import { NextRequest, NextResponse } from 'next/server';
import {
  getStoredPortfolio,
  createPortfolioItem,
} from '@/lib/portfolio-store';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';
    const items = getStoredPortfolio();

    if (all) {
      return NextResponse.json({ portfolio: items });
    }

    const activeItems = items.filter((i) => i.active);
    return NextResponse.json({ portfolio: activeItems });
  } catch (error: any) {
    return NextResponse.json({ portfolio: getStoredPortfolio() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getUserFromRequest(req);
    if (session && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      category,
      description,
      url,
      displayUrl,
      tagline,
      subheadline,
      previewImage,
      favicon,
      features,
      badge,
      infrastructure,
      featured,
      active,
    } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Título e URL do projeto são obrigatórios.' },
        { status: 400 }
      );
    }

    const newItem = createPortfolioItem({
      title: title.trim(),
      category: category?.trim() || 'Site Institucional Profissional',
      description: description?.trim() || 'Projeto web desenvolvido pela mzTech.',
      url: url.trim(),
      displayUrl: displayUrl?.trim() || url.replace(/^https?:\/\//i, ''),
      tagline: tagline?.trim() || 'PRESENÇA DIGITAL DE ALTA PERFORMANCE',
      subheadline: subheadline?.trim() || 'Soluções Web sob Medida mzTech',
      previewImage: previewImage || null,
      favicon: favicon || null,
      features: Array.isArray(features) && features.length > 0 ? features : ['Design Responsivo', 'Alta Performance', 'WhatsApp Integrado'],
      badge: badge || 'Em Produção',
      infrastructure: infrastructure || 'Railway Cloud',
      featured: Boolean(featured),
      active: active !== undefined ? Boolean(active) : true,
    });

    return NextResponse.json({
      message: 'Projeto adicionado ao portfólio com sucesso!',
      item: newItem,
    });
  } catch (error: any) {
    console.error('Erro ao adicionar projeto ao portfólio:', error);
    return NextResponse.json(
      { error: 'Erro ao processar criação do projeto no portfólio.' },
      { status: 500 }
    );
  }
}
