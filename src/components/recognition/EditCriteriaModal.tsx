
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Criterion, CriterionFormData } from '@/types/recognitionCriteria';

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  weight: z.number().min(1).max(10),
  isActive: z.boolean(),
});

interface EditCriteriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditCriteriaModal: React.FC<EditCriteriaModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
  const [isNewCriterion, setIsNewCriterion] = useState(false);

  const form = useForm<CriterionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      weight: 5,
      isActive: true,
    },
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    setCriteria([
      {
        id: '1',
        name: 'Pontualidade',
        description: 'Chegar no horário estabelecido',
        weight: 8,
        isActive: true,
      },
      {
        id: '2',
        name: 'Proatividade',
        description: 'Tomar iniciativa em situações que requerem ação',
        weight: 9,
        isActive: true,
      },
    ]);
  }, []);

  const handleNewCriterion = () => {
    setIsNewCriterion(true);
    setEditingCriterion(null);
    form.reset({
      name: '',
      description: '',
      weight: 5,
      isActive: true,
    });
  };

  const handleEditCriterion = (criterion: Criterion) => {
    setIsNewCriterion(false);
    setEditingCriterion(criterion);
    form.reset({
      name: criterion.name,
      description: criterion.description,
      weight: criterion.weight,
      isActive: criterion.isActive,
    });
  };

  const handleDeleteCriterion = (id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
    toast({
      title: 'Critério removido',
      description: 'O critério foi removido com sucesso.',
    });
  };

  const onSubmit = (data: CriterionFormData) => {
    if (isNewCriterion) {
      const newCriterion: Criterion = {
        id: Date.now().toString(),
        ...data,
      };
      setCriteria(prev => [...prev, newCriterion]);
      toast({
        title: 'Critério adicionado',
        description: 'O novo critério foi criado com sucesso.',
      });
    } else if (editingCriterion) {
      setCriteria(prev =>
        prev.map(c =>
          c.id === editingCriterion.id ? { ...editingCriterion, ...data } : c
        )
      );
      toast({
        title: 'Critério atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    }

    setEditingCriterion(null);
    setIsNewCriterion(false);
    form.reset();
  };

  const showForm = isNewCriterion || editingCriterion;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Critérios de Avaliação</DialogTitle>
          <DialogDescription>
            Configure os critérios utilizados para avaliar o desempenho dos colaboradores
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!showForm && (
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Critérios Cadastrados</h3>
              <Button onClick={handleNewCriterion}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Critério
              </Button>
            </div>
          )}

          {showForm && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Critério</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Pontualidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso (1-10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o que será avaliado neste critério..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Critério Ativo</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Critérios inativos não aparecem nas avaliações
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit">
                    {isNewCriterion ? 'Criar Critério' : 'Salvar Alterações'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingCriterion(null);
                      setIsNewCriterion(false);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {!showForm && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criteria.map((criterion) => (
                  <TableRow key={criterion.id}>
                    <TableCell className="font-medium">{criterion.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {criterion.description}
                    </TableCell>
                    <TableCell>{criterion.weight}</TableCell>
                    <TableCell>
                      <Badge variant={criterion.isActive ? 'default' : 'secondary'}>
                        {criterion.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCriterion(criterion)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCriterion(criterion.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
