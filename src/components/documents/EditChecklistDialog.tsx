
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit3, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { requiredDocumentsService } from '@/services/requiredDocumentsService';
import { documentChecklistService } from '@/services/documentChecklistService';

interface ChecklistItem {
  id: string;
  name: string;
  required: boolean;
}

interface EditChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultChecklist: ChecklistItem[] = [
  { id: '1', name: 'Contrato de Trabalho', required: true },
  { id: '2', name: 'Carteira de Trabalho', required: true },
  { id: '3', name: 'CPF', required: true },
  { id: '4', name: 'RG', required: true },
  { id: '5', name: 'Comprovante de Residência', required: true },
  { id: '6', name: 'Atestado de Saúde Ocupacional', required: true },
  { id: '7', name: 'PIS/PASEP', required: true },
  { id: '8', name: 'Título de Eleitor', required: false }
];

export const EditChecklistDialog: React.FC<EditChecklistDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const { toast } = useToast();

  // Carregar documentos obrigatórios do banco de dados
  useEffect(() => {
    if (open && !initialLoad) {
      loadRequiredDocuments();
    }
  }, [open, initialLoad]);

  const loadRequiredDocuments = async () => {
    try {
      setLoading(true);
      
      const documents = await requiredDocumentsService.getRequiredDocuments();
      const checklistItems = requiredDocumentsService.convertToChecklistItems(documents);
      
      setChecklist(checklistItems);
      setInitialLoad(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os documentos obrigatórios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (newItemName.trim()) {
      try {
        setLoading(true);
        const newDocument = await requiredDocumentsService.createRequiredDocument({
          document_type: newItemName.trim().toLowerCase().replace(/\s+/g, '_'),
          name: newItemName.trim(),
          description: `Documento: ${newItemName.trim()}`,
          is_mandatory: true,
          category: 'documentos_pessoais',
          is_active: true
        });

        const newItem: ChecklistItem = {
          id: newDocument.id,
          name: newDocument.name,
          required: newDocument.is_mandatory
        };
        
        setChecklist(prev => [...prev, newItem]);
        setNewItemName('');
        
        toast({
          title: "Sucesso",
          description: "Documento adicionado com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o documento.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      setLoading(true);
      await requiredDocumentsService.removeRequiredDocument(id);
      setChecklist(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Documento removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o documento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (id: string, name: string) => {
    try {
      await requiredDocumentsService.updateDocumentName(id, name);
      setChecklist(prev => prev.map(item => 
        item.id === id ? { ...item, name } : item
      ));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o nome do documento.",
        variant: "destructive",
      });
    }
  };

  const handleToggleRequired = async (id: string) => {
    try {
      const item = checklist.find(item => item.id === id);
      if (!item) return;

      const newRequiredStatus = !item.required;
      await requiredDocumentsService.updateDocumentMandatory(id, newRequiredStatus);
      
      setChecklist(prev => prev.map(item => 
        item.id === id ? { ...item, required: newRequiredStatus } : item
      ));
      
      toast({
        title: "Sucesso",
        description: `Documento marcado como ${newRequiredStatus ? 'obrigatório' : 'opcional'}.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do documento.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      toast({
        title: "Sucesso",
        description: "Todas as alterações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Houve um problema ao salvar as alterações.",
        variant: "destructive",
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Editar Checklist de Documentos Obrigatórios
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Item */}
          <div className="flex gap-2">
            <Input
              placeholder="Nome do novo documento..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              className="flex-1"
            />
            <Button onClick={handleAddItem} size="sm" disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Documentos no Checklist ({checklist.length})
            </Label>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {checklist.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  
                  <div className="flex-1">
                    <Input
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, e.target.value)}
                      className="border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={item.required}
                        onChange={() => handleToggleRequired(item.id)}
                        className="rounded"
                      />
                      <span className={item.required ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {item.required ? 'Obrigatório' : 'Opcional'}
                      </span>
                    </label>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{checklist.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {checklist.filter(item => item.required).length}
              </div>
              <div className="text-xs text-gray-600">Obrigatórios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {checklist.filter(item => !item.required).length}
              </div>
              <div className="text-xs text-gray-600">Opcionais</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
