import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
    const dbOnline = await isDatabaseOnline();

    let metrics = {
      users: 0,
      mzClients: 0,
      mzQuotes: 0,
      mzContracts: 0,
      mzProjects: 0,
      mzPortfolio: 0,
      mzServices: 0,
    };

    if (dbOnline) {
      try {
        const [users, mzClients, mzQuotes, mzContracts, mzProjects, mzPortfolio, mzServices] =
          await Promise.all([
            prisma.user.count().catch(() => 0),
            prisma.mzClient.count().catch(() => 0),
            prisma.mzQuote.count().catch(() => 0),
            prisma.mzContract.count().catch(() => 0),
            prisma.mzProject.count().catch(() => 0),
            prisma.mzPortfolio.count().catch(() => 0),
            prisma.mzService.count().catch(() => 0),
          ]);

        metrics = {
          users,
          mzClients,
          mzQuotes,
          mzContracts,
          mzProjects,
          mzPortfolio,
          mzServices,
        };
      } catch (e) {}
    }

    return NextResponse.json({
      status: dbOnline ? 'HEALTHY' : 'WARNING_NO_DATABASE',
      database: {
        configured: hasDatabaseUrl,
        connected: dbOnline,
        engine: 'PostgreSQL',
      },
      persistenceMode: dbOnline ? 'POSTGRESQL_PERMANENT' : 'LOCAL_EPHEMERAL',
      metrics,
      advice: !hasDatabaseUrl
        ? 'A variável DATABASE_URL do PostgreSQL não foi encontrada nas variáveis de ambiente da Railway. Para garantir persistência definitiva sem perda de dados em redeploys, adicione o banco PostgreSQL na Railway.'
        : !dbOnline
        ? 'DATABASE_URL configurada mas o banco ainda não respondeu ao teste de ping.'
        : 'Banco de dados PostgreSQL 100% operacional e com persistência de dados ativa.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao verificar saúde do sistema.' }, { status: 500 });
  }
}
