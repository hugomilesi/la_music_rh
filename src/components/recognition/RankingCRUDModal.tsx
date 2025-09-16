
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Star, Trophy, Lock } from 'lucide-react';
import { useEmployees } from '@/contexts/EmployeeContext';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { EmployeeSelector } from '@/components/incidents/EmployeeSelector';

interface RankingEntry {
  id: string;
  employee_id: string;
  program_id: string;
  evaluation_period: string;
  total_stars: number;
  evaluator_id: string;
  evaluation_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface RankingCRUDModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId?: string;
  evaluationPeriod?: string;
}

export const RankingCRUDModal: React.FC<RankingCRUDModalProps> = ({
  open,
  onOpenChange,
  programId,
  evaluationPeriod
}) => {
  const { employees } = useEmployees();
  const { canEditInModule } = usePermissionsV2();
  const canManageEvaluations = useMemo(() => canEditInModule('avaliacoes'), [canEditInModule]);
  
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<RankingEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    employee_id: '',
    total_stars: 0,
    notes: '',
    evaluator_id: ''
  });

  useEffect(() => {
    if (open) {
      loadRankings();
    }
  }, [open, programId, evaluationPeriod]);

  const loadRankings = async () => {
    // Simulated data - replace with actual API call
    const mockData: RankingEntry[] = [
      {
        id: '1',
        employee_id: 'emp1',
        program_id: programId || 'prog1',
        evaluation_period: evaluationPeriod || 'Março 2024',
        total_stars: 85,
        evaluator_id: 'eval1',
        evaluation_date: '2024-03-15',
        notes: 'Excelente desempenho nas metas de retenção',
        created_at: '2024-03-15T10:00:00Z',
        updated_at: '2024-03-15T10:00:00Z'
      },
      {
        id: '2',
        employee_id: 'emp2',
        program_id: programId || 'prog1',
        evaluation_period: evaluationPeriod || 'Março 2024',
        total_stars: 92,
        evaluator_id: 'eval1',
        evaluation_date: '2024-03-15',
        notes: 'Superou todas as expectativas',
        created_at: '2024-03-15T10:00:00Z',
        updated_at: '2024-03-15T10:00:00Z'
      }
    ];
    
    setRankings(mockData);
  };

  const handleSave = () => {
    const entry: RankingEntry = {
      id: editingEntry?.id || Date.now().toString(),
      employee_id: formData.employee_id,
      program_id: programId || 'default',
      evaluation_period: evaluationPeriod || 'Março 2024',
      total_stars: formData.total_stars,
      evaluator_id: formData.evaluator_id,
      evaluation_date: new Date().toISOString().split('T')[0],
      notes: formData.notes,
      created_at: editingEntry?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (editingEntry) {
      setRankings(prev => prev.map(r => r.id === editingEntry.id ? entry : r));
    } else {
      setRankings(prev => [...prev, entry]);
    }

    resetForm();
  };

  const handleEdit = (entry: RankingEntry) => {
    setEditingEntry(entry);
    setFormData({
      employee_id: entry.employee_id,
      total_stars: entry.total_stars,
      notes: entry.notes,
      evaluator_id: entry.evaluator_id
    });
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setRankings(prev => prev.filter(r => r.id !== id));
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      total_stars: 0,
      notes: '',
      evaluator_id: ''
    });
    setEditingEntry(null);
    setIsCreating(false);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Funcionário não encontrado';
  };

  if (!canManageEvaluations) {
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
              Você não tem permissão para gerenciar rankings e avaliações.
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
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Gerenciar Rankings
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-[70vh]">
          {/* Rankings List */}
          <div className="flex-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Rankings Atuais</CardTitle>
                  <Button 
                    onClick={() => setIsCreating(true)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Funcionário</TableHead>
                        <TableHead>Estrelas</TableHead>
                        <TableHead>Observações</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankings.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {getEmployeeName(entry.employee_id)}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {entry.total_stars} ⭐
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {entry.notes}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEdit(entry)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(entry.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {rankings.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum ranking encontrado</p>
                      <Button 
                        onClick={() => setIsCreating(true)}
                        className="mt-4"
                        variant="outline"
                      >
                        Criar Primeiro Ranking
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          {isCreating && (
            <div className="w-96">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    {editingEntry ? 'Editar' : 'Novo'} Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Funcionário</Label>
                    <EmployeeSelector
                      value={formData.employee_id}
                      onChange={(employeeId, employeeName) => {
                        setFormData(prev => ({ ...prev, employee_id: employeeId }));
                      }}
                      placeholder="Selecionar funcionário..."
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Total de Estrelas</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.total_stars}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        total_stars: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Avaliador</Label>
                    <EmployeeSelector
                      value={formData.evaluator_id}
                      onChange={(employeeId, employeeName) => {
                        setFormData(prev => ({ ...prev, evaluator_id: employeeId }));
                      }}
                      placeholder="Selecionar avaliador..."
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Observações</Label>
                    <Textarea
                      placeholder="Comentários sobre a avaliação..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        notes: e.target.value 
                      }))}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={!formData.employee_id || !formData.evaluator_id}
                      className="flex-1"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
