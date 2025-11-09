import * as XLSX from 'xlsx';
import { Colaborador, formatCPF } from '@/types/colaborador';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeColumns?: string[];
}

/**
 * Exporta dados de colaboradores para Excel
 */
export const exportColaboradoresToExcel = (
  colaboradores: Colaborador[], 
  options: ExportOptions = {}
) => {
  const {
    filename = `colaboradores_${new Date().toISOString().split('T')[0]}.xlsx`,
    sheetName = 'Colaboradores',
    includeColumns = [
      'nome', 'email', 'cpf', 'telefone', 'cargo', 'departamento', 
      'unidade', 'tipo_contratacao', 'status', 'data_admissao',
      'banco', 'agencia', 'conta', 'tipo_conta'
    ]
  } = options;

  // Mapear dados para formato de exportação
  const exportData = colaboradores.map(colaborador => {
    const row: any = {};
    
    if (includeColumns.includes('nome')) row['Nome'] = colaborador.nome;
    if (includeColumns.includes('email')) row['Email'] = colaborador.email;
    if (includeColumns.includes('cpf')) row['CPF'] = formatCPF(colaborador.cpf);
    if (includeColumns.includes('telefone')) row['Telefone'] = colaborador.telefone || '';
    if (includeColumns.includes('cargo')) row['Cargo'] = colaborador.cargo;
    if (includeColumns.includes('departamento')) row['Departamento'] = colaborador.departamento;
    if (includeColumns.includes('unidade')) {
      // Concatenar nomes das unidades
      row['Unidade'] = colaborador.unidades?.map(cu => cu.unidade?.nome).join(', ') || 'Sem unidade';
    }
    if (includeColumns.includes('tipo_contratacao')) row['Tipo Contratação'] = colaborador.tipo_contratacao;
    if (includeColumns.includes('status')) row['Status'] = colaborador.status;
    if (includeColumns.includes('data_admissao')) {
      row['Data Admissão'] = new Date(colaborador.data_admissao).toLocaleDateString('pt-BR');
    }
    if (includeColumns.includes('banco')) row['Banco'] = colaborador.banco || '';
    if (includeColumns.includes('agencia')) row['Agência'] = colaborador.agencia || '';
    if (includeColumns.includes('conta')) row['Conta'] = colaborador.conta || '';
    if (includeColumns.includes('tipo_conta')) row['Tipo Conta'] = colaborador.tipo_conta || '';
    
    return row;
  });

  // Criar workbook e worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Ajustar largura das colunas
  const columnWidths = [
    { wch: 25 }, // Nome
    { wch: 30 }, // Email
    { wch: 15 }, // CPF
    { wch: 15 }, // Telefone
    { wch: 20 }, // Cargo
    { wch: 20 }, // Departamento
    { wch: 15 }, // Unidade
    { wch: 15 }, // Tipo Contratação
    { wch: 10 }, // Status
    { wch: 15 }, // Data Admissão
    { wch: 15 }, // Banco
    { wch: 10 }, // Agência
    { wch: 15 }, // Conta
    { wch: 12 }  // Tipo Conta
  ];
  
  worksheet['!cols'] = columnWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Fazer download do arquivo
  XLSX.writeFile(workbook, filename);
};

/**
 * Exporta dados filtrados de colaboradores
 */
export const exportFilteredColaboradores = (
  colaboradores: Colaborador[],
  filtros: any,
  visibleColumns: string[]
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `colaboradores_filtrados_${timestamp}.xlsx`;
  
  exportColaboradoresToExcel(colaboradores, {
    filename,
    includeColumns: visibleColumns
  });
};
