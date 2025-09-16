
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
  Loader2
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
    try {
      setLoadingDocuments(true);
      // console.log('📄 Loading documents for benefit:', benefit.id);
      
      // Get all employee benefits for this benefit to find documents
      const employeeBenefits = await benefitsService.getEmployeeBenefits();
      const benefitEnrollments = employeeBenefits.filter(eb => eb.benefitId === benefit.id);
      
      // console.log('Found enrollments for benefit:', benefitEnrollments.length);
      
      // Collect all documents from all enrollments for this benefit
      const allDocuments: BenefitDocument[] = [];
      
      for (const enrollment of benefitEnrollments) {
        try {
          const docs = await benefitDocumentService.getDocumentsByBenefitId(enrollment.id);
          // Add employee info to each document for better identification
          const docsWithEmployee = docs.map(doc => ({
            ...doc,
            name: `${doc.document_name || doc.name} (${enrollment.employeeName})`,
            type: doc.mime_type || doc.type,
            url: doc.file_path || doc.url,
            uploadDate: doc.created_at || doc.uploadDate,
            status: (doc.status as 'pending' | 'approved' | 'rejected') || 'approved'
          }));
          allDocuments.push(...docsWithEmployee);
        } catch (docError) {
          // console.warn(`Could not load documents for enrollment ${enrollment.id}:`, docError);
        }
      }
      
      // console.log('Total documents found:', allDocuments.length);
      setDocuments(allDocuments);
    } catch (error) {
      // console.error('❌ Error loading documents:', error);
      // Fallback to showing benefit.documents if available
      if (benefit.documents && benefit.documents.length > 0) {
        const fallbackDocs: BenefitDocument[] = benefit.documents.map((docName, index) => ({
          id: `${benefit.id}_doc_${index}`,
          name: docName,
          type: 'application/pdf',
          url: '',
          uploadDate: new Date().toISOString(),
          status: 'approved' as const
        }));
        setDocuments(fallbackDocs);
      }
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleDownloadDocument = async (doc: BenefitDocument) => {
    try {
      setDownloadingDoc(doc.id);
      // console.log('📥 Downloading document:', doc.name);
      
      // Use the real download service
      const downloadUrl = await benefitDocumentService.downloadDocument(doc.id);
      
      // Open the download URL in a new tab
      window.open(downloadUrl, '_blank');
      
      // console.log('✅ Document download initiated successfully');
      
    } catch (error) {
      // console.error('❌ Error downloading document:', error);
      alert('Erro ao baixar documento. Verifique se o arquivo ainda existe no storage.');
    } finally {
      setDownloadingDoc(null);
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
                    <div key={index} className="flex items-center gap-2">
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
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        disabled={downloadingDoc === doc.id}
                        onClick={() => handleDownloadDocument(doc)}
                      >
                        {downloadingDoc === doc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {downloadingDoc === doc.id ? 'Baixando...' : 'Baixar'}
                      </Button>
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
