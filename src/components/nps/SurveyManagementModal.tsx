
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Send, Edit, Trash2, Users, Save, X } from 'lucide-react';
import { useNPS } from '@/contexts/NPSContext';

interface SurveyManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SurveyManagementModal: React.FC<SurveyManagementModalProps> = ({
  open,
  onOpenChange
}) => {
  const { surveys, deleteSurvey, updateSurvey, sendSurveyToWhatsApp } = useNPS();
  const [editingSurvey, setEditingSurvey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: ''
    // Removido: startDate e endDate - templates não precisam de datas específicas
  });

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

  const handleEdit = (survey: any) => {
    setEditingSurvey(survey.id);
    setEditForm({
      title: survey.title,
      description: survey.description
      // Removido: startDate e endDate - templates não precisam de datas específicas
    });
  };

  const handleSaveEdit = (surveyId: string) => {
    updateSurvey(surveyId, editForm);
    setEditingSurvey(null);
    setEditForm({ title: '', description: '' });
  };

  const handleCancelEdit = () => {
    setEditingSurvey(null);
    setEditForm({ title: '', description: '' });
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

  const handleDelete = (surveyId: string) => {
    if (confirm('Tem certeza que deseja excluir esta pesquisa? Esta ação não pode ser desfeita.')) {
      deleteSurvey(surveyId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Gerenciar Pesquisas NPS
            <Badge variant="outline">{surveys.length} pesquisas</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {surveys.map((survey) => (
            <Card key={survey.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingSurvey === survey.id ? (
                      <div className="space-y-3">
                        <div>
                          <Label>Título</Label>
                          <Input
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Descrição</Label>
                          <Textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            rows={2}
                          />
                        </div>
                        {/* Removido: Campos de data - templates não precisam de datas específicas */}
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-lg">{survey.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
                      </>
                    )}
                  </div>
                  {editingSurvey !== survey.id && (
                    <Badge className={getStatusBadge(survey.status)}>
                      {getStatusText(survey.status)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingSurvey !== survey.id && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Removido: Exibição de período - templates não têm datas específicas */}
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
                )}

                <div className="flex items-center gap-2">
                  {editingSurvey === survey.id ? (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleSaveEdit(survey.id)}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(survey)}
                      >
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
                        onClick={() => handleDelete(survey.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {surveys.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma pesquisa criada ainda</p>
              <Button 
                className="mt-4"
                onClick={() => onOpenChange(false)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Pesquisa
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
