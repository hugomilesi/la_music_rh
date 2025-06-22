
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Document, DocumentStatus } from '@/types/document';
import { useDocuments } from '@/contexts/DocumentContext';
import { Download, Trash2, Edit } from 'lucide-react';

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
  const { updateDocument, deleteDocument } = useDocuments();
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

  const handleSave = () => {
    if (!document) return;
    
    updateDocument(document.id, {
      status: formData.status as DocumentStatus,
      expiryDate: formData.expiryDate || null,
      notes: formData.notes
    });
    
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!document) return;
    deleteDocument(document.id);
    onOpenChange(false);
  };

  const handleDownload = () => {
    if (!document) return;
    console.log(`Downloading document: ${document.fileName}`);
    // Simulate download
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Documento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium">{document.document}</h3>
            <p className="text-sm text-gray-600">{document.employee}</p>
            <p className="text-xs text-gray-500 mt-1">
              Uploaded: {new Date(document.uploadDate).toLocaleDateString('pt-BR')}
            </p>
            {document.fileName && (
              <p className="text-xs text-gray-500">
                Arquivo: {document.fileName} ({(document.fileSize! / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Edit Form */}
          {isEditing ? (
            <div className="space-y-3">
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
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  document.status === 'válido' ? 'text-green-600' :
                  document.status === 'vencido' ? 'text-red-600' :
                  document.status === 'vencendo' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {document.status}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Validade:</span>
                <span className="text-sm">
                  {document.expiryDate ? new Date(document.expiryDate).toLocaleDateString('pt-BR') : 'Sem validade'}
                </span>
              </div>
              
              {document.notes && (
                <div>
                  <span className="text-sm text-gray-600">Observações:</span>
                  <p className="text-sm mt-1">{document.notes}</p>
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
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza de que deseja excluir este documento? Esta ação não pode ser desfeita.
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
