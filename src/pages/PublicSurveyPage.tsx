import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AnonymousSurvey } from '@/components/nps/AnonymousSurvey';
import { Card, CardContent } from '@/components/ui/card';
import { Music } from 'lucide-react';

export const PublicSurveyPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [searchParams] = useSearchParams();
  
  // Extrair parâmetros da URL
  const question = searchParams.get('question');
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  if (!surveyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-500">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Link Inválido</h3>
              <p className="text-muted-foreground">
                O link da pesquisa não é válido ou expirou.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-lg p-2">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LA Music</h1>
                <p className="text-sm text-gray-500">Pesquisa de Satisfação</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        <AnonymousSurvey 
          surveyId={surveyId}
          customQuestion={question || undefined}
          responseToken={token || undefined}
          userId={userId || undefined}
          onComplete={() => {
            // Opcional: redirecionar ou mostrar mensagem adicional
            // Survey completed logging disabled
          }}
        />
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 LA Music. Todos os direitos reservados.</p>
            <p className="mt-1">
              Esta pesquisa é anônima e seus dados são tratados com total confidencialidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};