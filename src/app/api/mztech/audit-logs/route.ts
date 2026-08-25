import { NextRequest, NextResponse } from 'next/server';
import { getStoredAuditLogs } from '@/lib/audit-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const category = searchParams.get('category');

    let logs = getStoredAuditLogs();

    if (category && category !== 'ALL') {
      logs = logs.filter((l) => l.category === category);
    }

    return NextResponse.json({
      logs: logs.slice(0, limit),
      total: logs.length,
    });
  } catch (error: any) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return NextResponse.json({ error: 'Erro ao buscar logs.' }, { status: 500 });
  }
}
