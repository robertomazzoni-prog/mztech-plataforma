import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import { getUserFromRequest } from '@/lib/auth';
import {
  getStoredProjects,
  updateStoredProject,
  deleteStoredProject,
} from '@/lib/mz-entities-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const projects = getStoredProjects();
    let project = projects.find((p) => p.id === params.id);

    if (!project) {
      const dbOnline = await isDatabaseOnline();
      if (dbOnline) {
        try {
          const dbProj = await prisma.mzProject.findUnique({
            where: { id: params.id },
            include: {
              client: true,
              hostings: true,
              maintenances: { orderBy: { date: 'desc' } },
              contracts: { orderBy: { createdAt: 'desc' } },
              backups: { orderBy: { backupDate: 'desc' } },
            },
          });
          if (dbProj) project = dbProj;
        } catch (err) {}
      }
    }

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error('Erro ao buscar projeto:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados do projeto.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      type,
      status,
      startDate,
      deliveryDate,
      domain,
      hostingUrl,
      githubRepo,
      hostingPlatform,
      notes,
    } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (type !== undefined) dataToUpdate.type = type;
    if (status !== undefined) dataToUpdate.status = status;
    if (startDate !== undefined) dataToUpdate.startDate = startDate ? new Date(startDate) : null;
    if (deliveryDate !== undefined)
      dataToUpdate.deliveryDate = deliveryDate ? new Date(deliveryDate) : null;
    if (domain !== undefined) dataToUpdate.domain = domain;
    if (hostingUrl !== undefined) dataToUpdate.hostingUrl = hostingUrl;
    if (githubRepo !== undefined) dataToUpdate.githubRepo = githubRepo;
    if (hostingPlatform !== undefined) dataToUpdate.hostingPlatform = hostingPlatform;
    if (notes !== undefined) dataToUpdate.notes = notes;

    let project = updateStoredProject(params.id, dataToUpdate);

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        const dbProj = await prisma.mzProject.update({
          where: { id: params.id },
          data: dataToUpdate,
        });
        if (!project) project = dbProj;
      } catch (err) {}
    }

    return NextResponse.json({ project: project || { id: params.id, ...dataToUpdate } });
  } catch (error: any) {
    console.error('Erro ao atualizar projeto:', error);
    return NextResponse.json({ error: 'Erro ao atualizar projeto.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    deleteStoredProject(params.id);

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        await prisma.mzProject.delete({
          where: { id: params.id },
        });
      } catch (err) {}
    }

    return NextResponse.json({ success: true, message: 'Projeto removido com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao remover projeto:', error);
    return NextResponse.json({ error: 'Erro ao remover projeto.' }, { status: 500 });
  }
}
