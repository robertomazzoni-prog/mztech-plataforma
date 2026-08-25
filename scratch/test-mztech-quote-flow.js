async function testMzTechQuoteFlow() {
  console.log('============================================================');
  console.log('🚀 TESTANDO SISTEMA DE SOLICITAÇÃO & PAINEL DA MZTECH');
  console.log('============================================================\n');

  try {
    const quotesRoute = require('../src/app/api/mztech/quotes/route');

    // 1. Simular envio de orçamento no site escolhendo o Roberto
    console.log('📋 1. Enviando solicitação de orçamento com escolha do Dev Roberto...');
    const quotePayloadRoberto = {
      name: 'Felipe Andrade',
      company: 'Andrade Logística & Transportes',
      whatsapp: '(31) 98877-6655',
      email: 'felipe@andradelog.com.br',
      selectedDev: 'Roberto',
      projectType: 'Sistema Web Personalizado',
      hasDomain: 'Sim, já possuo domínio',
      needsHosting: 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
      projectDescription: 'Painel para rastreamento de frotas e emissão de relatórios.',
      estimatedBudget: 'R$ 4.500,00',
      desiredDeadline: '25 dias',
    };

    const postReq1 = {
      json: async () => quotePayloadRoberto,
      cookies: { get: () => null },
      headers: { get: () => null },
    };

    const res1 = await quotesRoute.POST(postReq1);
    const data1 = await res1.json();
    console.log(`Resposta do envio (Roberto): status ${res1.status}`, data1.quote?.name);
    if (res1.status !== 201) throw new Error('Falha ao enviar orçamento para Roberto.');

    // 2. Simular envio de orçamento no site escolhendo o Morvan
    console.log('\n📋 2. Enviando solicitação de orçamento com escolha do Dev Morvan...');
    const quotePayloadMorvan = {
      name: 'Camila Duarte',
      company: 'Duarte Estética Avançada',
      whatsapp: '(31) 97766-5544',
      email: 'camila@duarteestetica.com.br',
      selectedDev: 'Morvan',
      projectType: 'Site Institucional Profissional',
      hasDomain: 'Não, preciso registrar',
      needsHosting: 'Plano Hospedagem + Manutenção (R$ 79,90/mês)',
      projectDescription: 'Site responsivo para atração de novos clientes e agendamento.',
      estimatedBudget: 'R$ 2.800,00',
      desiredDeadline: '15 dias',
    };

    const postReq2 = {
      json: async () => quotePayloadMorvan,
      cookies: { get: () => null },
      headers: { get: () => null },
    };

    const res2 = await quotesRoute.POST(postReq2);
    const data2 = await res2.json();
    console.log(`Resposta do envio (Morvan): status ${res2.status}`, data2.quote?.name);
    if (res2.status !== 201) throw new Error('Falha ao enviar orçamento para Morvan.');

    // 3. Consultar a API como a área administrativa faz
    console.log('\n📋 3. Consultando a listagem da Área Administrativa (/admin e /admin/mztech)...');
    const getReq = {
      url: 'http://localhost:3000/api/mztech/quotes',
      cookies: { get: () => null },
      headers: { get: () => null },
    };

    const getRes = await quotesRoute.GET(getReq);
    const getData = await getRes.json();

    console.log(`Total de orçamentos no painel mzTech: ${getData.total}`);
    console.log(`Métricas: Roberto = ${getData.metrics.quotesForRoberto}, Morvan = ${getData.metrics.quotesForMorvan}`);

    const foundRoberto = getData.quotes.some((q) => q.name === 'Felipe Andrade' && q.selectedDev === 'Roberto');
    const foundMorvan = getData.quotes.some((q) => q.name === 'Camila Duarte' && q.selectedDev === 'Morvan');

    if (!foundRoberto || !foundMorvan) {
      throw new Error('As solicitações enviadas não foram listadas corretamente no painel administrativo!');
    }

    console.log('✅ Ambas as solicitações foram gravadas e estão visíveis com seus respectivos responsáveis (Roberto e Morvan)!');
    console.log('\n============================================================');
    console.log('🎉 TESTE DO SISTEMA DA MZTECH CONCLUÍDO COM 100% DE SUCESSO!');
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
    process.exit(1);
  }
}

testMzTechQuoteFlow();
