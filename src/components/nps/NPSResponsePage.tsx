import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NPSSurvey } from '@/types/nps';
import { MessageSquare, Send, CheckCircle, AlertCircle, Star } from 'lucide-react';

interface NPSResponsePageProps {
  token: string;
}

interface WhatsAppSend {
  id: string;
  survey_id: string;
  user_id: string;
  phone_number: string;
  status: string;
  response_token: string;
  response_score?: number;
  response_comment?: string;
  created_at: string;
}

export const NPSResponsePage: React.FC<NPSResponsePageProps> = ({
  token,
}) => {
  const [survey, setSurvey] = useState<NPSSurvey | null>(null);
  const [whatsappSend, setWhatsappSend] = useState<WhatsAppSend | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    loadSurveyData();
  }, [token]);



  const loadSurveyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados da pesquisa baseado apenas no token
      const response = await fetch(`/api/nps/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Link inválido ou expirado.');
        } else if (response.status === 410) {
          setError('Esta pesquisa já foi respondida.');
        } else {
          setError('Erro ao carregar a pesquisa.');
        }
        return;
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setSurvey(data.data.survey);
        setWhatsappSend(data.data.nps_send);
        
        // Se já foi respondida, mostrar os dados
        if (data.data.has_responded) {
          setSubmitted(true);
        }
      } else {
         setError('Dados da pesquisa não encontrados.');
       }
    } catch (error) {

      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
  };

  const getScoreColor = (score: number) => {
    if (score <= 6) return 'bg-red-500 hover:bg-red-600 border-red-500';
    if (score <= 8) return 'bg-yellow-500 hover:bg-yellow-600 border-yellow-500';
    return 'bg-green-500 hover:bg-green-600 border-green-500';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 6) return 'Detrator';
    if (score <= 8) return 'Neutro';
    return 'Promotor';
  };

  const getScoreEmoji = (score: number) => {
    if (score <= 3) return '😞';
    if (score <= 6) return '😐';
    if (score <= 8) return '🙂';
    return '😍';
  };

  const handleSubmit = useCallback(async (event?: React.MouseEvent) => {
    // Previne propagação e comportamento padrão
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Proteção contra execuções múltiplas
    if (selectedScore === null || !whatsappSend || submitting || submitted || isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    setSubmitting(true);
    setError(null);
    
    try {
      // Adiciona um pequeno delay para evitar animação muito rápida
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await fetch(`/api/nps/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score: selectedScore,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar resposta');
      }

      // Pequeno delay antes de mostrar sucesso para melhor UX
      await new Promise(resolve => setTimeout(resolve, 200));
      setSubmitted(true);
    } catch (error) {

      setError('Erro ao enviar resposta. Tente novamente.');
    } finally {
      setSubmitting(false);
      isProcessingRef.current = false;
    }
  }, [selectedScore, whatsappSend, submitting, submitted, token, comment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Carregando pesquisa...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h3 className="text-xl font-semibold text-red-700">Ops!</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey || !whatsappSend) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-500 mx-auto" />
              <p className="text-muted-foreground">Pesquisa não encontrada.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-green-700">Obrigado!</h3>
                <p className="text-green-600">
                  Sua avaliação foi registrada com sucesso.
                </p>
              </div>
              
              {selectedScore !== null && (
                <div className="bg-white p-4 rounded-lg border space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl">{getScoreEmoji(selectedScore)}</span>
                    <span className="text-2xl font-bold">{selectedScore}/10</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getScoreColor(selectedScore)} text-white`}
                  >
                    {getScoreLabel(selectedScore)}
                  </Badge>
                  {comment && (
                    <p className="text-sm text-gray-600 italic mt-2">
                      "{comment}"
                    </p>
                  )}
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                Sua opinião é muito importante para nós!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">{survey.title}</CardTitle>
            {survey.description && (
              <p className="text-blue-100 mt-2">{survey.description}</p>
            )}
            <Badge variant="secondary" className="bg-white text-blue-600 mt-2">
              Pesquisa NPS
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-8 p-6">
            {/* Pergunta Principal */}
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {survey.question || 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa?'}
              </h3>
              <p className="text-sm text-muted-foreground">
                0 = Nunca recomendaria | 10 = Definitivamente recomendaria
              </p>
            </div>
            
            {/* Escala NPS - Mobile Optimized */}
            <div className="space-y-6">
              {/* Escala para telas maiores */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-11 gap-2">
                  {Array.from({ length: 11 }, (_, i) => (
                    <Button
                      key={i}
                      variant={selectedScore === i ? 'default' : 'outline'}
                      className={`h-14 w-full text-lg font-bold transition-all duration-200 ${
                        selectedScore === i ? getScoreColor(i) + ' text-white' : 'hover:scale-105'
                      }`}
                      onClick={() => handleScoreSelect(i)}
                    >
                      {i}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Escala para mobile */}
              <div className="sm:hidden space-y-3">
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Button
                      key={i}
                      variant={selectedScore === i ? 'default' : 'outline'}
                      className={`h-12 w-full text-lg font-bold ${
                        selectedScore === i ? getScoreColor(i) + ' text-white' : ''
                      }`}
                      onClick={() => handleScoreSelect(i)}
                    >
                      {i}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Button
                      key={i + 6}
                      variant={selectedScore === i + 6 ? 'default' : 'outline'}
                      className={`h-12 w-full text-lg font-bold ${
                        selectedScore === i + 6 ? getScoreColor(i + 6) + ' text-white' : ''
                      }`}
                      onClick={() => handleScoreSelect(i + 6)}
                    >
                      {i + 6}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-muted-foreground px-2">
                <span className="flex items-center gap-1">
                  <span className="text-red-500">😞</span>
                  Muito improvável
                </span>
                <span className="flex items-center gap-1">
                  Muito provável
                  <span className="text-green-500">😍</span>
                </span>
              </div>
              
              {selectedScore !== null && (
                <div className="text-center space-y-2">
                  <div className="text-4xl">{getScoreEmoji(selectedScore)}</div>
                  <Badge 
                    variant="secondary" 
                    className={`${getScoreColor(selectedScore)} text-white text-lg px-4 py-2`}
                  >
                    {getScoreLabel(selectedScore)} - {selectedScore}/10
                  </Badge>
                </div>
              )}
            </div>

            {/* Comentário Opcional */}
            <div>
              <label className="text-base font-medium mb-3 block flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conte-nos mais sobre sua experiência (opcional)
              </label>
              <Textarea
                placeholder="Sua opinião nos ajuda a melhorar cada vez mais..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="text-base"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Botão de Envio */}
            <div className="pt-4">
              <Button
                ref={buttonRef}
                onClick={handleSubmit}
                disabled={selectedScore === null || submitting || submitted}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95 select-none"
                size="lg"
                type="button"
                style={{ 
                  pointerEvents: (submitting || submitted) ? 'none' : 'auto',
                  userSelect: 'none',
                  WebkitUserSelect: 'none'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                }}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Enviar Avaliação
                  </div>
                )}
              </Button>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <Star className="h-4 w-4 inline mr-1" />
              Sua resposta é anônima e segura
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};