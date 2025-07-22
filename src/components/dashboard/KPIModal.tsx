
import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Award, AlertTriangle, Calendar, Clock, UserPlus, FileText, Lock } from 'lucide-react';
import { useEmployees } from '@/contexts/EmployeeContext';
import { Unit } from '@/types/employee';
import { usePermissions } from '@/hooks/usePermissions';

interface KPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'employees' | 'turnover' | 'nps' | 'alerts' | 'admissions' | 'evaluations' | 'hours' | 'incidents' | null;
}

const getUnitName = (unit: Unit): string => {
  switch (unit) {
    case Unit.CAMPO_GRANDE:
      return 'Campo Grande';
    case Unit.RECREIO:
      return 'Recreio';
    case Unit.BARRA:
      return 'Barra';
    default:
      return 'Unidade';
  }
};

export const KPIModal: React.FC<KPIModalProps> = ({ isOpen, onClose, type }) => {
  const { employees } = useEmployees();
  const { checkPermission } = usePermissions();

  const canViewEmployees = useMemo(() => checkPermission('canManageEmployees', false), [checkPermission]);

  if (!type) return null;

  const getModalContent = () => {
    switch (type) {
      case 'employees':
        
        if (!canViewEmployees) {
          return {
            title: 'Colaboradores Ativos',
            description: 'Acesso negado',
            content: (
              <div className="text-center py-8">
                <Lock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
                <p className="text-gray-600">Você não tem permissão para visualizar informações de colaboradores.</p>
              </div>
            )
          };
        }
        
        const activeEmployees = employees.filter(emp => emp.status === 'active');
        const employeesByUnit = {
          [Unit.CAMPO_GRANDE]: activeEmployees.filter(emp => emp.units.includes(Unit.CAMPO_GRANDE)),
          [Unit.RECREIO]: activeEmployees.filter(emp => emp.units.includes(Unit.RECREIO)),
          [Unit.BARRA]: activeEmployees.filter(emp => emp.units.includes(Unit.BARRA))
        };

        const totalCapacity = 150;
        const occupancyRate = (activeEmployees.length / totalCapacity) * 100;

        return {
          title: 'Colaboradores Ativos',
          description: 'Detalhamento dos colaboradores por unidade e estatísticas de ocupação',
          content: (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{activeEmployees.length}</p>
                      <p className="text-sm text-gray-600">Total Ativo</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{occupancyRate.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Taxa de Ocupação</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Capacidade Total</span>
                  <span>{activeEmployees.length}/{totalCapacity}</span>
                </div>
                <Progress value={occupancyRate} className="h-2" />
              </div>

              {/* By Unit */}
              <div className="grid gap-4">
                {Object.entries(employeesByUnit).map(([unit, unitEmployees]) => (
                  <Card key={unit}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{getUnitName(unit as Unit)}</span>
                        <Badge variant="outline">{unitEmployees.length} colaboradores</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {unitEmployees.slice(0, 5).map(emp => (
                          <div key={emp.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{emp.name}</span>
                              <p className="text-sm text-gray-600">{emp.position}</p>
                            </div>
                            <Badge variant="secondary">{emp.department}</Badge>
                          </div>
                        ))}
                        {unitEmployees.length > 5 && (
                          <div className="text-center pt-2">
                            <Button variant="outline" size="sm">
                              Ver mais {unitEmployees.length - 5} colaboradores
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        };

      case 'turnover':
        const turnoverData = [
          { month: 'Dezembro 2024', rate: 2.8, employees: 4, trend: 'down' },
          { month: 'Novembro 2024', rate: 3.2, employees: 4, trend: 'down' },
          { month: 'Outubro 2024', rate: 4.5, employees: 6, trend: 'up' },
          { month: 'Setembro 2024', rate: 3.1, employees: 4, trend: 'down' },
          { month: 'Agosto 2024', rate: 5.2, employees: 7, trend: 'up' },
          { month: 'Julho 2024', rate: 2.9, employees: 4, trend: 'down' }
        ];

        return {
          title: 'Turnover Mensal',
          description: 'Análise detalhada do turnover por período e tendências',
          content: (
            <div className="space-y-6">
              {/* Current Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">3.2%</p>
                    <p className="text-sm text-gray-600">Taxa Atual</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">3.6%</p>
                    <p className="text-sm text-gray-600">Média 6 meses</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">5.0%</p>
                    <p className="text-sm text-gray-600">Meta Máxima</p>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico dos Últimos 6 Meses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {turnoverData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{data.month}</span>
                          <p className="text-sm text-gray-600">{data.employees} desligamentos</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={data.rate <= 5 ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}
                          >
                            {data.rate}%
                          </Badge>
                          <TrendingUp 
                            className={`w-4 h-4 ${data.trend === 'down' ? 'text-green-600 rotate-180' : 'text-red-600'}`} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Insights</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Taxa atual está 36% abaixo da meta máxima</li>
                    <li>• Tendência de melhoria nos últimos 3 meses</li>
                    <li>• Campo Grande apresenta a menor taxa de turnover</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )
        };

      case 'nps':
        return {
          title: 'NPS Interno - Pesquisa de Clima',
          description: 'Análise completa da satisfação dos colaboradores',
          content: (
            <div className="space-y-6">
              {/* Current NPS */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">8.4</div>
                  <p className="text-lg text-purple-800">NPS Atual</p>
                  <p className="text-sm text-purple-600">Excelente clima organizacional</p>
                </CardContent>
              </Card>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">68%</p>
                    <p className="text-sm text-gray-600">Promotores</p>
                    <p className="text-xs text-green-600">Notas 9-10</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">20%</p>
                    <p className="text-sm text-gray-600">Neutros</p>
                    <p className="text-xs text-yellow-600">Notas 7-8</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">12%</p>
                    <p className="text-sm text-gray-600">Detratores</p>
                    <p className="text-xs text-red-600">Notas 0-6</p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Promotores</span>
                    <span>68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Neutros</span>
                    <span>20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Detratores</span>
                    <span>12%</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
              </div>

              {/* By Unit */}
              <Card>
                <CardHeader>
                  <CardTitle>NPS por Unidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Campo Grande</span>
                      <Badge className="bg-green-100 text-green-800">8.7</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Barra</span>
                      <Badge className="bg-green-100 text-green-800">8.3</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Recreio</span>
                      <Badge className="bg-green-100 text-green-800">8.2</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card className="bg-yellow-50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">🎯 Próximas Ações</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Implementar feedback individual para detratores</li>
                    <li>• Criar grupos de melhoria com neutros</li>
                    <li>• Replicar boas práticas da unidade Campo Grande</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )
        };

      case 'alerts':
        const alertsData = [
          { type: 'Documentos Vencidos', count: 7, color: 'red', items: ['CPF - João Silva', 'Carteira de Trabalho - Maria Santos', 'Comprovante de Residência - Pedro Costa'] },
          { type: 'Avaliações Pendentes', count: 5, color: 'orange', items: ['Avaliação 360° - Ana Oliveira', 'Coffee Connection - Carlos Lima', 'Feedback Trimestral - Lucia Fernandes'] },
          { type: 'Férias Vencendo', count: 3, color: 'yellow', items: ['30 dias - Roberto Silva', '15 dias - Fernanda Costa', '45 dias - Marcos Antonio'] },
          { type: 'Certificações', count: 2, color: 'blue', items: ['NR-10 - Técnico João', 'Primeiros Socorros - Recepcionista Ana'] }
        ];

        return {
          title: 'Alertas e Pendências',
          description: 'Monitoramento de itens que requerem atenção',
          content: (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">17</p>
                    <p className="text-sm text-gray-600">Total de Alertas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">7</p>
                    <p className="text-sm text-gray-600">Críticos</p>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts by Category */}
              <div className="space-y-4">
                {alertsData.map((alert, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{alert.type}</span>
                        <Badge 
                          variant="outline" 
                          className={
                            alert.color === 'red' ? 'text-red-600 border-red-300' :
                            alert.color === 'orange' ? 'text-orange-600 border-orange-300' :
                            alert.color === 'yellow' ? 'text-yellow-600 border-yellow-300' :
                            'text-blue-600 border-blue-300'
                          }
                        >
                          {alert.count} itens
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {alert.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{item}</span>
                            <Button variant="outline" size="sm">
                              Resolver
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        };

      case 'admissions':
        const admissionsData = [
          { name: 'Ana Carolina Silva', position: 'Professora de Piano', unit: 'Campo Grande', date: '2024-03-15', status: 'Concluída' },
          { name: 'Roberto Martins', position: 'Professor de Violão', unit: 'Barra', date: '2024-03-12', status: 'Documentação' },
          { name: 'Fernanda Costa', position: 'Recepcionista', unit: 'Recreio', date: '2024-03-10', status: 'Concluída' },
          { name: 'Carlos Eduardo', position: 'Professor de Bateria', unit: 'Campo Grande', date: '2024-03-08', status: 'Integração' }
        ];

        return {
          title: 'Admissões dos Últimos 30 Dias',
          description: 'Novos colaboradores e status de integração',
          content: (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">8</p>
                    <p className="text-sm text-gray-600">Total de Admissões</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">6</p>
                    <p className="text-sm text-gray-600">Integração Completa</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">2</p>
                    <p className="text-sm text-gray-600">Em Andamento</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Admissions */}
              <Card>
                <CardHeader>
                  <CardTitle>Admissões Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {admissionsData.map((admission, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{admission.name}</p>
                          <p className="text-sm text-gray-600">{admission.position}</p>
                          <p className="text-xs text-gray-500">{admission.unit} • {new Date(admission.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <Badge 
                          variant="outline"
                          className={
                            admission.status === 'Concluída' ? 'text-green-600 border-green-300' :
                            admission.status === 'Integração' ? 'text-blue-600 border-blue-300' :
                            'text-orange-600 border-orange-300'
                          }
                        >
                          {admission.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="bg-green-50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-green-900 mb-2">📋 Próximos Passos</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Finalizar documentação de Roberto Martins</li>
                    <li>• Agendar coffee connection para Carlos Eduardo</li>
                    <li>• Preparar materiais de integração para próximas admissões</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )
        };

      case 'evaluations':
        const evaluationsData = [
          { employee: 'Ana Silva', type: 'Avaliação 360°', dueDate: '2024-03-25', status: 'Pendente', priority: 'high' },
          { employee: 'Carlos Santos', type: 'Coffee Connection', dueDate: '2024-03-28', status: 'Agendado', priority: 'medium' },
          { employee: 'Maria Oliveira', type: 'Feedback Trimestral', dueDate: '2024-03-30', status: 'Pendente', priority: 'medium' },
          { employee: 'João Costa', type: 'Avaliação de Desempenho', dueDate: '2024-04-02', status: 'Pendente', priority: 'low' }
        ];

        return {
          title: 'Avaliações Pendentes',
          description: 'Cronograma de avaliações e feedback dos colaboradores',
          content: (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">15</p>
                    <p className="text-sm text-gray-600">Total Pendentes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">5</p>
                    <p className="text-sm text-gray-600">Vencimento Próximo</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">78%</p>
                    <p className="text-sm text-gray-600">Taxa de Conclusão</p>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Evaluations */}
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Avaliações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {evaluationsData.map((evaluation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{evaluation.employee}</p>
                          <p className="text-sm text-gray-600">{evaluation.type}</p>
                          <p className="text-xs text-gray-500">Vencimento: {new Date(evaluation.dueDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={
                              evaluation.priority === 'high' ? 'text-red-600 border-red-300' :
                              evaluation.priority === 'medium' ? 'text-orange-600 border-orange-300' :
                              'text-green-600 border-green-300'
                            }
                          >
                            {evaluation.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Agendar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        };

      case 'hours':
        return {
          title: 'Horas Trabalhadas',
          description: 'Controle de jornada e produtividade da equipe',
          content: (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">2.847h</p>
                    <p className="text-sm text-gray-600">Esta Semana</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">11.234h</p>
                    <p className="text-sm text-gray-600">Este Mês</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">98.5%</p>
                    <p className="text-sm text-gray-600">Adesão ao Ponto</p>
                  </CardContent>
                </Card>
              </div>

              {/* By Unit */}
              <Card>
                <CardHeader>
                  <CardTitle>Horas por Unidade (Semana)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Campo Grande</span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-24 h-2" />
                        <span className="text-sm font-medium">1.247h</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Barra</span>
                      <div className="flex items-center gap-2">
                        <Progress value={78} className="w-24 h-2" />
                        <span className="text-sm font-medium">892h</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Recreio</span>
                      <div className="flex items-center gap-2">
                        <Progress value={72} className="w-24 h-2" />
                        <span className="text-sm font-medium">708h</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card className="bg-yellow-50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ Atenção</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• 3 colaboradores com horas extras excessivas</li>
                    <li>• 2 faltas não justificadas esta semana</li>
                    <li>• Sistema de ponto offline em 2 ocasiões</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )
        };

      case 'incidents':
        const incidentsData = [
          { id: 1, type: 'Atraso Recorrente', employee: 'Pedro Silva', date: '2024-03-20', severity: 'low', status: 'Em Análise' },
          { id: 2, type: 'Conflito Interpessoal', employee: 'Maria Santos', date: '2024-03-18', severity: 'medium', status: 'Resolvido' },
          { id: 3, type: 'Não Cumprimento de Protocolo', employee: 'João Costa', date: '2024-03-15', severity: 'high', status: 'Ação Disciplinar' }
        ];

        return {
          title: 'Ocorrências e Incidentes',
          description: 'Gestão de ocorrências disciplinares e comportamentais',
          content: (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">3</p>
                    <p className="text-sm text-gray-600">Este Mês</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">1</p>
                    <p className="text-sm text-gray-600">Em Análise</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">2</p>
                    <p className="text-sm text-gray-600">Resolvidos</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Incidents */}
              <Card>
                <CardHeader>
                  <CardTitle>Ocorrências Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {incidentsData.map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{incident.type}</p>
                          <p className="text-sm text-gray-600">Colaborador: {incident.employee}</p>
                          <p className="text-xs text-gray-500">{new Date(incident.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={
                              incident.severity === 'high' ? 'text-red-600 border-red-300' :
                              incident.severity === 'medium' ? 'text-orange-600 border-orange-300' :
                              'text-yellow-600 border-yellow-300'
                            }
                          >
                            {incident.severity === 'high' ? 'Alta' : incident.severity === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                          <Badge variant="secondary">
                            {incident.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Prevention */}
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🛡️ Ações Preventivas</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Treinamento de comunicação não violenta agendado</li>
                    <li>• Revisão dos protocolos de atendimento em andamento</li>
                    <li>• Implementação de sistema de feedback contínuo</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )
        };

      default:
        return {
          title: 'Detalhes do KPI',
          description: 'Informações detalhadas sobre este indicador',
          content: <p>Dados em desenvolvimento...</p>
        };
    }
  };

  const modalContent = getModalContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'employees' && <Users className="w-5 h-5" />}
            {type === 'turnover' && <TrendingUp className="w-5 h-5" />}
            {type === 'nps' && <Award className="w-5 h-5" />}
            {type === 'alerts' && <AlertTriangle className="w-5 h-5" />}
            {type === 'admissions' && <UserPlus className="w-5 h-5" />}
            {type === 'evaluations' && <Calendar className="w-5 h-5" />}
            {type === 'hours' && <Clock className="w-5 h-5" />}
            {type === 'incidents' && <FileText className="w-5 h-5" />}
            {modalContent.title}
          </DialogTitle>
          <DialogDescription>
            {modalContent.description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {modalContent.content}
        </div>
      </DialogContent>
    </Dialog>
  );
};
