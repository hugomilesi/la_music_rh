
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, TrendingUp, TrendingDown, Users, MessageSquare, Settings, Send } from 'lucide-react';
import { useNPS } from '@/contexts/NPSContext';
import { NPSDetailsModal } from '@/components/nps/NPSDetailsModal';
import { SurveyManagementModal } from '@/components/nps/SurveyManagementModal';
import { NPSEvolutionChart } from '@/components/nps/NPSEvolutionChart';
import { CommentsModal } from '@/components/nps/CommentsModal';

const NPSPage: React.FC = () => {
  const { stats, responses } = useNPS();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('current');

  const recentComments = responses.slice(0, 3);

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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSurveyModalOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Gerenciar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Pesquisa
          </Button>
        </div>
      </div>

      {/* NPS Score Cards - Agora interativos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setDetailsModalOpen(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">NPS Atual</p>
                <p className="text-3xl font-bold text-green-600">+{stats.currentScore}</p>
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

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setDetailsModalOpen(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promotores</p>
                <p className="text-2xl font-bold text-green-600">{stats.promoters}%</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setDetailsModalOpen(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Neutros</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.neutrals}%</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setDetailsModalOpen(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Detratores</p>
                <p className="text-2xl font-bold text-red-600">{stats.detractors}%</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart - Agora um componente interativo */}
      <NPSEvolutionChart />

      {/* Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Envio Automático</h3>
                <p className="text-sm text-gray-600">WhatsApp integrado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSurveyModalOpen(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Gerenciar Pesquisas</h3>
                <p className="text-sm text-gray-600">Criar e editar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setDetailsModalOpen(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Análise Detalhada</h3>
                <p className="text-sm text-gray-600">Insights completos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments Section - Agora interativo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comentários Recentes
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCommentsModalOpen(true)}
            >
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentComments.map((feedback) => (
              <div key={feedback.id} className="p-4 border border-gray-200 rounded-lg">
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
                      <span className="text-xs text-gray-500">• {feedback.employeeName}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <NPSDetailsModal 
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
      
      <SurveyManagementModal
        open={surveyModalOpen}
        onOpenChange={setSurveyModalOpen}
      />
      
      <CommentsModal
        open={commentsModalOpen}
        onOpenChange={setCommentsModalOpen}
      />
    </div>
  );
};

export default NPSPage;
