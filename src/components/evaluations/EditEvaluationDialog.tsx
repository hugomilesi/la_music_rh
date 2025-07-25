
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Evaluation } from '@/types/evaluation';
import { useEvaluations } from '@/contexts/EvaluationContext';
import { Edit, Save, X } from 'lucide-react';

interface EditEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluation: Evaluation | null;
  onEvaluationUpdated?: (updatedEvaluation: Evaluation) => void;
}

export const EditEvaluationDialog: React.FC<EditEvaluationDialogProps> = ({
  open,
  onOpenChange,
  evaluation,
  onEvaluationUpdated
}) => {
  const { updateEvaluation } = useEvaluations();
  const [formData, setFormData] = useState({
    score: 0,
    status: 'Em Andamento' as 'Concluída' | 'Em Andamento',
    followUpActions: '',
    topics: [] as string[],
    meetingDate: '',
    meetingTime: '',
    location: '',
    confidential: false
  });

  useEffect(() => {
    if (evaluation) {
      setFormData({
        score: evaluation.score,
        status: evaluation.status,
        followUpActions: evaluation.followUpActions || '',
        topics: evaluation.topics || [],
        meetingDate: evaluation.meetingDate || '',
        meetingTime: evaluation.meetingTime || '',
        location: evaluation.location || '',
        confidential: evaluation.confidential || false
      });
    }
  }, [evaluation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluation) return;

    try {
      await updateEvaluation(evaluation.id, {
        ...formData,
        topics: formData.topics.filter(topic => topic.trim() !== '')
      });

      // Create updated evaluation object for parent component
      const updatedEvaluation = {
        ...evaluation,
        ...formData,
        topics: formData.topics.filter(topic => topic.trim() !== '')
      };

      // Notify parent component if callback is provided
      if (onEvaluationUpdated) {
        onEvaluationUpdated(updatedEvaluation);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating evaluation:', error);
      // Error handling is already done in the context
    }
  };

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...formData.topics];
    newTopics[index] = value;
    setFormData(prev => ({ ...prev, topics: newTopics }));
  };

  const addTopic = () => {
    setFormData(prev => ({ ...prev, topics: [...prev.topics, ''] }));
  };

  const removeTopic = (index: number) => {
    const newTopics = formData.topics.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, topics: newTopics }));
  };

  if (!evaluation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Editar Avaliação - {evaluation.employee}
          </DialogTitle>
          <DialogDescription>
            Atualize as informações da avaliação de desempenho.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="score">Nota</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.score}
                onChange={(e) => setFormData(prev => ({ ...prev, score: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full px-3 py-2 border border-gray-200 rounded-md"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Concluída' | 'Em Andamento' }))}
              >
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída">Concluída</option>
              </select>
            </div>
          </div>

          {evaluation.type === 'Coffee Connection' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meetingDate">Data do Encontro</Label>
                  <Input
                    id="meetingDate"
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="meetingTime">Horário</Label>
                  <Input
                    id="meetingTime"
                    type="time"
                    value={formData.meetingTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingTime: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Café Central, Sala de Reuniões..."
                />
              </div>

              <div>
                <Label>Tópicos de Conversa</Label>
                <div className="space-y-2">
                  {formData.topics.map((topic, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={topic}
                        onChange={(e) => handleTopicChange(index, e.target.value)}
                        placeholder="Digite um tópico..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTopic(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addTopic}>
                    Adicionar Tópico
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={formData.confidential}
                  onChange={(e) => setFormData(prev => ({ ...prev, confidential: e.target.checked }))}
                />
                <Label htmlFor="confidential">Conversa confidencial</Label>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="followUpActions">Ações de Acompanhamento</Label>
            <Textarea
              id="followUpActions"
              value={formData.followUpActions}
              onChange={(e) => setFormData(prev => ({ ...prev, followUpActions: e.target.value }))}
              placeholder="Descreva as ações de follow-up necessárias..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
