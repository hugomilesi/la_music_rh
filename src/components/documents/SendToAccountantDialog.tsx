
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocuments } from '@/hooks/useDocuments';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useEmailService } from '@/hooks/useEmailService';
import { Document } from '@/types/document';
import { Mail, Send, FileText, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  const [email, setEmail] = useState('gprado0167@gmail.com');
  const [subject, setSubject] = useState('Documentos para Análise');
  const [message, setMessage] = useState('Segue em anexo os documentos solicitados para análise.');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [documentsToSend, setDocumentsToSend] = useState<string[]>(
    selectedDocuments.map(doc => doc.id)
  );
  const { sendDocumentEmail, isLoading, error, success } = useEmailService();

  // Filter documents based on selected employee
  const availableDocuments = React.useMemo(() => {
    return selectedEmployee === 'all' 
      ? filteredDocuments 
      : filteredDocuments.filter(doc => doc.employeeId === selectedEmployee);
  }, [selectedEmployee, filteredDocuments]);

  // Update documents when employee selection changes
  React.useEffect(() => {
    if (selectedEmployee !== 'all') {
      setDocumentsToSend(availableDocuments.map(doc => doc.id));
    }
  }, [selectedEmployee, availableDocuments]);

  const handleDocumentToggle = (documentId: string) => {
    setDocumentsToSend(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSend = async () => {
    if (!email || !subject || !message) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (documentsToSend.length === 0) {
      toast.error('Selecione pelo menos um documento para enviar.');
      return;
    }

    try {
      // Get selected documents with their details
      const selectedDocs = availableDocuments.filter(doc => documentsToSend.includes(doc.id));
      
      // Create document list for email
      const documentsList = selectedDocs.map(doc => ({
        name: `${doc.document} - ${doc.employee}`,
        url: doc.filePath || '#' // You might need to generate proper URLs for documents
      }));

      // Send email with documents
      const result = await sendDocumentEmail({
        to: [email],
        employeeName: selectedEmployee === 'all' ? 'Todos os colaboradores' : employees.find(emp => emp.id === selectedEmployee)?.name || 'Colaborador',
        documentType: 'Documentos para Análise Contábil',
        message: `${message}\n\nDocumentos inclusos:\n${selectedDocs.map(doc => `• ${doc.document} - ${doc.employee}`).join('\n')}`,
      });

      if (result.success) {
        toast.success(`Documentos enviados com sucesso para ${email}!`);
        onOpenChange(false);
        
        // Reset form
        setEmail('gprado0167@gmail.com');
        setSubject('Documentos para Análise');
        setMessage('Segue em anexo os documentos solicitados para análise.');
        setSelectedEmployee('all');
        setDocumentsToSend(selectedDocuments.map(doc => doc.id));
      } else {
        toast.error(result.error || 'Erro ao enviar documentos.');
      }
    } catch (err) {
      toast.error('Erro ao enviar documentos para o contador');
    }
  };

  const selectedDocs = availableDocuments.filter(doc => documentsToSend.includes(doc.id));

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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isLoading || documentsToSend.length === 0 || !email || !subject || !message}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Enviado!
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Tentar Novamente
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {`Enviar ${documentsToSend.length} Documento(s)`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
