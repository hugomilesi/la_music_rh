
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Document, DocumentStatus } from '@/types/document';
import { useDocuments } from '@/contexts/DocumentContext';
import { Download, Trash2, Edit, FileText, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDateToLocal } from '@/utils/dateUtils';

interface DocumentManagementDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentManagementDialog: React.FC<DocumentManagementDialogProps> = ({
  document,
  open,
  onOpenChange
}) => {
  const { updateDocument, deleteDocument, downloadDocument } = useDocuments();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    expiryDate: '',
    notes: ''
  });

  React.useEffect(() => {
    if (document) {
      setFormData({
        status: document.status,
        expiryDate: document.expiryDate || '',
        notes: document.notes || ''
      });
    }
  }, [document]);

  const handleSave = async () => {
    if (!document) return;
    
    await updateDocument(document.id, {
      status: formData.status as DocumentStatus,
      expiryDate: formData.expiryDate || null,
      notes: formData.notes
    });
    
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!document) return;
    await deleteDocument(document.id);
    onOpenChange(false);
  };

  const handleDownload = () => {
    if (!document) return;
    downloadDocument(document);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'válido': 'bg-green-100 text-green-800 border-green-200',
      'vencido': 'bg-red-100 text-red-800 border-red-200',
      'vencendo': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pendente': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gerenciar Documento
          </DialogTitle>
          <DialogDescription>
            Visualize, edite ou exclua informações do documento {document.document}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{document.document}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{document.employee}</span>
                </div>
              </div>
              <Badge className={getStatusBadge(document.status)}>
                {document.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Upload:</span>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>{new Date(document.uploadDate).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              
              {document.expiryDate && (
                <div>
                  <span className="text-gray-500">Validade:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{new Date(document.expiryDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              )}
            </div>
            
            {document.fileName && (
              <div className="text-sm border-t pt-3">
                <span className="text-gray-500">Arquivo:</span>
                <div className="mt-1">
                  <span className="font-medium">{document.fileName}</span>
                  {document.fileSize && (
                    <span className="text-gray-500 ml-2">({formatFileSize(document.fileSize)})</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Edit Form */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="válido">Válido</SelectItem>
                    <SelectItem value="vencendo">Vencendo</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expiryDate">Data de Validade</Label>
                <Input
                  type="date"
                  id="expiryDate"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  min={formatDateToLocal(new Date())}
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione observações..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {document.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Observações:</span>
                  <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded border">
                    {document.notes}
                  </p>
                </div>
              )}
              
              {document.uploadedBy && (
                <div className="text-sm">
                  <span className="text-gray-500">Enviado por:</span>
                  <span className="ml-2 font-medium">{document.uploadedBy}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza de que deseja excluir este documento? Esta ação não pode ser desfeita e o arquivo será removido permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  Salvar
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Fechar
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
