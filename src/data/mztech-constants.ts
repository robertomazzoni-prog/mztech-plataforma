export const MZTECH_INFO = {
  name: 'mzTech',
  legalName: 'mzTech Soluções Digitais & Desenvolvimento',
  tagline: 'Desenvolvimento de sites e sistemas sob medida.',
  description:
    'Desenvolvemos, hospedamos e mantemos aplicações web para empresas que precisam de estabilidade, velocidade e atendimento direto com os desenvolvedores.',
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
      'Criação de sites, landing pages e sistemas web sob medida. O valor do desenvolvimento é definido na proposta com base no número de páginas e funcionalidades necessárias.',
    features: [
      'Desenvolvimento exclusivo e sob medida',
      'Design responsivo e otimizado para celulares',
      'Código limpo com Next.js, React e TypeScript',
      'Entrega do projeto testado e pronto para produção',
    ],
  },
  {
    id: 'HOSPEDAGEM',
    name: '2. Hospedagem Gerenciada na Nuvem',
    tag: 'Serviço Recorrente Mensal',
    description:
      'Gerenciamento dos servidores em nuvem, renovação do certificado SSL e monitoramento para manter seu site online.',
    features: [
      'Infraestrutura em nuvem (Railway, DigitalOcean ou VPS dedicada)',
      'Certificado de Segurança SSL automático e renovado',
      'Monitoramento de estabilidade do servidor',
      'Banco de dados relacional dedicado e seguro',
    ],
  },
  {
    id: 'MANUTENCAO_SUPORTE',
    name: '3. Manutenção Técnica & Suporte',
    tag: 'Serviço Recorrente Vinculado ao Plano',
    description:
      'Atualizações de segurança, correções no código, pequenas alterações de textos ou telefones e suporte direto com os desenvolvedores por WhatsApp.',
    features: [
      'Correções de bugs e atualizações de segurança',
      'Pequenas alterações de textos, telefones e imagens',
      'Backups periódicos do banco de dados',
      'Suporte técnico direto com quem desenvolveu',
    ],
  },
];

export const MZTECH_PLANS = [
  {
    id: 'hospedagem',
    name: 'Plano Hospedagem',
    price: 29.90,
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
    price: 45.90,
    period: '/mês',
    description: 'Plano recomendado para quem quer hospedagem na nuvem, manutenção preventiva contínua e atendimento prioritário por WhatsApp.',
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
    a: 'O desenvolvimento é o trabalho de criar o design, programar o código e testar o sistema sob medida. A mensalidade cobre os custos de servidor na nuvem, certificado SSL, rotinas de backup e o suporte contínuo para manter tudo funcionando.',
  },
  {
    q: 'Como funciona o cancelamento dos serviços recorrentes?',
    a: 'Você pode solicitar o cancelamento da hospedagem e manutenção a qualquer momento, avisando nossa equipe. Com o cancelamento, os serviços mensais e cobranças são encerrados.',
  },
  {
    q: 'O que recebo caso decida cancelar os serviços?',
    a: 'Com os pagamentos do desenvolvimento quitados, a mzTech entrega todo o código-fonte desenvolvido, os arquivos do projeto e o backup mais recente do banco de dados.',
  },
  {
    q: 'Se eu cancelar, a mzTech configura meu novo servidor ou VPS?',
    a: 'Não. Após a entrega dos arquivos, a contratação e configuração da nova hospedagem são de responsabilidade do cliente. Caso queira que nossa equipe execute essa migração técnica, o trabalho é orçado à parte como serviço adicional.',
  },
  {
    q: 'A migração para outro servidor está inclusa na mensalidade?',
    a: 'Não. A mensalidade cobre os custos dentro dos servidores que nós mesmos gerenciamos. Migrar o sistema para outro provedor externo é um serviço pontual orçado separadamente.',
  },
  {
    q: 'O domínio próprio é meu ou da mzTech?',
    a: 'O domínio próprio (ex: suaempresa.com.br) registrado em seu nome é sempre seu. O cancelamento da hospedagem não interfere na titularidade do seu domínio.',
  },
  {
    q: 'Qual é a infraestrutura utilizada pela mzTech?',
    a: 'Utilizamos servidores em nuvem de alta confiabilidade (como Railway, DigitalOcean, VPS e AWS), dimensionados conforme as necessidades e o tráfego do projeto.',
  },
  {
    q: 'Como funcionam os backups e a retenção?',
    a: 'Fazemos cópias regulares de segurança do banco de dados para proteção operacional. Os backups são mantidos durante a vigência do contrato para recuperação rápida em caso de imprevistos técnicos.',
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
