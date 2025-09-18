import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Users,
  TrendingUp,
  Calculator,
  Building2,
  PieChart,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface Employee {
  id: string | number;
  name: string;
  position: string;
  classification: string;
  unit: string;
  units: string[];
  salary: number;
  transport: number;
  bonus: number;
  commission: number;
  reimbursement: number;
  thirteenth: number;
  inss: number;
  store: number;
  bistro: number;
  advance: number;
  discount: number;
  total: number;
  bank: string;
  agency: string;
  account: string;
  cpf: string;
  pix: string;
  notes: string;
  date: string;
  // Campos adicionais para professores multi-unidade
  salaryRecreio?: number;
  salaryCampoGrande?: number;
  salaryBarra?: number;
  lalita?: number;
  passagens?: number;
}

interface UnitSummary {
  name: string;
  total: number;
  employees: number;
  averagePerEmployee: number;
  color: string;
}

interface PayrollDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalGeneral: number;
  allEmployees: any[];
  unitSummaries: any[];
  formatCurrency: (value: number) => string;
}

const PayrollDetailsModal: React.FC<PayrollDetailsModalProps> = ({
  open,
  onOpenChange,
  totalGeneral,
  allEmployees,
  unitSummaries,
  formatCurrency,
}) => {


  // Verificar se temos dados válidos
  if (!allEmployees || allEmployees.length === 0) {

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Folha de Pagamento</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">
            <p className="text-gray-500">Nenhum dado de folha de pagamento encontrado.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  // Calcular estatísticas detalhadas
  const totalEmployees = allEmployees.length;
  const averageSalary = totalEmployees > 0 ? totalGeneral / totalEmployees : 0;
  
  // Calcular distribuição por classificação
  const classificationData = allEmployees.reduce((acc, emp) => {
    const existing = acc.find(item => item.name === emp.classification);
    const empTotal = emp.salary + emp.transport + emp.bonus + emp.commission + emp.reimbursement + emp.thirteenth;
    
    if (existing) {
      existing.value += empTotal;
      existing.count += 1;
    } else {
      acc.push({
        name: emp.classification,
        value: empTotal,
        count: 1,
        color: getClassificationColor(emp.classification)
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; count: number; color: string }>);

  // Calcular custos por categoria
  const costBreakdown = {
    salarios: allEmployees.reduce((sum, emp) => sum + emp.salary, 0),
    beneficios: allEmployees.reduce((sum, emp) => sum + emp.transport + emp.bonus + emp.reimbursement, 0),
    comissoes: allEmployees.reduce((sum, emp) => sum + emp.commission, 0),
    decimoTerceiro: allEmployees.reduce((sum, emp) => sum + emp.thirteenth, 0),
    deducoes: allEmployees.reduce((sum, emp) => sum + emp.inss + emp.store + emp.bistro + emp.advance + emp.discount, 0),
  };

  const costBreakdownData = [
    { name: 'Salários', value: costBreakdown.salarios, color: '#3b82f6' },
    { name: 'Benefícios', value: costBreakdown.beneficios, color: '#10b981' },
    { name: 'Comissões', value: costBreakdown.comissoes, color: '#f59e0b' },
    { name: '13º Salário', value: costBreakdown.decimoTerceiro, color: '#8b5cf6' },
    { name: 'Deduções', value: -costBreakdown.deducoes, color: '#3b82f6' },
  ];

  function getClassificationColor(classification: string): string {
    const colors = {
      'Professor': '#3b82f6',
      'Coordenador': '#10b981',
      'Administrativo': '#f59e0b',
      'Diretor': '#8b5cf6',
      'Estagiário': '#06b6d4',
      'Terceirizado': '#84cc16',
    };
    return colors[classification as keyof typeof colors] || '#6b7280';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            Detalhes da Folha de Pagamento - Total Geral
          </DialogTitle>
          <DialogDescription>
            Visualização detalhada dos dados da folha de pagamento com estatísticas, gráficos e resumos por unidade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Executivo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/60 backdrop-blur-md border border-white/30 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-sm">Total Bruto</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalGeneral)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-md border border-white/30 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-sm">Funcionários</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {totalEmployees}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-md border border-white/30 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-sm">Média Salarial</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(averageSalary)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-md border border-white/30 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-sm">Unidades</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {unitSummaries.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos Detalhados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Classificação */}
            <Card className="bg-white/60 backdrop-blur-md border border-white/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Distribuição por Classificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        `${name} (${classificationData.find(d => d.name === name)?.count || 0} funcionários)`
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Pie
                      data={classificationData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {classificationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Composição de Custos */}
            <Card className="bg-white/60 backdrop-blur-md border border-white/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Composição de Custos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Resumo por Unidade */}
          <Card className="bg-white/60 backdrop-blur-md border border-white/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Resumo por Unidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unitSummaries.map((unit) => (
                  <div key={unit.name} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: unit.color }}
                      />
                      <span className="font-medium">{unit.name}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold">
                        {formatCurrency(unit.total)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {unit.employees} funcionários
                      </div>
                      <div className="text-xs text-gray-500">
                        Média: {formatCurrency(unit.averagePerEmployee)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {((unit.total / totalGeneral) * 100).toFixed(1)}% do total
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas por Classificação */}
          <Card className="bg-white/60 backdrop-blur-md border border-white/30 shadow-lg">
            <CardHeader>
              <CardTitle>Estatísticas por Classificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classificationData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="secondary">{item.count} funcionários</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(item.value)}</div>
                      <div className="text-sm text-gray-500">
                        Média: {formatCurrency(item.value / item.count)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detalhes dos Funcionários */}
          <Card className="bg-white/60 backdrop-blur-md border border-white/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Detalhes dos Funcionários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {allEmployees.map((employee) => (
                  <div key={employee.id} className="p-4 border rounded-lg bg-white/40">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{employee.name}</h4>
                        <p className="text-sm text-gray-600">{employee.position}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{employee.classification}</Badge>
                          <Badge variant="secondary">{employee.unit}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(employee.total)}</div>
                        <div className="text-sm text-gray-500">Total</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Salário:</span>
                        <div className="font-medium">{formatCurrency(employee.salary)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Vale Transporte:</span>
                        <div className="font-medium">{formatCurrency(employee.transport)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">13º Salário:</span>
                        <div className="font-medium">{formatCurrency(employee.thirteenth)}</div>
                      </div>
                      {employee.bonus > 0 && (
                        <div>
                          <span className="text-gray-600">Bônus:</span>
                          <div className="font-medium">{formatCurrency(employee.bonus)}</div>
                        </div>
                      )}
                      {employee.commission > 0 && (
                        <div>
                          <span className="text-gray-600">Comissão:</span>
                          <div className="font-medium">{formatCurrency(employee.commission)}</div>
                        </div>
                      )}
                      {employee.reimbursement > 0 && (
                        <div>
                          <span className="text-gray-600">Reembolso:</span>
                          <div className="font-medium">{formatCurrency(employee.reimbursement)}</div>
                        </div>
                      )}
                      {employee.inss > 0 && (
                        <div>
                          <span className="text-gray-600">INSS:</span>
                          <div className="font-medium text-red-600">-{formatCurrency(employee.inss)}</div>
                        </div>
                      )}
                      {employee.store > 0 && (
                        <div>
                          <span className="text-gray-600">Loja:</span>
                          <div className="font-medium text-red-600">-{formatCurrency(employee.store)}</div>
                        </div>
                      )}
                      {employee.bistro > 0 && (
                        <div>
                          <span className="text-gray-600">Bistrô:</span>
                          <div className="font-medium text-red-600">-{formatCurrency(employee.bistro)}</div>
                        </div>
                      )}
                      {employee.advance > 0 && (
                        <div>
                          <span className="text-gray-600">Adiantamento:</span>
                          <div className="font-medium text-red-600">-{formatCurrency(employee.advance)}</div>
                        </div>
                      )}
                      {employee.discount > 0 && (
                        <div>
                          <span className="text-gray-600">Desconto:</span>
                          <div className="font-medium text-red-600">-{formatCurrency(employee.discount)}</div>
                        </div>
                      )}
                    </div>

                    {/* Informações Bancárias */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Banco:</span>
                          <div className="font-medium">{employee.bank || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Agência:</span>
                          <div className="font-medium">{employee.agency || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Conta:</span>
                          <div className="font-medium">{employee.account || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">PIX:</span>
                          <div className="font-medium">{employee.pix || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Notas e Data */}
                    {(employee.notes || employee.date) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {employee.date && (
                          <div className="mb-2">
                            <span className="text-gray-600 text-sm">Data:</span>
                            <div className="font-medium">{employee.date}</div>
                          </div>
                        )}
                        {employee.notes && (
                          <div>
                            <span className="text-gray-600 text-sm">Notas:</span>
                            <div className="font-medium bg-yellow-50 p-2 rounded mt-1">{employee.notes}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayrollDetailsModal;