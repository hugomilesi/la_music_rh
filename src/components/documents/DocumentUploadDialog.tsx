
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { useDocuments } from '@/contexts/DocumentContext';
import { useEmployees } from '@/contexts/EmployeeContext';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { uploadDocument, isLoading } = useDocuments();
  const { employees } = useEmployees();
  const [formData, setFormData] = useState({
    employeeId: '',
    documentType: '',
    expiryDate: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !formData.employeeId || !formData.documentType) {
      return;
    }

    await uploadDocument({
      file: selectedFile,
      employeeId: formData.employeeId,
      documentType: formData.documentType,
      expiryDate: formData.expiryDate || undefined,
      notes: formData.notes || undefined
    });

    // Reset form
    setFormData({
      employeeId: '',
      documentType: '',
      expiryDate: '',
      notes: ''
    });
    setSelectedFile(null);
    onOpenChange(false);
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
    'Outros'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="employee">Colaborador</Label>
            <Select
              value={formData.employeeId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o colaborador" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="documentType">Tipo de Documento</Label>
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
            <Label htmlFor="file">Arquivo</Label>
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
                      <Upload className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Clique para enviar arquivo</p>
                    <p className="text-xs text-gray-400">PDF, DOC, JPG até 10MB</p>
                  </div>
                )}
              </label>
              {selectedFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="mt-2"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remover arquivo
                </Button>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="expiryDate">Data de Validade (Opcional)</Label>
            <Input
              type="date"
              id="expiryDate"
              value={formData.expiryDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedFile || !formData.employeeId || !formData.documentType || isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Documento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
