
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DetailedRankingEmployee, isEligibleForProgram } from '@/types/recognition';
import { recognitionPrograms } from '@/data/recognitionMockData';
import { Trophy, Calendar, Star, Award, DollarSign, Gift, Crown, Medal, TrendingUp, User, Lock } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface EmployeeRankingDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: DetailedRankingEmployee | null;
  onDeliverPrize?: () => void;
  onCreateBonus?: () => void;
}

export const EmployeeRankingDetailsModal: React.FC<EmployeeRankingDetailsModalProps> = ({
  open,
  onOpenChange,
  employee,
  onDeliverPrize,
  onCreateBonus
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { checkPermission } = usePermissions();
  const canViewEmployees = checkPermission('canManageEmployees');

  if (!employee) return null;

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Medal className="w-5 h-5 text-yellow-600" />;
    return <Trophy className="w-4 h-4 text-gray-500" />;
  };

  const getProgramIcon = (programId: string) => {
    switch (programId) {
      case 'fideliza': return <Star className="w-4 h-4 text-blue-600" />;
      case 'matriculador': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'professor': return <Award className="w-4 h-4 text-purple-600" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getProgramColor = (programId: string) => {
    switch (programId) {
      case 'fideliza': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'matriculador': return 'text-green-600 bg-green-50 border-green-200';
      case 'professor': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <Trophy className="w-4 h-4 text-yellow-600" />;
      case 'bonus': return <Gift className="w-4 h-4 text-green-600" />;
      case 'special': return <Crown className="w-4 h-4 text-purple-600" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  // Calcular total baseado apenas nos programas elegíveis
  const calculateEligibleTotal = () => {
    let total = 0;
    if (isEligibleForProgram(employee.role, 'fideliza')) total += employee.stars.fideliza;
    if (isEligibleForProgram(employee.role, 'matriculador')) total += employee.stars.matriculador;
    if (isEligibleForProgram(employee.role, 'professor')) total += employee.stars.professor;
    return total;
  };

  const eligibleTotal = calculateEligibleTotal();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getRankIcon(employee.position)}
              <span className="font-bold">{employee.position}º Lugar</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <div className="font-bold text-lg">{employee.name}</div>
              <div className="text-sm text-gray-600 font-normal">
                {employee.role} • {employee.unit}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {!canViewEmployees ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <Lock className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
            <p className="text-gray-600 max-w-md">
              Você não tem permissão para visualizar detalhes dos colaboradores. 
              Entre em contato com o administrador para obter acesso.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[70vh] pr-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                {isEligibleForProgram(employee.role, 'fideliza') && (
                  <TabsTrigger value="fideliza">Fideliza+</TabsTrigger>
                )}
                {isEligibleForProgram(employee.role, 'matriculador') && (
                  <TabsTrigger value="matriculador">Matriculador+</TabsTrigger>
                )}
                {isEligibleForProgram(employee.role, 'professor') && (
                  <TabsTrigger value="professor">Professor+</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-sm text-gray-600">Total Elegível</p>
                          <p className="text-2xl font-bold">{eligibleTotal}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {isEligibleForProgram(employee.role, 'fideliza') && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Fideliza+</p>
                            <p className="text-2xl font-bold text-blue-600">{employee.stars.fideliza}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {isEligibleForProgram(employee.role, 'matriculador') && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600">Matriculador+</p>
                            <p className="text-2xl font-bold text-green-600">{employee.stars.matriculador}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {isEligibleForProgram(employee.role, 'professor') && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-600">Professor+</p>
                            <p className="text-2xl font-bold text-purple-600">{employee.stars.professor}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Employee Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informações do Colaborador
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Cargo</p>
                      <p className="font-medium">{employee.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unidade</p>
                      <p className="font-medium">{employee.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data de Admissão</p>
                      <p className="font-medium">{new Date(employee.joinDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Eligible Programs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Programas Elegíveis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {employee.eligiblePrograms.map(programId => {
                        const program = recognitionPrograms.find(p => p.id === programId);
                        return program ? (
                          <Badge key={programId} className={getProgramColor(programId)}>
                            {getProgramIcon(programId)}
                            <span className="ml-1">{program.name}</span>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    {employee.eligiblePrograms.length === 0 && (
                      <p className="text-gray-500">Nenhum programa elegível para este cargo.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      Conquistas Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {employee.achievements.length > 0 ? (
                      <div className="space-y-3">
                        {employee.achievements.map((achievement) => (
                          <div key={achievement.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                              {getAchievementIcon(achievement.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{achievement.title}</h4>
                              <p className="text-sm text-gray-600">{achievement.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {getProgramIcon(achievement.programId)}
                                <Badge className="text-xs">
                                  {recognitionPrograms.find(p => p.id === achievement.programId)?.name}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(achievement.date).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-yellow-600">+{achievement.starsAwarded} ⭐</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Nenhuma conquista registrada ainda.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Evolução Mensal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {employee.monthlyProgress.map((progress, index) => (
                        <div key={index} className="grid gap-4 p-3 border border-gray-200 rounded-lg" style={{
                          gridTemplateColumns: `1fr ${employee.eligiblePrograms.length}fr 1fr`
                        }}>
                          <div>
                            <p className="text-sm font-medium">{progress.month}</p>
                          </div>
                          
                          <div className="grid gap-4" style={{
                            gridTemplateColumns: `repeat(${employee.eligiblePrograms.length}, 1fr)`
                          }}>
                            {isEligibleForProgram(employee.role, 'fideliza') && (
                              <div className="text-center">
                                <p className="text-xs text-gray-600">Fideliza+</p>
                                <p className="font-bold text-blue-600">{progress.fideliza}</p>
                              </div>
                            )}
                            {isEligibleForProgram(employee.role, 'matriculador') && (
                              <div className="text-center">
                                <p className="text-xs text-gray-600">Matriculador+</p>
                                <p className="font-bold text-green-600">{progress.matriculador}</p>
                              </div>
                            )}
                            {isEligibleForProgram(employee.role, 'professor') && (
                              <div className="text-center">
                                <p className="text-xs text-gray-600">Professor+</p>
                                <p className="font-bold text-purple-600">{progress.professor}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Total</p>
                            <p className="font-bold text-lg">{progress.total}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {['fideliza', 'matriculador', 'professor'].filter(programId => 
                isEligibleForProgram(employee.role, programId)
              ).map((programId) => (
                <TabsContent key={programId} value={programId} className="space-y-6">
                  <Card className={`border-l-4 ${getProgramColor(programId)}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getProgramIcon(programId)}
                        {recognitionPrograms.find(p => p.id === programId)?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Estrelas Conquistadas</p>
                          <p className="text-3xl font-bold">{employee.stars[programId as keyof typeof employee.stars]} ⭐</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Critérios Atendidos</p>
                          <p className="text-3xl font-bold">{employee.metCriteria[programId]?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Met Criteria */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Critérios Atendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {employee.metCriteria[programId]?.length > 0 ? (
                        <div className="space-y-2">
                          {employee.metCriteria[programId].map((criterionId) => {
                            const program = recognitionPrograms.find(p => p.id === programId);
                            const criterion = program?.criteria.find(c => c.id === criterionId);
                            return criterion ? (
                              <div key={criterionId} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div>
                                  <p className="font-medium">{criterion.title}</p>
                                  <p className="text-sm text-gray-600">{criterion.description}</p>
                                </div>
                                <Badge className="ml-auto bg-green-100 text-green-800">
                                  {criterion.weight} ⭐
                                </Badge>
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">Nenhum critério atendido ainda.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </ScrollArea>
        )}

        <div className="flex justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Período: {employee.evaluationPeriod}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            {onCreateBonus && (
              <Button variant="outline" onClick={() => { onCreateBonus(); onOpenChange(false); }}>
                <Gift className="w-4 h-4 mr-2" />
                Nova Bonificação
              </Button>
            )}
            {onDeliverPrize && (
              <Button onClick={() => { onDeliverPrize(); onOpenChange(false); }} className="bg-yellow-600 hover:bg-yellow-700">
                <Trophy className="w-4 h-4 mr-2" />
                Entregar Prêmio
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeRankingDetailsModal;
