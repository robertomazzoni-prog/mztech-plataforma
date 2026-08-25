const { spawn, execSync } = require('child_process');

console.log('==============================================');
console.log('🚀 mzTech Soluções Digitais - INICIANDO NA RAILWAY');
console.log('==============================================');

// Sincronização do Prisma com tratamento de erro
if (process.env.DATABASE_URL) {
  try {
    console.log('📦 Executando prisma db push...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  } catch (e) {
    console.error('⚠️ Aviso ao sincronizar Prisma:', e.message);
  }
} else {
  console.log('ℹ️ DATABASE_URL não configurada. Operando com armazenamento local JSON / memória com alta disponibilidade.');
}

const port = process.env.PORT || '3000';
console.log(`🚀 Iniciando Next.js na porta ${port} e host 0.0.0.0...`);

// Iniciar Next.js com spawn não-bloqueante
const child = spawn('npx', ['next', 'start', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  shell: true,
});

child.on('error', (err) => {
  console.error('❌ Erro no processo Next.js:', err);
});

child.on('exit', (code) => {
  console.log(`ℹ️ Next.js finalizou com código: ${code}`);
  process.exit(code || 0);
});
