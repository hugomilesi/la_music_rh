
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNPS } from '@/contexts/NPSContext';

export const NPSEvolutionChart: React.FC = () => {
  const { evolution } = useNPS();

  const formatTooltip = (value: number, name: string) => {
    if (name === 'score') {
      return [`+${value}`, 'NPS Score'];
    }
    return [`${value}`, 'Respostas'];
  };

  const formatXAxisLabel = (tickItem: string) => {
    const [year, month] = tickItem.split('-');
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return monthNames[parseInt(month) - 1];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Evolução do NPS</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">Últimos 3 meses</Badge>
            <Badge className="bg-green-100 text-green-800">+7 pontos</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={evolution}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxisLabel}
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(label) => `Mês: ${formatXAxisLabel(label)}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {evolution.map((item, index) => (
            <div key={item.date} className="p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">{formatXAxisLabel(item.date)}</p>
              <p className="font-semibold text-green-600">+{item.score}</p>
              <p className="text-xs text-gray-500">{item.responses} respostas</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
