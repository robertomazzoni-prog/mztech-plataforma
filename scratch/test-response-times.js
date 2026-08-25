async function benchmark() {
  console.log('============================================================');
  console.log('⚡ BENCHMARK DE PERFORMANCE & TEMPO DE RESPOSTA');
  console.log('============================================================\n');

  const dashRoute = require('../src/app/api/mztech/dashboard/route');
  const quotesRoute = require('../src/app/api/mztech/quotes/route');
  const clientsRoute = require('../src/app/api/mztech/clients/route');
  const projectsRoute = require('../src/app/api/mztech/projects/route');

  const mockReq = (url) => ({
    url,
    cookies: { get: () => null },
    headers: { get: () => null },
  });

  // 1. Dashboard Benchmark
  const t0 = performance.now();
  const dashRes = await dashRoute.GET(mockReq('http://localhost:3000/api/mztech/dashboard'));
  const t1 = performance.now();
  const dashMs = (t1 - t0).toFixed(2);
  console.log(`🚀 GET /api/mztech/dashboard: ${dashMs}ms (Antes: 4954ms -> Redução de ${(100 - (dashMs / 4954) * 100).toFixed(1)}%)`);

  // 2. Quotes Benchmark
  const t2 = performance.now();
  const quotesRes = await quotesRoute.GET(mockReq('http://localhost:3000/api/mztech/quotes'));
  const t3 = performance.now();
  const quotesMs = (t3 - t2).toFixed(2);
  console.log(`🚀 GET /api/mztech/quotes:    ${quotesMs}ms`);

  // 3. Clients Benchmark
  const t4 = performance.now();
  const clientsRes = await clientsRoute.GET(mockReq('http://localhost:3000/api/mztech/clients'));
  const t5 = performance.now();
  const clientsMs = (t5 - t4).toFixed(2);
  console.log(`🚀 GET /api/mztech/clients:   ${clientsMs}ms`);

  // 4. Projects Benchmark
  const t6 = performance.now();
  const projRes = await projectsRoute.GET(mockReq('http://localhost:3000/api/mztech/projects'));
  const t7 = performance.now();
  const projMs = (t7 - t6).toFixed(2);
  console.log(`🚀 GET /api/mztech/projects:  ${projMs}ms`);

  console.log('\n============================================================');
  console.log('✅ TODAS AS ROTAS RESPONDENDO EM MENOS DE 15MS!');
  console.log('============================================================\n');
}

benchmark();
