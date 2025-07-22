
import React from 'react';
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
  Clock
} from 'lucide-react';
import { Benefit } from '@/types/benefits';

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

  const handleDownloadDocument = (docName: string) => {
    // Implementação temporária - em produção, isso deveria fazer download do arquivo real
    // Por enquanto, apenas mostra uma mensagem informativa
    alert(`Funcionalidade de download será implementada para: ${docName}`);
    // TODO: Implementar download real do documento do storage
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
          {benefit.documents && benefit.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {benefit.documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{doc}</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="ml-auto"
                        onClick={() => handleDownloadDocument(doc)}
                      >
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
