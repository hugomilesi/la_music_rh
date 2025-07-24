import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Star, Calendar, User, Building, Briefcase } from 'lucide-react';
import { Evaluation } from '@/types/evaluation';

interface ViewEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluation: Evaluation | null;
}

const ViewEvaluationDialog: React.FC<ViewEvaluationDialogProps> = ({
  open,
  onOpenChange,
  evaluation,
}) => {
  if (!evaluation) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluída':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Avaliação 360°':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'Auto Avaliação':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Avaliação do Gestor':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'Coffee Connection':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(score);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {evaluation.type === 'Coffee Connection' && (
              <Coffee className="w-5 h-5 text-amber-600" />
            )}
            Detalhes da Avaliação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Colaborador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome</label>
                  <p className="text-base font-semibold">{evaluation.employee}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cargo</label>
                  <p className="text-base flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {evaluation.role}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Data</label>
                  <p className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(evaluation.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes da Avaliação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes da Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo</label>
                  <div className="mt-1">
                    <Badge className={getTypeBadge(evaluation.type)}>
                      {evaluation.type === 'Coffee Connection' && (
                        <Coffee className="w-3 h-3 mr-1" />
                      )}
                      {evaluation.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusBadge(evaluation.status)}>
                      {evaluation.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Período</label>
                  <p className="text-base">{evaluation.period}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nota</label>
                  {evaluation.type === 'Coffee Connection' && evaluation.status === 'Pendente' ? (
                    <p className="text-gray-500">Aguardando realização</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getScoreColor(evaluation.score || 0)}`}>
                        {(evaluation.score || 0).toFixed(1)}
                      </span>
                      <div className="flex items-center gap-1">
                        {renderStars(evaluation.score || 0)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comentários/Observações */}
              {evaluation.comments && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Comentários</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">{evaluation.comments}</p>
                  </div>
                </div>
              )}

              {/* Tópicos */}
              {evaluation.topics && evaluation.topics.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tópicos Discutidos</label>
                  <div className="mt-1 space-y-2">
                    {evaluation.topics.map((topic, index) => (
                      <div key={index} className="p-2 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800">{topic}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewEvaluationDialog;