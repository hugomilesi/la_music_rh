
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Send, Edit, Trash2, Users } from 'lucide-react';
import { useNPS } from '@/contexts/NPSContext';

interface SurveyManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SurveyManagementModal: React.FC<SurveyManagementModalProps> = ({
  open,
  onOpenChange
}) => {
  const { surveys, deleteSurvey, sendSurveyToWhatsApp } = useNPS();
  const [newSurveyOpen, setNewSurveyOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      'draft': 'bg-gray-100 text-gray-800',
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'draft': 'Rascunho',
      'active': 'Ativa',
      'completed': 'Concluída'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const handleSendToWhatsApp = async (surveyId: string) => {
    // Mock phones - em produção viria do contexto de colaboradores
    const phones = ['+5511999999999', '+5511888888888'];
    try {
      await sendSurveyToWhatsApp(surveyId, phones);
      alert('Pesquisa enviada via WhatsApp com sucesso!');
    } catch (error) {
      alert('Erro ao enviar pesquisa via WhatsApp');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Gerenciar Pesquisas NPS
              <Button 
                size="sm"
                onClick={() => setNewSurveyOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Pesquisa
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {surveys.map((survey) => (
              <Card key={survey.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{survey.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
                    </div>
                    <Badge className={getStatusBadge(survey.status)}>
                      {getStatusText(survey.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Período</p>
                      <p className="font-medium">
                        {new Date(survey.startDate).toLocaleDateString('pt-BR')} - {' '}
                        {new Date(survey.endDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Colaboradores</p>
                      <p className="font-medium flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {survey.targetEmployees.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Respostas</p>
                      <p className="font-medium">{survey.responses.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    
                    {survey.status === 'active' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSendToWhatsApp(survey.id)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar WhatsApp
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteSurvey(survey.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {surveys.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma pesquisa criada ainda</p>
                <Button 
                  className="mt-4"
                  onClick={() => setNewSurveyOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Pesquisa
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para nova pesquisa seria implementado aqui */}
      {newSurveyOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Nova Pesquisa</h3>
            <p className="text-gray-600 mb-4">
              Funcionalidade em desenvolvimento. Por enquanto, use as pesquisas existentes.
            </p>
            <Button onClick={() => setNewSurveyOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
