import React, { useState, useMemo, useEffect } from 'react';
import { useDocuments } from '@/contexts/DocumentContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { Document } from '@/types/document';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { EditDocumentDialog } from './EditDocumentDialog';
import { DocumentUploadDialog } from './DocumentUploadDialog';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  Eye, 
  Download, 
  Upload, 
  Mail, 
  Package, 
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { documentChecklistService } from '@/services/documentChecklistService';
import type { EmployeeDocumentSummary, DocumentChecklistItem } from '@/services/documentChecklistService';
import { extractDocumentTypeFromPath, formatExpiryDate, getDocumentStatus } from '@/utils/documentUtils';
import { toast } from '@/hooks/use-toast';

interface ImprovedDocumentsTableProps {
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
  completionRate: number;
}



export const ImprovedDocumentsTable: React.FC<ImprovedDocumentsTableProps> = ({
  onEmployeeClick,
  onSendToAccountant
}) => {
  const { filteredDocuments, downloadDocument, exportDocumentsByEmployee, viewDocument, deleteDocument } = useDocuments();
  const { employees } = useEmployees();
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const [employeeSummaries, setEmployeeSummaries] = useState<EmployeeDocumentSummary[]>([]);
  const [checklistData, setChecklistData] = useState<Map<string, DocumentChecklistItem[]>>(new Map());
  const [loading, setLoading] = useState(true);
  
  // Estados para diálogos
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedEmployeeForUpload, setSelectedEmployeeForUpload] = useState<string>('');

  // Carregar dados do checklist
  const loadEmployeeSummaries = async () => {
    try {
      setLoading(true);
      const summaries = await documentChecklistService.getAllEmployeesDocumentSummary();
      setEmployeeSummaries(summaries);
      
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

  useEffect(() => {
    loadEmployeeSummaries();
  }, []);

  // Processar dados dos colaboradores
  const groupedDocuments = useMemo(() => {
    const groups = new Map<string, EmployeeDocumentGroup>();

    // Criar grupos baseados nos documentos existentes
    filteredDocuments.forEach(doc => {
      if (!groups.has(doc.employee_id)) {
        const employeeSummary = employeeSummaries.find(s => s.employee_id === doc.employee_id);
        const checklistItems = checklistData.get(doc.employee_id) || [];
        
        let employeeName = 'Nome não encontrado';
        if (doc.employee?.username && doc.employee.username.trim() !== '') {
          employeeName = doc.employee.username;
        } else if (employeeSummary?.employee_name && employeeSummary.employee_name.trim() !== '') {
          employeeName = employeeSummary.employee_name;
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
          checklistItems: checklistItems,
          completionRate: 0
        });
      }

      const group = groups.get(doc.employee_id)!;
      group.documents.push(doc);
      group.totalDocuments++;

      const status = getDocumentStatus(doc.expires_at);
      switch (status) {
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

    // Adicionar funcionários que têm checklist mas não têm documentos
    employeeSummaries.forEach(summary => {
      if (!groups.has(summary.employee_id)) {
        const checklistItems = checklistData.get(summary.employee_id) || [];
        
        groups.set(summary.employee_id, {
          employeeId: summary.employee_id,
          employeeName: summary.employee_name || 'Nome não encontrado',
          documents: [],
          totalDocuments: 0,
          validDocuments: 0,
          expiringDocuments: 0,
          expiredDocuments: 0,
          pendingDocuments: checklistItems.filter(item => item.status === 'pendente').length,
          checklistItems: checklistItems,
          completionRate: 0
        });
      }
    });

    // Calcular taxa de conclusão
    groups.forEach(group => {
      const totalRequired = group.checklistItems.length;
      const completed = group.validDocuments;
      group.completionRate = totalRequired > 0 ? Math.round((completed / totalRequired) * 100) : 0;
    });

    // Ordenação inteligente: priorizar pendentes e vencendo
    return Array.from(groups.values()).sort((a, b) => {
      // Primeiro critério: prioridade (pendentes e vencendo primeiro)
      const aPriority = a.pendingDocuments > 0 || a.expiringDocuments > 0 ? 1 : 
                      a.expiredDocuments > 0 ? 2 : 3;
      const bPriority = b.pendingDocuments > 0 || b.expiringDocuments > 0 ? 1 : 
                      b.expiredDocuments > 0 ? 2 : 3;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Segundo critério: nome do colaborador
      return a.employeeName.localeCompare(b.employeeName);
    });
  }, [filteredDocuments, employeeSummaries, checklistData]);

  // Filtrar colaboradores que têm documentos para exibir (incluindo pendentes)
  const filteredGroupedDocuments = useMemo(() => {
    return groupedDocuments.filter(group => {
      const hasUploadedDocuments = group.documents.length > 0;
      const hasSentDocuments = group.checklistItems.some(item => item.status === 'completo');
      const hasPendingDocuments = group.checklistItems.some(item => item.status === 'pendente');
      return hasUploadedDocuments || hasSentDocuments || hasPendingDocuments;
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

  // Função para obter status unificado com ícones melhorados
  const getUnifiedStatus = (doc: Document) => {
    const status = getDocumentStatus(doc.expires_at);
    switch (status) {
      case 'válido':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Válido',
          color: 'text-green-700 bg-green-100 border-green-300',
          priority: 4
        };
      case 'vencendo':
        const daysUntilExpiry = doc.expires_at ? 
          Math.ceil((new Date(doc.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          label: `Vencendo em ${daysUntilExpiry} dias`,
          color: 'text-yellow-700 bg-yellow-100 border-yellow-300',
          priority: 2
        };
      case 'vencido':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          label: 'Vencido',
          color: 'text-red-700 bg-red-100 border-red-300',
          priority: 3
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4 text-yellow-600" />,
          label: 'Pendente de envio',
          color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
          priority: 1
        };
    }
  };

  // Função para obter ações contextuais baseadas no status
  const getContextualActions = (doc: Document) => {
    const status = getDocumentStatus(doc.expires_at);
    
    switch (status) {
      case 'válido':
        return [
          {
            icon: <Eye className="w-4 h-4" />,
            label: 'Visualizar',
            action: () => viewDocument(doc),
            variant: 'ghost' as const
          },
          {
            icon: <Download className="w-4 h-4" />,
            label: 'Baixar',
            action: () => downloadDocument(doc),
            variant: 'ghost' as const
          }
        ];
      case 'vencendo':
      case 'vencido':
        return [
          {
            icon: <RefreshCw className="w-4 h-4" />,
            label: 'Atualizar',
            action: () => {
              // Implementar atualização de documento
              toast({ title: 'Funcionalidade em desenvolvimento', description: 'Atualização de documento será implementada em breve.' });
            },
            variant: 'outline' as const
          },
          {
            icon: <Eye className="w-4 h-4" />,
            label: 'Visualizar',
            action: () => viewDocument(doc),
            variant: 'ghost' as const
          }
        ];
      default:
        return [
          {
            icon: <Upload className="w-4 h-4" />,
            label: 'Enviar',
            action: () => {
              // Implementar envio de documento
              toast({ title: 'Funcionalidade em desenvolvimento', description: 'Envio de documento será implementado em breve.' });
            },
            variant: 'outline' as const
          }
        ];
    }
  };

  const handleEmployeeExport = (employeeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    exportDocumentsByEmployee(employeeId, 'excel');
  };

  const handleSendEmployeeDocuments = (documents: Document[], e: React.MouseEvent) => {
    e.stopPropagation();
    onSendToAccountant(documents);
  };

  // Função para abrir o diálogo de upload com colaborador pré-selecionado
  const handleUploadDocument = (employeeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEmployeeForUpload(employeeId);
    setUploadDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Carregando dados dos documentos...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos por Colaborador
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Status Resumo</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
                <TableBody>
                  {filteredGroupedDocuments.map((group) => (
                    <React.Fragment key={group.employeeId}>
                      {/* Linha do Colaborador */}
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
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{group.employeeName}</div>
                              <div className="text-sm text-gray-500">
                                {group.validDocuments}/{group.checklistItems.length} documentos válidos
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progresso</span>
                              <span className="font-medium">{group.completionRate}%</span>
                            </div>
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                              <div 
                                className="h-full transition-all rounded-full" 
                                style={{
                                  width: `${group.completionRate}%`,
                                  background: 'linear-gradient(45deg, #fbbf24, #f97316)'
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {group.validDocuments > 0 && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {group.validDocuments} válidos
                              </Badge>
                            )}
                            {group.expiringDocuments > 0 && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {group.expiringDocuments} vencendo
                              </Badge>
                            )}
                            {group.expiredDocuments > 0 && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {group.expiredDocuments} vencidos
                              </Badge>
                            )}
                            {group.pendingDocuments > 0 && (
                              <Badge className="bg-gray-100 text-gray-800 text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {group.pendingDocuments} pendentes
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={(e) => handleEmployeeExport(group.employeeId, e)}
                                >
                                  <Package className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Exportar documentos</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={(e) => handleSendEmployeeDocuments(group.documents, e)}
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Enviar para contador</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Documentos Expandidos */}
                      {expandedEmployees.has(group.employeeId) && (
                        <>
                          {group.documents
                            .sort((a, b) => {
                              const aStatus = getUnifiedStatus(a);
                              const bStatus = getUnifiedStatus(b);
                              return aStatus.priority - bStatus.priority;
                            })
                            .map((doc, index) => {
                            const statusInfo = getUnifiedStatus(doc);
                            const contextualActions = getContextualActions(doc);
                            return (
                              <TableRow key={`document-${group.employeeId}-${doc.id}-${index}`} className="bg-gray-50">
                                <TableCell></TableCell>
                                <TableCell className="pl-12">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <div className="font-medium text-sm">
                                        {doc.document_name || doc.file_name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {extractDocumentTypeFromPath(doc.file_path)}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-gray-600">
                                    Enviado: {doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                                    {doc.expires_at && (
                                      <div className="text-xs text-gray-500">
                                        Vencimento: {new Date(doc.expires_at).toLocaleDateString('pt-BR')}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={`${statusInfo.color} border text-xs flex items-center gap-1 w-fit font-medium`}>
                                    {statusInfo.icon}
                                    {statusInfo.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {contextualActions.map((action, actionIndex) => (
                                      <Tooltip key={actionIndex}>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            variant={action.variant} 
                                            size="sm" 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              action.action();
                                            }}
                                          >
                                            {action.icon}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{action.label}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}
                                    
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingDocument(doc);
                                          setEditDialogOpen(true);
                                        }}>
                                          Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          className="text-red-600"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Tem certeza que deseja excluir este documento?')) {
                                              deleteDocument(doc.id);
                                            }
                                          }}
                                        >
                                          Excluir
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          
                          {/* Documentos Pendentes */}
                          {group.checklistItems
                            .filter(item => item.status === 'pendente')
                            .map((item, index) => (
                              <TableRow key={`pending-${group.employeeId}-${item.id}-${index}`} className="bg-blue-50">
                                <TableCell></TableCell>
                                <TableCell className="pl-12">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <div className="font-medium text-sm">
                                        {item.required_document_name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Documento obrigatório
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-gray-600">-</div>
                                </TableCell>
                                <TableCell>
                                  <Badge className="text-yellow-700 bg-yellow-100 border-yellow-200 border text-xs flex items-center gap-1 w-fit font-medium">
                                    <AlertCircle className="w-3 h-3" />
                                    Pendente de envio
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={(e) => handleUploadDocument(group.employeeId, e)}
                                      >
                                        <Upload className="w-4 h-4 mr-1" />
                                        Enviar
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Enviar documento</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))
                          }
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
              
              {filteredGroupedDocuments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhum colaborador encontrado</p>
                  <p className="text-sm">Não há colaboradores com documentos nesta categoria.</p>
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
      
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        preSelectedEmployeeId={selectedEmployeeForUpload}
      />
    </TooltipProvider>
  );
};