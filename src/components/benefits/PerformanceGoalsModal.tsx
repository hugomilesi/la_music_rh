
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, Trash2, Edit, Save, X } from 'lucide-react';
import { PerformanceGoal } from '@/types/benefits';

interface PerformanceGoalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benefitId: string;
  goals: PerformanceGoal[];
  onSaveGoals: (goals: PerformanceGoal[]) => void;
}

export const PerformanceGoalsModal: React.FC<PerformanceGoalsModalProps> = ({
  open,
  onOpenChange,
  benefitId,
  goals,
  onSaveGoals
}) => {
  const [currentGoals, setCurrentGoals] = useState<PerformanceGoal[]>(goals);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetValue: '',
    unit: '',
    weight: '',
    deadline: ''
  });
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PerformanceGoal>>({});

  const addGoal = () => {
    if (!newGoal.title || !newGoal.targetValue || !newGoal.deadline) return;

    const goal: PerformanceGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetValue: parseFloat(newGoal.targetValue),
      unit: newGoal.unit,
      weight: parseFloat(newGoal.weight) || 0,
      deadline: newGoal.deadline,
      status: 'pending',
      createdBy: 'current_user',
      createdAt: new Date().toISOString()
    };

    setCurrentGoals([...currentGoals, goal]);
    setNewGoal({
      title: '',
      description: '',
      targetValue: '',
      unit: '',
      weight: '',
      deadline: ''
    });
  };

  const startEdit = (goal: PerformanceGoal) => {
    setEditingGoal(goal.id);
    setEditForm({
      title: goal.title,
      description: goal.description,
      targetValue: goal.targetValue,
      unit: goal.unit,
      weight: goal.weight,
      deadline: goal.deadline,
      status: goal.status
    });
  };

  const saveEdit = () => {
    if (!editingGoal || !editForm.title || !editForm.targetValue) return;

    setCurrentGoals(currentGoals.map(goal => 
      goal.id === editingGoal 
        ? { ...goal, ...editForm }
        : goal
    ));
    setEditingGoal(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingGoal(null);
    setEditForm({});
  };

  const removeGoal = (goalId: string) => {
    if (confirm('Tem certeza que deseja remover esta meta?')) {
      setCurrentGoals(currentGoals.filter(g => g.id !== goalId));
    }
  };

  const updateProgress = (goalId: string, currentValue: number) => {
    setCurrentGoals(currentGoals.map(goal => 
      goal.id === goalId 
        ? { ...goal, currentValue }
        : goal
    ));
  };

  const handleSave = () => {
    onSaveGoals(currentGoals);
    onOpenChange(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Configurar Metas de Performance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Metas Configuradas</h3>
            {currentGoals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma meta configurada</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {currentGoals.map((goal) => (
                  <Card key={goal.id}>
                    <CardContent className="p-4">
                      {editingGoal === goal.id ? (
                        // Edit Form
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Título da Meta</Label>
                              <Input
                                value={editForm.title || ''}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select
                                value={editForm.status}
                                onValueChange={(value) => setEditForm({ ...editForm, status: value as any })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pendente</SelectItem>
                                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                                  <SelectItem value="completed">Concluída</SelectItem>
                                  <SelectItem value="failed">Falhada</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              rows={2}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Valor Meta</Label>
                              <Input
                                type="number"
                                value={editForm.targetValue || ''}
                                onChange={(e) => setEditForm({ ...editForm, targetValue: parseFloat(e.target.value) })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Unidade</Label>
                              <Input
                                value={editForm.unit || ''}
                                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Peso (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={editForm.weight || ''}
                                onChange={(e) => setEditForm({ ...editForm, weight: parseFloat(e.target.value) })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Prazo</Label>
                              <Input
                                type="date"
                                value={editForm.deadline || ''}
                                onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2 border-t">
                            <Button size="sm" onClick={saveEdit}>
                              <Save className="w-4 h-4 mr-1" />
                              Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Display Mode
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{goal.title}</h4>
                              <Badge className={getStatusColor(goal.status)}>
                                {goal.status === 'pending' && 'Pendente'}
                                {goal.status === 'in_progress' && 'Em Andamento'}
                                {goal.status === 'completed' && 'Concluída'}
                                {goal.status === 'failed' && 'Falhada'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Meta:</span>
                                <p className="font-medium">{goal.targetValue} {goal.unit}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Peso:</span>
                                <p className="font-medium">{goal.weight}%</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Prazo:</span>
                                <p className="font-medium">{new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Progresso Atual:</span>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    className="h-6 text-xs w-20"
                                    value={goal.currentValue || 0}
                                    onChange={(e) => updateProgress(goal.id, parseFloat(e.target.value) || 0)}
                                  />
                                  <span className="text-xs">/ {goal.targetValue}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Conclusão:</span>
                                <div className="mt-1">
                                  <Progress value={(goal.currentValue || 0) / goal.targetValue * 100} className="h-2" />
                                  <p className="text-xs mt-1">
                                    {Math.round((goal.currentValue || 0) / goal.targetValue * 100)}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(goal)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeGoal(goal.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add New Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adicionar Nova Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Meta *</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="Ex: Aumentar vendas em 20%"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Descreva os detalhes da meta..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetValue">Valor Meta *</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                    placeholder="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Input
                    id="unit"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    placeholder="vendas, pontos, %"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (%)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    max="100"
                    value={newGoal.weight}
                    onChange={(e) => setNewGoal({ ...newGoal, weight: e.target.value })}
                    placeholder="25"
                  />
                </div>
              </div>

              <Button onClick={addGoal} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Meta
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
