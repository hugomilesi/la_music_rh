
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocuments } from '@/hooks/useDocuments';
import { Document } from '@/types/document';
import { toast } from 'sonner';
import { formatDateToLocal } from '@/utils/dateUtils';
import { supabase } from '@/lib/supabase';

interface EditDocumentDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RequiredDocument {
  id: string;
  document_type: string;
  name: string;
  is_active: boolean;
}

export const EditDocumentDialog: React.FC<EditDocumentDialogProps> = ({
  document,
  open,
  onOpenChange
}) => {
  const { updateDocument, replaceDocument } = useDocuments();
  const [name, setName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [notes, setNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);

  // Load required documents from database
  useEffect(() => {
    const loadRequiredDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from('user_required_documents')
          .select('required_document_id, document_type, document_name, is_mandatory')
          .eq('is_mandatory', true)
          .order('document_name');

        if (error) throw error;
        
        // Mapear os dados para o formato esperado
        const mappedData = data?.map(item => ({
          id: item.required_document_id,
          document_type: item.document_type,
          name: item.document_name,
          is_active: true
        })) || [];
        
        setRequiredDocuments(mappedData);
      } catch (error) {
        toast.error('Erro ao carregar tipos de documento');
      }
    };

    if (open) {
      loadRequiredDocuments();
    }
  }, [open]);

  React.useEffect(() => {
    if (document) {
      setName(document.document_name || '');
      setDocumentType(document.document_type || '');
      setNotes(document.notes || '');
      setExpiryDate(document.expiry_date ? formatDateToLocal(new Date(document.expiry_date)) : '');
    }
  }, [document]);

  const handleSave = async () => {
    if (!document) return;

    setLoading(true);
    try {
      // Get the selected document name from the dropdown
      const selectedDoc = requiredDocuments.find(doc => doc.document_type === documentType);
      const documentName = selectedDoc ? selectedDoc.name : name;

      if (newFile) {
        // Replace the document file
        await replaceDocument(document.id, newFile);
        // Update document metadata after replacing file
        await updateDocument(document.id, {
          document: documentName,
          document_type: documentType,
          notes,
          expires_at: expiryDate || null
        });
        toast.success('Documento substituído com sucesso!');
      } else {
        // Update document metadata only
        await updateDocument(document.id, {
          document: documentName,
          document_type: documentType,
          notes,
          expires_at: expiryDate || null
        });
        toast.success('Documento atualizado com sucesso!');
      }
      
      onOpenChange(false);
      setNewFile(null);
    } catch (error) {
      // Log desabilitado: Error updating document
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
            <Label htmlFor="documentType">Tipo de Documento *</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                {requiredDocuments.map((doc) => (
                  <SelectItem key={doc.id} value={doc.document_type}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <p className="text-sm text-muted-foreground">{document.file_name}</p>
            <p className="text-sm text-muted-foreground">Tipo: {document.mime_type}</p>
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
            disabled={loading || !documentType}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
