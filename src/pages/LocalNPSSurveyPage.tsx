import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Star } from 'lucide-react';

interface ValidationData {
  is_valid: boolean;
  send_data?: {
    survey_id: string;
    survey_title: string;
    user_name: string;
    user_phone: string;
    question: string;
    already_responded: boolean;
  };
  error_message?: string;
}

const LocalNPSSurveyPage: React.FC = () => {
  const { token: routeToken } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  
  // Priorizar o token dos query parameters, se não existir, usar o da rota
  const token = searchParams.get('token') || routeToken;
  
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setError('Token não fornecido');
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('validate_nps_token_simple', { p_token: token })
        .single();

      if (error) {
        console.error('Erro ao validar token:', error);
        setError('Erro interno do servidor');
        return;
      }

      if (!data) {
        setError('Token inválido ou expirado');
        return;
      }

      setValidationData(data);
      
      if (data.send_data?.already_responded) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Erro na validação:', err);
      setError('Erro ao validar token');
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async () => {
    if (selectedScore === null) {
      setError('Por favor, selecione uma pontuação');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('submit_nps_response', {
          p_token: token,
          p_score: selectedScore,
          p_comment: comment || null
        });

      if (error) {
        console.error('Erro ao enviar resposta:', error);
        setError('Erro ao enviar resposta');
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Erro no envio:', err);
      setError('Erro ao enviar resposta');
    } finally {
      setSubmitting(false);
    }
  };

  const renderScoreButtons = () => {
    const buttons = [];
    for (let i = 0; i <= 10; i++) {
      buttons.push(
        <Button
          key={i}
          variant={selectedScore === i ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedScore(i)}
          className={`w-12 h-12 ${
            selectedScore === i 
              ? 'bg-blue-600 text-white' 
              : 'hover:bg-blue-50'
          }`}
        >
          {i}
        </Button>
      );
    }
    return buttons;
  };

  const getScoreLabel = (score: number | null) => {
    if (score === null) return '';
    if (score <= 6) return 'Detrator';
    if (score <= 8) return 'Neutro';
    return 'Promotor';
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return '';
    if (score <= 6) return 'text-red-600';
    if (score <= 8) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Carregando pesquisa...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !validationData?.is_valid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || validationData?.error_message || 'Link inválido ou expirado'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Obrigado!</h2>
              <p className="text-gray-600">
                {validationData.send_data?.already_responded 
                  ? 'Você já respondeu esta pesquisa anteriormente.'
                  : 'Sua resposta foi registrada com sucesso.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {validationData.send_data?.survey_title || 'Pesquisa de Satisfação'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {validationData.send_data?.question || 'Como você avalia nossa empresa?'}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Score Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa?
              </label>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Muito improvável</span>
                <span className="text-xs text-gray-500">Muito provável</span>
              </div>
              
              <div className="grid grid-cols-11 gap-2 mb-4">
                {renderScoreButtons()}
              </div>
              
              {selectedScore !== null && (
                <div className="text-center">
                  <span className={`font-medium ${getScoreColor(selectedScore)}`}>
                    {getScoreLabel(selectedScore)}
                  </span>
                </div>
              )}
            </div>

            {/* Comment Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentários (opcional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte-nos mais sobre sua experiência..."
                rows={4}
                className="w-full"
              />
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              onClick={submitResponse}
              disabled={selectedScore === null || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                'Enviar Resposta'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocalNPSSurveyPage;