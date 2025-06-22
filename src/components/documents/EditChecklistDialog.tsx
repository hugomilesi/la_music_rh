
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Edit3, GripVertical } from 'lucide-react';

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
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [newItemName, setNewItemName] = useState('');

  const handleAddItem = () => {
    if (newItemName.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        required: true
      };
      setChecklist(prev => [...prev, newItem]);
      setNewItemName('');
    }
  };

  const handleRemoveItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, name: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, name } : item
    ));
  };

  const handleToggleRequired = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, required: !item.required } : item
    ));
  };

  const handleSave = () => {
    console.log('Salvando checklist:', checklist);
    // Here you would save to your backend/context
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
            <Button onClick={handleAddItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
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
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
