
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy, Edit, MoreHorizontal, Trash2, Eye, Calendar } from 'lucide-react';
import { ScheduleEvent } from '@/types/schedule';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useToast } from '@/hooks/use-toast';

interface EventQuickActionsProps {
  event: ScheduleEvent;
  onEdit?: (event: ScheduleEvent) => void;
  onView?: (event: ScheduleEvent) => void;
  onDuplicate?: (event: ScheduleEvent) => void;
}

export const EventQuickActions: React.FC<EventQuickActionsProps> = ({
  event,
  onEdit,
  onView,
  onDuplicate
}) => {
  const { deleteEvent } = useSchedule();
  const { toast } = useToast();

  // Verificar se é um evento de avaliação
  const isEvaluationEvent = event.id.startsWith('eval_');
  
  console.log('Event details:', {
    id: event.id,
    title: event.title,
    isEvaluationEvent,
    type: event.type
  });

  const handleDelete = async () => {
    // Verificação adicional para eventos de avaliação
    if (isEvaluationEvent) {
      toast({
        title: 'Ação não permitida',
        description: 'Avaliações só podem ser removidas na página de Avaliações.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteEvent(event.id, 'schedule');
      toast({
        title: 'Evento removido',
        description: 'O evento foi removido com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao remover o evento.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(event);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onView?.(event)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalhes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit?.(event)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {!isEvaluationEvent && (
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Remover
          </DropdownMenuItem>
        )}
        {isEvaluationEvent && (
          <DropdownMenuItem disabled className="text-gray-400">
            <Trash2 className="mr-2 h-4 w-4" />
            Remover na página de Avaliações
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
