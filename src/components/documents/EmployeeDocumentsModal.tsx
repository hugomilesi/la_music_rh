
import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Mail, FileText, Search, Package, Eye, Edit, Trash2, Lock } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { Document } from '@/types/document';
import { EditDocumentDialog } from './EditDocumentDialog';
import { extractDocumentTypeFromPath, formatExpiryDate, getDocumentStatus } from '@/utils/documentUtils';

interface EmployeeDocumentsModalProps {
  employeeId: string | null;
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendToAccountant?: (documents: Document[]) => void;
}

export const EmployeeDocumentsModal: React.FC<EmployeeDocumentsModalProps> = ({
  employeeId,
  employeeName,
  open,
  onOpenChange,
  onSendToAccountant
}) => {
  const { getDocumentsByEmployee, downloadDocument, exportDocumentsByEmployee, viewDocument, deleteDocument } = useDocuments();
  const { canViewModule } = usePermissionsV2();
  const [employeeDocuments, setEmployeeDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Verificar se o usuário tem permissão para gerenciar colaboradores
  const canViewDocuments = useMemo(() => canViewModule('documentos'), [canViewModule]);

  useEffect(() => {
    if (employeeId) {
      setLoading(true);
      setError(null);
      
      getDocumentsByEmployee(employeeId)
        .then((docs) => {
          setEmployeeDocuments(Array.isArray(docs) ? docs : []);
        })
        .catch((err) => {
    
          setError('Erro ao carregar documentos do funcionário');
          setEmployeeDocuments([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [employeeId, getDocumentsByEmployee]);

  if (!employeeId) return null;

  const filteredDocuments = Array.isArray(employeeDocuments) 
     ? employeeDocuments.filter(doc =>
         doc.document_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase())
       )
     : [];

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
      'Carteira de Trabalho': 'bg-red-50 text-red-700 border-red-200',
      'CPF': 'bg-red-50 text-red-700 border-red-200',
      'RG': 'bg-red-50 text-red-700 border-red-200',
      'Comprovante de Residência': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Atestado de Saúde Ocupacional': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'PIS/PASEP': 'bg-blue-50 text-blue-700 border-blue-200',
      'Título de Eleitor': 'bg-blue-50 text-blue-700 border-blue-200',
      'Atestado Médico': 'bg-blue-50 text-blue-700 border-blue-200',
      'Certificado de Curso': 'bg-blue-50 text-blue-700 border-blue-200',
      'Carteira Médica': 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const handleExportEmployee = (format: 'pdf' | 'excel') => {
    exportDocumentsByEmployee(employeeId, format);
  };

  const handleSendToAccountant = () => {
    if (onSendToAccountant) {
      onSendToAccountant(filteredDocuments);
    }
  };

  // Se não tem permissão, mostrar modal de acesso negado
  if (!canViewDocuments) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              Acesso Negado
            </DialogTitle>
            <DialogDescription>
              Você não tem permissão para visualizar documentos de colaboradores.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos de {employeeName}
            <Badge variant="secondary">{employeeDocuments.length} documento(s)</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => handleExportEmployee('excel')}>
              <Package className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportEmployee('pdf')}>
              <Package className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleSendToAccountant}>
              <Mail className="w-4 h-4 mr-2" />
              Enviar ao Contador
            </Button>
          </div>

          {/* Documents Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data Upload</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.document_name}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(extractDocumentTypeFromPath(doc.file_path))}>
                        {extractDocumentTypeFromPath(doc.file_path)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      {formatExpiryDate(doc.expires_at)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(getDocumentStatus(doc.expires_at))}>
                        {getDocumentStatus(doc.expires_at)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => viewDocument(doc)}
                          title="Visualizar documento"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => downloadDocument(doc)}
                          title="Baixar documento"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
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
                          onClick={() => {
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
              </TableBody>
            </Table>
            
            {filteredDocuments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhum documento encontrado com o termo de busca.' : 'Nenhum documento encontrado para este funcionário.'}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
      
      <EditDocumentDialog
        document={editingDocument}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingDocument(null);
        }}
      />
    </>
  );
};
