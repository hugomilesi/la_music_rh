
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useDocuments } from '@/contexts/DocumentContext';
import { Document } from '@/types/document';
import { Mail, Send, FileText } from 'lucide-react';

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
  const [email, setEmail] = useState('gprado0167@gmail.com');
  const [subject, setSubject] = useState('Documentos para Análise');
  const [message, setMessage] = useState('Segue em anexo os documentos solicitados para análise.');
  const [documentsToSend, setDocumentsToSend] = useState<string[]>(
    selectedDocuments.map(doc => doc.id)
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleDocumentToggle = (documentId: string) => {
    setDocumentsToSend(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSend = async () => {
    setIsLoading(true);
    
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Enviando documentos para:', email);
    console.log('Assunto:', subject);
    console.log('Mensagem:', message);
    console.log('Documentos:', documentsToSend);
    
    setIsLoading(false);
    onOpenChange(false);
    
    // Here you would integrate with an email service
    alert('Documentos enviados com sucesso!');
  };

  const selectedDocs = filteredDocuments.filter(doc => documentsToSend.includes(doc.id));

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

          {/* Document Selection */}
          <div>
            <Label className="text-base font-semibold">Documentos para Enviar ({selectedDocs.length})</Label>
            <div className="mt-2 max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
              {filteredDocuments.map((doc) => (
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
            </div>
          </div>

          {/* Summary */}
          {selectedDocs.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Resumo do Envio:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {selectedDocs.map(doc => (
                  <li key={doc.id}>• {doc.document} - {doc.employee}</li>
                ))}
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
