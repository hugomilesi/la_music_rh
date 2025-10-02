import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  CreditCard, 
  Briefcase, 
  Building, 
  MapPin, 
  FileText, 
  Calendar, 
  DollarSign,
  Clock
} from 'lucide-react';
import { 
  Colaborador,
  StatusColaborador,
  formatCPF
} from '@/types/colaborador';

interface DetalhesColaboradorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colaborador: Colaborador;
}

export const DetalhesColaboradorDialog: React.FC<DetalhesColaboradorDialogProps> = ({
  open,
  onOpenChange,
  colaborador
}) => {
  // Formatar data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };
  
  // Calcular tempo de empresa
  const calcularTempoEmpresa = (dataAdmissao: string) => {
    try {
      const admissao = new Date(dataAdmissao);
      const hoje = new Date();
      const diffTime = Math.abs(hoje.getTime() - admissao.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return `${diffDays} dias`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} ${months === 1 ? 'mês' : 'meses'}`;
      } else {
        const years = Math.floor(diffDays / 365);
        const remainingMonths = Math.floor((diffDays % 365) / 30);
        if (remainingMonths === 0) {
          return `${years} ${years === 1 ? 'ano' : 'anos'}`;
        }
        return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
      }
    } catch {
      return 'Não calculado';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Detalhes do Colaborador
          </DialogTitle>
          <DialogDescription>
            Informações completas de {colaborador.nome}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nome Completo</p>
                  <p className="font-medium">{colaborador.nome}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{colaborador.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">CPF</p>
                  <p className="font-medium">{formatCPF(colaborador.cpf)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge 
                    variant={colaborador.status === StatusColaborador.ATIVO ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {colaborador.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Informações Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="w-5 h-5" />
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Cargo</p>
                  <p className="font-medium">{colaborador.cargo}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Departamento</p>
                  <p className="font-medium">{colaborador.departamento}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Unidade</p>
                  <p className="font-medium">{colaborador.unidade}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Tipo de Contratação</p>
                  <Badge variant="outline" className="mt-1">
                    {colaborador.tipo_contratacao}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Informações de Admissão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Informações de Admissão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Data de Admissão</p>
                  <p className="font-medium">{formatDate(colaborador.data_admissao)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Tempo de Empresa</p>
                  <p className="font-medium">{calcularTempoEmpresa(colaborador.data_admissao)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Cadastrado em</p>
                  <p className="font-medium">{formatDate(colaborador.created_at)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Última Atualização</p>
                  <p className="font-medium">{formatDate(colaborador.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Informações Bancárias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5" />
                Informações Bancárias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {colaborador.banco || colaborador.agencia || colaborador.conta ? (
                <>
                  {colaborador.banco && (
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Banco</p>
                        <p className="font-medium">{colaborador.banco}</p>
                      </div>
                    </div>
                  )}
                  
                  {colaborador.agencia && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Agência</p>
                        <p className="font-medium">{colaborador.agencia}</p>
                      </div>
                    </div>
                  )}
                  
                  {colaborador.conta && (
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Conta</p>
                        <p className="font-medium">{colaborador.conta}</p>
                      </div>
                    </div>
                  )}
                  
                  {colaborador.tipo_conta && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Tipo de Conta</p>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {colaborador.tipo_conta}
                        </Badge>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <DollarSign className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Informações bancárias não cadastradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Resumo em Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="text-center">
            <CardContent className="pt-4">
              <Calendar className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="text-sm text-gray-500">Admissão</p>
              <p className="font-semibold">{formatDate(colaborador.data_admissao)}</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-4">
              <Clock className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-gray-500">Tempo</p>
              <p className="font-semibold">{calcularTempoEmpresa(colaborador.data_admissao)}</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-4">
              <MapPin className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <p className="text-sm text-gray-500">Unidade</p>
              <p className="font-semibold">{colaborador.unidade}</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-4">
              <FileText className="w-8 h-8 mx-auto text-orange-500 mb-2" />
              <p className="text-sm text-gray-500">Status</p>
              <Badge 
                variant={colaborador.status === StatusColaborador.ATIVO ? "default" : "secondary"}
                className="mt-1"
              >
                {colaborador.status}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};