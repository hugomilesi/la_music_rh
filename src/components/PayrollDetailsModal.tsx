import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  id: string;
  name: string;
  position: string;
  classification: string;
  unit: string;
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
  bank: string;
  agency: string;
  account: string;
  cpf: string;
  pix: string;
}

interface UnitSummary {
  name: string;
  total: number;
  employees: number;
  averagePerEmployee: number;
  color: string;
}

interface PayrollDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalGeneral: number;
  allEmployees: Employee[];
  unitSummaries: UnitSummary[];
  formatCurrency: (value: number) => string;
}

const PayrollDetailsModal: React.FC<PayrollDetailsModalProps> = ({
  isOpen,
  onClose,
  totalGeneral,
  allEmployees,
  unitSummaries,
  formatCurrency,
}) => {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            Detalhes da Folha de Pagamento - Total Geral
          </DialogTitle>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayrollDetailsModal;