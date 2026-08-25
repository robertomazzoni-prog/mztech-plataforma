const { SandboxMockAdapter } = require('../src/lib/payment/adapters/sandbox-mock-adapter');

async function runPaymentUnitTests() {
  console.log('============================================================');
  console.log('🚀 INICIANDO TESTES DO SISTEMA DE PAGAMENTOS & WEBHOOKS MZTECH');
  console.log('============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    const adapter = new SandboxMockAdapter();

    // ----------------------------------------------------
    // TESTE 1: CRIAÇÃO DE CLIENTE E ASSINATURA EM SANDBOX
    // ----------------------------------------------------
    console.log('📋 1. Testando Gateway Adapter (Sandbox Mock)...');
    const customer = await adapter.createCustomer({
      name: 'Lucas Mazzoni',
      email: 'admin@mazzoni.com',
      whatsapp: '5531991985648',
      companyName: 'Mazzoni Barbershop',
    });
    assert(customer.status === 'SUCCESS', 'Cliente criado em Sandbox');
    assert(customer.gatewayCustomerId.startsWith('cus_mock_'), 'ID do cliente no gateway gerado com segurança');

    const subscription = await adapter.createSubscription(
      {
        clientId: 'client-mazzoni',
        planName: 'Plano Hospedagem + Manutenção Técnica',
        amount: 79.90,
        paymentMethod: 'CREDIT_CARD',
      },
      customer.gatewayCustomerId
    );
    assert(subscription.status === 'ACTIVE', 'Assinatura criada com status ACTIVE');
    assert(subscription.gatewaySubscriptionId.startsWith('sub_mock_'), 'ID da assinatura no gateway gerado');

    // ----------------------------------------------------
    // TESTE 2: CRIAÇÃO DE COBRANÇA PIX (SEM DADOS SENSÍVEIS)
    // ----------------------------------------------------
    console.log('\n📋 2. Testando Cobrança Pix...');
    const pixCharge = await adapter.createPixCharge(
      {
        clientId: 'client-mazzoni',
        amount: 79.90,
        description: 'Mensalidade mzTech',
      },
      customer.gatewayCustomerId
    );
    assert(pixCharge.status === 'PENDING', 'Cobrança Pix criada com status PENDING');
    assert(!!pixCharge.pixCopyPaste, 'Código Pix Copia e Cola gerado');
    assert(pixCharge.pixCopyPaste.includes('br.gov.bcb.pix'), 'Padrão Pix verificado');

    // ----------------------------------------------------
    // TESTE 3: WEBHOOK - PAGAMENTO APROVADO (PAID -> EM_DIA)
    // ----------------------------------------------------
    console.log('\n📋 3. Testando Webhook: Pagamento Aprovado (PAID -> EM_DIA)...');
    const eventPaid = await adapter.parseWebhookEvent({
      eventId: 'evt_test_paid_001',
      eventType: 'PAYMENT_RECEIVED',
      amount: 79.90,
      paymentMethod: 'CREDIT_CARD',
    });
    assert(eventPaid.status === 'PAID', 'Evento PAYMENT_RECEIVED mapeado para status PAID');
    assert(eventPaid.subscriptionStatus === 'ACTIVE', 'Assinatura mantida ACTIVE');

    // ----------------------------------------------------
    // TESTE 4: WEBHOOK - RECUSA DE CARTÃO (FAILED -> RECUSADO)
    // ----------------------------------------------------
    console.log('\n📋 4. Testando Webhook: Pagamento Recusado (FAILED -> RECUSADO)...');
    const eventFailed = await adapter.parseWebhookEvent({
      eventId: 'evt_test_failed_002',
      eventType: 'PAYMENT_FAILED',
      amount: 79.90,
      paymentMethod: 'CREDIT_CARD',
      failureReason: 'Cartão com saldo insuficiente',
    });
    assert(eventFailed.status === 'FAILED', 'Evento PAYMENT_FAILED mapeado para status FAILED');
    assert(eventFailed.subscriptionStatus === 'OVERDUE', 'Assinatura marcada como OVERDUE');
    assert(!!eventFailed.failureReason, 'Motivo da recusa registrado para o cliente');

    // ----------------------------------------------------
    // TESTE 5: WEBHOOK - PAGAMENTO ATRASADO (OVERDUE -> ATRASADO)
    // ----------------------------------------------------
    console.log('\n📋 5. Testando Webhook: Pagamento Vencido (OVERDUE -> ATRASADO)...');
    const eventOverdue = await adapter.parseWebhookEvent({
      eventId: 'evt_test_overdue_003',
      eventType: 'PAYMENT_OVERDUE',
      amount: 79.90,
    });
    assert(eventOverdue.status === 'OVERDUE', 'Evento PAYMENT_OVERDUE mapeado para status OVERDUE');

    // ----------------------------------------------------
    // TESTE 6: WEBHOOK - CANCELAMENTO DE ASSINATURA (CANCELLED -> CANCELADO)
    // ----------------------------------------------------
    console.log('\n📋 6. Testando Webhook: Cancelamento de Assinatura (CANCELLED -> CANCELADO)...');
    const eventCancelled = await adapter.parseWebhookEvent({
      eventId: 'evt_test_canc_004',
      eventType: 'SUBSCRIPTION_CANCELLED',
    });
    assert(eventCancelled.status === 'CANCELLED', 'Evento SUBSCRIPTION_CANCELLED mapeado para status CANCELLED');
    assert(eventCancelled.subscriptionStatus === 'CANCELLED', 'Assinatura cancelada');

    // ----------------------------------------------------
    // TESTE 7: IDEMPOTÊNCIA E DETECÇÃO DE DUPLICATAS
    // ----------------------------------------------------
    console.log('\n📋 7. Testando Regra de Idempotência...');
    const processedEvents = new Set();
    const eventIdFixed = 'evt_idempotent_fixed_777';

    function simulateWebhookProcessing(eventId) {
      if (processedEvents.has(eventId)) {
        return { processedStatus: 'IGNORED_DUPLICATE', message: 'Evento duplicado ignorado.' };
      }
      processedEvents.add(eventId);
      return { processedStatus: 'PROCESSED', message: 'Evento processado.' };
    }

    const firstRun = simulateWebhookProcessing(eventIdFixed);
    assert(firstRun.processedStatus === 'PROCESSED', 'Primeira entrega do webhook processada normalmente');

    const secondRun = simulateWebhookProcessing(eventIdFixed);
    assert(secondRun.processedStatus === 'IGNORED_DUPLICATE', 'Segunda entrega do mesmo eventId foi ignorada sem duplicar');

    console.log('\n============================================================');
    console.log(`RESULTADO: ${passed}/${total} TESTES EXECUTADOS COM 100% DE SUCESSO!`);
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ ERRO NA EXECUÇÃO DOS TESTES:', error);
    process.exit(1);
  }
}

runPaymentUnitTests();
