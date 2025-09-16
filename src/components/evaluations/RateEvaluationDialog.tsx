import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { Evaluation } from '@/types/evaluation';
import { evaluationService } from '@/services/evaluationService';
import { toast } from '@/hooks/use-toast';

interface RateEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluation: Evaluation;
  onEvaluationRated: (updatedEvaluation: Evaluation) => void;
}

export function RateEvaluationDialog({
  open,
  onOpenChange,
  evaluation,
  onEvaluationRated,
}: RateEvaluationDialogProps) {
  const [rating, setRating] = React.useState(0);
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const [comments, setComments] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Can rate if evaluation is in progress
  const canRate = evaluation.status === 'Em Andamento';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canRate) {
      toast({
        title: "Erro",
        description: "Esta avaliação não está em andamento.",
        variant: "destructive",
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma nota de 1 a 5 estrelas.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        score: rating,
        status: 'Concluída' as const,
        completed_at: new Date().toISOString(),
        comments: comments || evaluation.comments,
      };

      const updatedEvaluation = await evaluationService.updateEvaluation(evaluation.id, updateData);
      
      // Create the updated evaluation object with the new data
      const evaluationWithUpdates = {
        ...updatedEvaluation,
        score: rating,
        status: 'Concluída' as const,
        completed_at: new Date().toISOString(),
        comments: comments || evaluation.comments,
      };
      
      onEvaluationRated(evaluationWithUpdates);
      onOpenChange(false);
      
      toast({
        title: "Avaliação concluída",
        description: "A nota foi registrada e a avaliação foi marcada como concluída.",
      });
      
      // Reset form
      setRating(0);
      setHoveredRating(0);
      setComments('');
    } catch (error) {
      // Log desabilitado: Error rating evaluation
      toast({
        title: "Erro ao avaliar",
        description: "Ocorreu um erro ao registrar a nota. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setRating(0);
    setHoveredRating(0);
    setComments('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Avaliar {evaluation.type}</DialogTitle>
          <DialogDescription>
            {!canRate ? (
              <span className="text-red-600">
                Esta avaliação não está em andamento.
              </span>
            ) : (
              `Dê uma nota para a avaliação de ${evaluation.employee}`
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nota (1-5 estrelas)</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`p-1 transition-transform ${
                    canRate ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                  onMouseEnter={() => canRate && setHoveredRating(star)}
                  onMouseLeave={() => canRate && setHoveredRating(0)}
                  onClick={() => canRate && setRating(star)}
                  disabled={!canRate}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                Nota selecionada: {rating} estrela{rating > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comentários (opcional)</Label>
            <Textarea
              id="comments"
              placeholder="Adicione comentários sobre a avaliação..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || rating === 0 || !canRate}>
              {loading ? 'Salvando...' : 'Concluir Avaliação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RateEvaluationDialog;