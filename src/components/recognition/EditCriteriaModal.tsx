import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Lock } from 'lucide-react';
import { RecognitionProgram, Criterion } from '@/types/recognition';
import { usePermissions } from '@/hooks/usePermissions';

interface EditCriteriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: RecognitionProgram;
  onSave: (program: RecognitionProgram) => void;
}

export const EditCriteriaModal: React.FC<EditCriteriaModalProps> = ({
  open,
  onOpenChange,
  program,
  onSave
}) => {
  const { checkPermission } = usePermissions();
  const canManageEvaluations = useMemo(() => checkPermission('canManageEvaluations', false), [checkPermission]);
  
  const [editedProgram, setEditedProgram] = useState<RecognitionProgram>(program);
  const [newCriterionTitle, setNewCriterionTitle] = useState('');
  const [newCriterionDescription, setNewCriterionDescription] = useState('');
  const [newCriterionWeight, setNewCriterionWeight] = useState(1);
  const [newCriterionType, setNewCriterionType] = useState<'checkbox' | 'observation' | 'stars'>('checkbox');
  const [newCriterionIsRequired, setNewCriterionIsRequired] = useState(false);
  const [newCriterionMaxStars, setNewCriterionMaxStars] = useState(5);

  const handleAddCriterion = () => {
    if (!newCriterionTitle || !newCriterionDescription) return;

    const newCriterion: Criterion = {
      id: Date.now().toString(),
      title: newCriterionTitle,
      description: newCriterionDescription,
      weight: newCriterionWeight,
      type: newCriterionType,
      isRequired: newCriterionIsRequired,
      maxStars: newCriterionType === 'stars' ? newCriterionMaxStars : newCriterionWeight
    };

    setEditedProgram(prev => ({
      ...prev,
      criteria: [...prev.criteria, newCriterion],
      totalPossibleStars: prev.totalPossibleStars + newCriterion.weight
    }));

    setNewCriterionTitle('');
    setNewCriterionDescription('');
    setNewCriterionWeight(1);
    setNewCriterionType('checkbox');
    setNewCriterionIsRequired(false);
    setNewCriterionMaxStars(5);
  };

  const handleRemoveCriterion = (id: string) => {
    const removedCriterion = editedProgram.criteria.find(c => c.id === id);
    if (!removedCriterion) return;

    setEditedProgram(prev => ({
      ...prev,
      criteria: prev.criteria.filter(c => c.id !== id),
      totalPossibleStars: prev.totalPossibleStars - removedCriterion.weight
    }));
  };

  const handleSave = () => {
    onSave(editedProgram);
    onOpenChange(false);
  };

  const handleInputChange = (criterionId: string, field: string, value: any) => {
    setEditedProgram(prev => ({
      ...prev,
      criteria: prev.criteria.map(c =>
        c.id === criterionId ? { ...c, [field]: value } : c
      )
    }));
  };

  if (!canManageEvaluations) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Acesso Negado
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Você não tem permissão para editar critérios de avaliação.
            </p>
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Critérios - {editedProgram.name}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-[70vh]">
          {/* Criteria List */}
          <div className="flex-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Critérios Atuais</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Peso</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedProgram.criteria.map((criterion) => (
                        <TableRow key={criterion.id}>
                          <TableCell className="font-medium">{criterion.title}</TableCell>
                          <TableCell>{criterion.weight} ⭐</TableCell>
                          <TableCell>{criterion.type}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCriterion(criterion.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {editedProgram.criteria.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhum critério adicionado</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="w-96">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Novo Critério</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Título</Label>
                  <Input
                    type="text"
                    value={newCriterionTitle}
                    onChange={(e) => setNewCriterionTitle(e.target.value)}
                    placeholder="Título do critério..."
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <Textarea
                    placeholder="Descrição do critério..."
                    value={newCriterionDescription}
                    onChange={(e) => setNewCriterionDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Peso (Estrelas)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={newCriterionWeight}
                      onChange={(e) => setNewCriterionWeight(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Tipo</Label>
                    <Select value={newCriterionType} onValueChange={(value) => setNewCriterionType(value as 'checkbox' | 'observation' | 'stars')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="observation">Observação</SelectItem>
                        <SelectItem value="stars">Estrelas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newCriterionType === 'stars' && (
                  <div>
                    <Label className="text-sm font-medium">Max Estrelas</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={newCriterionMaxStars}
                      onChange={(e) => setNewCriterionMaxStars(parseInt(e.target.value) || 5)}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRequired"
                    checked={newCriterionIsRequired}
                    onCheckedChange={(checked) => setNewCriterionIsRequired(checked as boolean)}
                  />
                  <Label htmlFor="isRequired" className="text-sm font-normal">
                    Obrigatório
                  </Label>
                </div>

                <Button onClick={handleAddCriterion} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Critério
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
