import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Star } from 'lucide-react';

interface NPSResponsePageProps {
  token: string;
}

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

const NPSResponsePage: React.FC<NPSResponsePageProps> = ({ token }) => {
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('validate_simple_nps_token', { token_param: token })
        .single();

      if (error) {
  
        setError('Erro interno do servidor');
        return;
      }

      setValidationData(data);
      
      if (!data.is_valid) {
        setError(data.error_message || 'Token inválido');
      }
    } catch (err) {
      setError('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async () => {
    if (selectedScore === null) {
      setError('Por favor, selecione uma pontuação.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('process_nps_response', {
          token_param: token,
          score_param: selectedScore,
          comment_param: comment || null
        })
        .single();

      if (error) {
  
        setError('Erro ao processar resposta. Tente novamente.');
        return;
      }

      if (data.success) {
        setSubmitted(true);
      } else {
        setError('Erro ao processar resposta. Tente novamente.');
      }
    } catch (err) {
      setError('Erro interno do servidor');
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Obrigado!</h2>
            <p className="text-gray-600 mb-4">
              Sua avaliação foi registrada com sucesso.
            </p>
            <p className="text-sm text-gray-500">
              Sua opinião é muito importante para nós!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !validationData?.is_valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops!</h2>
            <p className="text-gray-600">
              {error || validationData?.error_message || 'Link inválido ou expirado'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { send_data } = validationData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            {send_data?.survey_title || 'Avaliação NPS'}
          </CardTitle>
          <p className="text-gray-600">
            {send_data?.question || 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa?'}
          </p>
          {send_data?.user_name && (
            <p className="text-sm text-gray-500 mt-2">
              Olá, {send_data.user_name}!
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Score Selection */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">0</span> = Não recomendaria de forma alguma
                <span className="mx-4">|</span>
                <span className="font-medium">10</span> = Recomendaria com certeza
              </p>
            </div>
            
            <div className="grid grid-cols-11 gap-2">
              {Array.from({ length: 11 }, (_, i) => (
                <Button
                  key={i}
                  variant={selectedScore === i ? "default" : "outline"}
                  className={`h-12 w-full text-lg font-bold transition-all ${
                    selectedScore === i 
                      ? `${getScoreColor(i)} text-white` 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedScore(i)}
                >
                  {i}
                </Button>
              ))}
            </div>
            
            {selectedScore !== null && (
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedScore <= 6 ? 'bg-red-100 text-red-800' :
                  selectedScore <= 8 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  <Star className="w-4 h-4 mr-1" />
                  {getScoreLabel(selectedScore)}
                </div>
              </div>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Comentários adicionais (opcional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte-nos mais sobre sua experiência..."
              className="min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={submitResponse}
            disabled={selectedScore === null || submitting}
            className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Enviando...
              </div>
            ) : (
              'Enviar Avaliação'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NPSResponsePage;