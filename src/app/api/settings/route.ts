import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { ensureDatabaseReady } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  id: 'main-settings',
  heroBadge: 'Mazzoni Barbershop • Estilo & Precisão',
  heroTitle: 'ELEVE SEU ESTILO AO NÍVEL MÁXIMO',
  heroSubtitle: 'Especialistas em Cortes Modernos, Barba Alinhada e Pigmentação de Alta Definição.',
  stat1Number: '10k+',
  stat1Label: 'Cortes Realizados',
  stat2Number: 'Premium',
  stat2Label: 'Experiência Única',
  stat3Number: '100%',
  stat3Label: 'Pontualidade',
  stat4Number: 'Online',
  stat4Label: 'Agendamento 24h',
  comfortTitle: 'Conforto & Cortesia',
  comfortText: 'Ambiente climatizado e café cortesia em um espaço moderno pensado para o seu conforto.',
  address: 'Rua VP-2 2993',
  phone: '31991985648',
  whatsapp: '5531991985648',
  instagram: 'https://www.instagram.com/mazzoni_barbers/',
  diffTitle: 'Mais que um corte, uma experiência exclusiva',
  diffSubtitle: 'Por que escolher a Mazzoni?',
  diff1Title: 'Visagismo Personalizado',
  diff1Text: 'Analisamos a geometria do seu rosto e o tipo de cabelo para criar um corte sob medida que valorize seus traços.',
  diff2Title: 'Pigmentação de Alta Definição',
  diff2Text: 'Preenchimento de falhas de barba e acabamento degradê impecável com produtos hipoalergênicos e longa durabilidade.',
  diff3Title: 'Conforto & Cortesia',
  diff3Text: 'Ambiente climatizado e café cortesia em um espaço moderno pensado para o seu conforto.',
  hoursWeekday: '09:00 às 20:00',
  hoursSaturday: '09:00 às 19:00',
  hoursSunday: 'Fechado',
  footerAbout: 'Tradição, estilo e sofisticação no coração da cidade. Especialistas em visagismo masculino, cortes clássicos e modernos, tratamentos de barba e pigmentação de alta definição.',
  ctaTitle: 'Pronto para Renovar o Visual?',
  ctaSubtitle: 'Garanta seu horário com poucos cliques. Escolha o serviço, selecione seu barbeiro e receba a confirmação instantânea no seu WhatsApp.',
};

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();

    const rows: any = await prisma.$queryRawUnsafe(`
      SELECT * FROM "SiteSetting" WHERE "id" = 'main-settings' LIMIT 1
    `).catch(() => []);

    if (rows && rows.length > 0) {
      const merged = { ...DEFAULT_SETTINGS, ...rows[0] };
      return NextResponse.json({ settings: merged });
    }

    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  } catch (error) {
    console.error('Erro ao buscar configurações do site:', error);
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureDatabaseReady();

    const session = getUserFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso restrito ao administrador.' }, { status: 403 });
    }

    const body = await req.json();

    const {
      heroBadge,
      heroTitle,
      heroSubtitle,
      stat1Number,
      stat1Label,
      stat2Number,
      stat2Label,
      stat3Number,
      stat3Label,
      stat4Number,
      stat4Label,
      comfortTitle,
      comfortText,
      address,
      phone,
      whatsapp,
      instagram,
      diffTitle,
      diffSubtitle,
      diff1Title,
      diff1Text,
      diff2Title,
      diff2Text,
      diff3Title,
      diff3Text,
      hoursWeekday,
      hoursSaturday,
      hoursSunday,
      footerAbout,
      ctaTitle,
      ctaSubtitle,
    } = body;

    // Tratar WhatsApp para garantir formato numérico internacional
    let cleanWhatsapp = whatsapp ? String(whatsapp).replace(/\D/g, '') : DEFAULT_SETTINGS.whatsapp;
    if (cleanWhatsapp && !cleanWhatsapp.startsWith('55') && cleanWhatsapp.length >= 10 && cleanWhatsapp.length <= 11) {
      cleanWhatsapp = '55' + cleanWhatsapp;
    }

    await prisma.$executeRawUnsafe(`
      INSERT INTO "SiteSetting" (
        "id", "heroBadge", "heroTitle", "heroSubtitle",
        "stat1Number", "stat1Label", "stat2Number", "stat2Label",
        "stat3Number", "stat3Label", "stat4Number", "stat4Label",
        "comfortTitle", "comfortText",
        "address", "phone", "whatsapp", "instagram",
        "diffTitle", "diffSubtitle", "diff1Title", "diff1Text",
        "diff2Title", "diff2Text", "diff3Title", "diff3Text",
        "hoursWeekday", "hoursSaturday", "hoursSunday", "footerAbout",
        "ctaTitle", "ctaSubtitle", "updatedAt"
      ) VALUES (
        'main-settings',
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, CURRENT_TIMESTAMP
      )
      ON CONFLICT ("id") DO UPDATE SET
        "heroBadge" = EXCLUDED."heroBadge",
        "heroTitle" = EXCLUDED."heroTitle",
        "heroSubtitle" = EXCLUDED."heroSubtitle",
        "stat1Number" = EXCLUDED."stat1Number",
        "stat1Label" = EXCLUDED."stat1Label",
        "stat2Number" = EXCLUDED."stat2Number",
        "stat2Label" = EXCLUDED."stat2Label",
        "stat3Number" = EXCLUDED."stat3Number",
        "stat3Label" = EXCLUDED."stat3Label",
        "stat4Number" = EXCLUDED."stat4Number",
        "stat4Label" = EXCLUDED."stat4Label",
        "comfortTitle" = EXCLUDED."comfortTitle",
        "comfortText" = EXCLUDED."comfortText",
        "address" = EXCLUDED."address",
        "phone" = EXCLUDED."phone",
        "whatsapp" = EXCLUDED."whatsapp",
        "instagram" = EXCLUDED."instagram",
        "diffTitle" = EXCLUDED."diffTitle",
        "diffSubtitle" = EXCLUDED."diffSubtitle",
        "diff1Title" = EXCLUDED."diff1Title",
        "diff1Text" = EXCLUDED."diff1Text",
        "diff2Title" = EXCLUDED."diff2Title",
        "diff2Text" = EXCLUDED."diff2Text",
        "diff3Title" = EXCLUDED."diff3Title",
        "diff3Text" = EXCLUDED."diff3Text",
        "hoursWeekday" = EXCLUDED."hoursWeekday",
        "hoursSaturday" = EXCLUDED."hoursSaturday",
        "hoursSunday" = EXCLUDED."hoursSunday",
        "footerAbout" = EXCLUDED."footerAbout",
        "ctaTitle" = EXCLUDED."ctaTitle",
        "ctaSubtitle" = EXCLUDED."ctaSubtitle",
        "updatedAt" = CURRENT_TIMESTAMP;
    `,
      heroBadge || DEFAULT_SETTINGS.heroBadge,
      heroTitle || DEFAULT_SETTINGS.heroTitle,
      heroSubtitle || DEFAULT_SETTINGS.heroSubtitle,
      stat1Number || DEFAULT_SETTINGS.stat1Number,
      stat1Label || DEFAULT_SETTINGS.stat1Label,
      stat2Number || DEFAULT_SETTINGS.stat2Number,
      stat2Label || DEFAULT_SETTINGS.stat2Label,
      stat3Number || DEFAULT_SETTINGS.stat3Number,
      stat3Label || DEFAULT_SETTINGS.stat3Label,
      stat4Number || DEFAULT_SETTINGS.stat4Number,
      stat4Label || DEFAULT_SETTINGS.stat4Label,
      comfortTitle || DEFAULT_SETTINGS.comfortTitle,
      comfortText || DEFAULT_SETTINGS.comfortText,
      address || DEFAULT_SETTINGS.address,
      phone || DEFAULT_SETTINGS.phone,
      cleanWhatsapp || DEFAULT_SETTINGS.whatsapp,
      instagram || DEFAULT_SETTINGS.instagram,
      diffTitle || DEFAULT_SETTINGS.diffTitle,
      diffSubtitle || DEFAULT_SETTINGS.diffSubtitle,
      diff1Title || DEFAULT_SETTINGS.diff1Title,
      diff1Text || DEFAULT_SETTINGS.diff1Text,
      diff2Title || DEFAULT_SETTINGS.diff2Title,
      diff2Text || DEFAULT_SETTINGS.diff2Text,
      diff3Title || (comfortTitle || DEFAULT_SETTINGS.diff3Title),
      diff3Text || (comfortText || DEFAULT_SETTINGS.diff3Text),
      hoursWeekday || DEFAULT_SETTINGS.hoursWeekday,
      hoursSaturday || DEFAULT_SETTINGS.hoursSaturday,
      hoursSunday || DEFAULT_SETTINGS.hoursSunday,
      footerAbout || DEFAULT_SETTINGS.footerAbout,
      ctaTitle || DEFAULT_SETTINGS.ctaTitle,
      ctaSubtitle || DEFAULT_SETTINGS.ctaSubtitle
    );

    return NextResponse.json({
      message: 'Configurações do site salvas com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao salvar configurações do site:', error);
    return NextResponse.json(
      { error: 'Falha ao salvar configurações do site.' },
      { status: 500 }
    );
  }
}
