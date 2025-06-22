
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calendar } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const [questions, setQuestions] = useState<NPSQuestion[]>([
    {
      id: 'q1',
      type: 'nps' as const,
      question: 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa como um lugar para trabalhar?',
      required: true
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const newSurvey = {
      ...formData,
      questions,
      status: 'draft' as const,
      responses: [],
      targetEmployees: ['emp1', 'emp2', 'emp3', 'emp4', 'emp5'] // Mock - viria do contexto de colaboradores
    };

    createSurvey(newSurvey);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
    });
    setQuestions([{
      id: 'q1',
      type: 'nps',
      question: 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa como um lugar para trabalhar?',
      required: true
    }]);
    
    onOpenChange(false);
    alert('Pesquisa criada com sucesso!');
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
            Nova Pesquisa NPS
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações da Pesquisa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">Data de Término *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
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
                      <Badge variant={question.type === 'nps' ? 'default' : 'outline'}>
                        {question.type === 'nps' ? 'NPS' : 'Texto'}
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
                    disabled={question.type === 'nps' && index === 0}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Calendar className="w-4 h-4 mr-2" />
              Criar Pesquisa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
