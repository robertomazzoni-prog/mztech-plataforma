export const MZTECH_INFO = {
  name: 'mzTech',
  legalName: 'mzTech Soluções Digitais & Desenvolvimento',
  tagline: 'Tecnologia que coloca sua empresa no digital.',
  description:
    'A mzTech desenvolve, hospeda e mantém sites e sistemas para empresas que buscam autoridade, estabilidade e crescimento contínuo no ambiente digital.',
  whatsapp: '5531986847049',
  whatsappDisplay: '(31) 98684-7049',
  robertoName: 'Roberto',
  robertoPhone: '(31) 98684-7049',
  robertoWhatsapp: '5531986847049',
  morvanName: 'Morvan',
  morvanPhone: '(31) 99359-7136',
  morvanWhatsapp: '5531993597136',
  email: 'robertomazzoni956@gmail.com',
  year: 2026,
};

export const MZTECH_SERVICE_CATEGORIES = [
  {
    id: 'DESENVOLVIMENTO',
    name: '1. Desenvolvimento de Sites & Sistemas',
    tag: 'Contratação Sob Medida por Projeto',
    description:
      'Criação de sites institucionais, landing pages e sistemas personalizados sob demanda. O valor é definido na proposta de acordo com a complexidade, quantidade de páginas e regras de negócio.',
    features: [
      'Desenvolvimento exclusivo e sob medida',
      'Design responsivo e otimizado para celulares',
      'Código limpo com Next.js, React e TypeScript',
      'Entrega do projeto homologado e pronto para produção',
    ],
  },
  {
    id: 'HOSPEDAGEM',
    name: '2. Hospedagem Gerenciada na Nuvem',
    tag: 'Serviço Recorrente Mensal',
    description:
      'Manutenção contínua da infraestrutura em nuvem, garantindo disponibilidade, certificado de segurança SSL e estabilidade técnica com suporte da mzTech.',
    features: [
      'Infraestrutura em nuvem (Railway, DigitalOcean, VPS ou provedores adequados)',
      'Certificado de Segurança SSL automático e renovado',
      'Monitoramento de uptime e disponibilidade',
      'Banco de dados relacional dedicado e seguro',
    ],
  },
  {
    id: 'MANUTENCAO_SUPORTE',
    name: '3. Manutenção Técnica & Suporte',
    tag: 'Serviço Recorrente Vinculado ao Plano',
    description:
      'Atualizações preventivas de segurança, correções técnicas, pequenas edições de conteúdo e suporte direto via WhatsApp para garantir tranquilidade.',
    features: [
      'Correções de bugs e atualizações de segurança',
      'Pequenas alterações de textos, telefones e imagens',
      'Backups periódicos de segurança operacional',
      'Suporte técnico direto com quem desenvolveu',
    ],
  },
];

export const MZTECH_PLANS = [
  {
    id: 'hospedagem',
    name: 'Plano Hospedagem',
    price: 39.90,
    period: '/mês',
    description: 'Para quem já tem o site pronto e precisa apenas de hospedagem gerenciada com segurança e suporte.',
    features: [
      'Hospedagem em nuvem gerenciada pela mzTech',
      'Certificado de Segurança SSL incluso',
      'Configuração de Domínio Próprio e DNS',
      'Monitoramento de disponibilidade',
      'Backups periódicos de segurança',
      'Suporte técnico para dúvidas e estabilidade',
    ],
    recommended: false,
    badge: 'Hospedagem Gerenciada',
    cta: 'Escolher Hospedagem',
  },
  {
    id: 'hospedagem-manutencao',
    name: 'Plano Hospedagem + Manutenção',
    price: 79.90,
    period: '/mês',
    description: 'A solução mais completa e recomendada para manter seu site rápido, seguro, atualizado e com suporte prioritário.',
    features: [
      'Tudo incluído no Plano Hospedagem',
      'Manutenção preventiva e corretiva contínua',
      'Pequenas alterações de textos, contatos e imagens',
      'Atualização de pacotes e patches de segurança',
      'Backups periódicos e rotina de validação',
      'Suporte prioritário direto via WhatsApp',
      'Orientação técnica para evolução do negócio',
    ],
    recommended: true,
    badge: 'Mais Recomendado',
    cta: 'Escolher Hospedagem + Manutenção',
  },
];

export const MZTECH_STEPS = [
  {
    step: '01',
    title: 'Entendimento & Proposta',
    description: 'Analisamos o seu negócio e enviamos uma proposta clara com escopo de desenvolvimento e plano mensal.',
  },
  {
    step: '02',
    title: 'Desenvolvimento do Projeto',
    description: 'Criamos o layout, programamos as funcionalidades e integramos com WhatsApp e banco de dados.',
  },
  {
    step: '03',
    title: 'Revisão & Aprovação',
    description: 'Você testa o site/sistema em ambiente de homologação e valida cada detalhe antes de ir ao ar.',
  },
  {
    step: '04',
    title: 'Publicação & Configuração',
    description: 'Configuramos seu domínio próprio, emitimos o certificado SSL e ativamos a hospedagem em nuvem.',
  },
  {
    step: '05',
    title: 'Suporte & Manutenção Contínua',
    description: 'Seu projeto permanece seguro, estável e atualizado com o plano recorrente mzTech.',
  },
];

export const MZTECH_SCOPE_INCLUDED = [
  {
    title: 'Correções Técnicas e Bugs',
    description: 'Resolução de eventuais falhas técnicas, quebras de layout ou erros de script.',
  },
  {
    title: 'Pequenas Alterações Pontuais',
    description: 'Troca de textos, fotos, telefones, endereços, horários ou links de redes sociais.',
  },
  {
    title: 'Atualizações de Segurança',
    description: 'Manutenção de dependências e aplicação de correções de vulnerabilidades conhecidas.',
  },
  {
    title: 'Backups Operacionais',
    description: 'Geração periódica de cópias de segurança do banco de dados para proteção operacional.',
  },
  {
    title: 'Monitoramento & SSL',
    description: 'Verificação contínua de estabilidade do servidor e renovação do certificado HTTPS.',
  },
  {
    title: 'Suporte Direto',
    description: 'Atendimento via WhatsApp e e-mail para dúvidas e orientações sobre o sistema.',
  },
];

export const MZTECH_SCOPE_EXCLUDED = [
  'Criação de novos sistemas, páginas complexas ou módulos não previstos no escopo inicial',
  'Reformulação visual completa (Redesign total do site ou sistema)',
  'Migração técnica para novos servidores/VPS do cliente (Tratado como Serviço Adicional)',
  'Contratação, configuração ou manutenção de infraestruturas externas de terceiros',
  'Instalação e gerenciamento de servidores Linux/VPS particulares do cliente após cancelamento',
  'Criação e gestão de campanhas de tráfego pago (Google Ads, Meta Ads)',
  'Produção de conteúdo de marketing, redação publicitária e logotipos do zero',
  'Desenvolvimento de integrações complexas com APIs não contratadas',
];

export const MZTECH_FAQ = [
  {
    q: 'Por que o desenvolvimento é cobrado separadamente da mensalidade?',
    a: 'O desenvolvimento é o trabalho especializado de criar o design, programar o código e estruturar o sistema sob medida. A mensalidade cobre a infraestrutura em nuvem, certificado SSL, monitoramento, backups operacionais e a manutenção contínua para mantê-lo funcionando com segurança.',
  },
  {
    q: 'Como funciona o cancelamento dos serviços recorrentes?',
    a: 'O cliente pode solicitar o cancelamento dos serviços recorrentes (hospedagem, manutenção e suporte) a qualquer momento conforme as condições contratuais. O cancelamento encerra as cobranças e os serviços gerenciados pela mzTech.',
  },
  {
    q: 'O que recebo caso decida cancelar os serviços?',
    a: 'Após a solicitação e encerramento dos serviços (respeitadas as condições de quitação do contrato), a mzTech entrega os ativos previstos na contratação, tais como o código-fonte desenvolvido, arquivos do projeto e o backup recente do banco de dados.',
  },
  {
    q: 'Se eu cancelar, a mzTech configura meu novo servidor ou VPS?',
    a: 'Não. Após a entrega dos arquivos, a responsabilidade pela contratação, instalação de Node.js, PostgreSQL, deploy, DNS, SSL e manutenção da nova infraestrutura é exclusivamente do cliente. A mzTech oferece o serviço de migração como um Serviço Adicional mediante orçamento separado.',
  },
  {
    q: 'A migração para outro servidor está inclusa na mensalidade?',
    a: 'Não. A mensalidade cobre a manutenção dentro da infraestrutura gerenciada pela mzTech. Caso o cliente solicite que a equipe da mzTech execute a migração e configuração em um novo servidor externo, esse trabalho é orçado separadamente como Serviço Adicional de Migração.',
  },
  {
    q: 'O domínio próprio é meu ou da mzTech?',
    a: 'O domínio próprio (ex: suaempresa.com.br) registrado em seu nome permanece sob sua titularidade exclusiva. O cancelamento da hospedagem não cancela o seu domínio próprio. Endereços técnicos temporários da plataforma (ex: *.up.railway.app) são apenas endereços de deploy e não constituem domínio do cliente.',
  },
  {
    q: 'Qual é a infraestrutura utilizada pela mzTech?',
    a: 'A mzTech utiliza provedores modernos em nuvem de alta confiabilidade (como Railway, DigitalOcean, VPS gerenciadas, Hetzner ou AWS) selecionados de acordo com as necessidades de cada projeto, garantindo 99.9% de disponibilidade.',
  },
  {
    q: 'Como funcionam os backups e a retenção?',
    a: 'Os backups são mecanismos de segurança e recuperação operacional. Eles são mantidos durante a vigência do contrato e pelo período de retenção estabelecido após o encerramento, não constituindo arquivo morto permanente ou ilimitado.',
  },
];

export const DEFAULT_CONTRACT_TEMPLATE = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO, HOSPEDAGEM E MANUTENÇÃO DIGITAL

IDENTIFICAÇÃO DAS PARTES:
CONTRATADA: mzTech Soluções Digitais & Desenvolvimento.
CONTRATANTE: Identificado na Proposta Comercial / Painel Operacional mzTech.

CLÁUSULA 1ª - DO OBJETO E DAS CATEGORIAS DE SERVIÇOS
O presente instrumento tem por objeto a prestação de serviços digitais divididos em 3 (três) categorias:
1. DESENVOLVIMENTO: Criação, programação e entrega de site ou sistema personalizado, contratado separadamente com valor e escopo definidos na proposta comercial.
2. HOSPEDAGEM: Serviço recorrente mensal de disponibilização da aplicação em ambiente de nuvem gerenciado pela CONTRATADA.
3. MANUTENÇÃO E SUPORTE: Serviços recorrentes mensais de correções técnicas, atualizações de segurança e suporte operacional atrelados ao plano contratado.

CLÁUSULA 2ª - DA INFRAESTRUTURA E PROVEDORES
A CONTRATADA utilizará provedores de nuvem adequados à estabilidade e desempenho do projeto (tais como Railway, DigitalOcean, VPS Própria, Hetzner, AWS ou similares). A CONTRATADA possui autonomia técnica para ajustar provedores internos sem alteração dos valores acordados com a CONTRATANTE.

CLÁUSULA 3ª - DO CANCELAMENTO DE SERVIÇOS RECORRENTES
A CONTRATANTE poderá solicitar o cancelamento dos serviços recorrentes de Hospedagem, Manutenção e Suporte mediante aviso prévio estipulado na proposta. O cancelamento encerra as cobranças recorrentes e a prestação dos serviços técnicos de manutenção e hospedagem pela CONTRATADA.

CLÁUSULA 4ª - DA ENTREGA DE ATIVOS APÓS CANCELAMENTO
Após a efetivação do cancelamento e quitação de eventuais valores pendentes, a CONTRATADA entregará à CONTRATANTE os ativos digitais previstos na contratação:
a) Código-fonte dos arquivos desenvolvidos;
b) Cópia de segurança (dump/backup) recente do banco de dados;
c) Arquivos e ativos gráficos fornecidos ou criados exclusivamente para o projeto.
A entrega será registrada formalmente com data, responsável e confirmação de recebimento.

CLÁUSULA 5ª - DA NÃO-RESPONSABILIDADE POR NOVA HOSPEDAGEM EXTERNA
Após a entrega dos ativos prevista na Cláusula 4ª, caso a CONTRATANTE opte por hospedar a aplicação em servidor próprio ou de terceiros, NÃO CABERÁ À CONTRATADA qualquer obrigação automática de:
a) Contratar, configurar ou gerenciar VPS ou servidores de terceiros;
b) Instalar Node.js, PostgreSQL, Docker ou dependências de sistema operacional;
c) Configurar variáveis de ambiente, portas de rede e rotinas de deploy;
d) Configurar zonas de DNS, registros de apontamento ou certificados SSL externos;
e) Restaurar dumps de bancos de dados em servidores não gerenciados pela CONTRATADA;
f) Prestar manutenção preventiva ou suporte técnico para a nova infraestrutura.
A CONTRATANTE assume integral responsabilidade pela gestão e contratação de sua nova infraestrutura.

CLÁUSULA 6ª - DO SERVIÇO ADICIONAL DE MIGRAÇÃO
A realização de migração técnica da aplicação para servidor ou provedor externo NÃO ESTÁ INCLUSA na mensalidade de hospedagem ou manutenção. Caso solicitada pela CONTRATANTE, a migração será tratada como SERVIÇO ADICIONAL DE MIGRAÇÃO, mediante proposta comercial, escopo e orçamento específicos acordados previamente entre as partes.

CLÁUSULA 7ª - DOS DOMÍNIOS
Diferencia-se expressamente:
a) DOMÍNIO PRÓPRIO DO CLIENTE (ex: cliente.com.br): Registrado para o cliente, cuja titularidade é exclusiva da CONTRATANTE. O cancelamento da hospedagem não afeta a propriedade do domínio.
b) ENDEREÇO TÉCNICO DA PLATAFORMA (ex: *.up.railway.app): Endereço técnico temporário fornecido pela infraestrutura de nuvem, não constituindo domínio próprio ou propriedade da CONTRATANTE.

CLÁUSULA 8ª - DA POLÍTICA DE BACKUPS E RETENÇÃO
Os backups realizados pela CONTRATADA possuem finalidade de segurança e recuperação operacional. Não constituem serviço de arquivamento permanente ou ilimitado. Após o encerramento formal dos serviços e entrega do backup previsto na Cláusula 4ª, a CONTRATADA manterá cópias em seu ambiente pelo período limite de retenção contratual (30 dias), após o qual os dados locais poderão ser descartados.

CLÁUSULA 9ª - DA PROPRIEDADE DO CÓDIGO E LICENCIAMENTO
Ressalvadas bibliotecas de código aberto (open-source), componentes de terceiros e frameworks proprietários ou reutilizáveis da mzTech, a CONTRATADA outorga à CONTRATANTE a titularidade ou licença de uso do código desenvolvido especificamente para seu projeto, conforme especificado na proposta comercial.

CLÁUSULA 10ª - DO SIGILO E PROTEÇÃO DE DADOS
As partes comprometem-se a manter sigilo sobre dados confidenciais e cumprir a legislação vigente sobre proteção de dados, não havendo compartilhamento ou exposição de dados entre diferentes clientes da CONTRATADA.

CLÁUSULA 11ª - DOS SERVIÇOS ADICIONAIS
Quaisquer solicitações de desenvolvimento de novas funcionalidades, páginas extras, integrações externas complexas ou redesign completo serão orçadas separadamente como Serviços Adicionais.

CLÁUSULA 12ª - DO FORO
Para dirimir quaisquer dúvidas decorrentes do presente contrato, as partes elegem o foro da comarca da sede da CONTRATADA.`;
