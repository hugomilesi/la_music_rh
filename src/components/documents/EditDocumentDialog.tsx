
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocuments } from '@/contexts/DocumentContext';
import { Document } from '@/types/document';
import { toast } from 'sonner';

interface EditDocumentDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditDocumentDialog: React.FC<EditDocumentDialogProps> = ({
  document,
  open,
  onOpenChange
}) => {
  const { updateDocument, replaceDocument } = useDocuments();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (document) {
      setName(document.document || '');
      setNotes(document.notes || '');
      setExpiryDate(document.expiryDate ? new Date(document.expiryDate).toISOString().split('T')[0] : '');
    }
  }, [document]);

  const handleSave = async () => {
    if (!document) return;

    setLoading(true);
    try {
      if (newFile) {
        // Replace the document file
        await replaceDocument(document.id, newFile, {
          document: name || document.document,
          notes,
          expiryDate: expiryDate || null
        });
        toast.success('Documento substituído com sucesso!');
      } else {
        // Update document metadata only
        await updateDocument(document.id, {
          document: name || document.document,
          notes,
          expiryDate: expiryDate || null
        });
        toast.success('Documento atualizado com sucesso!');
      }
      
      onOpenChange(false);
      setNewFile(null);
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Erro ao atualizar documento');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFile(file);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Documento</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do documento"
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o documento"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="expiry">Data de Validade</Label>
            <Input
              id="expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="file">Substituir Arquivo (opcional)</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {newFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Novo arquivo: {newFile.name}
              </p>
            )}
          </div>

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium">Arquivo atual:</p>
            <p className="text-sm text-muted-foreground">{document.fileName}</p>
            <p className="text-sm text-muted-foreground">Tipo: {document.type}</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
