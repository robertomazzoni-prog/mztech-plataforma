const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const usersCount = await prisma.user.count();
  if (usersCount > 0) {
    console.log('Banco de dados já contém registros. Pulando seed inicial.');
    return;
  }

  console.log('Criando usuários iniciais...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const clientPassword = await bcrypt.hash('cliente123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Lucas Mazzoni (Admin)',
      email: 'admin@mazzoni.com',
      password: adminPassword,
      phone: '(11) 99999-8888',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces',
    },
  });

  const client = await prisma.user.create({
    data: {
      name: 'Matheus Oliveira',
      email: 'cliente@exemplo.com',
      password: clientPassword,
      phone: '(11) 98765-4321',
      role: 'CLIENT',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces',
    },
  });

  console.log('Criando barbeiros...');
  const barber1 = await prisma.barber.create({
    data: {
      name: 'Lucas Mazzoni',
      bio: 'Fundador e mestre barbeiro com mais de 10 anos de experiência em visagismo, degradê e pigmentação.',
      avatarUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop&crop=faces',
      specialties: 'Visagismo, Fade Navalhado, Pigmentação de Barba',
      workingHoursStart: '09:00',
      workingHoursEnd: '20:00',
      lunchStart: '13:00',
      lunchEnd: '14:00',
      workingDays: '1,2,3,4,5,6',
    },
  });

  const barber2 = await prisma.barber.create({
    data: {
      name: 'Gabriel Santos',
      bio: 'Especialista em barboterapia tradicional, toalha quente e cuidados masculinos premium.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
      specialties: 'Barbaterapia, Toalha Quente, Corte Clássico',
      workingHoursStart: '09:00',
      workingHoursEnd: '19:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      workingDays: '1,2,3,4,5,6',
    },
  });

  const barber3 = await prisma.barber.create({
    data: {
      name: 'Diego Silva',
      bio: 'Mestre em texturização, alinhamento capilar e pigmentação HD.',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
      specialties: 'Pigmentação Capilar, Freestyle, Cortes Modernos',
      workingHoursStart: '10:00',
      workingHoursEnd: '20:00',
      lunchStart: '14:00',
      lunchEnd: '15:00',
      workingDays: '1,2,3,4,5,6',
    },
  });

  console.log('Criando catálogo de serviços...');
  const services = [
    // COMBOS
    {
      name: 'Combo Mazzoni VIP (Corte + Barba + Pigmentação)',
      category: 'COMBO',
      description: 'A experiência completa: corte personalizado com visagismo, barbaterapia com toalha quente e pigmentação de alta definição.',
      price: 130.00,
      durationMinutes: 75,
      popular: true,
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop',
    },
    {
      name: 'Combo Executivo (Corte + Barba)',
      category: 'COMBO',
      description: 'Alinhamento completo do visual com corte degradê ou clássico e barba esculpida na navalha com toalha quente.',
      price: 90.00,
      durationMinutes: 60,
      popular: true,
      imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=400&fit=crop',
    },
    {
      name: 'Combo Estilo (Corte + Pigmentação)',
      category: 'COMBO',
      description: 'Corte perfeito com acabamento em pigmentação capilar para destacar as linhas e disfarce.',
      price: 95.00,
      durationMinutes: 55,
      popular: false,
      imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=400&fit=crop',
    },
    // CORTES
    {
      name: 'Corte Degradê / Fade Moderno',
      category: 'CORTE',
      description: 'Degradê na zero ou navalha, acabamento milimétrico, lavagem e finalização com pomada modeladora.',
      price: 55.00,
      durationMinutes: 45,
      popular: true,
      imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=400&fit=crop',
    },
    {
      name: 'Corte Clássico na Tesoura',
      category: 'CORTE',
      description: 'Corte tradicional executado 100% na tesoura, respeitando o caimento natural do cabelo e formato do rosto.',
      price: 50.00,
      durationMinutes: 40,
      popular: false,
      imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=400&fit=crop',
    },
    {
      name: 'Corte Social Tradicional',
      category: 'CORTE',
      description: 'Corte sóbrio e elegante, ideal para o dia a dia e ambientes corporativos.',
      price: 45.00,
      durationMinutes: 35,
      popular: false,
      imageUrl: 'https://images.unsplash.com/photo-1593702295094-aea22597af65?w=600&h=400&fit=crop',
    },
    // BARBA
    {
      name: 'Barba com Toalha Quente',
      category: 'BARBA',
      description: 'Modelagem da barba com navalhete, hidratação de pele, aplicação de toalha quente e massagem facial relaxante.',
      price: 45.00,
      durationMinutes: 35,
      popular: true,
      imageUrl: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=600&h=400&fit=crop',
    },
    {
      name: 'Barbaterapia Completa & Ozônio',
      category: 'BARBA',
      description: 'Tratamento intensivo com vapor de ozônio, esfoliação profunda, óleos essenciais e toalha quente.',
      price: 60.00,
      durationMinutes: 45,
      popular: false,
      imageUrl: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=600&h=400&fit=crop',
    },
    // PIGMENTAÇÃO
    {
      name: 'Pigmentação de Barba',
      category: 'PIGMENTACAO',
      description: 'Técnica que preenche falhas, realça a densidade da barba e deixa o contorno nítido e natural.',
      price: 40.00,
      durationMinutes: 30,
      popular: true,
      imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=400&fit=crop',
    },
    {
      name: 'Pigmentação Capilar / Disfarce HD',
      category: 'PIGMENTACAO',
      description: 'Realce e definição para cortes degradê, disfarçando áreas ralas e dando aspecto de acabamento impecável.',
      price: 50.00,
      durationMinutes: 35,
      popular: false,
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop',
    },
    // TRATAMENTOS
    {
      name: 'Design de Sobrancelha na Navalha',
      category: 'TRATAMENTO',
      description: 'Alinhamento limpo da sobrancelha masculina mantendo a naturalidade.',
      price: 20.00,
      durationMinutes: 15,
      popular: false,
      imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=400&fit=crop',
    },
  ];

  for (const s of services) {
    await prisma.service.create({ data: s });
  }

  const createdServices = await prisma.service.findMany();
  const today = new Date().toISOString().split('T')[0];

  await prisma.appointment.create({
    data: {
      clientName: 'Matheus Oliveira',
      clientPhone: '(11) 98765-4321',
      clientEmail: 'cliente@exemplo.com',
      date: today,
      timeSlot: '14:00',
      status: 'CONFIRMED',
      notes: 'Gostaria de caprichar na pigmentação da barba.',
      userId: client.id,
      barberId: barber1.id,
      serviceId: createdServices[0].id,
    }
  });

  console.log('✅ Banco de dados semeado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
