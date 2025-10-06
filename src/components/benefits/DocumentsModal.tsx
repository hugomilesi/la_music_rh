import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  File, 
  Download, 
  Trash2, 
  Search, 
  Upload,
  FileText,
  Image,
  FileSpreadsheet,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBenefits } from '@/contexts/BenefitsContext';
import { DocumentUploadModal } from './DocumentUploadModal';

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  benefitId: string;
  employeeBenefitId?: string;
  benefitName: string;
}

interface BenefitDocument {
  id: string;
  benefit_id: string;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  colaborador_id?: string;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  enrollment: 'Formulário de Inscrição',
  medical: 'Documento Médico',
  identification: 'Documento de Identificação',
  proof_of_income: 'Comprovante de Renda',
  dependent_proof: 'Comprovante de Dependente',
  contract: 'Contrato',
  receipt: 'Comprovante de Pagamento',
  other: 'Outros'
};

export const DocumentsModal: React.FC<DocumentsModalProps> = ({
  isOpen,
  onClose,
  benefitId,
  employeeBenefitId,
  benefitName
}) => {
  const { getBenefitDocuments, deleteBenefitDocument, getDocumentUrl } = useBenefits();
  const [documents, setDocuments] = useState<BenefitDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<BenefitDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen, benefitId, employeeBenefitId]);

  useEffect(() => {
    const filtered = documents.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.file_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(filtered);
  }, [documents, searchTerm]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await getBenefitDocuments(benefitId);
      setDocuments(docs);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar documentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (document: BenefitDocument) => {
    try {
      const url = await getDocumentUrl(document.file_path);
      if (url) {
        const link = window.document.createElement('a');
        link.href = url;
        link.download = document.name;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      } else {
        toast.error('Erro ao gerar link de download');
      }
    } catch (error) {
      toast.error('Erro ao baixar documento');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      await deleteBenefitDocument(documentId);
      toast.success('Documento excluído com sucesso');
      loadDocuments();
    } catch (error) {
      toast.error('Erro ao excluir documento');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="h-5 w-5" />;
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Documentos do Benefício</DialogTitle>
            <p className="text-sm text-gray-600">
              {benefitName}
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => {
                setShowUploadModal(true);
              }}>
                <Upload className="h-4 w-4 mr-2" />
                Enviar Documento
              </Button>
            </div>

            {/* Documents List */}
            <div className="border rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando documentos...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="p-8 text-center">
                  <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'Nenhum documento encontrado' : 'Nenhum documento enviado ainda'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredDocuments.map((document) => (
                    <div key={document.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="text-gray-500">
                            {getFileIcon(document.file_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {document.name}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {document.file_type}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(document.file_size)}
                              </span>
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(document.created_at)}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <User className="h-3 w-3 mr-1" />
                                {document.status}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(document)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(document.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            {filteredDocuments.length > 0 && (
              <div className="text-sm text-gray-600 text-center">
                {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          loadDocuments();
        }}
        benefitId={benefitId}
        employeeBenefitId={employeeBenefitId}
        benefitName={benefitName}
      />
    </>
  );
};