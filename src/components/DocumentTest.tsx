import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { documentService } from '@/services/documentService';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Download, List, TestTube, X } from 'lucide-react';

interface DocumentTestProps {
  onClose?: () => void;
}

export const DocumentTest: React.FC<DocumentTestProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { employees } = useEmployees();
  const { toast } = useToast();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    addResult('Testando conexão com Supabase...');
    
    try {
      const success = await documentService.testConnection();
      if (success) {
        addResult('✅ Conexão com Supabase funcionando');
        toast({ title: 'Sucesso', description: 'Conexão testada com sucesso' });
      } else {
        addResult('❌ Falha na conexão com Supabase');
        toast({ title: 'Erro', description: 'Falha na conexão', variant: 'destructive' });
      }
    } catch (error) {
      addResult(`❌ Erro na conexão: ${error}`);
      toast({ title: 'Erro', description: 'Erro na conexão', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const testUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast({ title: 'Erro', description: 'Selecione um arquivo primeiro', variant: 'destructive' });
      return;
    }

    if (employees.length === 0) {
      toast({ title: 'Erro', description: 'Nenhum funcionário encontrado', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const file = fileInputRef.current.files[0];
    const employee = employees[0]; // Use first employee for test
    
    addResult(`Testando upload do arquivo: ${file.name}`);
    
    try {
      const result = await documentService.uploadDocument({
        employee_id: employee.id,
        document_name: 'Teste',
        document_type: 'teste',
        file: file,
        uploaded_by: 'sistema'
      });
      addResult(`✅ Upload realizado com sucesso. ID: ${result.id}`);
      toast({ title: 'Sucesso', description: 'Upload testado com sucesso' });
      
      // Test download immediately
      addResult('Testando download...');
      const downloadUrl = await documentService.downloadDocument(result.id);
      addResult(`✅ Download URL gerada: ${downloadUrl.substring(0, 50)}...`);
      
    } catch (error) {
      addResult(`❌ Erro no upload: ${error}`);
      toast({ title: 'Erro', description: 'Erro no upload', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const listFiles = async () => {
    setIsLoading(true);
    addResult('Listando arquivos no storage...');
    
    try {
      const files = await documentService.getAllDocuments();
      addResult(`✅ Encontrados ${files.length} documentos no banco`);
        files.forEach((file, index) => {
          addResult(`  ${index + 1}. ${file.document_name} (${file.file_size || 'N/A'} bytes)`);
        });
    } catch (error) {
      addResult(`❌ Erro ao listar arquivos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Teste de Integração - Documentos
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={testConnection} 
            disabled={isLoading}
            variant="outline"
          >
            Testar Conexão
          </Button>
          
          <Button 
            onClick={listFiles} 
            disabled={isLoading}
            variant="outline"
          >
            Listar Arquivos
          </Button>
          
          <Button 
            onClick={clearResults} 
            disabled={isLoading}
            variant="secondary"
          >
            Limpar Resultados
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            className="flex-1"
          />
          <Button 
            onClick={testUpload} 
            disabled={isLoading || !fileInputRef.current?.files?.[0]}
          >
            Testar Upload
          </Button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Resultados dos Testes:</h3>
          {testResults.length === 0 ? (
            <p className="text-gray-500">Nenhum teste executado ainda.</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>Funcionários disponíveis:</strong> {employees.length}</p>
          {employees.length > 0 && (
            <p><strong>Primeiro funcionário:</strong> {employees[0].name} (ID: {employees[0].id})</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};