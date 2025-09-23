import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, XCircle, Upload } from 'lucide-react';
import { useDocuments } from '@/contexts/DocumentContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { extractDocumentTypeFromPath, getDocumentStatus } from '@/utils/documentUtils';
import { supabase } from '@/integrations/supabase/client';

interface DocumentChecklistProps {
  employeeId?: string;
  onUploadDocument?: (employeeId: string, documentType: string) => void;
}

interface RequiredDocument {
  id: string;
  document_type: string;
  name: string;
  description: string;
  is_mandatory: boolean;
}

interface EmployeeDocumentStatus {
  employeeId: string;
  employeeName: string;
  requiredDocuments: {
    id: string;
    type: string;
    name: string;
    status: 'completo' | 'pendente' | 'vencendo' | 'vencido';
    document?: any;
    mandatory: boolean;
  }[];
  completionRate: number;
  pendingMandatory: number;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  employeeId,
  onUploadDocument
}) => {
  const { filteredDocuments } = useDocuments();
  const { employees } = useEmployees();
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar documentos obrigatórios do banco de dados usando a nova view
  useEffect(() => {
    const fetchRequiredDocuments = async () => {
      try {
        // Usar a nova view para melhor sincronização
        const { data, error } = await supabase
          .from('user_required_documents')
          .select('*')
          .limit(1); // Apenas para verificar se a view existe

        if (error) {
          console.error('View não encontrada, usando método tradicional:', error);
          // Fallback para método tradicional
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('required_documents')
            .select('id, document_type, name, description, is_mandatory')
            .eq('is_active', true)
            .order('name');

          if (fallbackError) {
            console.error('Erro ao buscar documentos obrigatórios:', fallbackError);
            return;
          }

          setRequiredDocuments(fallbackData || []);
        } else {
          // Usar a view para obter documentos únicos
          const { data: viewData, error: viewError } = await supabase
            .from('user_required_documents')
            .select('required_document_id, document_name, document_type, description, is_mandatory')
            .eq('is_active', true);

          if (viewError) {
            console.error('Erro ao buscar via view:', viewError);
            return;
          }

          // Extrair documentos únicos da view
          const uniqueDocuments = viewData?.reduce((acc, item) => {
            const existingDoc = acc.find(doc => doc.id === item.required_document_id);
            if (!existingDoc) {
              acc.push({
                id: item.required_document_id,
                document_type: item.document_type,
                name: item.document_name,
                description: item.description,
                is_mandatory: item.is_mandatory
              });
            }
            return acc;
          }, [] as RequiredDocument[]) || [];

          setRequiredDocuments(uniqueDocuments);

          // Verificar se há problemas de sincronização e executar sync se necessário
          const { data: syncData, error: syncError } = await supabase
            .from('user_required_documents')
            .select('sync_status')
            .neq('sync_status', 'synchronized');

          if (!syncError && syncData && syncData.length > 0) {
            console.log('Problemas de sincronização detectados, executando sincronização...');
            const { error: syncFunctionError } = await supabase.rpc('sync_user_required_documents');
            if (syncFunctionError) {
              console.error('Erro na sincronização:', syncFunctionError);
            } else {
              console.log('Sincronização executada com sucesso');
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar documentos obrigatórios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequiredDocuments();
  }, []);

  const employeeDocumentStatus = useMemo(() => {
    if (loading || requiredDocuments.length === 0) return null;

    if (employeeId) {
      // Single employee view
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return null;

      const employeeDocuments = filteredDocuments.filter(doc => doc.employeeId === employeeId);
      
      const requiredDocumentsStatus = requiredDocuments.map(reqDoc => {
        const existingDoc = employeeDocuments.find(doc => 
          extractDocumentTypeFromPath(doc.file_path).toLowerCase().includes(reqDoc.name.toLowerCase()) ||
          doc.document.toLowerCase().includes(reqDoc.document_type.toLowerCase())
        );

        let status: 'completo' | 'pendente' | 'vencendo' | 'vencido' = 'pendente';
        
        if (existingDoc) {
          const docStatus = getDocumentStatus(existingDoc.expires_at);
          switch (docStatus) {
            case 'válido':
              status = 'completo';
              break;
            case 'vencendo':
              status = 'vencendo';
              break;
            case 'vencido':
              status = 'vencido';
              break;
            default:
              status = 'pendente';
          }
        }

        return {
          id: reqDoc.id,
          type: reqDoc.document_type,
          name: reqDoc.name,
          status,
          document: existingDoc,
          mandatory: reqDoc.is_mandatory
        };
      });

      // Only count mandatory documents for completion rate and pending count
      const mandatoryDocuments = requiredDocumentsStatus.filter(doc => doc.mandatory);
      const totalMandatory = mandatoryDocuments.length;
      const completedMandatory = mandatoryDocuments.filter(doc => doc.status === 'completo').length;
      const pendingMandatory = mandatoryDocuments.filter(doc => doc.status === 'pendente').length;

      return {
        employeeId,
        employeeName: employee.name,
        requiredDocuments: requiredDocumentsStatus,
        completionRate: totalMandatory > 0 ? Math.round((completedMandatory / totalMandatory) * 100) : 100,
        pendingMandatory
      };
    } else {
      // All employees overview
      return employees.map(employee => {
        const employeeDocuments = filteredDocuments.filter(doc => doc.employeeId === employee.id);
        
        const requiredDocumentsStatus = requiredDocuments.map(reqDoc => {
          const existingDoc = employeeDocuments.find(doc => 
            extractDocumentTypeFromPath(doc.file_path).toLowerCase().includes(reqDoc.name.toLowerCase()) ||
            doc.document.toLowerCase().includes(reqDoc.document_type.toLowerCase())
          );

          let status: 'completo' | 'pendente' | 'vencendo' | 'vencido' = 'pendente';
          
          if (existingDoc) {
            const docStatus = getDocumentStatus(existingDoc.expires_at);
            switch (docStatus) {
              case 'válido':
                status = 'completo';
                break;
              case 'vencendo':
                status = 'vencendo';
                break;
              case 'vencido':
                status = 'vencido';
                break;
              default:
                status = 'pendente';
            }
          }

          return {
            id: reqDoc.id,
            type: reqDoc.document_type,
            name: reqDoc.name,
            status,
            document: existingDoc,
            mandatory: reqDoc.is_mandatory
          };
        });

        // Only count mandatory documents for completion rate and pending count
        const mandatoryDocuments = requiredDocumentsStatus.filter(doc => doc.mandatory);
        const totalMandatory = mandatoryDocuments.length;
        const completedMandatory = mandatoryDocuments.filter(doc => doc.status === 'completo').length;
        const pendingMandatory = mandatoryDocuments.filter(doc => doc.status === 'pendente').length;

        return {
          employeeId: employee.id,
          employeeName: employee.name,
          requiredDocuments: requiredDocumentsStatus,
          completionRate: totalMandatory > 0 ? Math.round((completedMandatory / totalMandatory) * 100) : 100,
          pendingMandatory
        };
      });
    }
  }, [employeeId, employees, filteredDocuments, requiredDocuments, loading]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completo':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'vencendo':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'vencido':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string, mandatory: boolean) => {
    const baseClasses = "text-xs px-2 py-1";
    
    switch (status) {
      case 'completo':
        return <Badge className={`${baseClasses} bg-green-100 text-green-800`}>Completo</Badge>;
      case 'vencendo':
        return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Vencendo</Badge>;
      case 'vencido':
        return <Badge className={`${baseClasses} bg-red-100 text-red-800`}>Vencido</Badge>;
      default:
        return (
          <Badge className={`${baseClasses} ${
            mandatory 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {mandatory ? 'OBRIGATÓRIO - Pendente' : 'Pendente'}
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

  if (employeeId && employeeDocumentStatus && !Array.isArray(employeeDocumentStatus)) {
    // Single employee view
    const employee = employeeDocumentStatus as EmployeeDocumentStatus;
    
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
            {employee.requiredDocuments.map((doc) => {
              const requiredDoc = requiredDocuments.find(rd => rd.document_type === doc.type);
              return (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(doc.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{doc.name}</span>
                        {doc.mandatory && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            OBRIGATÓRIO
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{requiredDoc?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(doc.status, doc.mandatory)}
                    {doc.status === 'pendente' && onUploadDocument && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onUploadDocument(employee.employeeId, doc.type)}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Enviar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (Array.isArray(employeeDocumentStatus)) {
    // All employees overview
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Colaboradores com Documentos Obrigatórios Pendentes
          </CardTitle>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {employee.requiredDocuments
                      .filter(doc => doc.mandatory && doc.status === 'pendente')
                      .map((doc) => (
                        <div key={doc.id} className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">{doc.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};