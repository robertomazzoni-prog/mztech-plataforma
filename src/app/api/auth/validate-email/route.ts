import { NextRequest, NextResponse } from 'next/server';
import { validateEmailDomainExists } from '@/lib/server-validators';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ isValid: false, error: 'E-mail não informado.' }, { status: 400 });
    }

    const result = await validateEmailDomainExists(email);
    if (!result.isValid) {
      return NextResponse.json({ isValid: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ isValid: true, cleanEmail: result.cleanEmail });
  } catch (error: any) {
    return NextResponse.json({ isValid: true });
  }
}
