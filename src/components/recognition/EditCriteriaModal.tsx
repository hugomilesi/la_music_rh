
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Save, X, Lock } from 'lucide-react';
import { RecognitionProgram, RecognitionCriterion } from '@/types/recognition';
import { usePermissions } from '@/hooks/usePermissions';

interface EditCriteriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: RecognitionProgram;
  onSave: (updatedProgram: RecognitionProgram) => void;
}

export const EditCriteriaModal: React.FC<EditCriteriaModalProps> = ({
  open,
  onOpenChange,
  program,
  onSave
}) => {
  const { canManageEvaluations } = usePermissions();
  const [editedProgram, setEditedProgram] = useState<RecognitionProgram>({ ...program });
  const [editingCriterion, setEditingCriterion] = useState<RecognitionCriterion | null>(null);

  const addNewCriterion = () => {
    const newCriterion: RecognitionCriterion = {
      id: `criterion-${Date.now()}`,
      title: 'Novo Critério',
      description: 'Descrição do critério',
      type: 'checkbox',
      weight: 5,
      isRequired: false
    };
    setEditingCriterion(newCriterion);
  };

  const editCriterion = (criterion: RecognitionCriterion) => {
    setEditingCriterion({ ...criterion });
  };

  const saveCriterion = () => {
    if (!editingCriterion) return;

    const existingIndex = editedProgram.criteria.findIndex(c => c.id === editingCriterion.id);
    
    if (existingIndex >= 0) {
      // Editar critério existente
      const newCriteria = [...editedProgram.criteria];
      newCriteria[existingIndex] = editingCriterion;
      setEditedProgram({ ...editedProgram, criteria: newCriteria });
    } else {
      // Adicionar novo critério
      setEditedProgram({
        ...editedProgram,
        criteria: [...editedProgram.criteria, editingCriterion]
      });
    }

    setEditingCriterion(null);
    updateTotalStars();
  };

  const deleteCriterion = (criterionId: string) => {
    setEditedProgram({
      ...editedProgram,
      criteria: editedProgram.criteria.filter(c => c.id !== criterionId)
    });
    updateTotalStars();
  };

  const updateTotalStars = () => {
    const total = editedProgram.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    setEditedProgram(prev => ({ ...prev, totalPossibleStars: total }));
  };

  const handleSave = () => {
    const total = editedProgram.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    const finalProgram = { ...editedProgram, totalPossibleStars: total };
    onSave(finalProgram);
    onOpenChange(false);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'border-l-blue-500 bg-blue-50';
      case 'green': return 'border-l-green-500 bg-green-50';
      case 'purple': return 'border-l-purple-500 bg-purple-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Verificação de permissão
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
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Critérios - {program.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Critérios */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Critérios Atuais</h3>
              <Button onClick={addNewCriterion} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            <ScrollArea className="h-[60vh]">
              <div className="space-y-3">
                {editedProgram.criteria.map((criterion) => (
                  <Card key={criterion.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium flex items-center gap-2">
                            {criterion.title}
                            {criterion.isRequired && (
                              <Badge variant="destructive" className="text-xs">
                                Obrigatório
                              </Badge>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {criterion.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {criterion.weight} ⭐
                            </Badge>
                            <Badge variant="outline">
                              {criterion.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editCriterion(criterion)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteCriterion(criterion.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <Card className={`border-l-4 ${getColorClasses(program.color)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Total de Estrelas Possíveis</h4>
                    <p className="text-sm text-gray-600">
                      Soma de todos os critérios
                    </p>
                  </div>
                  <div className="text-2xl font-bold">
                    {editedProgram.criteria.reduce((sum, c) => sum + c.weight, 0)} ⭐
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editor de Critério */}
          <div className="space-y-4">
            {editingCriterion ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {editedProgram.criteria.find(c => c.id === editingCriterion.id) ? 'Editar' : 'Novo'} Critério
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCriterion(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <ScrollArea className="h-[60vh]">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={editingCriterion.title}
                        onChange={(e) =>
                          setEditingCriterion({ ...editingCriterion, title: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={editingCriterion.description}
                        onChange={(e) =>
                          setEditingCriterion({ ...editingCriterion, description: e.target.value })
                        }
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Select
                        value={editingCriterion.type}
                        onValueChange={(value: 'checkbox' | 'observation' | 'stars') =>
                          setEditingCriterion({ ...editingCriterion, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="observation">Observação</SelectItem>
                          <SelectItem value="stars">Estrelas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="weight">Peso (Estrelas)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={editingCriterion.weight}
                        onChange={(e) =>
                          setEditingCriterion({
                            ...editingCriterion,
                            weight: parseInt(e.target.value) || 0
                          })
                        }
                        min={1}
                        max={50}
                      />
                    </div>

                    {editingCriterion.type === 'stars' && (
                      <div>
                        <Label htmlFor="maxStars">Máximo de Estrelas</Label>
                        <Input
                          id="maxStars"
                          type="number"
                          value={editingCriterion.maxStars || editingCriterion.weight}
                          onChange={(e) =>
                            setEditingCriterion({
                              ...editingCriterion,
                              maxStars: parseInt(e.target.value) || editingCriterion.weight
                            })
                          }
                          min={1}
                          max={editingCriterion.weight}
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="required"
                        checked={editingCriterion.isRequired || false}
                        onCheckedChange={(checked) =>
                          setEditingCriterion({ ...editingCriterion, isRequired: checked })
                        }
                      />
                      <Label htmlFor="required">Critério obrigatório</Label>
                    </div>

                    <Separator />

                    <div className="flex gap-3">
                      <Button onClick={saveCriterion} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Critério
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingCriterion(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex items-center justify-center h-[60vh] text-gray-500">
                <div className="text-center">
                  <p>Selecione um critério para editar</p>
                  <p className="text-sm mt-1">ou adicione um novo critério</p>
                </div>
              </div>
            )}
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
