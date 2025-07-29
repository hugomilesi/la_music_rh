import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  DollarSign,
  TrendingUp,
  Building2,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  position: string;
  classification: string;
  unit: string;
  salary: number;
  benefits: number;
  total: number;
}

interface ClassificationCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  allEmployees: Record<string, Employee[]>;
  formatCurrency: (value: number) => string;
}

const ClassificationCostModal: React.FC<ClassificationCostModalProps> = ({
  isOpen,
  onClose,
  allEmployees,
  formatCurrency,
}) => {
  // Flatten all employees
  const allEmployeesList = Object.values(allEmployees).flat();

  // Calculate classification statistics
  const classificationStats = allEmployeesList.reduce((acc, employee) => {
    const classification = employee.classification;
    if (!acc[classification]) {
      acc[classification] = {
        count: 0,
        totalCost: 0,
        employees: [],
      };
    }
    acc[classification].count += 1;
    acc[classification].totalCost += employee.total;
    acc[classification].employees.push(employee);
    return acc;
  }, {} as Record<string, { count: number; totalCost: number; employees: Employee[] }>);

  // Prepare chart data
  const chartData = Object.entries(classificationStats).map(([classification, stats]) => ({
    name: classification,
    value: stats.totalCost,
    count: stats.count,
    average: stats.totalCost / stats.count,
    color: getClassificationColor(classification),
  }));

  // Calculate totals
  const totalEmployees = allEmployeesList.length;
  const totalCost = allEmployeesList.reduce((sum, emp) => sum + emp.total, 0);
  const averageCost = totalCost / totalEmployees;

  // Unit distribution for each classification
  const unitDistribution = Object.entries(classificationStats).map(([classification, stats]) => {
    const unitBreakdown = stats.employees.reduce((acc, emp) => {
      if (!acc[emp.unit]) acc[emp.unit] = 0;
      acc[emp.unit] += 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      classification,
      units: Object.entries(unitBreakdown).map(([unit, count]) => ({
        unit,
        count,
        percentage: (count / stats.count) * 100,
      })),
    };
  });

  function getClassificationColor(classification: string): string {
    const colors: Record<string, string> = {
      'CLT': '#10b981',
      'PJ': '#3b82f6',
      'Horista': '#f59e0b',
      'Estagiário': '#8b5cf6',
    };
    return colors[classification] || '#6b7280';
  }

  function getUnitName(unitKey: string): string {
    const unitNames: Record<string, string> = {
      'recreio': 'Recreio',
      'campo-grande': 'Campo Grande',
      'barra': 'Barra',
      'staff-rateado': 'Staff Rateado',
    };
    return unitNames[unitKey] || unitKey;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Detalhes - Custo por Classificação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Funcionários</p>
                    <p className="text-2xl font-bold">{totalEmployees}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Custo Médio</p>
                    <p className="text-2xl font-bold">{formatCurrency(averageCost)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Classificações</p>
                    <p className="text-2xl font-bold">{Object.keys(classificationStats).length}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost by Classification Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Custo por Classificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        'Custo Total'
                      ]}
                      labelFormatter={(label) => `Classificação: ${label}`}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Distribuição de Funcionários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value} funcionários`,
                        'Quantidade'
                      ]}
                    />
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Classification Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Classificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(classificationStats).map(([classification, stats]) => (
                  <Card key={classification} className="border-l-4" style={{ borderLeftColor: getClassificationColor(classification) }}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge style={{ backgroundColor: getClassificationColor(classification), color: 'white' }}>
                            {classification}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {stats.count} funcionários
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Custo Total</p>
                          <p className="text-lg font-bold">{formatCurrency(stats.totalCost)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Custo Médio</p>
                          <p className="text-sm font-semibold">{formatCurrency(stats.totalCost / stats.count)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">% do Total</p>
                          <p className="text-sm font-semibold">
                            {((stats.totalCost / totalCost) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Employee List by Classification */}
          <Card>
            <CardHeader>
              <CardTitle>Funcionários por Classificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(classificationStats).map(([classification, stats]) => (
                  <div key={classification}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge style={{ backgroundColor: getClassificationColor(classification), color: 'white' }}>
                        {classification}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {stats.count} funcionários - {formatCurrency(stats.totalCost)}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Unidade</TableHead>
                            <TableHead className="text-right">Salário</TableHead>
                            <TableHead className="text-right">Benefícios</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.employees
                            .sort((a, b) => b.total - a.total)
                            .map((employee) => (
                            <TableRow key={employee.id}>
                              <TableCell className="font-medium">{employee.name}</TableCell>
                              <TableCell>{employee.position}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getUnitName(employee.unit)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">{formatCurrency(employee.salary)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(employee.benefits)}</TableCell>
                              <TableCell className="text-right font-semibold">{formatCurrency(employee.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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

export default ClassificationCostModal;