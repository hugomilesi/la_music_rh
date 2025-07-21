
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, Users, Calendar, Award, Shield, Clock, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  estimatedSize: string;
  format: string[];
}

const exportOptions: ExportOption[] = [
  {
    id: 'employees',
    name: 'Dados de Colaboradores',
    description: 'Informações pessoais, cargos, e dados contratuais',
    icon: Users,
    estimatedSize: '2.4 MB',
    format: ['Excel', 'CSV', 'PDF']
  },
  {
    id: 'documents',
    name: 'Documentos',
    description: 'Contratos, certificados e documentos anexados',
    icon: FileText,
    estimatedSize: '45.2 MB',
    format: ['ZIP', 'PDF']
  },
  {
    id: 'evaluations',
    name: 'Avaliações',
    description: 'Histórico de avaliações e feedbacks',
    icon: Award,
    estimatedSize: '1.8 MB',
    format: ['Excel', 'PDF']
  },
  {
    id: 'schedule',
    name: 'Agenda e Eventos',
    description: 'Compromissos, reuniões e eventos agendados',
    icon: Calendar,
    estimatedSize: '0.5 MB',
    format: ['Excel', 'iCal']
  },
  {
    id: 'timesheet',
    name: 'Registros de Ponto',
    description: 'Histórico de entrada e saída dos colaboradores',
    icon: Clock,
    estimatedSize: '3.1 MB',
    format: ['Excel', 'CSV']
  },
  {
    id: 'audit',
    name: 'Log de Auditoria',
    description: 'Histórico de ações e alterações no sistema',
    icon: Shield,
    estimatedSize: '0.8 MB',
    format: ['TXT', 'CSV']
  }
];

interface DataExportDialogProps {
  children: React.ReactNode;
}

export const DataExportDialog: React.FC<DataExportDialogProps> = ({ children }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('Excel');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();
  const { canExportData } = usePermissions();

  // Check if user has permission to export data
  if (!canExportData) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Acesso Negado
            </DialogTitle>
            <DialogDescription>
              Você não tem permissão para exportar dados do sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline">Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, optionId]);
    } else {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    }
  };

  const handleExport = async () => {
    if (selectedOptions.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma opção para exportar",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          toast({
            title: "Exportação concluída",
            description: "Os dados foram exportados com sucesso"
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const getTotalSize = () => {
    return selectedOptions.reduce((total, optionId) => {
      const option = exportOptions.find(opt => opt.id === optionId);
      if (option) {
        const size = parseFloat(option.estimatedSize.replace(/[^\d.]/g, ''));
        return total + size;
      }
      return total;
    }, 0).toFixed(1);
  };

  const availableFormats = [...new Set(
    selectedOptions.flatMap(optionId => {
      const option = exportOptions.find(opt => opt.id === optionId);
      return option?.format || [];
    })
  )];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exportar Dados do Sistema</DialogTitle>
          <DialogDescription>
            Selecione os dados que deseja exportar e o formato de arquivo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Options */}
          <div>
            <h3 className="text-sm font-medium mb-4">Selecione os dados para exportar:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exportOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = selectedOptions.includes(option.id);
                
                return (
                  <Card key={option.id} className={`cursor-pointer border-2 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleOptionChange(option.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <h4 className="font-medium">{option.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Tamanho: {option.estimatedSize}</span>
                            <span>Formatos: {option.format.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Format Selection */}
          {selectedOptions.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Formato de Exportação:</Label>
              <div className="flex gap-2 mt-2">
                {availableFormats.map((format) => (
                  <Button
                    key={format}
                    variant={selectedFormat === format ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFormat(format)}
                  >
                    {format}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Export Summary */}
          {selectedOptions.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Resumo da Exportação</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Itens selecionados:</span>
                    <p className="font-medium">{selectedOptions.length}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tamanho estimado:</span>
                    <p className="font-medium">{getTotalSize()} MB</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Formato:</span>
                    <p className="font-medium">{selectedFormat}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <Label>Exportando dados...</Label>
              <Progress value={exportProgress} className="w-full" />
              <p className="text-sm text-gray-600">{exportProgress}% concluído</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedOptions(exportOptions.map(opt => opt.id))}
            >
              Selecionar Tudo
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedOptions([])}
            >
              Limpar Seleção
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || selectedOptions.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar Dados'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
