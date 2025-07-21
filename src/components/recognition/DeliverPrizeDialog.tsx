
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Gift, Medal, Crown, Star, Lock } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface DeliverPrizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeliverPrize?: (prize: any) => void;
}

export const DeliverPrizeDialog: React.FC<DeliverPrizeDialogProps> = ({
  open,
  onOpenChange,
  onDeliverPrize
}) => {
  const { checkPermission } = usePermissions();
  const canManageEmployees = checkPermission('canManageEmployees', false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [prizeType, setPrizeType] = useState('');
  const [achievement, setAchievement] = useState('');
  const [comments, setComments] = useState('');

  const topPerformers = [
    { id: '1', name: 'Aline Cristina Pessanha Faria', unit: 'Campo Grande', totalStars: 95, program: 'Fideliza+' },
    { id: '2', name: 'Felipe Elias Carvalho', unit: 'Campo Grande', totalStars: 92, program: 'Matriculador+' },
    { id: '3', name: 'Igor Esteves Alves Baiao', unit: 'Barra', totalStars: 90, program: 'Professor+' },
    { id: '4', name: 'Maria Silva', unit: 'Tijuca', totalStars: 88, program: 'Fideliza+' },
    { id: '5', name: 'João Santos', unit: 'Copacabana', totalStars: 85, program: 'Professor+' }
  ];

  const prizeTypes = [
    { 
      value: 'monthly-champion', 
      label: 'Campeão do Mês', 
      icon: Crown, 
      description: 'Reconhecimento para o melhor desempenho mensal',
      color: 'text-yellow-600'
    },
    { 
      value: 'excellence-medal', 
      label: 'Medalha de Excelência', 
      icon: Medal, 
      description: 'Para colaboradores que demonstraram excelência',
      color: 'text-blue-600'
    },
    { 
      value: 'special-recognition', 
      label: 'Reconhecimento Especial', 
      icon: Trophy, 
      description: 'Premiação especial por conquistas específicas',
      color: 'text-purple-600'
    },
    { 
      value: 'gift-voucher', 
      label: 'Vale Presente', 
      icon: Gift, 
      description: 'Vale presente para uso em lojas parceiras',
      color: 'text-green-600'
    }
  ];

  const achievements = [
    'Meta de retenção superada',
    'Maior número de matrículas do mês',
    'Melhor avaliação dos alunos',
    'Inovação em métodos de ensino',
    'Excelência no atendimento',
    'Colaboração excepcional',
    'Liderança de equipe',
    'Outro (especificar nos comentários)'
  ];

  const handleDeliverPrize = () => {
    const prize = {
      id: Date.now().toString(),
      employeeId: selectedEmployee,
      employeeName: topPerformers.find(e => e.id === selectedEmployee)?.name || '',
      prizeType,
      achievement,
      comments,
      deliveredDate: new Date().toISOString().split('T')[0],
      deliveredBy: 'Admin',
      status: 'delivered'
    };

    console.log('Prêmio entregue:', prize);
    
    if (onDeliverPrize) {
      onDeliverPrize(prize);
    }
    
    // Reset form
    setSelectedEmployee('');
    setPrizeType('');
    setAchievement('');
    setComments('');
    
    onOpenChange(false);
  };

  const selectedEmployee_data = topPerformers.find(e => e.id === selectedEmployee);
  const selectedPrizeType_data = prizeTypes.find(type => type.value === prizeType);

  if (!canManageEmployees) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              Acesso Negado
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Você não tem permissão para entregar prêmios. Esta ação é restrita a administradores.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Entregar Prêmio
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Employee Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Selecionar Colaborador</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Escolha um colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      {topPerformers.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="font-medium">{employee.name}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {employee.unit}
                                </Badge>
                                <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                  {employee.totalStars} ⭐
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEmployee_data && (
                  <Card className="bg-blue-50 border border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">{selectedEmployee_data.name}</p>
                          <p className="text-sm text-blue-700">
                            {selectedEmployee_data.program} • {selectedEmployee_data.unit}
                          </p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {selectedEmployee_data.totalStars} ⭐
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Prize Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tipo de Prêmio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Prêmio</Label>
                  <Select value={prizeType} onValueChange={setPrizeType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo de prêmio" />
                    </SelectTrigger>
                    <SelectContent>
                      {prizeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className={`w-4 h-4 ${type.color}`} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPrizeType_data && (
                  <Card className="bg-green-50 border border-green-200">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <selectedPrizeType_data.icon className={`w-5 h-5 ${selectedPrizeType_data.color}`} />
                        <div>
                          <p className="font-medium text-green-900">{selectedPrizeType_data.label}</p>
                          <p className="text-sm text-green-700">{selectedPrizeType_data.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Achievement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Motivo da Premiação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Conquista/Achievement</Label>
                  <Select value={achievement} onValueChange={setAchievement}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o motivo da premiação" />
                    </SelectTrigger>
                    <SelectContent>
                      {achievements.map((ach) => (
                        <SelectItem key={ach} value={ach}>
                          {ach}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Comentários Adicionais</Label>
                  <Textarea
                    placeholder="Adicione comentários sobre a premiação..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeliverPrize}
            disabled={!selectedEmployee || !prizeType || !achievement}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Entregar Prêmio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
