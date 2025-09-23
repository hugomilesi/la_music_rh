/**
 * Utilitários para processamento de documentos
 */

/**
 * Extrai o tipo de documento do file_path
 * @param filePath - Caminho do arquivo (ex: "documents/RG/1758639810885_file.pdf")
 * @returns Tipo de documento formatado
 */
export function extractDocumentTypeFromPath(filePath: string): string {
  if (!filePath) return 'Outros';
  
  // Extrair o tipo do caminho: documents/TIPO/arquivo.ext
  const pathParts = filePath.split('/');
  if (pathParts.length >= 2 && pathParts[0] === 'documents') {
    const documentType = pathParts[1];
    
    // Mapear tipos comuns para nomes mais legíveis
    const typeMapping: Record<string, string> = {
      'Contrato_de_Trabalho': 'Contrato de Trabalho',
      'Carteira_de_Trabalho': 'Carteira de Trabalho',
      'CPF': 'CPF',
      'RG': 'RG',
      'Comprovante_de_Residencia': 'Comprovante de Residência',
      'Atestado_de_Saude_Ocupacional': 'Atestado de Saúde Ocupacional',
      'PIS_PASEP': 'PIS/PASEP',
      'Titulo_de_Eleitor': 'Título de Eleitor',
      'Atestado_Medico': 'Atestado Médico',
      'Certificado_de_Curso': 'Certificado de Curso',
      'Licenca_Medica': 'Licença Médica',
      'Atestado_de_Comparecimento': 'Atestado de Comparecimento',
      'Outros': 'Outros'
    };
    
    return typeMapping[documentType] || documentType.replace(/_/g, ' ');
  }
  
  return 'Outros';
}

/**
 * Determina a categoria do documento baseado no tipo
 * @param documentType - Tipo do documento
 * @returns Categoria do documento
 */
export function getDocumentCategory(documentType: string): 'obrigatorio' | 'temporario' | 'complementar' {
  const obrigatorios = [
    'Contrato de Trabalho',
    'Carteira de Trabalho', 
    'CPF',
    'RG',
    'PIS/PASEP'
  ];
  
  const temporarios = [
    'Atestado Médico',
    'Licença Médica',
    'Atestado de Comparecimento'
  ];
  
  if (obrigatorios.includes(documentType)) {
    return 'obrigatorio';
  } else if (temporarios.includes(documentType)) {
    return 'temporario';
  } else {
    return 'complementar';
  }
}

/**
 * Formata a data de validade para exibição
 * @param expiresAt - Data de expiração do banco (expires_at)
 * @returns Data formatada ou texto padrão
 */
export function formatExpiryDate(expiresAt: string | null): string {
  if (!expiresAt) return 'Sem validade';
  
  try {
    return new Date(expiresAt).toLocaleDateString('pt-BR');
  } catch {
    return 'Data inválida';
  }
}

/**
 * Determina o status do documento baseado na data de validade
 * @param expiresAt - Data de expiração
 * @returns Status do documento
 */
export function getDocumentStatus(expiresAt: string | null): 'válido' | 'vencido' | 'vencendo' | 'pendente' {
  if (!expiresAt) return 'válido'; // Documentos sem validade são considerados válidos
  
  try {
    const expiryDate = new Date(expiresAt);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (expiryDate < today) {
      return 'vencido';
    } else if (expiryDate <= thirtyDaysFromNow) {
      return 'vencendo';
    } else {
      return 'válido';
    }
  } catch {
    return 'pendente';
  }
}