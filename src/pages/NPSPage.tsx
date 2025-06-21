
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, TrendingUp, TrendingDown, Users, MessageSquare } from 'lucide-react';

const NPSPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NPS Interno</h1>
          <p className="text-gray-600 mt-1">Análise do clima organizacional e satisfação dos colaboradores</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar Período
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Pesquisa
          </Button>
        </div>
      </div>

      {/* NPS Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">NPS Atual</p>
                <p className="text-3xl font-bold text-green-600">+65</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-800">Excelente</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promotores</p>
                <p className="text-2xl font-bold text-green-600">78%</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Neutros</p>
                <p className="text-2xl font-bold text-yellow-600">13%</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Detratores</p>
                <p className="text-2xl font-bold text-red-600">9%</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do NPS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico de evolução do NPS ao longo do tempo</p>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comentários Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                comment: "Ambiente muito positivo, me sinto valorizada na equipe.",
                score: 9,
                date: "2024-03-15",
                category: "promotor"
              },
              {
                comment: "Gostaria de mais oportunidades de crescimento profissional.",
                score: 7,
                date: "2024-03-14",
                category: "neutro"
              },
              {
                comment: "Excelente liderança e comunicação clara dos objetivos.",
                score: 10,
                date: "2024-03-13",
                category: "promotor"
              }
            ].map((feedback, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{feedback.comment}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        className={
                          feedback.category === 'promotor' ? 'bg-green-100 text-green-800' :
                          feedback.category === 'neutro' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        Nota {feedback.score}
                      </Badge>
                      <span className="text-xs text-gray-500">{feedback.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NPSPage;
