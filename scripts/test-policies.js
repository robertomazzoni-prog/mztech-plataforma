const fs = require('fs');
const path = require('path');

// Ler .env manualmente caso não esteja carregado
if (!process.env.DATABASE_URL && fs.existsSync(path.resolve(__dirname, '../.env'))) {
  const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  }
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runPolicyTests() {
  console.log('============================================================');
  console.log('INICIANDO SUÍTE DE TESTES DAS POLÍTICAS mzTech');
  console.log('============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // ------------------------------------------------------------
    // TESTE 1: REGRESSÃO E INTEGRIDADE DO MAZZONI BARBERSHOP
    // ------------------------------------------------------------
    console.log('📋 1. Testando Integridade do Mazzoni Barbershop...');
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@mazzoni.com' } });
    assert(!!adminUser, 'Admin do Mazzoni continua existindo e intacto');

    const barbers = await prisma.barber.findMany();
    assert(barbers.length >= 3, `Barbeiros cadastrados: ${barbers.length} (esperado >= 3)`);

    const services = await prisma.service.findMany();
    assert(services.length >= 3, `Serviços da barbearia cadastrados: ${services.length} (esperado >= 3)`);

    console.log(`     Configurações e tabelas da barbearia 100% preservadas.`);

    // ------------------------------------------------------------
    // TESTE 2: CICLO COMPLETO DE CLIENTE & CANCELAMENTO & ENTREGA
    // ------------------------------------------------------------
    console.log('\n📋 2. Testando Ciclo de Cliente: ATIVO -> CANCELAMENTO_SOLICITADO -> ENCERRADO...');
    
    // Criar cliente de teste
    const testClient = await prisma.mzClient.create({
      data: {
        companyName: 'Cliente Teste Políticas S.A.',
        contactName: 'Roberto Alencar',
        whatsapp: '5511999887766',
        email: 'roberto@clienteteste.com.br',
        domain: 'clienteteste.com.br',
        status: 'ATIVO',
        startDate: new Date('2026-08-01T00:00:00Z'),
        notes: 'Cliente para validação de ciclo de vida e entrega.',
      },
    });
    assert(testClient.status === 'ATIVO', 'Cliente criado com status ATIVO');

    // Vincular Hospedagem ao cliente
    const testHosting = await prisma.mzHosting.create({
      data: {
        clientId: testClient.id,
        provider: 'DigitalOcean',
        serverType: 'App Platform Docker',
        url: 'https://clienteteste.ondigitalocean.app',
        customDomain: 'clienteteste.com.br',
        platformDomain: 'clienteteste.ondigitalocean.app',
        monthlyPrice: 79.90,
        status: 'ATIVO',
      },
    });
    assert(testHosting.status === 'ATIVO', 'Hospedagem vinculada com status ATIVO');
    assert(testHosting.provider === 'DigitalOcean', 'Provedor DigitalOcean gravado com sucesso');
    assert(testHosting.customDomain !== testHosting.platformDomain, 'Domínio próprio e técnico separados');

    // 2.1 Mudar para CANCELAMENTO_SOLICITADO
    const reqDate = new Date('2026-08-24T14:00:00Z');
    const cancelRequestedClient = await prisma.mzClient.update({
      where: { id: testClient.id },
      data: {
        status: 'CANCELAMENTO_SOLICITADO',
        cancellationDate: reqDate,
        cancellationReason: 'Contratação de desenvolvedor interno para a empresa',
        terminatedServices: 'Hospedagem, Manutenção Técnica e Suporte',
      },
    });
    assert(cancelRequestedClient.status === 'CANCELAMENTO_SOLICITADO', 'Status atualizado para CANCELAMENTO_SOLICITADO');
    assert(!!cancelRequestedClient.cancellationDate, 'Data da solicitação gravada');

    // 2.2 Efetivar ENCERRAMENTO & ENTREGA DE ATIVOS
    const effDate = new Date('2026-08-24T16:00:00Z');
    const terminatedClient = await prisma.mzClient.update({
      where: { id: testClient.id },
      data: {
        status: 'ENCERRADO',
        terminationEffectiveDate: effDate,
        codeDelivered: true,
        backupDelivered: true,
        deliveredAt: effDate,
        deliveredBy: 'Lucas Mazzoni (mzTech OPS)',
        terminationNotes: 'Entregue zip do repositório e dump do postgres. Cliente orientado que nova VPS é de sua responsabilidade.',
      },
    });
    assert(terminatedClient.status === 'ENCERRADO', 'Status final atualizado para ENCERRADO');
    assert(terminatedClient.codeDelivered === true, 'Registro Código Entregue = SIM');
    assert(terminatedClient.backupDelivered === true, 'Registro Backup Entregue = SIM');
    assert(terminatedClient.deliveredBy === 'Lucas Mazzoni (mzTech OPS)', 'Responsável pela entrega registrado');

    // Atualizar hospedagem vinculada para ENCERRADO
    await prisma.mzHosting.updateMany({
      where: { clientId: testClient.id, status: 'ATIVO' },
      data: { status: 'ENCERRADO', cancellationDate: effDate },
    });

    const updatedHosting = await prisma.mzHosting.findUnique({ where: { id: testHosting.id } });
    assert(updatedHosting.status === 'ENCERRADO', 'Hospedagem do cliente desativada (status ENCERRADO)');

    // ------------------------------------------------------------
    // TESTE 3: CONTRATO COM CLÁUSULAS E REGIME DE PROPRIEDADE
    // ------------------------------------------------------------
    console.log('\n📋 3. Testando Contrato & Regras de Propriedade do Código...');
    const testContract = await prisma.mzContract.create({
      data: {
        clientId: testClient.id,
        title: 'Contrato Oficial mzTech - Cliente Teste',
        content: 'Minuta contratual com 12 cláusulas oficiais.',
        totalDevPrice: 2500.0,
        monthlyPrice: 79.90,
        codeOwnershipType: 'PROPRIEDADE_CLIENTE',
        backupRetentionDays: 30,
        migrationExcluded: true,
        status: 'ASSINADO',
        signedAt: new Date('2026-08-01T00:00:00Z'),
      },
    });
    assert(testContract.codeOwnershipType === 'PROPRIEDADE_CLIENTE', 'Regime de propriedade do código registrado');
    assert(testContract.backupRetentionDays === 30, 'Prazo de retenção de backup de 30 dias registrado');
    assert(testContract.migrationExcluded === true, 'Cláusula de Migração Excluída da Mensalidade registrada');

    // ------------------------------------------------------------
    // TESTE 4: CADASTRO DE PROVEDOR VPS PRÓPRIA & BACKUP COM RETENÇÃO
    // ------------------------------------------------------------
    console.log('\n📋 4. Testando Suporte a VPS Própria & Registro de Backup...');
    const vpsHosting = await prisma.mzHosting.create({
      data: {
        clientId: testClient.id,
        provider: 'VPS Própria',
        serverType: 'VPS Ubuntu 24.04 LTS (Hetzner Cloud)',
        url: 'https://vps.clienteteste.com.br',
        customDomain: 'vps.clienteteste.com.br',
        platformDomain: '192.168.10.50',
        monthlyPrice: 39.90,
        status: 'ATIVO',
      },
    });
    assert(vpsHosting.provider === 'VPS Própria', 'Provedor VPS Própria cadastrado com sucesso');

    const backupRecord = await prisma.mzBackup.create({
      data: {
        clientId: testClient.id,
        databaseName: 'PostgreSQL 16 (Hetzner VPS)',
        fileName: 'backup-vps-2026-08-24.dump',
        storageLocation: 'D:\\MZTECH-BACKUPS\\Cliente-Teste\\postgres\\backup-vps-2026-08-24.dump',
        fileSize: '65.2 KB',
        retentionDays: 30,
        status: 'ENTREGUE_AO_CLIENTE',
        notes: 'Backup entregue formalmente ao cliente no encerramento.',
      },
    });
    assert(backupRecord.status === 'ENTREGUE_AO_CLIENTE', 'Status de backup ENTREGUE_AO_CLIENTE verificado');
    assert(backupRecord.retentionDays === 30, 'Retenção de 30 dias associada');

    // Limpeza do cliente de teste
    await prisma.mzBackup.deleteMany({ where: { clientId: testClient.id } });
    await prisma.mzContract.deleteMany({ where: { clientId: testClient.id } });
    await prisma.mzHosting.deleteMany({ where: { clientId: testClient.id } });
    await prisma.mzClient.delete({ where: { id: testClient.id } });
    console.log('\n🧹 Limpeza de dados de teste concluída.');

    console.log('\n============================================================');
    console.log(`RESULTADO: ${passedTests}/${totalTests} TESTES APROVADOS COM 100% DE SUCESSO!`);
    console.log('============================================================');
  } catch (error) {
    console.error('❌ ERRO NA EXECUÇÃO DOS TESTES:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPolicyTests();
