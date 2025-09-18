import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  DollarSign,
  TrendingUp,
  Building2,
  Calculator,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  position: string;
  unit: string;
  classification: string;
  salary: number;
  benefits: number;
  taxes: number;
  total: number;
}

interface ClassificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classification: string;
  employees: Employee[];
  formatCurrency: (value: number) => string;
}

export function ClassificationDetailsModal({
  isOpen,
  onClose,
  classification,
  employees,
  formatCurrency,
}: ClassificationDetailsModalProps) {
  // Filtrar funcionários pela classificação
  const classificationEmployees = employees.filter(emp => emp.classification === classification);
  
  // Calcular estatísticas
  const totalEmployees = classificationEmployees.length;
  const totalCost = classificationEmployees.reduce((sum, emp) => sum + emp.total, 0);
  const averageCost = totalEmployees > 0 ? totalCost / totalEmployees : 0;
  const totalSalaries = classificationEmployees.reduce((sum, emp) => sum + emp.salary, 0);
  const totalBenefits = classificationEmployees.reduce((sum, emp) => sum + emp.benefits, 0);
  const totalTaxes = classificationEmployees.reduce((sum, emp) => sum + emp.taxes, 0);

  // Distribuição por unidade
  const unitDistribution = classificationEmployees.reduce((acc, emp) => {
    const existing = acc.find(item => item.name === emp.unit);
    if (existing) {
      existing.value += emp.total;
      existing.count += 1;
    } else {
      acc.push({
        name: emp.unit,
        value: emp.total,
        count: 1,
        color: getUnitColor(emp.unit),
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; count: number; color: string }>);

  // Composição de custos
  const costComposition = [
    { name: 'Salários', value: totalSalaries, color: '#3B82F6' },
    { name: 'Benefícios', value: totalBenefits, color: '#10B981' },
    { name: 'Impostos', value: totalTaxes, color: '#F59E0B' },
  ];

  function getUnitColor(unit: string): string {
    const colors: Record<string, string> = {
      'Recreio': '#3B82F6',
      'Campo Grande': '#10B981',
      'Barra': '#F59E0B',
      'Staff Rateado': '#EF4444',
    };
    return colors[unit] || '#8B5CF6';
  }

  function getClassificationColor(classification: string): string {
    const colors: Record<string, string> = {
      'CLT': '#3B82F6',
      'PJ': '#10B981',
      'Horista': '#F59E0B',
      'Estagiário': '#EF4444',
    };
    return colors[classification] || '#8B5CF6';
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Detalhes - {classification}
          </DialogTitle>
          <DialogDescription>
            Visualização detalhada dos funcionários e estatísticas da classificação {classification}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cards de Resumo Executivo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  {((totalEmployees / employees.length) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
                <p className="text-xs text-muted-foreground">
                  {((totalCost / employees.reduce((sum, emp) => sum + emp.total, 0)) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(averageCost)}</div>
                <p className="text-xs text-muted-foreground">
                  Por funcionário
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unidades</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unitDistribution.length}</div>
                <p className="text-xs text-muted-foreground">
                  Unidades com {classification}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Unidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Distribuição por Unidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={unitDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {unitDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Composição de Custos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Composição de Custos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costComposition}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                      {costComposition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Resumo por Unidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Resumo por Unidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {unitDistribution.map((unit) => (
                  <Card key={unit.name} className="border-l-4" style={{ borderLeftColor: unit.color }}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{unit.name}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Funcionários:</span>
                            <span className="font-medium">{unit.count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Custo Total:</span>
                            <span className="font-medium">{formatCurrency(unit.value)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Custo Médio:</span>
                            <span className="font-medium">{formatCurrency(unit.value / unit.count)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lista de Funcionários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Funcionários - {classification}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Salário</TableHead>
                    <TableHead>Benefícios</TableHead>
                    <TableHead>Impostos</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classificationEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <Badge variant="outline" style={{ borderColor: getUnitColor(employee.unit) }}>
                          {employee.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(employee.salary)}</TableCell>
                      <TableCell>{formatCurrency(employee.benefits)}</TableCell>
                      <TableCell>{formatCurrency(employee.taxes)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(employee.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}