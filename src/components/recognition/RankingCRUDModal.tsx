import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Star, Save, X, Lock } from 'lucide-react';
import { RecognitionService } from '@/services/recognitionService';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import type { EmployeeEvaluation, RecognitionProgram, RecognitionCriterion } from '@/types/supabase-recognition';

interface RankingCRUDModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: string;
  employeeName?: string;
  onDataChange: () => void;
}

interface EvaluationFormData {
  id?: string;
  programId: string;
  evaluationPeriod: string;
  totalStars: number;
  notes?: string;
  criteriaEvaluations: Array<{
    criterionId: string;
    isMet: boolean;
    starsAwarded: number;
    observation?: string;
  }>;
}

export const RankingCRUDModal: React.FC<RankingCRUDModalProps> = ({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  onDataChange
}) => {
  const [programs, setPrograms] = useState<RecognitionProgram[]>([]);
  const [criteria, setCriteria] = useState<RecognitionCriterion[]>([]);
  const [evaluations, setEvaluations] = useState<EmployeeEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<EvaluationFormData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { checkPermission } = usePermissions();
  const canManageEvaluations = useMemo(() => checkPermission('canManageEvaluations', false), [checkPermission]);

  useEffect(() => {
    if (open && employeeId) {
      loadData();
    }
  }, [open, employeeId]);

  const loadData = async () => {
    if (!employeeId) return;
    
    try {
      setLoading(true);
      const [programsData, evaluationsData] = await Promise.all([
        RecognitionService.getPrograms(),
        RecognitionService.getEmployeeEvaluations(employeeId)
      ]);
      
      setPrograms(programsData);
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadCriteria = async (programId: string) => {
    try {
      const criteriaData = await RecognitionService.getCriteriaByProgram(programId);
      setCriteria(criteriaData);
    } catch (error) {
      console.error('Erro ao carregar critérios:', error);
      toast.error('Erro ao carregar critérios');
    }
  };

  const handleCreateNew = () => {
    setEditingEvaluation({
      programId: '',
      evaluationPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM
      totalStars: 0,
      notes: '',
      criteriaEvaluations: []
    });
    setShowForm(true);
  };

  const handleEdit = async (evaluation: EmployeeEvaluation) => {
    try {
      const criteriaEvals = await RecognitionService.getCriterionEvaluations(evaluation.id);
      await loadCriteria(evaluation.program_id);
      
      setEditingEvaluation({
        id: evaluation.id,
        programId: evaluation.program_id,
        evaluationPeriod: evaluation.evaluation_period,
        totalStars: evaluation.total_stars,
        notes: evaluation.comments || '',
        criteriaEvaluations: criteriaEvals.map(ce => ({
          criterionId: ce.criterion_id,
          isMet: ce.is_met,
          starsAwarded: ce.stars_awarded || 0,
          observation: ce.observation || ''
        }))
      });
      setShowForm(true);
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error);
      toast.error('Erro ao carregar avaliação');
    }
  };

  const handleDelete = async (evaluationId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    
    try {
      await RecognitionService.deleteEmployeeEvaluation(evaluationId);
      toast.success('Avaliação excluída com sucesso!');
      await loadData();
      onDataChange();
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      toast.error('Erro ao excluir avaliação');
    }
  };

  const handleProgramChange = async (programId: string) => {
    if (!editingEvaluation) return;
    
    await loadCriteria(programId);
    setEditingEvaluation({
      ...editingEvaluation,
      programId,
      criteriaEvaluations: []
    });
  };

  const handleCriterionChange = (criterionId: string, field: string, value: any) => {
    if (!editingEvaluation) return;
    
    const updatedCriteria = editingEvaluation.criteriaEvaluations.map(ce => 
      ce.criterionId === criterionId ? { ...ce, [field]: value } : ce
    );
    
    // Se o critério não existe, adiciona
    if (!updatedCriteria.find(ce => ce.criterionId === criterionId)) {
      updatedCriteria.push({
        criterionId,
        isMet: field === 'isMet' ? value : false,
        starsAwarded: field === 'starsAwarded' ? value : 0,
        observation: field === 'observation' ? value : ''
      });
    }
    
    const totalStars = updatedCriteria.reduce((sum, ce) => sum + ce.starsAwarded, 0);
    
    setEditingEvaluation({
      ...editingEvaluation,
      criteriaEvaluations: updatedCriteria,
      totalStars
    });
  };

  const handleSave = async () => {
    if (!editingEvaluation || !employeeId) return;
    
    try {
      setLoading(true);
      
      if (editingEvaluation.id) {
        // Atualizar avaliação existente
        await RecognitionService.updateEmployeeEvaluation(editingEvaluation.id, {
          programId: editingEvaluation.programId,
          evaluationPeriod: editingEvaluation.evaluationPeriod,
          notes: editingEvaluation.notes,
          criteriaEvaluations: editingEvaluation.criteriaEvaluations
        });
        toast.success('Avaliação atualizada com sucesso!');
      } else {
        // Criar nova avaliação
        await RecognitionService.submitCompleteEvaluation({
          employeeId,
          programId: editingEvaluation.programId,
          evaluationPeriod: editingEvaluation.evaluationPeriod,
          evaluatorId: '1', // ID do avaliador padrão
          criteriaEvaluations: editingEvaluation.criteriaEvaluations,
          notes: editingEvaluation.notes
        });
        toast.success('Avaliação criada com sucesso!');
      }
      
      setShowForm(false);
      setEditingEvaluation(null);
      await loadData();
      onDataChange();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast.error('Erro ao salvar avaliação');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvaluation(null);
    setCriteria([]);
  };

  const getCriterionEvaluation = (criterionId: string) => {
    return editingEvaluation?.criteriaEvaluations.find(ce => ce.criterionId === criterionId) || {
      criterionId,
      isMet: false,
      starsAwarded: 0,
      observation: ''
    };
  };

  if (!canManageEvaluations) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              Acesso Negado
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Você não tem permissão para gerenciar avaliações de colaboradores. Esta ação é restrita a administradores.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showForm ? 
              (editingEvaluation?.id ? 'Editar Avaliação' : 'Nova Avaliação') : 
              `Gerenciar Ranking - ${employeeName}`
            }
          </DialogTitle>
        </DialogHeader>

        {!showForm ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Avaliações Existentes</h3>
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Avaliação
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : evaluations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma avaliação encontrada
              </div>
            ) : (
              <div className="space-y-3">
                {evaluations.map((evaluation) => {
                  const program = programs.find(p => p.id === evaluation.program_id);
                  return (
                    <Card key={evaluation.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Badge style={{ backgroundColor: program?.color }}>
                              {program?.name}
                            </Badge>
                            <div>
                              <p className="font-medium">{evaluation.evaluation_period}</p>
                              <p className="text-sm text-gray-600">
                                {evaluation.total_stars} estrelas
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(evaluation)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(evaluation.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="program">Programa</Label>
                <Select
                  value={editingEvaluation?.programId || ''}
                  onValueChange={handleProgramChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="period">Período de Avaliação</Label>
                <Input
                  id="period"
                  type="month"
                  value={editingEvaluation?.evaluationPeriod || ''}
                  onChange={(e) => setEditingEvaluation(prev => prev ? {
                    ...prev,
                    evaluationPeriod: e.target.value
                  } : null)}
                />
              </div>
            </div>

            {criteria.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Critérios de Avaliação</h4>
                <div className="space-y-4">
                  {criteria.map((criterion) => {
                    const evaluation = getCriterionEvaluation(criterion.id);
                    return (
                      <Card key={criterion.id}>
                        <CardHeader>
                          <CardTitle className="text-base">{criterion.title}</CardTitle>
                          <p className="text-sm text-gray-600">{criterion.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Atendido</Label>
                              <Select
                                value={evaluation.isMet ? 'true' : 'false'}
                                onValueChange={(value) => 
                                  handleCriterionChange(criterion.id, 'isMet', value === 'true')
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Sim</SelectItem>
                                  <SelectItem value="false">Não</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Estrelas Concedidas</Label>
                              <Input
                                type="number"
                                min="0"
                                max={criterion.max_stars}
                                value={evaluation.starsAwarded}
                                onChange={(e) => 
                                  handleCriterionChange(criterion.id, 'starsAwarded', parseInt(e.target.value) || 0)
                                }
                              />
                            </div>
                            
                            <div>
                              <Label>Observação</Label>
                              <Input
                                value={evaluation.observation}
                                onChange={(e) => 
                                  handleCriterionChange(criterion.id, 'observation', e.target.value)
                                }
                                placeholder="Observações..."
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Observações Gerais</Label>
              <Textarea
                id="notes"
                value={editingEvaluation?.notes || ''}
                onChange={(e) => setEditingEvaluation(prev => prev ? {
                  ...prev,
                  notes: e.target.value
                } : null)}
                placeholder="Observações sobre a avaliação..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">
                Total de Estrelas: {editingEvaluation?.totalStars || 0}
              </span>
            </div>
          </div>
        )}

        <DialogFooter>
          {showForm ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};