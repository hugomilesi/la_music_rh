import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { NPSSurvey, NPSResponse } from '@/types/nps';
import { NPSService } from '@/services/npsService';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AnonymousSurveyProps {
  surveyId: string;
  customQuestion?: string;
  responseToken?: string;
  userId?: string;
  onComplete?: () => void;
}

export const AnonymousSurvey: React.FC<AnonymousSurveyProps> = ({
  surveyId,
  customQuestion,
  responseToken,
  userId,
  onComplete,
}) => {
  const [survey, setSurvey] = useState<NPSSurvey | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    loadSurvey();
    if (responseToken && userId) {
      validateToken();
    }
  }, [surveyId, responseToken, userId]);

  const loadSurvey = async () => {
    try {
      const surveys = await NPSService.getSurveys();
      const targetSurvey = surveys.find(s => s.id === surveyId);
      setSurvey(targetSurvey || null);
    } catch (error) {
      // Log desabilitado: Erro ao carregar pesquisa
    } finally {
      setLoading(false);
    }
  };

  const validateToken = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_sends')
        .select('response_token, user_id, status, responded_at')
        .eq('response_token', responseToken)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        setTokenValid(false);
        return;
      }

      // Verificar se já foi respondido
      if (data.responded_at) {
        setSubmitted(true);
        return;
      }

      // Token válido e não respondido
      setTokenValid(true);
    } catch (error) {
      setTokenValid(false);
    }
  };

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
  };

  const getScoreColor = (score: number) => {
    if (score <= 6) return 'bg-red-500 hover:bg-red-600';
    if (score <= 8) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 6) return 'Detrator';
    if (score <= 8) return 'Neutro';
    return 'Promotor';
  };

  const handleSubmit = async () => {
    if (selectedScore === null || !survey) return;

    setSubmitting(true);
    try {
      // Usar o novo método simplificado do NPSService
      const result = await NPSService.submitNPSResponse({
        survey_id: survey.id,
        employee_id: userId || 'anonymous',
        score: selectedScore,
        comment: comment.trim() || '',
        user_name: 'Usuário Anônimo',
        department: 'Não informado'
      });

      if (result.success) {
        // Se temos responseToken e userId, atualizar o status no whatsapp_sends
        if (responseToken && userId) {
          await supabase
            .from('whatsapp_sends')
            .update({ 
              status: 'responded',
              responded_at: new Date().toISOString()
            })
            .eq('response_token', responseToken)
            .eq('user_id', userId);
        }

        setSubmitted(true);
        onComplete?.();
      } else {
        throw new Error(result.error || 'Erro ao enviar resposta');
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Pesquisa não encontrada.</p>
        </div>
      </div>
    );
  }

  if (!tokenValid && responseToken) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-500">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Ops!</h3>
              <p className="text-muted-foreground">
                Link inválido ou expirado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold">Obrigado!</h3>
              <p className="text-muted-foreground">
                Sua resposta foi enviada com sucesso. Agradecemos seu feedback!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{survey.title}</CardTitle>
            <Badge variant="secondary">Anônima</Badge>
          </div>
          {survey.description && (
            <p className="text-muted-foreground">{survey.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pergunta Principal */}
          <div>
            <h3 className="text-lg font-medium mb-4">
              {customQuestion || survey.questions[0]?.question || 'Como você avaliaria nossa empresa?'}
            </h3>
            
            {/* Escala NPS */}
            <div className="space-y-4">
              <div className="grid grid-cols-11 gap-2">
                {Array.from({ length: 11 }, (_, i) => (
                  <Button
                    key={i}
                    variant={selectedScore === i ? 'default' : 'outline'}
                    className={`h-12 w-full ${selectedScore === i ? getScoreColor(i) : ''}`}
                    onClick={() => handleScoreSelect(i)}
                  >
                    {i}
                  </Button>
                ))}
              </div>
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Muito improvável</span>
                <span>Muito provável</span>
              </div>
              
              {selectedScore !== null && (
                <div className="text-center">
                  <Badge 
                    variant="secondary" 
                    className={`${getScoreColor(selectedScore)} text-white`}
                  >
                    {getScoreLabel(selectedScore)}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Comentário Opcional */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comentário (opcional)
            </label>
            <Textarea
              placeholder="Conte-nos mais sobre sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {/* Botão de Envio */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={selectedScore === null || submitting}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Enviando...' : 'Enviar Resposta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};