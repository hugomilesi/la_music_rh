import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VacationProvider, useVacation } from '@/contexts/VacationContext';
import { VacationStats } from '@/components/vacation/VacationStats';
import { VacationAlerts } from '@/components/vacation/VacationAlerts';
import { VacationCalendar } from '@/components/vacation/VacationCalendar';
import { VacationRequestsList } from '@/components/vacation/VacationRequestsList';
import { NewVacationDialog } from '@/components/vacation/NewVacationDialog';
import { VacationRequest } from '@/types/vacation';
import { VacationDetailsModal } from '@/components/vacation/VacationDetailsModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';


const VacationPageContent = () => {
  const {
    vacationRequests,
    vacationAlerts,
    isLoading,
    approveVacationRequest,
    rejectVacationRequest,
  } = useVacation();
  const { user } = useAuth();
  const [isNewRequestDialogOpen, setIsNewRequestDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);
  const { toast } = useToast();


  const handleApprove = async (requestId: string) => {
    try {
      if (!user?.id) {
        toast({ title: 'Erro', description: 'Usuário não autenticado.', variant: 'destructive' });
        return;
      }
      await approveVacationRequest(requestId, user.id);
      toast({ title: 'Sucesso', description: 'Solicitação de férias aprovada.' });
      setSelectedRequest(null);
    } catch (error) {
      // Log desabilitado: Error approving vacation request
      toast({ title: 'Erro', description: 'Falha ao aprovar a solicitação. Verifique se você tem permissão para esta ação.', variant: 'destructive' });
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    try {
      if (!user?.id) {
        toast({ title: 'Erro', description: 'Usuário não autenticado.', variant: 'destructive' });
        return;
      }
      await rejectVacationRequest(requestId, reason, user.id);
      toast({ title: 'Sucesso', description: 'Solicitação de férias rejeitada.' });
      setSelectedRequest(null);
    } catch (error) {
      // Log desabilitado: Error rejecting vacation request
      toast({ title: 'Erro', description: 'Falha ao rejeitar a solicitação. Verifique se você tem permissão para esta ação.', variant: 'destructive' });
    }
  };


  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Painel de Férias</h1>
        <Button onClick={() => setIsNewRequestDialogOpen(true)}>Solicitar Férias</Button>
      </header>

      <VacationStats />
      <VacationAlerts alerts={vacationAlerts} onViewAlertDetails={(alertId) => {
        const request = vacationRequests.find(r => `pending_${r.id}` === alertId);
        if (request) setSelectedRequest(request);
      }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VacationCalendar requests={vacationRequests} />
        </div>
        <div>
          <VacationRequestsList
            onViewDetails={(requestId) => {
              const request = vacationRequests.find(r => r.id === requestId);
              if (request) setSelectedRequest(request);
            }}
          />
        </div>
      </div>

      <NewVacationDialog
        open={isNewRequestDialogOpen}
        onOpenChange={setIsNewRequestDialogOpen}
      />

      <VacationDetailsModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        requestId={selectedRequest?.id || null}
      />
    </div>
  );
};

const VacationPage = () => (
  <VacationProvider>
    <VacationPageContent />
  </VacationProvider>
);

export default VacationPage;
