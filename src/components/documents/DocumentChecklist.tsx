import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, XCircle, Upload, Eye, Download } from 'lucide-react';
import { useEmployees } from '@/contexts/EmployeeContext';
import { supabase } from '@/integrations/supabase/client';
import { useDocuments } from '@/hooks/useDocuments';

interface DocumentChecklistProps {
  employeeId?: string;
  onUploadDocument?: (employeeId: string, documentType: string) => void;
}

interface UserRequiredDocument {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  employee_position: string;
  employee_department: string;
  employee_unit: string;
  required_document_id: string;
  document_name: string;
  document_type: string;
  document_description: string;
  is_mandatory: boolean;
  document_category: string;
  status: string;
  document_id: string | null;
  file_name: string | null;
  file_path: string | null;
  expiry_date: string | null;
  document_uploaded_at: string | null;
  document_updated_at: string | null;
  checklist_created_at: string | null;
  checklist_updated_at: string | null;
}

interface EmployeeDocumentStatus {
  employeeId: string;
  employeeName: string;
  requiredDocuments: {
    id: string;
    type: string;
    name: string;
    description: string;
    status: 'completo' | 'pendente' | 'vencendo' | 'vencido';
    mandatory: boolean;
    document_id: string | null;
    file_name: string | null;
    file_path: string | null;
    expiry_date: string | null;
  }[];
  completionRate: number;
  pendingMandatory: number;
}

interface ProcessedDocumentData {
  employee_id: string;
  employee_name: string;
  required_document_id: string;
  document_type: string;
  document_name: string;
  document_description: string;
  is_mandatory: boolean;
  status: string;
  document_id: string | null;
  file_name: string | null;
  file_path: string | null;
  expiry_date: string | null;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  employeeId,
  onUploadDocument
}) => {
  const { employees } = useEmployees();
  const { viewDocument, downloadDocument } = useDocuments();
  const [employeeDocumentStatus, setEmployeeDocumentStatus] = useState<EmployeeDocumentStatus[] | ProcessedDocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRequiredDocuments, setUserRequiredDocuments] = useState<UserRequiredDocument[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('user_required_documents')
        .select('*')
        .order('employee_name', { ascending: true });

      if (error) {
        throw error;
      }
      
      setUserRequiredDocuments(data || []);
    } catch (err) {
      // Handle error silently or show user-friendly message
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Setup real-time subscription for documents table
    const documentsSubscription = supabase
      .channel(`documents-checklist-changes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'documents'
      }, () => {
        fetchData();
      })
      .subscribe();

    // Setup real-time subscription for user_required_documents view changes
    // Note: Views don't trigger postgres_changes directly, but we can listen to the underlying tables
    const requiredDocsSubscription = supabase
      .channel(`required-docs-checklist-changes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'required_documents'
      }, () => {
        fetchData();
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(documentsSubscription);
      supabase.removeChannel(requiredDocsSubscription);
    };
  }, []);

  const employeeDocumentStatus = useMemo(() => {
    if (loading || userRequiredDocuments.length === 0) {
      return null;
    }

    if (employeeId) {
      // Single employee view
      const employeeDocuments = userRequiredDocuments.filter(doc => doc.employee_id === employeeId);
      
      if (employeeDocuments.length === 0) {
        return null;
      }

      const totalDocuments = employeeDocuments.length;
      const completedDocuments = employeeDocuments.filter(doc => 
        doc.status === 'completo' || doc.status === 'enviado' || doc.document_id !== null
      ).length;
      const pendingDocuments = employeeDocuments.filter(doc => 
        doc.status === 'pendente' && doc.document_id === null
      ).length;
      const expiringDocuments = employeeDocuments.filter(doc => doc.status === 'vencendo').length;
      const expiredDocuments = employeeDocuments.filter(doc => doc.status === 'vencido').length;
      const mandatoryPending = employeeDocuments.filter(doc => 
        doc.is_mandatory && (doc.status === 'pendente' && doc.document_id === null)
      ).length;

      const completionRate = totalDocuments > 0 ? Math.round((completedDocuments / totalDocuments) * 100) : 0;

      return [{
        employeeId,
        employeeName: employeeDocuments[0]?.employee_name || 'Funcionário',
        totalDocuments,
        completedDocuments,
        pendingDocuments,
        expiringDocuments,
        expiredDocuments,
        pendingMandatory: mandatoryPending,
        completionRate,
        documents: employeeDocuments
      }];
    } else {
      // All employees overview - agrupar por funcionário
      const employeeGroups = userRequiredDocuments.reduce((acc, doc) => {
        if (!acc[doc.employee_id]) {
          acc[doc.employee_id] = {
            employeeId: doc.employee_id,
            employeeName: doc.employee_name,
            documents: []
          };
        }
        acc[doc.employee_id].documents.push(doc);
        return acc;
      }, {} as Record<string, { employeeId: string; employeeName: string; documents: UserRequiredDocument[] }>);

      const result = Object.values(employeeGroups).map(group => {
        const totalDocuments = group.documents.length;
        const completedDocuments = group.documents.filter(doc => 
          doc.status === 'completo' || doc.status === 'enviado' || doc.document_id !== null
        ).length;
        const pendingDocuments = group.documents.filter(doc => 
          doc.status === 'pendente' && doc.document_id === null
        ).length;
        const expiringDocuments = group.documents.filter(doc => doc.status === 'vencendo').length;
        const expiredDocuments = group.documents.filter(doc => doc.status === 'vencido').length;
        const mandatoryPending = group.documents.filter(doc => 
          doc.is_mandatory && (doc.status === 'pendente' && doc.document_id === null)
        ).length;

        const completionRate = totalDocuments > 0 ? Math.round((completedDocuments / totalDocuments) * 100) : 0;

        return {
          employeeId: group.employeeId,
          employeeName: group.employeeName,
          totalDocuments,
          completedDocuments,
          pendingDocuments,
          expiringDocuments,
          expiredDocuments,
          pendingMandatory: mandatoryPending,
          completionRate,
          documents: group.documents
        };
      }).filter(employee => employee.pendingMandatory > 0); // Mostrar apenas funcionários com documentos obrigatórios pendentes

      return result;
    }
  }, [employeeId, userRequiredDocuments, loading]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completo':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'vencendo':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'vencido':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string, mandatory: boolean) => {
    const baseClasses = "text-xs font-medium px-2 py-1 rounded";
    
    switch (status) {
      case 'completo':
        return <Badge className={`${baseClasses} bg-green-100 text-green-800`}>Completo</Badge>;
      case 'vencendo':
        return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Vencendo</Badge>;
      case 'vencido':
        return <Badge className={`${baseClasses} bg-red-100 text-red-800`}>Vencido</Badge>;
      default:
        return (
          <Badge 
            className={`${baseClasses} ${
              mandatory 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Pendente
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando documentos obrigatórios...</div>
        </CardContent>
      </Card>
    );
  }

  if (employeeId && employeeDocumentStatus && Array.isArray(employeeDocumentStatus) && employeeDocumentStatus.length > 0) {
    // Single employee view
    const employee = employeeDocumentStatus[0];
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Checklist de Documentos - {employee.employeeName}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {employee.completionRate}% Completo
              </Badge>
              {employee.pendingMandatory > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {employee.pendingMandatory} Obrigatórios Pendentes
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employee.documents.map((doc) => (
              <div key={`${doc.employee_id}-${doc.required_document_id}`} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(doc.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{doc.document_name}</span>
                      {doc.is_mandatory && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                          OBRIGATÓRIO
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{doc.document_description}</p>
                    {doc.file_name && (
                      <p className="text-xs text-blue-600">Arquivo: {doc.file_name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(doc.status, doc.is_mandatory)}
                  {doc.status === 'pendente' && onUploadDocument && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onUploadDocument(employee.employeeId, doc.document_type)}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Enviar
                    </Button>
                  )}
                  {doc.status !== 'pendente' && doc.document_id && (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => viewDocument({ id: doc.document_id, file_path: doc.file_path })}
                        title="Visualizar documento"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => downloadDocument({ id: doc.document_id, file_path: doc.file_path, name: doc.file_name })}
                        title="Baixar documento"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (Array.isArray(employeeDocumentStatus) && !employeeId) {
    // All employees overview - Documentos por Colaborador
    return (
      <div className="space-y-6">
        {/* Tabela de Documentos por Colaborador */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos por Colaborador</CardTitle>
          </CardHeader>
          <CardContent>
            {employeeDocumentStatus.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-green-600">Todos os colaboradores estão em dia!</p>
                <p className="text-sm">Não há documentos obrigatórios pendentes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {employeeDocumentStatus.map((employee) => (
                  <div key={employee.employeeId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{employee.employeeName}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">
                          {employee.pendingMandatory} Obrigatórios Pendentes
                        </Badge>
                        <Badge variant="outline">
                          {employee.completionRate}% Completo
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Lista de documentos pendentes */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Documentos Pendentes:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {employee.documents
                          .filter(doc => doc.is_mandatory && doc.status === 'pendente')
                          .map((doc) => (
                            <div key={`${doc.employee_id}-${doc.required_document_id}`} className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-medium text-red-800">{doc.document_name}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};