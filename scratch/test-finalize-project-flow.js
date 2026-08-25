async function testFinalizeProjectFlow() {
  console.log('============================================================');
  console.log('🚀 TESTANDO FINALIZAÇÃO DE PROJETO & AUTO-REGISTRO');
  console.log('============================================================\n');

  try {
    const quotesRoute = require('../src/app/api/mztech/quotes/route');
    const quoteIdRoute = require('../src/app/api/mztech/quotes/[id]/route');
    const clientsRoute = require('../src/app/api/mztech/clients/route');
    const projectsRoute = require('../src/app/api/mztech/projects/route');

    // 1. Criar um novo orçamento para o teste
    console.log('📋 1. Criando novo orçamento de teste no site...');
    const postReq = {
      json: async () => ({
        name: 'Ana Carolina Dias',
        company: 'Dias Arquitetura & Interiores',
        whatsapp: '(31) 98888-3344',
        email: 'ana@diasarquitetura.com.br',
        selectedDev: 'Roberto',
        projectType: 'Site Institucional Premium',
        hasDomain: 'Sim, já possuo',
        needsHosting: 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
        projectDescription: 'Portfolio interativo de projetos arquitetônicos.',
        estimatedBudget: 'R$ 3.200,00',
        desiredDeadline: '20 dias',
        status: 'NOVO',
      }),
      cookies: { get: () => null },
      headers: { get: () => null },
    };

    const quoteRes = await quotesRoute.POST(postReq);
    const quoteData = await quoteRes.json();
    const createdQuoteId = quoteData.quote.id;
    console.log(`✅ Orçamento criado com sucesso: ${createdQuoteId} (${quoteData.quote.name})`);

    // 2. Marcar o projeto como FINALIZADO ('CONCLUIDO')
    console.log('\n📋 2. Marcando projeto como "4. Finalizado" (CONCLUIDO)...');
    const patchReq = {
      json: async () => ({ status: 'CONCLUIDO' }),
      cookies: { get: () => null },
      headers: { get: () => null },
    };

    const patchRes = await quoteIdRoute.PATCH(patchReq, { params: { id: createdQuoteId } });
    const patchData = await patchRes.json();
    console.log(`Resposta do PATCH: status ${patchRes.status}`, patchData.message);

    // 3. Verificar se o cliente foi cadastrado automaticamente na aba Clientes
    console.log('\n📋 3. Verificando se o cliente aparece em /api/mztech/clients...');
    const getClientsReq = {
      url: 'http://localhost:3000/api/mztech/clients',
      cookies: { get: () => null },
      headers: { get: () => null },
    };

    const clientsRes = await clientsRoute.GET(getClientsReq);
    const clientsData = await clientsRes.json();
    const foundClient = clientsData.clients.find(
      (c) => c.companyName === 'Dias Arquitetura & Interiores' || c.contactName === 'Ana Carolina Dias'
    );

    if (!foundClient) {
      throw new Error('Cliente não foi encontrado na listagem de Clientes após finalizar o projeto!');
    }
    console.log(`✅ Cliente encontrado com sucesso na aba Clientes: ${foundClient.companyName} (Status: ${foundClient.status}, Financeiro: ${foundClient.financialStatus})`);

    // 4. Verificar se o projeto foi cadastrado automaticamente na aba Projetos
    console.log('\n📋 4. Verificando se o projeto aparece em /api/mztech/projects...');
    const getProjectsReq = {
      url: 'http://localhost:3000/api/mztech/projects',
      cookies: { get: () => null },
      headers: { get: () => null },
    };

    const projectsRes = await projectsRoute.GET(getProjectsReq);
    const projectsData = await projectsRes.json();
    const foundProject = projectsData.projects.find(
      (p) => p.name.includes('Dias Arquitetura')
    );

    if (!foundProject) {
      throw new Error('Projeto não foi encontrado na listagem de Projetos após finalizar!');
    }
    console.log(`✅ Projeto encontrado com sucesso na aba Projetos: "${foundProject.name}" (Status: ${foundProject.status}, Plataforma: ${foundProject.hostingPlatform})`);

    console.log('\n============================================================');
    console.log('🎉 TESTE DE AUTO-REGISTRO EM CLIENTES E PROJETOS 100% APROVADO!');
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
    process.exit(1);
  }
}

testFinalizeProjectFlow();
