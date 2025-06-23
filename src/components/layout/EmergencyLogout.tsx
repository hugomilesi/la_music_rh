
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const EmergencyLogout: React.FC = () => {
  const { forceLogout } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEmergencyLogout = async () => {
    setIsProcessing(true);
    
    try {
      await forceLogout();
      
      toast({
        title: "Logout de emergência executado",
        description: "Todos os dados de sessão foram limpos. Redirecionando...",
      });
    } catch (error) {
      console.error('Emergency logout error:', error);
      
      toast({
        title: "Executando logout de emergência",
        description: "Limpando dados locais e redirecionando...",
      });
      
      // Force reload as last resort
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Logout de Emergência
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Logout de Emergência
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Esta opção força a limpeza completa de todos os dados de sessão e 
              redireciona para a página inicial.
            </p>
            <p className="font-medium">
              Use apenas se estiver com problemas para sair normalmente.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleEmergencyLogout}
            disabled={isProcessing}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Executar Logout
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
