
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, FileText, Eye, Loader2 } from 'lucide-react';
import { useBenefits } from '@/contexts/BenefitsContext';
import { Benefit } from '@/types/benefits';
import { benefitDocumentService } from '@/services/benefitDocumentService';

interface EditBenefitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benefit: Benefit;
}

export const EditBenefitDialog: React.FC<EditBenefitDialogProps> = ({
  open,
  onOpenChange,
  benefit
}) => {
  const { updateBenefit, benefitTypes } = useBenefits();
  const [formData, setFormData] = useState({
    name: benefit?.name || '',
    typeId: benefit?.type?.id || '',
    description: benefit?.description || '',
    value: benefit?.value !== undefined && benefit?.value !== null ? benefit.value.toString() : '',
    supplier: benefit?.provider || '',
    startDate: benefit?.startDate || '',
    endDate: benefit?.endDate || '',
    isActive: benefit?.isActive ?? true
  });
  const [coverage, setCoverage] = useState<string[]>(Array.isArray(benefit?.coverage) ? benefit.coverage : []);
  const [newCoverage, setNewCoverage] = useState('');
  const [documents, setDocuments] = useState<{id: string, name: string}[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);

  useEffect(() => {
    if (benefit) {
      setFormData({
        name: benefit.name || '',
        typeId: benefit.type?.id || '',
        description: benefit.description || '',
        value: benefit.value !== undefined && benefit.value !== null ? benefit.value.toString() : '',
        supplier: benefit.provider || '',
        startDate: benefit.startDate || '',
        endDate: benefit.endDate || '',
        isActive: benefit.isActive ?? true
      });
      setCoverage(Array.isArray(benefit.coverage) ? benefit.coverage : []);
      
      // Carregar documentos do benefício
      const loadDocuments = async () => {
        try {
          const benefitDocuments = await benefitDocumentService.getDocumentsByBenefit(benefit.id);
          setDocuments(benefitDocuments.map(doc => ({ id: doc.id, name: doc.name })));
        } catch (error) {
          console.error('Erro ao carregar documentos:', error);
          setDocuments([]);
        }
      };
      
      loadDocuments();
    }
  }, [benefit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedType = benefitTypes.find(type => type.id === formData.typeId);
    if (!selectedType) return;

    updateBenefit(benefit.id, {
      name: formData.name,
      type: selectedType,
      description: formData.description,
      value: formData.value ? parseFloat(formData.value) : 0,
      provider: formData.supplier,
      coverage,
      documents: documentFiles.length > 0 ? documentFiles.map(f => f.name) : documents,
      documentFiles, // Pass the actual File objects for upload
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      isActive: formData.isActive
    });

    onOpenChange(false);
  };

  const addCoverage = () => {
    if (newCoverage.trim() && !coverage.includes(newCoverage.trim())) {
      setCoverage([...coverage, newCoverage.trim()]);
      setNewCoverage('');
    }
  };

  const removeCoverage = (item: string) => {
    setCoverage(coverage.filter(c => c !== item));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocumentFiles(prev => [...prev, ...files]);
    
    // Adicionar nomes dos arquivos à lista de documentos (para novos arquivos)
    const newDocuments = files.map(file => ({ id: `new_${Date.now()}_${file.name}`, name: file.name }));
    setDocuments(prev => [...prev, ...newDocuments]);
  };

  const removeDocument = async (documentId: string) => {
    try {
      setDeletingDoc(documentId);
      
      // Se é um documento existente (UUID válido), deletar do bucket
      if (!documentId.startsWith('new_')) {
        // Encontrar o documento na lista para obter o file_path
        const docToDelete = documents.find(doc => doc.id === documentId);
        await benefitDocumentService.deleteDocument(documentId, docToDelete?.file_path);
      }
      
      // Remover da lista local
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      // Se for um arquivo novo, remover também da lista de arquivos
      if (documentId.startsWith('new_')) {
        const docName = documents.find(doc => doc.id === documentId)?.name;
        if (docName) {
          setDocumentFiles(prev => prev.filter(file => file.name !== docName));
        }
      }
    } catch (error) {
      console.error('Erro ao remover documento:', error);
    } finally {
      setDeletingDoc(null);
    }
  };

  const handleViewDocument = async (documentId: string) => {
    try {
      setViewingDoc(documentId);
      
      // Só pode visualizar documentos existentes (não novos arquivos)
      if (!documentId.startsWith('new_')) {
        const url = await benefitDocumentService.getDocumentUrl(document.file_path);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Erro ao visualizar documento:', error);
    } finally {
      setViewingDoc(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Benefício</DialogTitle>
          <DialogDescription>
            Atualize as informações do benefício {benefit.name}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Benefício</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Benefício</Label>
              <Select
                value={formData.typeId}
                onValueChange={(value) => setFormData({ ...formData, typeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {benefitTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Nome do fornecedor"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cobertura</Label>
            <div className="flex gap-2">
              <Input
                value={newCoverage}
                onChange={(e) => setNewCoverage(e.target.value)}
                placeholder="Adicionar item de cobertura"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCoverage())}
              />
              <Button type="button" onClick={addCoverage}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {Array.isArray(coverage) && coverage.map((item) => (
                <Badge key={item} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeCoverage(item)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Documentos */}
          <div className="space-y-2">
            <Label>Documentos (Opcional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Clique para fazer upload ou arraste arquivos aqui
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
            {documents.length > 0 && (
              <div className="space-y-2">
                <Label>Documentos anexados:</Label>
                {documents.map((doc, index) => (
                  <div key={`doc-${doc.id}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Botão de visualizar - apenas para documentos existentes */}
                      {!doc.id.startsWith('new_') && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(doc.id)}
                          disabled={viewingDoc === doc.id}
                        >
                          {viewingDoc === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      {/* Botão de remover */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc.id)}
                        disabled={deletingDoc === doc.id}
                      >
                        {deletingDoc === doc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Benefício ativo</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
