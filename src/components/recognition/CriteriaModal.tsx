import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, FileText, Award, Edit } from 'lucide-react';
import { RecognitionProgram, CriterionEvaluation } from '@/types/recognition';
import { EditCriteriaModal } from './EditCriteriaModal';

interface CriteriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: RecognitionProgram;
  onSaveEvaluation?: (evaluations: CriterionEvaluation[]) => void;
  onSaveProgram?: (program: RecognitionProgram) => void;
}

export const CriteriaModal: React.FC<CriteriaModalProps> = ({
  open,
  onOpenChange,
  program,
  onSaveEvaluation,
  onSaveProgram
}) => {
  const [currentProgram, setCurrentProgram] = useState<RecognitionProgram>(program);
  const [evaluations, setEvaluations] = useState<CriterionEvaluation[]>(
    currentProgram.criteria.map(criterion => ({
      criterionId: criterion.id,
      isCompleted: false,
      observation: '',
      starsAwarded: 0
    }))
  );
  const [totalCalculatedStars, setTotalCalculatedStars] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const updateEvaluation = (criterionId: string, updates: Partial<CriterionEvaluation>) => {
    const newEvaluations = evaluations.map(evaluation => 
      evaluation.criterionId === criterionId ? { ...evaluation, ...updates } : evaluation
    );
    setEvaluations(newEvaluations);
    
    // Calculate total stars
    const total = newEvaluations.reduce((sum, evaluation) => sum + evaluation.starsAwarded, 0);
    setTotalCalculatedStars(total);
  };

  const handleCheckboxChange = (criterionId: string, checked: boolean) => {
    const criterion = currentProgram.criteria.find(c => c.id === criterionId);
    if (!criterion) return;

    updateEvaluation(criterionId, {
      isCompleted: checked,
      starsAwarded: checked ? criterion.weight : 0
    });
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-l-blue-500 bg-blue-50';
      case 'green':
        return 'border-l-green-500 bg-green-50';
      case 'purple':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getCriterionIcon = (type: string) => {
    switch (type) {
      case 'checkbox':
        return <CheckCircle className="w-4 h-4" />;
      case 'observation':
        return <FileText className="w-4 h-4" />;
      case 'stars':
        return <Star className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const handleSaveProgram = (updatedProgram: RecognitionProgram) => {
    setCurrentProgram(updatedProgram);
    // Atualizar evaluations para corresponder aos novos critérios
    const newEvaluations = updatedProgram.criteria.map(criterion => {
      const existingEvaluation = evaluations.find(e => e.criterionId === criterion.id);
      return existingEvaluation || {
        criterionId: criterion.id,
        isCompleted: false,
        observation: '',
        starsAwarded: 0
      };
    });
    setEvaluations(newEvaluations);
    
    if (onSaveProgram) {
      onSaveProgram(updatedProgram);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Critérios - {currentProgram.name}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Critérios
              </Button>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Program Overview */}
              <Card className={`border-l-4 ${getColorClasses(currentProgram.color)}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{currentProgram.name}</span>
                    <Badge variant="outline">
                      {totalCalculatedStars} / {currentProgram.totalPossibleStars} ⭐
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{currentProgram.description}</p>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">Cargos Elegíveis:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentProgram.targetRoles.map(role => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Criteria List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Critérios de Avaliação</h3>
                
                {currentProgram.criteria.map((criterion) => {
                  const evaluation = evaluations.find(e => e.criterionId === criterion.id);
                  
                  return (
                    <Card key={criterion.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getCriterionIcon(criterion.type)}
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
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
                              </div>
                              
                              <Badge className="bg-yellow-100 text-yellow-800">
                                {criterion.weight} ⭐
                              </Badge>
                            </div>

                            {/* Criterion Input */}
                            {criterion.type === 'checkbox' && (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={criterion.id}
                                  checked={evaluation?.isCompleted || false}
                                  onCheckedChange={(checked) => 
                                    handleCheckboxChange(criterion.id, checked as boolean)
                                  }
                                />
                                <Label 
                                  htmlFor={criterion.id}
                                  className="text-sm font-normal"
                                >
                                  Critério atendido
                                </Label>
                              </div>
                            )}

                            {criterion.type === 'observation' && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Observações (opcional)
                                </Label>
                                <textarea
                                  className="w-full p-2 text-sm border border-gray-300 rounded-md"
                                  rows={3}
                                  placeholder="Descreva evidências ou observações relevantes..."
                                  value={evaluation?.observation || ''}
                                  onChange={(e) => updateEvaluation(criterion.id, {
                                    observation: e.target.value
                                  })}
                                />
                              </div>
                            )}

                            {criterion.type === 'stars' && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Estrelas (0 - {criterion.maxStars})
                                </Label>
                                <input
                                  type="number"
                                  min="0"
                                  max={criterion.maxStars}
                                  className="w-20 p-2 text-sm border border-gray-300 rounded-md"
                                  value={evaluation?.starsAwarded || 0}
                                  onChange={(e) => updateEvaluation(criterion.id, {
                                    starsAwarded: Math.min(
                                      parseInt(e.target.value) || 0,
                                      criterion.maxStars || criterion.weight
                                    )
                                  })}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Summary */}
              <Card className="bg-blue-50 border border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Total de Estrelas Calculadas</h4>
                      <p className="text-sm text-gray-600">
                        Baseado nos critérios selecionados
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {totalCalculatedStars} ⭐
                      </div>
                      <div className="text-sm text-gray-600">
                        de {currentProgram.totalPossibleStars} possíveis
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            {onSaveEvaluation && (
              <Button onClick={() => {
                onSaveEvaluation(evaluations);
                onOpenChange(false);
              }}>
                Salvar Avaliação
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EditCriteriaModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        program={currentProgram}
        onSave={handleSaveProgram}
      />
    </>
  );
};
