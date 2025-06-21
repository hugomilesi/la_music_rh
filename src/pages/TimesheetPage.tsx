
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Filter, Search, Download, Clock, CheckCircle, XCircle } from 'lucide-react';

const mockTimesheet = [
  {
    id: 1,
    employee: 'Ana Silva',
    date: '2024-03-21',
    entry: '08:00',
    lunchOut: '12:00',
    lunchIn: '13:00',
    exit: '17:00',
    totalHours: '08:00',
    status: 'completo'
  },
  {
    id: 2,
    employee: 'Carlos Santos',
    date: '2024-03-21',
    entry: '08:15',
    lunchOut: '12:00',
    lunchIn: '13:00',
    exit: '17:00',
    totalHours: '07:45',
    status: 'atraso'
  },
  {
    id: 3,
    employee: 'Maria Oliveira',
    date: '2024-03-21',
    entry: '08:00',
    lunchOut: '12:00',
    lunchIn: null,
    exit: null,
    totalHours: '-',
    status: 'em_andamento'
  }
];

const TimesheetPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('2024-03-21');

  const getStatusBadge = (status: string) => {
    const variants = {
      'completo': 'bg-green-100 text-green-800',
      'atraso': 'bg-yellow-100 text-yellow-800',
      'falta': 'bg-red-100 text-red-800',
      'em_andamento': 'bg-blue-100 text-blue-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completo':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'atraso':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'falta':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Ponto</h1>
          <p className="text-gray-600 mt-1">Gestão de horários e frequência dos colaboradores</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar Planilha
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Marcar Ponto Manual
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Presentes Hoje</p>
                <p className="text-2xl font-bold text-green-600">142</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Atrasos</p>
                <p className="text-2xl font-bold text-yellow-600">8</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Faltas</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Horas Trabalhadas</p>
                <p className="text-2xl font-bold">1.136h</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por colaborador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />

              <select className="px-3 py-2 border border-gray-200 rounded-md text-sm">
                <option value="all">Todas as Unidades</option>
                <option value="centro">Centro</option>
                <option value="zona-sul">Zona Sul</option>
                <option value="norte">Norte</option>
              </select>

              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timesheet Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Ponto - {new Date(selectedDate).toLocaleDateString('pt-BR')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída Almoço</TableHead>
                <TableHead>Volta Almoço</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Total Horas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTimesheet.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.employee}</TableCell>
                  <TableCell>{record.entry}</TableCell>
                  <TableCell>{record.lunchOut || '-'}</TableCell>
                  <TableCell>{record.lunchIn || '-'}</TableCell>
                  <TableCell>{record.exit || '-'}</TableCell>
                  <TableCell className="font-medium">{record.totalHours}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <Badge className={getStatusBadge(record.status)}>
                        {record.status === 'completo' ? 'Completo' :
                         record.status === 'atraso' ? 'Atraso' :
                         record.status === 'falta' ? 'Falta' : 'Em Andamento'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimesheetPage;
