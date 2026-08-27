// Lista oficial de DDDs válidos no Brasil (Anatel)
export const VALID_BRAZILIAN_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
  21, 22, 24,                         // RJ
  27, 28,                             // ES
  31, 32, 33, 34, 35, 37, 38,         // MG
  41, 42, 43, 44, 45, 46,             // PR
  47, 48, 49,                         // SC
  51, 53, 54, 55,                     // RS
  61,                                 // DF
  62, 64,                             // GO
  63,                                 // TO
  65, 66,                             // MT
  67,                                 // MS
  68,                                 // AC
  69,                                 // RO
  71, 73, 74, 75, 77,                 // BA
  79,                                 // SE
  81, 87,                             // PE
  82,                                 // AL
  83,                                 // PB
  84,                                 // RN
  85, 88,                             // CE
  86, 89,                             // PI
  91, 93, 94,                         // PA
  92, 97,                             // AM
  95,                                 // RR
  96,                                 // AP
  98, 99,                             // MA
]);

// Domínios fictícios, de teste, temporários ou de exemplos de placeholders proibidos
export const BLOCKED_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'exemplo.com',
  'exemplo.com.br',
  'test.com',
  'teste.com',
  'teste.com.br',
  'test.org',
  'test.net',
  'asdf.com',
  'asdf.com.br',
  'foo.com',
  'bar.com',
  'fake.com',
  'invalid.com',
  'empresa.com',
  'empresa.com.br',
  'suaempresa.com',
  'suaempresa.com.br',
  'minhaempresa.com',
  'minhaempresa.com.br',
  'seuemail.com',
  'seuemail.com.br',
  'meuemail.com',
  'meuemail.com.br',
  'qualquercoisa.com',
  'qualquercoisa.com.br',
  'naoexiste.com',
  'naoexiste.com.br',
  '123.com',
  '123.com.br',
  'aaa.com',
  'abc.com',
  'abc.com.br',
  'xyz.com',
  'xyz.com.br',
  'domain.com',
  'site.com',
  'email.com',
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'grr.la',
  'pokemail.net',
  'spam4.me',
  '10minutemail.com',
  '10mail.org',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'sharklasers.com',
  'throwawaymail.com',
  'trashmail.com',
  'dispostable.com',
  'maildrop.cc',
  'burnermail.io',
  'mohmal.com',
  'inboxkitten.com',
  'getairmail.com',
  'fakeinbox.com',
  'fakemailgenerator.com',
  'mytemp.email',
  'tempr.email',
  'discard.email',
  'generator.email',
  'emailondeck.com',
  'nada.ltd',
  'crazymailing.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'einrot.com',
  'rhinomore.com',
]);

// Padrões de nomes de usuário de teste/falsos bloqueados
const DUMMY_USER_PATTERNS = [
  /test(e)?/i,
  /^asdf/i,
  /^qwerty/i,
  /^fake/i,
  /^admin\d*$/i,
  /^usuario\d*$/i,
  /^cliente\d*$/i,
  /^fulano/i,
  /^ciclano/i,
  /^demo\d*$/i,
  /^qualquer/i,
  /^sememail/i,
  /^naoexiste/i,
  /^temp/i,
  /^exemplo/i,
  /^sample/i,
  /^dummy/i,
  /^anonimo/i,
  /^\d+$/,
  /^([a-z0-9])\1{2,}$/i,
];

/**
 * Valida se um nome ou nome de empresa é real (não é 'teste', 'asdf', etc.)
 */
export function validateRealName(name: string, fieldName = 'Nome'): {
  isValid: boolean;
  error?: string;
  cleanName: string;
} {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: `${fieldName} não informado.`, cleanName: '' };
  }

  const clean = name.trim();
  if (clean.length < 3) {
    return { isValid: false, error: `${fieldName} deve ter no mínimo 3 caracteres.`, cleanName: clean };
  }

  const lower = clean.toLowerCase();
  const dummyNames = ['teste', 'test', 'asdf', 'qwerty', 'fake', 'admin', 'xxx', 'abc', '123', 'usuario', 'fulano'];
  if (dummyNames.includes(lower) || lower.startsWith('teste') || lower.startsWith('test ')) {
    return {
      isValid: false,
      error: `Por favor, informe um ${fieldName.toLowerCase()} real (evite nomes fictícios como "teste").`,
      cleanName: clean,
    };
  }

  return { isValid: true, cleanName: clean };
}

/**
 * Formata um número de telefone dinamicamente enquanto o usuário digita
 */
export function formatPhoneInput(value: string): string {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }

  if (digits.length > 11) {
    digits = digits.slice(0, 11);
  }

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Validação rigorosa de número de telefone/WhatsApp brasileiro
 */
export function validateBrazilianPhone(phone: string): {
  isValid: boolean;
  error?: string;
  cleanDigits: string;
  formatted: string;
} {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      error: 'Número de telefone ou WhatsApp não informado.',
      cleanDigits: '',
      formatted: '',
    };
  }

  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }

  if (digits.length !== 10 && digits.length !== 11) {
    return {
      isValid: false,
      error: 'O telefone deve conter DDD + número (10 ou 11 dígitos). Ex: (31) 99123-4567',
      cleanDigits: digits,
      formatted: formatPhoneInput(digits),
    };
  }

  // Validar DDD oficial da Anatel
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (!VALID_BRAZILIAN_DDDS.has(ddd)) {
    return {
      isValid: false,
      error: `O DDD (${digits.slice(0, 2)}) informado não existe no Brasil.`,
      cleanDigits: digits,
      formatted: formatPhoneInput(digits),
    };
  }

  const numberPart = digits.slice(2);

  // 1. Rejeita se todos os dígitos do número forem iguais (ex: 999999999, 888888888, 000000000)
  if (numberPart.split('').every((c) => c === numberPart[0])) {
    return {
      isValid: false,
      error: 'Número de telefone inválido (dígitos todos repetidos). Informe seu número real.',
      cleanDigits: digits,
      formatted: formatPhoneInput(digits),
    };
  }

  // 2. Celular (11 dígitos): deve começar com 9 após o DDD e os 8 dígitos seguintes NÃO podem ser todos iguais
  if (digits.length === 11) {
    if (numberPart[0] !== '9') {
      return {
        isValid: false,
        error: 'Celulares no Brasil devem iniciar com o dígito 9 após o DDD. Ex: (31) 9XXXX-XXXX',
        cleanDigits: digits,
        formatted: formatPhoneInput(digits),
      };
    }
    const afterNine = numberPart.slice(1);
    if (afterNine.split('').every((c) => c === afterNine[0])) {
      return {
        isValid: false,
        error: 'Número de celular inválido (dígitos repetidos como 99999-9999). Informe seu número real.',
        cleanDigits: digits,
        formatted: formatPhoneInput(digits),
      };
    }
  }

  // 3. Telefone Fixo (10 dígitos): deve começar com 2 a 5
  if (digits.length === 10) {
    const firstDigit = parseInt(numberPart[0], 10);
    if (firstDigit < 2 || firstDigit > 5) {
      return {
        isValid: false,
        error: 'Número de telefone fixo deve começar com 2, 3, 4 ou 5 após o DDD.',
        cleanDigits: digits,
        formatted: formatPhoneInput(digits),
      };
    }
  }

  // 4. Rejeita sequências numéricas óbvias falsas
  const dummySequences = ['12345678', '87654321', '123456789', '987654321', '01234567', '76543210'];
  if (dummySequences.some((seq) => numberPart.includes(seq))) {
    return {
      isValid: false,
      error: 'Número de telefone inválido (sequência numérica falsa). Informe seu número real.',
      cleanDigits: digits,
      formatted: formatPhoneInput(digits),
    };
  }

  return {
    isValid: true,
    cleanDigits: digits,
    formatted: formatPhoneInput(digits),
  };
}

/**
 * Validação rigorosa de formato de e-mail e detecção de e-mails falsos
 */
export function validateEmailFormat(email: string): {
  isValid: boolean;
  error?: string;
  cleanEmail: string;
} {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      error: 'E-mail não informado.',
      cleanEmail: '',
    };
  }

  const clean = email.toLowerCase().trim();

  // Padrão RFC 5322 simplificado e estrito
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(clean)) {
    return {
      isValid: false,
      error: 'Formato de e-mail inválido. Utilize o formato seu.nome@dominio.com.br',
      cleanEmail: clean,
    };
  }

  const parts = clean.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      error: 'Formato de e-mail inválido.',
      cleanEmail: clean,
    };
  }

  const [username, domain] = parts;

  if (username.length < 3 || username.length > 64) {
    return {
      isValid: false,
      error: 'O nome de usuário do e-mail deve ter no mínimo 3 caracteres.',
      cleanEmail: clean,
    };
  }

  // Verifica repetições de um único caractere (ex: aaaaa@...)
  if (username.split('').every((c) => c === username[0])) {
    return {
      isValid: false,
      error: 'Informe um e-mail real e existente (caracteres repetidos).',
      cleanEmail: clean,
    };
  }

  // Bloqueio de padrões falsos/testes no usuário (ex: teste123, fake, asdf, etc.)
  if (DUMMY_USER_PATTERNS.some((p) => p.test(username))) {
    return {
      isValid: false,
      error: `O e-mail "${clean}" parece ser um e-mail de teste fictício. Por favor, informe seu e-mail pessoal ou corporativo real e ativo.`,
      cleanEmail: clean,
    };
  }

  // Validações do domínio
  if (domain.length < 4 || !domain.includes('.')) {
    return {
      isValid: false,
      error: 'O domínio do e-mail é inválido (deve conter extensão como .com ou .com.br).',
      cleanEmail: clean,
    };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return {
      isValid: false,
      error: 'Extensão de domínio do e-mail inválida.',
      cleanEmail: clean,
    };
  }

  // Domínios bloqueados / falsos / descartáveis
  if (BLOCKED_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: `O domínio "@${domain}" não é aceito. Informe seu e-mail corporativo ou pessoal real e ativo.`,
      cleanEmail: clean,
    };
  }

  return {
    isValid: true,
    cleanEmail: clean,
  };
}
