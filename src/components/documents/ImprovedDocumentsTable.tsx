import React, { useState, useMemo, useEffect } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { useEmployees } from '@/contexts/EmployeeContext';
import { Document } from '@/types/document';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
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
  AlertCircle,
  Search
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
  remainingDocuments: number;
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
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para diálogos
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedEmployeeForUpload, setSelectedEmployeeForUpload] = useState<string>('');

  // Carregar dados do checklist usando apenas colaboradores com documentos enviados
  const loadEmployeeSummaries = async () => {
    try {
      setLoading(true);
      console.log('ImprovedDocumentsTable: Iniciando carregamento de dados (apenas colaboradores com documentos)...');
      
      // Usar a nova função que busca apenas colaboradores com documentos enviados
      const summariesWithDocuments = await documentChecklistService.getEmployeesWithDocumentsSummary();
      console.log('ImprovedDocumentsTable: Colaboradores com documentos recebidos:', summariesWithDocuments?.length || 0);
      console.log('ImprovedDocumentsTable: Dados completos dos colaboradores:', summariesWithDocuments);
      
      // Criar mapa de checklist a partir dos summaries
      const checklistMap = new Map<string, DocumentChecklistItem[]>();
      
      summariesWithDocuments.forEach(summary => {
        checklistMap.set(summary.employee_id, summary.checklist_items);
      });
      
      setEmployeeSummaries(summariesWithDocuments);
      setChecklistData(checklistMap);
      
      console.log('ImprovedDocumentsTable: ChecklistData definido:', checklistMap.size, 'funcionários com documentos');
      
    } catch (error) {
      console.error('ImprovedDocumentsTable: Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos documentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('ImprovedDocumentsTable: Carregamento finalizado');
    }
  };

  useEffect(() => {
    loadEmployeeSummaries();
  }, []);

  // Processar dados dos colaboradores usando dados da view user_required_documents
  const groupedDocuments = useMemo(() => {
    const groups = new Map<string, EmployeeDocumentGroup>();

    console.log('ImprovedDocumentsTable: Iniciando processamento de grupos');
    console.log('ImprovedDocumentsTable: employeeSummaries:', employeeSummaries.length);
    console.log('ImprovedDocumentsTable: checklistData:', checklistData.size);

    // Processar todos os funcionários da view user_required_documents
    employeeSummaries.forEach(summary => {
      const checklistItems = checklistData.get(summary.employee_id) || [];
      
      console.log('ImprovedDocumentsTable: Processando funcionário:', {
        employee_id: summary.employee_id,
        employee_name: summary.employee_name,
        total_documents: summary.total_documents,
        validated_documents: summary.validated_documents,
        pending_documents: summary.pending_documents,
        checklist_items: checklistItems.length
      });

      // Extrair documentos enviados dos checklistItems (que já vêm da view)
      const sentDocuments = checklistItems
        .filter(item => item.document_id && (item.status === 'completo' || item.status === 'enviado' || item.status === 'aprovado'))
        .map(item => {
          // Buscar o documento completo no filteredDocuments usando o document_id
          const fullDocument = filteredDocuments.find(doc => doc.id === item.document_id);
          if (fullDocument) {
            return fullDocument;
          }
          // Se não encontrar, criar um documento básico com as informações disponíveis
          return {
            id: item.document_id,
            document_name: item.required_document_name,
            file_name: item.required_document_name,
            employee_id: summary.employee_id,
            status: item.status,
            created_at: item.created_at,
            updated_at: item.updated_at
          } as Document;
        });

      // Calcular contadores corretos baseados nos checklistItems
      const totalRequired = checklistItems.length;
      const completedDocuments = checklistItems.filter(item => 
        item.status === 'enviado' || item.status === 'aprovado' || item.status === 'completo'
      ).length;
      const validatedDocuments = checklistItems.filter(item => 
        item.status === 'aprovado' || item.status === 'completo'
      ).length;
      const pendingDocuments = checklistItems.filter(item => 
        item.status === 'pendente'
      ).length;
      const remainingDocuments = totalRequired - completedDocuments;

      console.log('ImprovedDocumentsTable: Documentos enviados encontrados:', {
        employee_id: summary.employee_id,
        employee_name: summary.employee_name,
        total_required: totalRequired,
        completed_documents: completedDocuments,
        validated_documents: validatedDocuments,
        pending_documents: pendingDocuments,
        remaining_documents: remainingDocuments,
        sent_documents: sentDocuments.length,
        document_names: sentDocuments.map(d => d.document_name || d.file_name)
      });

      // Criar grupo para o funcionário
      groups.set(summary.employee_id, {
        employeeId: summary.employee_id,
        employeeName: summary.employee_name || 'Nome não encontrado',
        documents: sentDocuments, // Usar documentos enviados extraídos da view
        totalDocuments: totalRequired,
        validDocuments: validatedDocuments,
        expiringDocuments: summary.expiring_documents || 0,
        expiredDocuments: summary.expired_documents || 0,
        pendingDocuments: pendingDocuments,
        checklistItems: checklistItems,
        completionRate: totalRequired > 0 ? Math.round((completedDocuments / totalRequired) * 100) : 0,
        remainingDocuments: remainingDocuments
      });
    });

    // Calcular taxa de conclusão baseada em documentos enviados/aprovados
    groups.forEach(group => {
      const totalRequired = group.checklistItems.length;
      const completedDocuments = group.checklistItems.filter(item => 
        item.status === 'enviado' || item.status === 'aprovado' || item.status === 'completo'
      ).length;
      group.completionRate = totalRequired > 0 ? Math.round((completedDocuments / totalRequired) * 100) : 0;
      
      console.log('ImprovedDocumentsTable: Taxa de conclusão calculada:', {
        employee_name: group.employeeName,
        total_required: totalRequired,
        completed_documents: completedDocuments,
        completion_rate: group.completionRate
      });
    });

    // Ordenação inteligente: priorizar pendentes e vencendo
    const result = Array.from(groups.values()).sort((a, b) => {
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
    
    console.log('ImprovedDocumentsTable: Grupos processados:', result.length);
    return result;
  }, [filteredDocuments, employeeSummaries, checklistData]);

  // Filtrar colaboradores que têm documentos para exibir (apenas com ao menos um documento enviado)
  const filteredGroupedDocuments = useMemo(() => {
    let filtered = groupedDocuments.filter(group => {
      // Verificar se tem ao menos um documento enviado, aprovado ou completo
      const hasAtLeastOneSentDocument = group.checklistItems.some(item => 
        item.status === 'enviado' || item.status === 'aprovado' || item.status === 'completo'
      );
      
      console.log('ImprovedDocumentsTable: Filtro por documento enviado:', {
        employee_name: group.employeeName,
        has_sent_document: hasAtLeastOneSentDocument,
        checklist_items: group.checklistItems.map(item => ({
          name: item.required_document_name,
          status: item.status
        }))
      });
      
      return hasAtLeastOneSentDocument;
    });

    // Aplicar filtro de busca por nome
    if (searchTerm.trim()) {
      filtered = filtered.filter(group => 
        group.employeeName.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }
     
    console.log('ImprovedDocumentsTable: Grupos filtrados final:', filtered.length);
    console.log('ImprovedDocumentsTable: Termo de busca:', searchTerm);
    return filtered;
  }, [groupedDocuments, searchTerm]);

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
      case 'vencendo': {
        const daysUntilExpiry = doc.expires_at ? 
          Math.ceil((new Date(doc.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          label: `Vencendo em ${daysUntilExpiry} dias`,
          color: 'text-yellow-700 bg-yellow-100 border-yellow-300',
          priority: 2
        };
      }
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentos por Colaborador
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome do colaborador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadEmployeeSummaries}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
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
                                {group.remainingDocuments > 0 
                                  ? `${group.remainingDocuments} documentos restantes para completar`
                                  : `${group.validDocuments}/${group.checklistItems.length} documentos válidos - Completo`
                                }
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
                          
                          {/* Documentos Pendentes (da view user_required_documents) */}
                          {group.checklistItems
                            .filter(item => item.status === 'pendente' && !item.document_id)
                            .map((item, index) => (
                              <TableRow key={`pending-${group.employeeId}-${item.required_document_id}-${index}`} className="bg-blue-50">
                                <TableCell></TableCell>
                                <TableCell className="pl-12">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    <div>
                                      <div className="font-medium text-sm">
                                        {item.required_document_name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Documento obrigatório pendente
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-gray-600">
                                    <span className="text-orange-600">Aguardando envio</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className="text-orange-700 bg-orange-100 border-orange-200 border text-xs flex items-center gap-1 w-fit font-medium">
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
                                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                                        onClick={(e) => handleUploadDocument(group.employeeId, e)}
                                      >
                                        <Upload className="w-4 h-4 mr-1" />
                                        Enviar
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Enviar documento obrigatório</p>
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