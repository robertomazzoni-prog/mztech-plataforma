export interface ExtractedPortfolioMetadata {
  title: string;
  category: string;
  description: string;
  url: string;
  displayUrl: string;
  tagline: string;
  subheadline: string;
  previewImage: string | null;
  favicon: string | null;
  features: string[];
  badge: string;
  infrastructure: string;
}

/**
 * Limpa títulos removendo sufixos genéricos de SEO como '| Home', '- Início', '• Oficial', etc.
 */
function cleanTitle(rawTitle: string, hostname: string): string {
  if (!rawTitle) {
    const parts = hostname.replace(/^www\./i, '').split('.')[0];
    return parts.charAt(0).toUpperCase() + parts.slice(1);
  }

  return rawTitle
    .replace(/\s*([|\-–—•~:]\s*(Home|Início|Official|Oficial|Site Oficial|Página Inicial|Bem-vindo|Welcome).*)$/i, '')
    .trim();
}

/**
 * Extrai meta tags e dados estruturados de um site a partir da URL
 */
export async function extractSiteMetadata(inputUrl: string): Promise<ExtractedPortfolioMetadata> {
  let targetUrl = inputUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    throw new Error('URL inválida. Por favor, informe um endereço válido (ex: https://meusite.com.br).');
  }

  const hostname = parsedUrl.hostname.replace(/^www\./i, '');
  const displayUrl = hostname + (parsedUrl.pathname !== '/' && parsedUrl.pathname !== '' ? parsedUrl.pathname : '');

  let html = '';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 mzTech-SmartCrawler/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      html = await res.text();
    }
  } catch (err) {
    // Se a conexão falhar (ex: site offline ou bloqueio de CORS/crawler), prossegue com fallback inteligente
    console.warn(`[SmartPortfolio] Não foi possível obter HTML de ${targetUrl}, aplicando inferência inteligente.`);
  }

  // 1. Extração de Título
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const rawTitle = ogTitleMatch?.[1] || titleTagMatch?.[1] || '';
  const finalTitle = cleanTitle(rawTitle, hostname);

  // 2. Extração de Descrição
  const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
  const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const rawDescription = ogDescMatch?.[1] || metaDescMatch?.[1] || '';

  // 3. Extração de Imagem / OpenGraph Image
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  let previewImage = ogImageMatch?.[1] || null;
  if (previewImage && !previewImage.startsWith('http://') && !previewImage.startsWith('https://')) {
    previewImage = new URL(previewImage, targetUrl).toString();
  }

  // 4. Extração de Favicon
  const faviconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i);
  let favicon = faviconMatch?.[1] || `${parsedUrl.origin}/favicon.ico`;
  if (favicon && !favicon.startsWith('http://') && !favicon.startsWith('https://')) {
    favicon = new URL(favicon, targetUrl).toString();
  }

  // 5. Extração de Headlines (H1 / H2)
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const h2Match = html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  const rawH1 = h1Match?.[1]?.trim() || '';
  const rawH2 = h2Match?.[1]?.trim() || '';

  // 6. Inferência Inteligente de Categoria e Recursos
  const combinedText = (html + ' ' + rawTitle + ' ' + rawDescription + ' ' + targetUrl).toLowerCase();

  let category = 'Site Institucional Profissional';
  let defaultFeatures = [
    'Design exclusivo & responsivo',
    'Integração direta com WhatsApp',
    'Otimização de SEO e velocidade',
    'Infraestrutura em nuvem segura',
  ];

  if (
    combinedText.includes('agendamento') ||
    combinedText.includes('barbearia') ||
    combinedText.includes('salao') ||
    combinedText.includes('clínica') ||
    combinedText.includes('horário')
  ) {
    category = 'Site + Sistema de Agendamento';
    defaultFeatures = [
      'Agendamento online 24h',
      'Confirmação automática via WhatsApp',
      'Painel de controle e faturamento',
      'Gestão de horários e serviços',
    ];
  } else if (
    combinedText.includes('loja') ||
    combinedText.includes('ecommerce') ||
    combinedText.includes('e-commerce') ||
    combinedText.includes('carrinho') ||
    combinedText.includes('produto') ||
    combinedText.includes('comprar') ||
    combinedText.includes('catálogo')
  ) {
    category = 'E-commerce & Catálogo Online';
    defaultFeatures = [
      'Catálogo de produtos com fotos em alta definição',
      'Checkout e pedidos rápidos via WhatsApp ou Gateway',
      'Controle de categorias e variações',
      'Carregamento ultra-rápido para celular',
    ];
  } else if (
    combinedText.includes('sistema') ||
    combinedText.includes('dashboard') ||
    combinedText.includes('painel') ||
    combinedText.includes('portal') ||
    combinedText.includes('gestao') ||
    combinedText.includes('gestão') ||
    combinedText.includes('login')
  ) {
    category = 'Sistema Web & Painel Administrativo';
    defaultFeatures = [
      'Painel administrativo completo sob medida',
      'Autenticação segura de usuários e permissões',
      'Relatórios e métricas em tempo real',
      'Banco de dados relacional integrado',
    ];
  } else if (
    combinedText.includes('cardapio') ||
    combinedText.includes('cardápio') ||
    combinedText.includes('delivery') ||
    combinedText.includes('restaurante') ||
    combinedText.includes('hamburgueria') ||
    combinedText.includes('pizzaria')
  ) {
    category = 'Cardápio Digital & Delivery';
    defaultFeatures = [
      'Cardápio interativo e atualizável em tempo real',
      'Envio de pedidos formatados direto no WhatsApp',
      'Cálculo de taxa e opções de pagamento',
      'Design apetitoso e adaptado para smartphones',
    ];
  } else if (combinedText.includes('landing') || combinedText.includes('captura') || combinedText.includes('conversao')) {
    category = 'Landing Page de Alta Conversão';
    defaultFeatures = [
      'Página única focada em conversão e leads',
      'Botões de chamada para ação estratégicos',
      'Carregamento instantâneo (< 1s)',
      'Pixel do Facebook e Google Ads prontos',
    ];
  }

  // 7. Descrição Final Inteligente
  const finalDescription =
    rawDescription && rawDescription.length > 25 && rawDescription.length < 350
      ? rawDescription
      : `Plataforma digital moderna desenvolvida sob medida pela mzTech em Next.js e TypeScript com foco em alta performance, usabilidade móvel e geração de oportunidades para ${finalTitle}.`;

  // 8. Tagline & Subheadline
  const tagline = rawH1 && rawH1.length < 60 ? rawH1.toUpperCase() : `PRESENÇA DIGITAL DE ALTA PERFORMANCE`;
  const subheadline =
    rawH2 && rawH2.length < 90 ? rawH2 : `${category} • Soluções Web mzTech`;

  let infrastructure = 'Railway Cloud';
  if (targetUrl.includes('vercel.app')) infrastructure = 'Vercel Edge Cloud';
  else if (targetUrl.includes('railway.app') || targetUrl.includes('railway')) infrastructure = 'Infraestrutura Railway';
  else infrastructure = 'Infraestrutura em Nuvem mzTech';

  return {
    title: finalTitle,
    category,
    description: finalDescription,
    url: targetUrl,
    displayUrl,
    tagline,
    subheadline,
    previewImage,
    favicon,
    features: defaultFeatures,
    badge: 'Em Produção',
    infrastructure,
  };
}
