
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Mail, FileText, Search, Package, Eye, Edit, Trash2 } from 'lucide-react';
import { useDocuments } from '@/contexts/DocumentContext';
import { Document } from '@/types/document';
import { EditDocumentDialog } from './EditDocumentDialog';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (!employeeId) return null;

  const employeeDocuments = getDocumentsByEmployee(employeeId);
  const filteredDocuments = employeeDocuments.filter(doc =>
    doc.document.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      'válido': 'bg-green-100 text-green-800',
      'vencido': 'bg-red-100 text-red-800',
      'vencendo': 'bg-yellow-100 text-yellow-800',
      'pendente': 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'obrigatorio': 'bg-red-50 text-red-700 border-red-200',
      'temporario': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'complementar': 'bg-blue-50 text-blue-700 border-blue-200'
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
                    <TableCell className="font-medium">{doc.document}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(doc.type)}>
                        {doc.type === 'obrigatorio' ? 'Obrigatório' : 
                         doc.type === 'temporario' ? 'Temporário' : 'Complementar'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(doc.uploadDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('pt-BR') : 'Sem validade'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(doc.status)}>
                        {doc.status}
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
