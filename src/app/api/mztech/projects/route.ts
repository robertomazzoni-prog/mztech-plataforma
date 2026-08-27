import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDatabaseOnline } from '@/lib/init-db';
import {
  getStoredProjects,
  saveStoredProjects,
  getStoredClients,
  syncProjectsFromDb,
} from '@/lib/mz-entities-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    let projects = await syncProjectsFromDb();

    let filtered = [...projects];
    if (clientId) filtered = filtered.filter((p) => p.clientId === clientId);
    if (status && status !== 'ALL') filtered = filtered.filter((p) => p.status === status);

    return NextResponse.json({ projects: filtered });
  } catch (error: any) {
    return NextResponse.json({ projects: getStoredProjects() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientId,
      newClientName,
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

    let finalClientId = clientId;
    let clientObj = null;
    const clients = getStoredClients();

    if ((!finalClientId || finalClientId === 'NEW') && newClientName) {
      const cleanName = newClientName.trim();
      let existingClient = clients.find(
        (c) => c.companyName?.toLowerCase() === cleanName.toLowerCase()
      );

      if (!existingClient) {
        existingClient = {
          id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          companyName: cleanName,
          contactName: cleanName,
          whatsapp: '(11) 99999-8888',
          email: `contato@${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'empresa'}.com.br`,
          status: 'ATIVO',
          financialStatus: 'EM_DIA',
          notes: 'Cadastrado diretamente pelo módulo de projetos.',
          codeDelivered: false,
          backupDelivered: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        clients.unshift(existingClient);
      }
      finalClientId = existingClient.id;
      clientObj = existingClient;
    } else if (finalClientId) {
      clientObj = clients.find((c) => c.id === finalClientId) || null;
    }

    if (!finalClientId || !name || !type) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: Cliente, Nome do Projeto e Tipo.' },
        { status: 400 }
      );
    }

    const newProjectId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newProject: any = {
      id: newProjectId,
      clientId: finalClientId,
      client: clientObj
        ? {
            id: clientObj.id,
            companyName: clientObj.companyName,
            contactName: clientObj.contactName,
            email: clientObj.email,
            whatsapp: clientObj.whatsapp,
          }
        : null,
      name,
      type,
      status: status || 'PLANEJAMENTO',
      startDate: startDate || new Date().toISOString(),
      deliveryDate: deliveryDate || null,
      domain: domain || null,
      hostingUrl: hostingUrl || null,
      githubRepo: githubRepo || null,
      hostingPlatform: hostingPlatform || 'Railway',
      notes: notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const projects = getStoredProjects();
    projects.unshift(newProject);
    saveStoredProjects(projects);

    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        if (clientObj) {
          await prisma.mzClient.upsert({
            where: { id: clientObj.id },
            create: {
              id: clientObj.id,
              companyName: clientObj.companyName,
              contactName: clientObj.contactName,
              whatsapp: clientObj.whatsapp,
              email: clientObj.email,
              status: clientObj.status || 'ATIVO',
              financialStatus: clientObj.financialStatus || 'EM_DIA',
              notes: clientObj.notes || null,
            },
            update: {},
          }).catch(() => {});
        }

        await prisma.mzProject.upsert({
          where: { id: newProject.id },
          create: {
            id: newProject.id,
            clientId: finalClientId,
            name: newProject.name,
            type: newProject.type,
            status: newProject.status,
            startDate: newProject.startDate ? new Date(newProject.startDate) : null,
            deliveryDate: newProject.deliveryDate ? new Date(newProject.deliveryDate) : null,
            domain: newProject.domain,
            hostingUrl: newProject.hostingUrl,
            githubRepo: newProject.githubRepo,
            hostingPlatform: newProject.hostingPlatform,
            notes: newProject.notes,
          },
          update: {
            name: newProject.name,
            type: newProject.type,
            status: newProject.status,
            domain: newProject.domain,
            hostingUrl: newProject.hostingUrl,
            githubRepo: newProject.githubRepo,
            notes: newProject.notes,
          },
        });
      } catch (err) {}
    }

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao cadastrar projeto.' }, { status: 500 });
  }
}
