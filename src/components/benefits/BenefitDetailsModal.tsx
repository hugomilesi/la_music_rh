
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Shield, 
  FileText,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Eye
} from 'lucide-react';
import { Benefit, BenefitDocument } from '@/types/benefits';
import { benefitsService } from '@/services/benefitsService';
import { benefitDocumentService } from '@/services/benefitDocumentService';

interface BenefitDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benefit: Benefit;
}

export const BenefitDetailsModal: React.FC<BenefitDetailsModalProps> = ({
  open,
  onOpenChange,
  benefit
}) => {
  const [documents, setDocuments] = useState<BenefitDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const getTypeBadgeColor = (color: string) => {
    // Convert Tailwind background color to badge color
    const colorMap: { [key: string]: string } = {
      'bg-purple-500': 'bg-purple-100 text-purple-800',
      'bg-orange-500': 'bg-orange-100 text-orange-800',
      'bg-red-500': 'bg-red-100 text-red-800',
      'bg-blue-500': 'bg-blue-100 text-blue-800',
      'bg-green-500': 'bg-green-100 text-green-800',
      'bg-yellow-500': 'bg-yellow-100 text-yellow-800',
      'bg-gray-500': 'bg-gray-100 text-gray-800',
      'bg-pink-500': 'bg-pink-100 text-pink-800',
      'bg-indigo-500': 'bg-indigo-100 text-indigo-800',
      'bg-teal-500': 'bg-teal-100 text-teal-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Load documents when modal opens
  useEffect(() => {
    if (open && benefit.id) {
      loadDocuments();
    }
  }, [open, benefit.id]);

  const loadDocuments = async () => {
    setLoadingDocuments(true);
    try {
      console.log('Loading documents for benefit:', benefit.id);
      
      // Buscar documentos diretamente pelo benefit_id
      const docs = await benefitDocumentService.getDocumentsByBenefit(benefit.id);
      console.log('Found documents:', docs);
      
      // Mapear documentos para o formato esperado pelo componente
      const mappedDocuments: BenefitDocument[] = docs.map(doc => ({
        id: doc.id,
        benefit_id: doc.benefit_id,
        name: doc.name,
        file_path: doc.file_path,
        file_size: doc.file_size,
        file_type: doc.file_type,
        status: doc.status,
        uploaded_by: doc.uploaded_by,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        // Campos adicionais para compatibilidade com o componente
        type: doc.file_type,
        url: doc.file_path,
        uploadDate: doc.created_at
      }));

      setDocuments(mappedDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      
      // Fallback to showing benefit.documents if available
      if (benefit.documents && benefit.documents.length > 0) {
        const fallbackDocs: BenefitDocument[] = benefit.documents.map((docName, index) => ({
          id: `${benefit.id}_doc_${index}`,
          benefit_id: benefit.id,
          name: docName,
          file_path: '',
          file_size: 0,
          file_type: 'application/pdf',
          status: 'approved' as const,
          uploaded_by: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Campos adicionais para compatibilidade
          type: 'application/pdf',
          url: '',
          uploadDate: new Date().toISOString()
        }));
        setDocuments(fallbackDocs);
      } else {
        setDocuments([]);
      }
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleDownloadDocument = async (doc: BenefitDocument) => {
    try {
      setDownloadingDoc(doc.id);
      
      
      // Use the real download service with file_path
      const downloadUrl = await benefitDocumentService.downloadDocument(doc.file_path);
      
      // Create a blob URL and trigger download
      const url = URL.createObjectURL(downloadUrl);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      
      
    } catch (error) {
      alert('Erro ao baixar documento. Verifique se o arquivo ainda existe no storage.');
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handleViewDocument = async (doc: BenefitDocument) => {
    try {
      setViewingDoc(doc.id);
      
      // Get the public URL for viewing using file_path
      const viewUrl = await benefitDocumentService.getDocumentUrl(doc.file_path);
      
      // Open the document in a new tab for viewing
      window.open(viewUrl, '_blank');
      
    } catch (error) {
      alert('Erro ao visualizar documento. Verifique se o arquivo ainda existe no storage.');
    } finally {
      setViewingDoc(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{benefit.name}</DialogTitle>
            <Badge className={getTypeBadgeColor(benefit.type.color)}>
              {benefit.type.name}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status e Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${benefit.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold">{benefit.isActive ? 'Ativo' : 'Inativo'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Valor</p>
                    <p className="font-semibold">R$ {benefit.value.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Descrição */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{benefit.description}</p>
            </CardContent>
          </Card>

          {/* Fornecedor e Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Fornecedor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-lg">{benefit.provider || 'Não informado'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Vigência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Início:</span>
                  <span className="font-medium">{formatDate(benefit.startDate)}</span>
                </div>
                {benefit.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fim:</span>
                    <span className="font-medium">{formatDate(benefit.endDate)}</span>
                  </div>
                )}
                {!benefit.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fim:</span>
                    <span className="text-green-600 font-medium">Indeterminado</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cobertura */}
          {benefit.coverage && Array.isArray(benefit.coverage) && benefit.coverage.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Cobertura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {benefit.coverage.map((item, index) => (
                    <div key={`coverage-${index}`} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regras de Elegibilidade */}
          {benefit.eligibilityRules && benefit.eligibilityRules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Regras de Elegibilidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {benefit.eligibilityRules.map((rule, index) => (
                    <div key={`rule-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {rule.rule.replace('_', ' ')}: {rule.operator} {rule.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentos
                {loadingDocuments && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDocuments ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2 text-sm text-gray-600">Carregando documentos...</span>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{doc.name}</span>
                        <div className="text-xs text-gray-500">
                          Enviado em: {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <Badge 
                        variant={doc.status === 'approved' ? 'default' : doc.status === 'pending' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {doc.status === 'approved' ? 'Aprovado' : doc.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled={viewingDoc === doc.id}
                          onClick={() => handleViewDocument(doc)}
                          title="Visualizar documento"
                        >
                          {viewingDoc === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          {viewingDoc === doc.id ? 'Abrindo...' : 'Visualizar'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled={downloadingDoc === doc.id}
                          onClick={() => handleDownloadDocument(doc)}
                          title="Baixar documento"
                        >
                          {downloadingDoc === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          {downloadingDoc === doc.id ? 'Baixando...' : 'Baixar'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nenhum documento anexado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Criado em:</span>
                  <span className="ml-2 font-medium">{formatDate(benefit.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Última atualização:</span>
                  <span className="ml-2 font-medium">{formatDate(benefit.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
