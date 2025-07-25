import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Clock, FileText, Upload } from 'lucide-react';
import { useDocuments } from '@/contexts/DocumentContext';
import { useEmployees } from '@/contexts/EmployeeContext';

interface DocumentChecklistProps {
  employeeId?: string;
  onUploadDocument?: (employeeId: string, documentType: string) => void;
}

interface RequiredDocument {
  type: string;
  name: string;
  description: string;
  mandatory: boolean;
}

interface EmployeeDocumentStatus {
  employeeId: string;
  employeeName: string;
  requiredDocuments: {
    type: string;
    name: string;
    status: 'completo' | 'pendente' | 'vencendo' | 'vencido';
    document?: any;
    mandatory: boolean;
  }[];
  completionRate: number;
  pendingMandatory: number;
}

const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  {
    type: 'contrato_trabalho',
    name: 'Contrato de Trabalho',
    description: 'Contrato de trabalho assinado',
    mandatory: true
  },
  {
    type: 'carteira_trabalho',
    name: 'Carteira de Trabalho',
    description: 'Cópia da carteira de trabalho',
    mandatory: true
  },
  {
    type: 'cpf',
    name: 'CPF',
    description: 'Cópia do CPF',
    mandatory: true
  },
  {
    type: 'rg',
    name: 'RG',
    description: 'Cópia do RG ou documento de identidade',
    mandatory: true
  },
  {
    type: 'comprovante_residencia',
    name: 'Comprovante de Residência',
    description: 'Comprovante de residência atualizado',
    mandatory: true
  },
  {
    type: 'titulo_eleitor',
    name: 'Título de Eleitor',
    description: 'Cópia do título de eleitor',
    mandatory: false
  },
  {
    type: 'certificado_reservista',
    name: 'Certificado de Reservista',
    description: 'Certificado de reservista (para homens)',
    mandatory: false
  },
  {
    type: 'certidao_nascimento',
    name: 'Certidão de Nascimento',
    description: 'Certidão de nascimento ou casamento',
    mandatory: false
  },
  {
    type: 'comprovante_escolaridade',
    name: 'Comprovante de Escolaridade',
    description: 'Diploma ou certificado de conclusão',
    mandatory: false
  },
  {
    type: 'foto_3x4',
    name: 'Foto 3x4',
    description: 'Foto 3x4 recente',
    mandatory: false
  }
];

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  employeeId,
  onUploadDocument
}) => {
  const { filteredDocuments } = useDocuments();
  const { employees } = useEmployees();

  const employeeDocumentStatus = useMemo(() => {
    if (employeeId) {
      // Single employee view
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return null;

      const employeeDocuments = filteredDocuments.filter(doc => doc.employeeId === employeeId);
      
      const requiredDocuments = REQUIRED_DOCUMENTS.map(reqDoc => {
        const existingDoc = employeeDocuments.find(doc => 
          doc.document.toLowerCase().includes(reqDoc.type.toLowerCase()) ||
          doc.type === reqDoc.type
        );

        let status: 'completo' | 'pendente' | 'vencendo' | 'vencido' = 'pendente';
        
        if (existingDoc) {
          switch (existingDoc.status) {
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
          type: reqDoc.type,
          name: reqDoc.name,
          status,
          document: existingDoc,
          mandatory: reqDoc.mandatory
        };
      });

      const totalRequired = REQUIRED_DOCUMENTS.length;
      const completed = requiredDocuments.filter(doc => doc.status === 'completo').length;
      const pendingMandatory = requiredDocuments.filter(doc => doc.mandatory && doc.status === 'pendente').length;

      return {
        employeeId,
        employeeName: employee.name,
        requiredDocuments,
        completionRate: Math.round((completed / totalRequired) * 100),
        pendingMandatory
      };
    } else {
      // All employees overview
      return employees.map(employee => {
        const employeeDocuments = filteredDocuments.filter(doc => doc.employeeId === employee.id);
        
        const requiredDocuments = REQUIRED_DOCUMENTS.map(reqDoc => {
          const existingDoc = employeeDocuments.find(doc => 
            doc.document.toLowerCase().includes(reqDoc.type.toLowerCase()) ||
            doc.type === reqDoc.type
          );

          let status: 'completo' | 'pendente' | 'vencendo' | 'vencido' = 'pendente';
          
          if (existingDoc) {
            switch (existingDoc.status) {
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
            type: reqDoc.type,
            name: reqDoc.name,
            status,
            document: existingDoc,
            mandatory: reqDoc.mandatory
          };
        });

        const totalRequired = REQUIRED_DOCUMENTS.length;
        const completed = requiredDocuments.filter(doc => doc.status === 'completo').length;
        const pendingMandatory = requiredDocuments.filter(doc => doc.mandatory && doc.status === 'pendente').length;

        return {
          employeeId: employee.id,
          employeeName: employee.name,
          requiredDocuments,
          completionRate: Math.round((completed / totalRequired) * 100),
          pendingMandatory
        };
      }).filter(emp => emp.pendingMandatory > 0); // Only show employees with pending mandatory docs
    }
  }, [employeeId, employees, filteredDocuments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completo':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'vencendo':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'vencido':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
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
            {employee.requiredDocuments.map((doc) => (
              <div key={doc.type} className="flex items-center justify-between p-3 border rounded-lg">
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
                    <p className="text-sm text-gray-600">{REQUIRED_DOCUMENTS.find(rd => rd.type === doc.type)?.description}</p>
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
            ))}
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
                        <div key={doc.type} className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
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