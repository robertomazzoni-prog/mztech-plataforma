import dns from 'dns';
import { validateEmailFormat } from './validators';

// Configura servidores DNS públicos confiáveis (Google DNS e Cloudflare)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);
} catch (e) {
  // Ignora se o ambiente bloquear custom DNS
}

/**
 * Validação profunda no Backend para verificar se o domínio do e-mail REALMENTE existe na internet (DNS MX)
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
    const dnsLookupPromise = new Promise<{ isValid: boolean; error?: string; cleanEmail: string }>((resolve) => {
      dns.resolveMx(domain, (errMx, addresses) => {
        if (!errMx && addresses && addresses.length > 0) {
          // Domínio real com servidor de e-mail MX ativo
          return resolve({ isValid: true, cleanEmail: formatCheck.cleanEmail });
        }

        // Se o DNS retornar ENOTFOUND (domínio inexistente) ou ENODATA (sem MX)
        if (errMx) {
          if (errMx.code === 'ENOTFOUND' || errMx.code === 'ENODATA' || errMx.code === 'SERVFAIL' || errMx.code === 'EREFUSED') {
            return resolve({
              isValid: false,
              error: `O domínio de e-mail "@${domain}" não existe na internet ou não está configurado para receber mensagens. Informe um e-mail real e ativo.`,
              cleanEmail: formatCheck.cleanEmail,
            });
          }
        }

        return resolve({
          isValid: false,
          error: `O domínio de e-mail "@${domain}" não possui servidores de e-mail ativos. Verifique se digitou corretamente.`,
          cleanEmail: formatCheck.cleanEmail,
        });
      });
    });

    const timeoutPromise = new Promise<{ isValid: boolean; error?: string; cleanEmail: string }>((resolve) => {
      setTimeout(() => {
        // Se houver timeout de rede em ambiente offline, aceita a validação sintática estrita
        resolve({ isValid: true, cleanEmail: formatCheck.cleanEmail });
      }, 3000);
    });

    return await Promise.race([dnsLookupPromise, timeoutPromise]);
  } catch (e) {
    return { isValid: true, cleanEmail: formatCheck.cleanEmail };
  }
}
