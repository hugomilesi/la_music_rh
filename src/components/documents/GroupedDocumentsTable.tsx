
import React, { useState, useMemo, useEffect } from 'react';
import { useDocuments } from '@/contexts/DocumentContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { Document } from '@/types/document';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight, User, FileText, Download, Mail, Package, Eye, Edit, Trash2, AlertCircle, CheckCircle, Check, X, FileDown } from 'lucide-react';
import { EditDocumentDialog } from './EditDocumentDialog';
import { documentChecklistService } from '@/services/documentChecklistService';
import type { EmployeeDocumentSummary, DocumentChecklistItem } from '@/services/documentChecklistService';
import { extractDocumentTypeFromPath, formatExpiryDate, getDocumentStatus } from '@/utils/documentUtils';
import { toast } from '@/hooks/use-toast';

interface GroupedDocumentsTableProps {
  onEmployeeClick: (employeeId: string, employeeName: string) => void;
  onSendToAccountant: (documents: Document[]) => void;
}

interface EmployeeDocumentGroup {
  employeeId: string;
  employeeName: string;
  documents: Document[];
  totalDocuments: number;
  validDocuments: number;
  expiringDocuments: number;
  expiredDocuments: number;
  pendingDocuments: number;
  checklistItems: DocumentChecklistItem[];
}

export const GroupedDocumentsTable: React.FC<GroupedDocumentsTableProps> = ({
  onEmployeeClick,
  onSendToAccountant
}) => {
  const { filteredDocuments, downloadDocument, exportDocumentsByEmployee, viewDocument, deleteDocument } = useDocuments();
  const { employees } = useEmployees();
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [employeeSummaries, setEmployeeSummaries] = useState<EmployeeDocumentSummary[]>([]);
  const [checklistData, setChecklistData] = useState<Map<string, DocumentChecklistItem[]>>(new Map());
  const [loading, setLoading] = useState(true);

  // Função para carregar dados do checklist
  const loadEmployeeSummaries = async () => {
    try {
      setLoading(true);
      const summaries = await documentChecklistService.getAllEmployeesDocumentSummary();
      setEmployeeSummaries(summaries);
      
      // Carregar checklist detalhado para cada funcionário
      const checklistMap = new Map<string, DocumentChecklistItem[]>();
      for (const summary of summaries) {
        const checklist = await documentChecklistService.getEmployeeDocumentChecklist(summary.employee_id);
        checklistMap.set(summary.employee_id, checklist);
      }
      setChecklistData(checklistMap);
    } catch (error) {
      console.error('Erro ao carregar dados do checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados do checklist
  useEffect(() => {
    loadEmployeeSummaries();
  }, []);

  // Função para aprovar documento
  const handleApproveDocument = async (checklistItemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await documentChecklistService.updateChecklistItemStatus(checklistItemId, 'completo');
      // Recarregar dados
      await loadEmployeeSummaries();
    } catch (error) {
      console.error('Erro ao aprovar documento:', error);
      alert('Erro ao aprovar documento. Tente novamente.');
    }
  };

  // Função para rejeitar documento
  const handleRejectDocument = async (checklistItemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await documentChecklistService.updateChecklistItemStatus(checklistItemId, 'pendente');
      // Recarregar dados
      await loadEmployeeSummaries();
    } catch (error) {
      console.error('Erro ao rejeitar documento:', error);
      alert('Erro ao rejeitar documento. Tente novamente.');
    }
  };

  const groupedDocuments = useMemo(() => {
    const groups = new Map<string, EmployeeDocumentGroup>();

    // Primeiro, criar grupos baseados nos documentos existentes
    filteredDocuments.forEach(doc => {
      if (!groups.has(doc.employee_id)) {
        const employeeSummary = employeeSummaries.find(s => s.employee_id === doc.employee_id);
        const checklistItems = checklistData.get(doc.employee_id) || [];
        
        // Priorizar fontes de dados válidas para o nome do colaborador
        let employeeName = 'Nome não encontrado';
        
        // 1. Tentar obter do documento (se disponível)
        if (doc.employee?.username && doc.employee.username.trim() !== '') {
          employeeName = doc.employee.username;
        }
        // 2. Tentar obter do resumo do funcionário
        else if (employeeSummary?.employee_name && employeeSummary.employee_name.trim() !== '' && employeeSummary.employee_name !== 'Nome não encontrado') {
          employeeName = employeeSummary.employee_name;
        }
        // 3. Tentar obter do primeiro item do checklist
        else if (checklistItems.length > 0 && checklistItems[0].employee_name && checklistItems[0].employee_name.trim() !== '' && checklistItems[0].employee_name !== 'Nome não encontrado') {
          employeeName = checklistItems[0].employee_name;
        }
        
        groups.set(doc.employee_id, {
          employeeId: doc.employee_id,
          employeeName: employeeName,
          documents: [],
          totalDocuments: 0,
          validDocuments: 0,
          expiringDocuments: 0,
          expiredDocuments: 0,
          pendingDocuments: checklistItems.filter(item => item.status === 'pendente').length,
          checklistItems: checklistItems
        });
      }

      const group = groups.get(doc.employee_id)!;
      group.documents.push(doc);
      group.totalDocuments++;

      switch (doc.status) {
        case 'válido':
          group.validDocuments++;
          break;
        case 'vencendo':
          group.expiringDocuments++;
          break;
        case 'vencido':
          group.expiredDocuments++;
          break;
      }
    });

    // Adicionar funcionários que têm checklist mas não têm documentos ainda
    employeeSummaries.forEach(summary => {
      if (!groups.has(summary.employee_id)) {
        const checklistItems = checklistData.get(summary.employee_id) || [];
        
        // Priorizar fontes de dados válidas para o nome do colaborador
        let employeeName = 'Nome não encontrado';
        
        // 1. Tentar obter do resumo do funcionário
        if (summary.employee_name && summary.employee_name.trim() !== '' && summary.employee_name !== 'Nome não encontrado') {
          employeeName = summary.employee_name;
        }
        // 2. Tentar obter do primeiro item do checklist
        else if (checklistItems.length > 0 && checklistItems[0].employee_name && checklistItems[0].employee_name.trim() !== '' && checklistItems[0].employee_name !== 'Nome não encontrado') {
          employeeName = checklistItems[0].employee_name;
        }
        
        groups.set(summary.employee_id, {
          employeeId: summary.employee_id,
          employeeName: employeeName,
          documents: [],
          totalDocuments: 0,
          validDocuments: 0,
          expiringDocuments: 0,
          expiredDocuments: 0,
          pendingDocuments: checklistItems.filter(item => item.status === 'pendente').length,
          checklistItems: checklistItems
        });
      }
    });

    return Array.from(groups.values()).sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  }, [filteredDocuments, employeeSummaries, checklistData]);

  // Filtrar colaboradores que têm documentos para exibir
  const filteredGroupedDocuments = useMemo(() => {
    return groupedDocuments.filter(group => {
      // Mostrar colaborador apenas se tem documentos enviados OU documentos aguardando aprovação
      const hasUploadedDocuments = group.documents.length > 0;
      const hasSentDocuments = group.checklistItems.some(item => item.status === 'completo');
      return hasUploadedDocuments || hasSentDocuments;
    });
  }, [groupedDocuments]);

  const toggleEmployee = (employeeId: string) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedEmployees(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Válido': 'bg-green-100 text-green-800',
      'Vencido': 'bg-red-100 text-red-800',
      'Vencendo em breve': 'bg-yellow-100 text-yellow-800',
      'Sem validade': 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Contrato de Trabalho': 'bg-red-50 text-red-700 border-red-200',
      'Carteira de Trabalho': 'bg-blue-50 text-blue-700 border-blue-200',
      'CPF': 'bg-green-50 text-green-700 border-green-200',
      'RG': 'bg-purple-50 text-purple-700 border-purple-200',
      'Comprovante de Residência': 'bg-orange-50 text-orange-700 border-orange-200',
      'Atestado de Saúde Ocupacional': 'bg-teal-50 text-teal-700 border-teal-200',
      'PIS/PASEP': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Título de Eleitor': 'bg-pink-50 text-pink-700 border-pink-200',
      'Atestado Médico': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'Certificado de Curso': 'bg-amber-50 text-amber-700 border-amber-200',
      'Carteira Médica': 'bg-lime-50 text-lime-700 border-lime-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const handleEmployeeExport = (employeeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    exportDocumentsByEmployee(employeeId, 'excel');
  };

  const handleSendEmployeeDocuments = (documents: Document[], e: React.MouseEvent) => {
    e.stopPropagation();
    onSendToAccountant(documents);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Carregando dados dos documentos...</div>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Válidos</TableHead>
                <TableHead>Vencendo</TableHead>
                <TableHead>Vencidos</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroupedDocuments.map((group) => (
                <React.Fragment key={group.employeeId}>
                  <TableRow 
                    className="cursor-pointer hover:bg-gray-50 border-b-2" 
                    onClick={() => toggleEmployee(group.employeeId)}
                  >
                    <TableCell>
                      {expandedEmployees.has(group.employeeId) ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{group.employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">{group.validDocuments}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800">{group.expiringDocuments}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800">{group.expiredDocuments}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => handleEmployeeExport(group.employeeId, e)}
                          title="Exportar documentos do colaborador"
                        >
                          <Package className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => handleSendEmployeeDocuments(group.documents, e)}
                          title="Enviar documentos para contador"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {expandedEmployees.has(group.employeeId) && (
                    <>
                      {/* Documentos enviados */}
                      {group.documents.map((doc, index) => (
                        <TableRow key={`document-${group.employeeId}-${doc.id}-${index}`} className="bg-gray-50">
                          <TableCell></TableCell>
                          <TableCell className="pl-8">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{doc.document_name || doc.file_name}</span>
                                <span className="text-xs text-gray-500">
                                  Tipo: {extractDocumentTypeFromPath(doc.file_path)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(extractDocumentTypeFromPath(doc.file_path))} style={{ fontSize: '10px', padding: '2px 6px' }}>
                              {extractDocumentTypeFromPath(doc.file_path)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatExpiryDate(doc.expires_at)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(getDocumentStatus(doc.expires_at))} style={{ fontSize: '10px', padding: '2px 6px' }}>
                              {getDocumentStatus(doc.expires_at)}
                            </Badge>
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewDocument(doc);
                                }}
                                title="Visualizar documento"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadDocument(doc);
                                }}
                                title="Baixar documento"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingDocument(doc);
                                  setEditDialogOpen(true);
                                }}
                                title="Editar documento"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Tem certeza que deseja excluir este documento?')) {
                                    deleteDocument(doc.id);
                                  }
                                }}
                                title="Excluir documento"
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {/* Documentos completos */}
                      {group.checklistItems
                        .filter(item => item.status === 'completo')
                        .map((item, index) => (
                          <TableRow key={`sent-${group.employeeId}-${item.id}-${index}`} className="bg-blue-50">
                            <TableCell></TableCell>
                            <TableCell className="pl-8">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{item.required_document_name}</span>
                                  <span className="text-xs text-gray-500">
                                    Tipo: {item.document_type === 'obrigatorio' ? 'Obrigatório' : 
                                           item.document_type === 'temporario' ? 'Temporário' : 'Complementar'}
                                  </span>
                                </div>
                                {item.is_mandatory && (
                                  <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                                )}
                                {item.uploaded_document_name && (
                                  <span className="text-xs text-gray-500">({item.uploaded_document_name})</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                {item.document_type === 'obrigatorio' ? 'Obrigatório' : 
                                 item.document_type === 'temporario' ? 'Temporário' : 'Complementar'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '-'}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">-</TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                Enviado
                              </Badge>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => handleApproveDocument(item.id, e)}
                                  title="Aprovar documento"
                                  className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => handleRejectDocument(item.id, e)}
                                  title="Rejeitar documento"
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      
                      {/* Documentos pendentes */}
                      {group.checklistItems
                        .filter(item => item.status === 'pendente')
                        .map((item, index) => (
                          <TableRow key={`pending-${group.employeeId}-${item.id}-${index}`} className="bg-yellow-50">
                            <TableCell></TableCell>
                            <TableCell className="pl-8">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-orange-700">{item.required_document_name}</span>
                                  <span className="text-xs text-gray-500">
                                    Tipo: {item.document_type === 'obrigatorio' ? 'Obrigatório' : 
                                           item.document_type === 'temporario' ? 'Temporário' : 'Complementar'}
                                  </span>
                                </div>
                                {item.is_mandatory && (
                                  <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-orange-100 text-orange-800" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                {item.document_type === 'obrigatorio' ? 'Obrigatório' : 
                                 item.document_type === 'temporario' ? 'Temporário' : 'Complementar'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">-</TableCell>
                            <TableCell className="text-sm text-gray-500">-</TableCell>
                            <TableCell>
                              <Badge className="bg-orange-100 text-orange-800" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                Pendente
                              </Badge>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell>
                              <div className="text-xs text-gray-500">
                                Aguardando envio
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          
          {filteredGroupedDocuments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum colaborador com documentos para revisar.
            </div>
          )}
        </CardContent>
      </Card>
     
      <EditDocumentDialog
        document={editingDocument}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingDocument(null);
        }}
      />
    </div>
  );
};
