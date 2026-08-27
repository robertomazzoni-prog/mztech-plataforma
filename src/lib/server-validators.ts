import dns from 'dns';
import { validateEmailFormat } from './validators';

/**
 * Validação profunda no Backend para verificar se o domínio do e-mail REALMENTE existe na internet (DNS MX / A)
 */
export async function validateEmailDomainExists(email: string): Promise<{
  isValid: boolean;
  error?: string;
  cleanEmail: string;
}> {
  const formatCheck = validateEmailFormat(email);
  if (!formatCheck.isValid) {
    return { isValid: false, error: formatCheck.error, cleanEmail: '' };
  }

  const domain = formatCheck.cleanEmail.split('@')[1];

  try {
    // Criar timeout de 2.5s para não travar requisições em redes lentas
    const dnsLookupPromise = new Promise<{ isValid: boolean; error?: string; cleanEmail: string }>((resolve) => {
      dns.resolveMx(domain, (errMx, addresses) => {
        if (!errMx && addresses && addresses.length > 0) {
          return resolve({ isValid: true, cleanEmail: formatCheck.cleanEmail });
        }

        // Se não encontrar MX, tentar registro A (muitos domínios usam A record como fallback de email)
        dns.resolve4(domain, (errA, aRecords) => {
          if (!errA && aRecords && aRecords.length > 0) {
            return resolve({ isValid: true, cleanEmail: formatCheck.cleanEmail });
          }

          return resolve({
            isValid: false,
            error: `O domínio de e-mail "@${domain}" não foi encontrado na internet ou não está ativo. Informe um e-mail com domínio real e ativo.`,
            cleanEmail: formatCheck.cleanEmail,
          });
        });
      });
    });

    const timeoutPromise = new Promise<{ isValid: boolean; error?: string; cleanEmail: string }>((resolve) => {
      setTimeout(() => {
        // Se der timeout de DNS, permite passar com a validação sintática para não bloquear
        resolve({ isValid: true, cleanEmail: formatCheck.cleanEmail });
      }, 2500);
    });

    return await Promise.race([dnsLookupPromise, timeoutPromise]);
  } catch (e) {
    // Em caso de falha de rede do servidor DNS, aceitar formato sintático válido
    return { isValid: true, cleanEmail: formatCheck.cleanEmail };
  }
}
