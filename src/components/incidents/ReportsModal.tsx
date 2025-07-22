
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Printer } from 'lucide-react';
import { useIncidents } from '@/contexts/IncidentsContext';

interface ReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  open,
  onOpenChange
}) => {
  const { incidents } = useIncidents();

  // Generate chart data
  const severityData = [
    { name: 'Baixa', value: incidents.filter(i => i.severity === 'baixa').length, color: '#fbbf24' },
    { name: 'Média', value: incidents.filter(i => i.severity === 'media').length, color: '#f97316' },
    { name: 'Alta', value: incidents.filter(i => i.severity === 'alta').length, color: '#ef4444' },
    { name: 'Crítica', value: incidents.filter(i => i.severity === 'critica').length, color: '#b91c1c' }
  ];

  const typeData = incidents.reduce((acc, incident) => {
    const existing = acc.find(item => item.name === incident.type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: incident.type, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const monthlyData = incidents.reduce((acc, incident) => {
    const month = new Date(incident.incidentDate).toLocaleDateString('pt-BR', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.incidents += 1;
    } else {
      acc.push({ month, incidents: 1 });
    }
    return acc;
  }, [] as { month: string; incidents: number }[]);

  const handleExport = () => {
    console.log('Exportando relatório...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Relatório de Ocorrências</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{incidents.length}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {incidents.filter(i => i.status === 'aberto').length}
                  </p>
                  <p className="text-sm text-gray-600">Ativas</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {incidents.filter(i => i.status === 'resolvido').length}
                  </p>
                  <p className="text-sm text-gray-600">Resolvidas</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {incidents.filter(i => i.severity === 'critica').length}
                  </p>
                  <p className="text-sm text-gray-600">Críticas</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ocorrências por Gravidade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ocorrências por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="incidents" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
