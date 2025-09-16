import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

const ButtonTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    // Simular operação assíncrona
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Teste de Botão</h2>
      
      <div className="space-y-2">
        <Button
          onClick={handleClick}
          disabled={loading || disabled}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {loading ? 'Carregando...' : 'Enviar Agora'}
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setDisabled(!disabled)}
          >
            {disabled ? 'Habilitar' : 'Desabilitar'} Botão
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Loading: {loading ? 'true' : 'false'}</p>
          <p>Disabled: {disabled ? 'true' : 'false'}</p>
        </div>
      </div>
    </div>
  );
};

export default ButtonTest;