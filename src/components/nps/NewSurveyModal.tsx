
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Plus, Trash2, Calendar, Users, Target, Clock } from 'lucide-react';
import { RiCheckboxCircleFill } from '@remixicon/react';
import { useNPS } from '@/contexts/NPSContext';
import { NPSQuestion } from '@/types/nps';

interface NewSurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewSurveyModal: React.FC<NewSurveyModalProps> = ({
  open,
  onOpenChange
}) => {
  const { createSurvey } = useNPS();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    surveyType: 'nps' as 'nps' | 'satisfaction',
    // Removendo campos de data - templates não precisam de datas específicas
    targetEmployees: [] as string[],
    targetDepartments: [] as string[],
    isAnonymous: true
  });

  const [questions, setQuestions] = useState<NPSQuestion[]>([
    {
      id: 'q1',
      type: 'nps' as const,
      question: 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa como um lugar para trabalhar?',
      required: true
    }
  ]);

  const handleSurveyTypeChange = (type: 'nps' | 'satisfaction') => {
    setFormData({ ...formData, surveyType: type });
    
    // Atualizar a primeira pergunta baseada no tipo
    const defaultQuestion = type === 'nps' 
      ? 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa como um lugar para trabalhar?'
      : 'Em uma escala de 0 a 5, qual seu nível de satisfação com a empresa?';
    
    setQuestions([{
      id: 'q1',
      type: type,
      question: defaultQuestion,
      required: true
    }]);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Por favor, preencha o título da pesquisa');
      return;
    }

    if (questions.length === 0) {
      alert('Por favor, adicione pelo menos uma pergunta');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔄 NewSurveyModal: Iniciando criação de pesquisa');
      
      const newSurvey = {
        title: formData.title,
        description: formData.description,
        surveyType: formData.surveyType,
        // Templates são criados como draft por padrão
        status: 'draft' as const,
        // Datas padrão para templates - serão definidas no agendamento
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 ano no futuro
        questions,
        targetEmployees: formData.targetEmployees,
        targetDepartments: formData.targetDepartments,
        isAnonymous: formData.isAnonymous
      };

      console.log('📤 Enviando pesquisa para criação:', newSurvey);
      
      await createSurvey(newSurvey);
      
      console.log('✅ Pesquisa criada com sucesso!');
      
      // Mostrar alert de sucesso
      setShowSuccessAlert(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        surveyType: 'nps'
      });
      setQuestions([{
        id: 'q1',
        type: 'nps',
        question: 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa como um lugar para trabalhar?',
        required: true
      }]);

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setShowSuccessAlert(false);
        onOpenChange(false);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro detalhado ao criar pesquisa:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Sem stack trace');
      console.error('❌ Mensagem:', error instanceof Error ? error.message : 'Erro desconhecido');
      alert('Erro ao criar pesquisa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: NPSQuestion = {
      id: `q${questions.length + 1}`,
      type: 'text',
      question: '',
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const updateQuestion = (questionId: string, field: keyof NPSQuestion, value: string | boolean) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Pesquisa
          </DialogTitle>
        </DialogHeader>

        {/* Alert de Sucesso */}
        {showSuccessAlert && (
          <Alert className="bg-green-50 border-green-200">
            <RiCheckboxCircleFill className="h-4 w-4 text-green-600" />
            <AlertTitle>Pesquisa NPS criada com sucesso!</AlertTitle>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações da Pesquisa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="surveyType">Tipo de Pesquisa</Label>
                <Select value={formData.surveyType} onValueChange={handleSurveyTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de pesquisa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nps">NPS (Escala 0-10)</SelectItem>
                    <SelectItem value="satisfaction">Satisfação (Escala 0-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Título da Pesquisa *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Pesquisa de Clima Organizacional - Abril 2024"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva o objetivo da pesquisa..."
                  rows={3}
                />
              </div>

              {/* Removido: Campos de data de início e fim */}
              {/* Templates não precisam de datas específicas - serão definidas no agendamento */}
            </CardContent>
          </Card>



          {/* Perguntas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Perguntas da Pesquisa</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Pergunta
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Pergunta {index + 1}</span>
                      <Badge variant={question.type === 'nps' || question.type === 'satisfaction' ? 'default' : 'outline'}>
                        {question.type === 'nps' ? 'NPS (0-10)' : 
                         question.type === 'satisfaction' ? 'Satisfação (0-5)' : 'Texto'}
                      </Badge>
                      {question.required && (
                        <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
                      )}
                    </div>
                    
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <Input
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                    placeholder="Digite a pergunta..."
                    disabled={(question.type === 'nps' || question.type === 'satisfaction') && index === 0}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Calendar className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Criando...' : 'Criar Pesquisa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
