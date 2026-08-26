import { NextRequest, NextResponse } from 'next/server';
import { getStoredSettings, updateSettings } from '@/lib/mz-settings-store';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const settings = getStoredSettings();
    return NextResponse.json(
      { settings },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao carregar configurações da empresa.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getUserFromRequest(req);
    if (session && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem alterar as informações da empresa.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      legalName,
      tagline,
      siteTheme,
      email,
      emails,
      robertoName,
      robertoPhone,
      robertoWhatsapp,
      robertoPixKey,
      morvanName,
      morvanPhone,
      morvanWhatsapp,
      morvanPixKey,
      pixKey,
      pixKeys,
      workingHours,
    } = body;

    const updated = updateSettings({
      ...(name !== undefined && { name: name.trim() }),
      ...(legalName !== undefined && { legalName: legalName.trim() }),
      ...(tagline !== undefined && { tagline: tagline.trim() }),
      ...(siteTheme !== undefined && { siteTheme }),
      ...(email !== undefined && { email: email.toLowerCase().trim() }),
      ...(Array.isArray(emails) && { emails }),
      ...(robertoName !== undefined && { robertoName: robertoName.trim() }),
      ...(robertoPhone !== undefined && { robertoPhone: robertoPhone.trim() }),
      ...(robertoWhatsapp !== undefined && { robertoWhatsapp: robertoWhatsapp.replace(/\D/g, '') }),
      ...(robertoPixKey !== undefined && { robertoPixKey: robertoPixKey.trim() }),
      ...(morvanName !== undefined && { morvanName: morvanName.trim() }),
      ...(morvanPhone !== undefined && { morvanPhone: morvanPhone.trim() }),
      ...(morvanWhatsapp !== undefined && { morvanWhatsapp: morvanWhatsapp.replace(/\D/g, '') }),
      ...(morvanPixKey !== undefined && { morvanPixKey: morvanPixKey.trim() }),
      ...(pixKey !== undefined && { pixKey: pixKey.trim() }),
      ...(Array.isArray(pixKeys) && { pixKeys }),
      ...(workingHours !== undefined && { workingHours: workingHours.trim() }),
    });

    return NextResponse.json({
      message: 'Informações da empresa, e-mails e chaves Pix atualizados com sucesso!',
      settings: updated,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao processar atualização das configurações.' },
      { status: 500 }
    );
  }
}
