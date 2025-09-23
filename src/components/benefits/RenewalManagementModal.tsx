
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  Target,
  User
} from 'lucide-react';
import { EmployeeBenefit } from '@/types/benefits';

interface RenewalManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renewals: EmployeeBenefit[];
  onApproveRenewal: (enrollmentId: string, comments?: string) => void;
  onDenyRenewal: (enrollmentId: string, comments: string) => void;
  onExtendRenewal: (enrollmentId: string, newDate: string) => void;
}

export const RenewalManagementModal: React.FC<RenewalManagementModalProps> = ({
  open,
  onOpenChange,
  renewals,
  onApproveRenewal,
  onDenyRenewal,
  onExtendRenewal
}) => {
  const [selectedRenewal, setSelectedRenewal] = useState<string | null>(null);
  const [comments, setComments] = useState('');

  const handleApprove = (enrollmentId: string) => {
    onApproveRenewal(enrollmentId, comments);
    setComments('');
    setSelectedRenewal(null);
  };

  const handleDeny = (enrollmentId: string) => {
    if (!comments.trim()) {
      alert('Por favor, adicione um comentário explicando o motivo da negação.');
      return;
    }
    onDenyRenewal(enrollmentId, comments);
    setComments('');
    setSelectedRenewal(null);
  };

  const getRenewalStatus = (renewal: EmployeeBenefit) => {
    if (!renewal.nextRenewalDate) return 'N/A';
    
    const renewalDate = new Date(renewal.nextRenewalDate);
    const today = new Date();
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilRenewal < 0) return 'Vencido';
    if (daysUntilRenewal === 0) return 'Vence hoje';
    if (daysUntilRenewal <= 7) return 'Urgente';
    if (daysUntilRenewal <= 30) return 'Próximo';
    
    return 'Futuro';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vencido': return 'bg-red-100 text-red-800';
      case 'Vence hoje': return 'bg-red-100 text-red-800';
      case 'Urgente': return 'bg-orange-100 text-orange-800';
      case 'Próximo': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getOverallScore = (renewal: EmployeeBenefit) => {
    return renewal.performanceData?.overallScore || 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Gerenciar Renovações de Benefícios
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {renewals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma renovação pendente</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {renewals.map((renewal) => {
                const status = getRenewalStatus(renewal);
                const score = getOverallScore(renewal);
                const isSelected = selectedRenewal === renewal.id;
                
                return (
                  <Card key={renewal.id} className={`${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{renewal.employeeName}</h3>
                              <Badge className={getStatusColor(status)}>
                                {status}
                              </Badge>
                              {renewal.performanceData && (
                                <Badge variant="outline" className={getScoreColor(score)}>
                                  Score: {score}%
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600">{renewal.benefitName}</p>
                          </div>
                          
                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Renovação: {renewal.nextRenewalDate ? 
                                  new Date(renewal.nextRenewalDate).toLocaleDateString('pt-BR') : 
                                  'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Performance Data */}
                        {renewal.performanceData && (
                          <Card className="bg-gray-50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Target className="w-4 h-4 text-blue-600" />
                                <h4 className="font-medium">Performance Atual</h4>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                  <span className="text-sm text-gray-500">Score Geral</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={score} className="flex-1" />
                                    <span className={`font-medium ${getScoreColor(score)}`}>
                                      {score}%
                                    </span>
                                  </div>
                                </div>
                                
                                <div>
                                  <span className="text-sm text-gray-500">Última Avaliação</span>
                                  <p className="font-medium">
                                    {new Date(renewal.performanceData.lastEvaluationDate).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                                
                                <div>
                                  <span className="text-sm text-gray-500">Metas Concluídas</span>
                                  <p className="font-medium">
                                    {renewal.performanceData.goalProgress?.filter(g => g.status === 'completed').length || 0} de {renewal.performanceData.goalProgress?.length || 0}
                                  </p>
                                </div>
                              </div>

                              {renewal.performanceData.goalProgress && renewal.performanceData.goalProgress.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="font-medium mb-2">Progresso das Metas</h5>
                                  <div className="space-y-2">
                                    {renewal.performanceData.goalProgress.map((goal, index) => (
                                      <div key={`goal-${index}`} className="flex items-center justify-between">
                                        <span className="text-sm">{goal.goalTitle}</span>
                                        <div className="flex items-center gap-2">
                                          <Progress value={goal.completionPercentage} className="w-20" />
                                          <span className="text-xs w-10">{goal.completionPercentage}%</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {renewal.performanceData.comments && (
                                <div className="mt-4 p-3 bg-blue-50 rounded">
                                  <p className="text-sm text-blue-800">
                                    <strong>Comentários:</strong> {renewal.performanceData.comments}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Action Section */}
                        {isSelected && (
                          <Card className="border-blue-200">
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="comments">Comentários da Revisão</Label>
                                  <Textarea
                                    id="comments"
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Adicione comentários sobre a decisão de renovação..."
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(renewal.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Aprovar Renovação
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeny(renewal.id)}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Negar Renovação
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedRenewal(null)}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Action Buttons */}
                        {!isSelected && (
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRenewal(renewal.id)}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Revisar
                            </Button>
                            
                            {status === 'Vencido' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newDate = new Date();
                                  newDate.setMonth(newDate.getMonth() + 1);
                                  onExtendRenewal(renewal.id, newDate.toISOString());
                                }}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <Clock className="w-4 h-4 mr-1" />
                                Estender Prazo
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
