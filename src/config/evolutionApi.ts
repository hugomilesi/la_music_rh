/**
 * Configuração centralizada da Evolution API
 * 
 * Este arquivo centraliza todas as configurações da Evolution API,
 * facilitando alterações futuras através do arquivo .env
 */

export interface EvolutionApiConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  enabled: boolean;
}

/**
 * Carrega as configurações da Evolution API a partir das variáveis de ambiente
 */
export function getEvolutionApiConfig(): EvolutionApiConfig {
  const config: EvolutionApiConfig = {
    apiUrl: import.meta.env.VITE_EVOLUTION_API_URL || 'http://localhost:8080',
    apiKey: import.meta.env.VITE_EVOLUTION_API_KEY || '',
    instanceName: import.meta.env.VITE_EVOLUTION_INSTANCE_NAME || 'default-instance',
    enabled: import.meta.env.VITE_EVOLUTION_API_ENABLED !== 'false'
  };

  // Validação das configurações obrigatórias
  if (!config.apiKey) {
    console.warn('⚠️ VITE_EVOLUTION_API_KEY não configurada no .env');
  }

  if (!config.apiUrl) {
    console.warn('⚠️ VITE_EVOLUTION_API_URL não configurada no .env');
  }

  if (!config.instanceName) {
    console.warn('⚠️ VITE_EVOLUTION_INSTANCE_NAME não configurada no .env');
  }

  return config;
}

/**
 * Valida se as configurações da Evolution API estão completas
 */
export function validateEvolutionApiConfig(config: EvolutionApiConfig): boolean {
  const isValid = !!(config.apiKey && config.apiUrl && config.instanceName && config.enabled);
  
  if (!isValid) {
    console.error('❌ Configuração da Evolution API incompleta:', {
      hasApiKey: !!config.apiKey,
      hasApiUrl: !!config.apiUrl,
      hasInstanceName: !!config.instanceName,
      enabled: config.enabled
    });
  }

  return isValid;
}

/**
 * Formata a URL da API removendo barras duplas e garantindo formato correto
 */
export function formatApiUrl(baseUrl: string, endpoint: string): string {
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBaseUrl}${cleanEndpoint}`;
}

/**
 * Headers padrão para requisições à Evolution API
 */
export function getEvolutionApiHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'apikey': apiKey
  };
}

/**
 * Configuração padrão exportada
 */
export const evolutionApiConfig = getEvolutionApiConfig();

/**
 * Log das configurações carregadas (sem expor dados sensíveis)
 */
console.log('🔧 Evolution API Config carregada:', {
  apiUrl: evolutionApiConfig.apiUrl,
  instanceName: evolutionApiConfig.instanceName,
  hasApiKey: !!evolutionApiConfig.apiKey,
  enabled: evolutionApiConfig.enabled
});