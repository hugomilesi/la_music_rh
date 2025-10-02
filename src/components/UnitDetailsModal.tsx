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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  Users,
  DollarSign,
  TrendingUp,
  Building2,
  Search,
  Download,
  FileText,
  Calculator,
  PieChart as PieChartIcon,
  BarChart3,
  Eye,
  EyeOff,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  position: string;
  classification: 'CLT' | 'PJ' | 'Horista' | 'Estagiário';
  salary: number;
  transport: number;
  bonus: number;
  commission: number;
  reimbursement: number;
  thirteenthVacation: number;
  inss: number;
  store: number;
  bistro: number;
  advance: number;
  discount: number;
  bank?: string;
  agency?: string;
  account?: string;
  cpf?: string;
  pix?: string;
}

interface UnitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitName: string;
  unitKey: string;
  employees: Employee[];
  showSensitiveData: boolean;
  onToggleSensitiveData: () => void;
}

const UnitDetailsModal: React.FC<UnitDetailsModalProps> = ({
  isOpen,
  onClose,
  unitName,
  unitKey,
  employees,
  showSensitiveData,
  onToggleSensitiveData,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedClassification, setSelectedClassification] = React.useState('Todos');

  // Função para calcular o total de um funcionário
  const calculateEmployeeTotal = (employee: Employee): number => {
    return (
      employee.salary +
      employee.transport +
      employee.bonus +
      employee.commission +
      employee.reimbursement +
      employee.thirteenthVacation +
      employee.inss +
      employee.store +
      employee.bistro +
      employee.advance -
      employee.discount
    );
  };

  // Filtrar funcionários
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClassification = selectedClassification === 'Todos' || employee.classification === selectedClassification;
    return matchesSearch && matchesClassification;
  });

  // Calcular estatísticas da unidade
  const totalCost = employees.reduce((sum, emp) => sum + calculateEmployeeTotal(emp), 0);
  const totalEmployees = employees.length;
  const averageCost = totalEmployees > 0 ? totalCost / totalEmployees : 0;

  // Dados por classificação
  const classificationData = [
    {
      name: 'CLT',
      employees: employees.filter(e => e.classification === 'CLT').length,
      cost: employees.filter(e => e.classification === 'CLT').reduce((sum, e) => sum + calculateEmployeeTotal(e), 0),
      color: '#3B82F6'
    },
    {
      name: 'PJ',
      employees: employees.filter(e => e.classification === 'PJ').length,
      cost: employees.filter(e => e.classification === 'PJ').reduce((sum, e) => sum + calculateEmployeeTotal(e), 0),
      color: '#10B981'
    },
    {
      name: 'Horista',
      employees: employees.filter(e => e.classification === 'Horista').length,
      cost: employees.filter(e => e.classification === 'Horista').reduce((sum, e) => sum + calculateEmployeeTotal(e), 0),
      color: '#F59E0B'
    },
    {
      name: 'Estagiário',
      employees: employees.filter(e => e.classification === 'Estagiário').length,
      cost: employees.filter(e => e.classification === 'Estagiário').reduce((sum, e) => sum + calculateEmployeeTotal(e), 0),
      color: '#EF4444'
    }
  ].filter(item => item.employees > 0);

  // Dados de evolução (mock data)
  const evolutionData = [
    { month: 'Ago', cost: totalCost * 0.85 },
    { month: 'Set', cost: totalCost * 0.90 },
    { month: 'Out', cost: totalCost * 0.95 },
    { month: 'Nov', cost: totalCost * 0.98 },
    { month: 'Dez', cost: totalCost * 1.02 },
    { month: 'Jan', cost: totalCost }
  ];

  // Dados de distribuição salarial
  const salaryRanges = [
    { range: 'Até R$ 2.000', count: employees.filter(e => calculateEmployeeTotal(e) <= 2000).length, color: '#EF4444' },
    { range: 'R$ 2.001 - R$ 4.000', count: employees.filter(e => calculateEmployeeTotal(e) > 2000 && calculateEmployeeTotal(e) <= 4000).length, color: '#F59E0B' },
    { range: 'R$ 4.001 - R$ 6.000', count: employees.filter(e => calculateEmployeeTotal(e) > 4000 && calculateEmployeeTotal(e) <= 6000).length, color: '#10B981' },
    { range: 'R$ 6.001 - R$ 10.000', count: employees.filter(e => calculateEmployeeTotal(e) > 6000 && calculateEmployeeTotal(e) <= 10000).length, color: '#3B82F6' },
    { range: 'Acima de R$ 10.000', count: employees.filter(e => calculateEmployeeTotal(e) > 10000).length, color: '#8B5CF6' }
  ].filter(item => item.count > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="w-6 h-6" />
            Detalhes da Unidade - {unitName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Executivo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/60 backdrop-blur-md border border-white/30 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Funcionários</p>
                    <p className="text-2xl font-bold text-blue-600">{totalEmployees}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Custo Total</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCost)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Custo Médio</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(averageCost)}</p>
                  </div>
                  <Calculator className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Classificações</p>
                    <p className="text-2xl font-bold text-purple-600">{classificationData.length}</p>
                  </div>
                  <PieChartIcon className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Classificação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Distribuição por Classificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={classificationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="employees"
                    >
                      {classificationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Custo por Classificação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Custo por Classificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classificationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="cost" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Evolução dos Custos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Evolução dos Custos (6 meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="cost" stroke="#8B5CF6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição Salarial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Distribuição Salarial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salaryRanges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Resumo por Classificação */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Classificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {classificationData.map((item) => (
                  <div key={item.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge style={{ backgroundColor: item.color, color: 'white' }}>
                        {item.name}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Funcionários: <span className="font-semibold">{item.employees}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Custo Total: <span className="font-semibold">{formatCurrency(item.cost)}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Custo Médio: <span className="font-semibold">
                          {formatCurrency(item.employees > 0 ? item.cost / item.employees : 0)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumo Estatístico */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resumo da Unidade</h3>
            <p className="text-sm text-gray-600">
              Esta unidade possui {filteredEmployees.length} funcionários ativos com dados detalhados disponíveis nos gráficos acima.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnitDetailsModal;