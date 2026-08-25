# 💈 Mazzoni Barbershop - Sistema de Agendamento Online

Um sistema completo, moderno e responsivo de agendamentos para barbearias premium, desenvolvido com **Next.js 14, React 18, Tailwind CSS, Prisma ORM, SQLite e TypeScript**.

---

## ✨ Funcionalidades Principais

1. **Catálogo de Serviços & Especialidades**:
   - ✂️ **Cortes**: Fade / Degradê Navalhado, Clássico na Tesoura, Social Tradicional.
   - 🧔 **Barba**: Modelagem na navalha, Toalha Quente & Ozônio, Barbaterapia completa.
   - 🎨 **Pigmentação**: Pigmentação de Barba, Disfarce HD Capilar.
   - 🌟 **Combos VIP**: Corte + Barba + Pigmentação, Combo Executivo, etc.

2. **Fluxo de Agendamento Inteligente**:
   - Escolha de Serviço com filtros por categoria.
   - Escolha do Barbeiro com foto e especialidades.
   - Calendário interativo com cálculo dinâmico de **horários livres**, bloqueando horários ocupados, intervalo de almoço e dias sem expediente.
   - Coleta de dados com máscara no telefone: `(XX) XXXXX-XXXX`.
   - **Confirmação no WhatsApp**: Geração automática de link com mensagem personalizada pronta para envio direto.

3. **Sistema de Contas & Autenticação**:
   - Cadastro e Login com criptografia de senha (`bcrypt`) e tokens `JWT`.
   - Perfil de **Cliente**: Meus agendamentos, status em tempo real, cancelamento de horários.
   - Perfil de **Administrador / Barbeiro**: Painel de controle, agenda do dia, métricas de faturamento, confirmação/conclusão de atendimentos, agendamento de balcão e gestão de serviços.

---

## 🔑 Credenciais de Demonstração

Para testar o sistema imediatamente, utilize as seguintes contas pré-configuradas:

### 👑 Administrador / Mestre Barbeiro
- **E-mail:** `admin@mazzoni.com`
- **Senha:** `admin123`
- **Acesso:** Painel com métricas de faturamento, alteração de status, agendamento de balcão e cadastro de serviços.

### 👤 Cliente Cadastrado
- **E-mail:** `cliente@exemplo.com`
- **Senha:** `cliente123`
- **Acesso:** Agendamento rápido e histórico em "Meus Agendamentos".

---

## 🚀 Como Executar o Projeto

```bash
# 1. Instalar dependências (caso ainda não tenha instalado)
npm install

# 2. Sincronizar o banco de dados SQLite e popular com dados de teste
npx prisma db push
node prisma/seed.js

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Abra seu navegador em [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Frontend:** [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
- **Banco de Dados:** SQLite com [Prisma ORM](https://www.prisma.io/)
- **Segurança:** [bcryptjs](https://www.npmjs.com/package/bcryptjs) & [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- **Animações & Efeitos:** [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
