
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useColaboradores } from '@/contexts/ColaboradorContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDateToLocal } from '@/utils/dateUtils';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedEmployeeId?: string;
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  preSelectedEmployeeId
}) => {
  const { uploadDocument, isLoading } = useDocuments();
  const { colaboradoresAtivos } = useColaboradores();
  const [formData, setFormData] = useState({
    employeeId: preSelectedEmployeeId || '',
    documentType: '',
    expiryDate: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Atualizar employeeId quando preSelectedEmployeeId mudar
  React.useEffect(() => {
    if (preSelectedEmployeeId) {
      setFormData(prev => ({ ...prev, employeeId: preSelectedEmployeeId }));
    }
  }, [preSelectedEmployeeId]);

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png', 
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError(null);
    
    if (file) {
      // Validate file size
      if (file.size > maxFileSize) {
        setUploadError(`Arquivo muito grande. Tamanho máximo: ${maxFileSize / 1024 / 1024}MB`);
        return;
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Tipo de arquivo não suportado. Use PDF, DOC, DOCX, JPG ou PNG.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    
    if (!selectedFile || !formData.employeeId || !formData.documentType) {
      setUploadError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await uploadDocument({
        file: selectedFile,
        employeeId: formData.employeeId,
        documentType: formData.documentType,
        expiryDate: formData.expiryDate || undefined,
        notes: formData.notes || undefined
      });

      // Reset form on success
      setFormData({
        employeeId: '',
        documentType: '',
        expiryDate: '',
        notes: ''
      });
      setSelectedFile(null);
      setUploadError(null);
      onOpenChange(false);
    } catch (error) {
      // Log desabilitado: Error uploading document
      setUploadError('Erro ao enviar documento. Tente novamente.');
    }
  };

  const documentTypes = [
    'Contrato de Trabalho',
    'Carteira de Trabalho',
    'CPF',
    'RG',
    'Comprovante de Residência',
    'Atestado de Saúde Ocupacional',
    'PIS/PASEP',
    'Título de Eleitor',
    'Atestado Médico',
    'Certificado de Curso',
    'Licença Médica',
    'Atestado de Comparecimento',
    'Outros'
  ];

  const resetForm = () => {
    setFormData({
      employeeId: '',
      documentType: '',
      expiryDate: '',
      notes: ''
    });
    setSelectedFile(null);
    setUploadError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Enviar Documento
          </DialogTitle>
          <DialogDescription>
            Faça o upload de documentos para os colaboradores do sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="employee">Colaborador *</Label>
            <Select
              value={formData.employeeId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o colaborador" />
              </SelectTrigger>
              <SelectContent>
                {colaboradoresAtivos.map((colaborador) => (
                  <SelectItem key={colaborador.id} value={colaborador.id}>
                    {colaborador.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="documentType">Tipo de Documento *</Label>
            <Select
              value={formData.documentType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file">Arquivo *</Label>
            <div className="mt-1">
              <input
                type="file"
                id="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              >
                {selectedFile ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Clique para enviar arquivo</p>
                    <p className="text-xs text-gray-400">PDF, DOC, JPG, PNG até 10MB</p>
                  </div>
                )}
              </label>
              {selectedFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setUploadError(null);
                  }}
                  className="mt-2"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remover arquivo
                </Button>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="expiryDate">Data de Validade *</Label>
            <Input
              type="date"
              id="expiryDate"
              value={formData.expiryDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre o documento..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedFile || !formData.employeeId || !formData.documentType || !formData.expiryDate || isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Documento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
