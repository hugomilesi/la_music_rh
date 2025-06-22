
import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocuments } from '@/contexts/DocumentContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { Document } from '@/types/document';
import { Mail, Send, FileText, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SendToAccountantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDocuments?: Document[];
}

export const SendToAccountantDialog: React.FC<SendToAccountantDialogProps> = ({
  open,
  onOpenChange,
  selectedDocuments = []
}) => {
  const { filteredDocuments } = useDocuments();
  const { employees } = useEmployees();
  const { toast } = useToast();
  const [email, setEmail] = useState('gprado0167@gmail.com');
  const [subject, setSubject] = useState('Documentos para Análise');
  const [message, setMessage] = useState('Segue em anexo os documentos solicitados para análise.');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [documentsToSend, setDocumentsToSend] = useState<string[]>(
    selectedDocuments.map(doc => doc.id)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Memoize available documents to prevent infinite re-renders
  const availableDocuments = useMemo(() => {
    return selectedEmployee === 'all' 
      ? filteredDocuments 
      : filteredDocuments.filter(doc => doc.employeeId === selectedEmployee);
  }, [selectedEmployee, filteredDocuments]);

  // Update documents when employee selection changes - with proper dependencies
  useEffect(() => {
    if (selectedEmployee !== 'all') {
      setDocumentsToSend(availableDocuments.map(doc => doc.id));
    }
  }, [selectedEmployee, availableDocuments.length]); // Use length instead of the array itself

  const handleDocumentToggle = (documentId: string) => {
    setDocumentsToSend(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSend = async () => {
    setIsLoading(true);
    
    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Enviando documentos para:', email);
      console.log('Assunto:', subject);
      console.log('Mensagem:', message);
      console.log('Documentos:', documentsToSend);
      
      toast({
        title: "Documentos enviados com sucesso!",
        description: `${documentsToSend.length} documento(s) enviado(s) para ${email}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao enviar documentos",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDocs = useMemo(() => 
    availableDocuments.filter(doc => documentsToSend.includes(doc.id)), 
    [availableDocuments, documentsToSend]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Enviar Documentos para Contador
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email do Contador</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contador@exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Assunto do email"
              />
            </div>

            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                rows={4}
              />
            </div>
          </div>

          {/* Employee Selector */}
          <div>
            <Label htmlFor="employee-select">Filtrar por Colaborador</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar colaborador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Colaboradores</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Selection */}
          <div>
            <Label className="text-base font-semibold">
              Documentos para Enviar ({selectedDocs.length})
              {selectedEmployee !== 'all' && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  - {employees.find(emp => emp.id === selectedEmployee)?.name}
                </span>
              )}
            </Label>
            <div className="mt-2 max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
              {availableDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={documentsToSend.includes(doc.id)}
                    onCheckedChange={() => handleDocumentToggle(doc.id)}
                  />
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.document}</p>
                    <p className="text-xs text-gray-500">{doc.employee}</p>
                  </div>
                </div>
              ))}
              
              {availableDocuments.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum documento encontrado para o colaborador selecionado.</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {selectedDocs.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Resumo do Envio:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {selectedDocs.slice(0, 5).map(doc => (
                  <li key={doc.id}>• {doc.document} - {doc.employee}</li>
                ))}
                {selectedDocs.length > 5 && (
                  <li className="text-blue-600">... e mais {selectedDocs.length - 5} documento(s)</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={documentsToSend.length === 0 || isLoading}
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Enviando...' : `Enviar ${documentsToSend.length} Documento(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
