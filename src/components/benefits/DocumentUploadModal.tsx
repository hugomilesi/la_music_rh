import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, File, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBenefits } from '@/contexts/BenefitsContext';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  benefitId: string;
  employeeBenefitId?: string;
  benefitName: string;
}

const DOCUMENT_TYPES = [
  { value: 'enrollment', label: 'Formulário de Inscrição' },
  { value: 'medical', label: 'Documento Médico' },
  { value: 'identification', label: 'Documento de Identificação' },
  { value: 'proof_of_income', label: 'Comprovante de Renda' },
  { value: 'dependent_proof', label: 'Comprovante de Dependente' },
  { value: 'contract', label: 'Contrato' },
  { value: 'receipt', label: 'Comprovante de Pagamento' },
  { value: 'other', label: 'Outros' }
];

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  benefitId,
  employeeBenefitId,
  benefitName
}) => {
  const { uploadBenefitDocument } = useBenefits();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
        return;
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não suportado. Use PDF, DOC, DOCX, Excel, CSV, TXT, ZIP ou imagens.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast.error('Selecione um arquivo e o tipo de documento');
      return;
    }

    setIsUploading(true);
    try {
      await uploadBenefitDocument(benefitId, employeeBenefitId || null, selectedFile, documentType);
      toast.success('Documento enviado com sucesso!');
      handleClose();
    } catch (error) {
      toast.error('Erro ao enviar documento');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDocumentType('');
    setDescription('');
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
          <p className="text-sm text-gray-600">
            Benefício: {benefitName}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>Arquivo</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                selectedFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.jpg,.jpeg,.png,.gif,.webp"
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <File className="h-8 w-8 text-green-600 mx-auto" />
                  <div>
                    <p className="font-medium text-green-800">{selectedFile.name}</p>
                    <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600">Clique para selecionar um arquivo</p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX ou imagens (máx. 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="documentType">Tipo de Documento *</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição para o documento..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || !selectedFile || !documentType}>
              {isUploading ? 'Enviando...' : 'Enviar Documento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};