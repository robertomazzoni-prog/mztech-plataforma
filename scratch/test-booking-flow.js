const fetch = global.fetch || require('node-fetch');

async function testBookingFlow() {
  console.log('============================================================');
  console.log('🚀 TESTANDO FLUXO DE AGENDAMENTO E ÁREA ADMINISTRATIVA');
  console.log('============================================================\n');

  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Simular Agendamento de Cliente na Barbearia (/agendar)
    console.log('📋 1. Criando novo agendamento de cliente...');
    const appointmentPayload = {
      clientName: 'Gabriel Medeiros',
      clientPhone: '(11) 98765-1122',
      clientEmail: 'gabriel@teste.com',
      serviceId: 'srv-teste',
      barberId: 'barber-teste',
      date: todayStr,
      timeSlot: '16:30',
      notes: 'Teste de agendamento automático',
    };

    // Import the handler directly
    const route = require('../src/app/api/appointments/route');
    const mockPostReq = {
      json: async () => appointmentPayload,
      cookies: { get: () => null },
      headers: { get: () => null },
    };

    const postRes = await route.POST(mockPostReq);
    const postData = await postRes.json();
    console.log(`Status do Agendamento: ${postRes.status}`, postData.message || postData.error);
    if (postRes.status !== 201) throw new Error('Falha ao criar agendamento.');

    // 2. Verificar se o agendamento aparece na listagem administrativa (/admin)
    console.log('\n📋 2. Consultando listagem administrativa de agendamentos...');
    const mockGetReq = {
      url: `http://localhost:3000/api/appointments?date=ALL`,
      cookies: { get: () => null },
      headers: { get: () => null },
    };

    const getRes = await route.GET(mockGetReq);
    const getData = await getRes.json();
    console.log(`Total de agendamentos retornados: ${getData.appointments?.length || 0}`);

    const found = getData.appointments?.some((a) => a.clientName === 'Gabriel Medeiros');
    if (!found) {
      throw new Error('O agendamento criado não foi encontrado na listagem administrativa!');
    }
    console.log('✅ Agendamento do cliente localizado com sucesso na área administrativa!');

    console.log('\n============================================================');
    console.log('🎉 TESTE DE AGENDAMENTO CONCLUÍDO COM 100% DE SUCESSO!');
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
    process.exit(1);
  }
}

testBookingFlow();
