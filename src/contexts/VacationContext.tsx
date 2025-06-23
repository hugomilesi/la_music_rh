
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VacationRequest, VacationBalance, NewVacationRequest, VacationAlert } from '@/types/vacation';
import { vacationService } from '@/services/vacationService';
import { useToast } from '@/hooks/use-toast';

interface VacationContextType {
  requests: VacationRequest[];
  balances: VacationBalance[];
  isLoading: boolean;
  addVacationRequest: (request: NewVacationRequest) => Promise<void>;
  updateVacationRequest: (id: string, updates: Partial<VacationRequest>) => Promise<void>;
  deleteVacationRequest: (id: string) => Promise<void>;
  getVacationAlerts: () => VacationAlert[];
  refreshData: () => Promise<void>;
}

const VacationContext = createContext<VacationContextType | undefined>(undefined);

export const VacationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [balances, setBalances] = useState<VacationBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [requestsData, balancesData] = await Promise.all([
        vacationService.getVacationRequests(),
        vacationService.getVacationBalances()
      ]);
      setRequests(requestsData);
      setBalances(balancesData);
    } catch (error) {
      console.error('Error loading vacation data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de férias",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addVacationRequest = async (requestData: NewVacationRequest) => {
    try {
      const newRequest = await vacationService.createVacationRequest(requestData);
      setRequests(prev => [...prev, newRequest]);
      toast({
        title: "Sucesso",
        description: "Solicitação de férias criada com sucesso",
      });
    } catch (error) {
      console.error('Error adding vacation request:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar solicitação de férias",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateVacationRequest = async (id: string, updates: Partial<VacationRequest>) => {
    try {
      const updatedRequest = await vacationService.updateVacationRequest(id, updates);
      setRequests(prev => prev.map(req => req.id === id ? updatedRequest : req));
      toast({
        title: "Sucesso",
        description: "Solicitação de férias atualizada com sucesso",
      });
    } catch (error) {
      console.error('Error updating vacation request:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar solicitação de férias",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteVacationRequest = async (id: string) => {
    try {
      await vacationService.deleteVacationRequest(id);
      setRequests(prev => prev.filter(req => req.id !== id));
      toast({
        title: "Sucesso",
        description: "Solicitação de férias removida com sucesso",
      });
    } catch (error) {
      console.error('Error deleting vacation request:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover solicitação de férias",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getVacationAlerts = (): VacationAlert[] => {
    const alerts: VacationAlert[] = [];
    const currentDate = new Date();
    
    // Check for pending approvals
    const pendingRequests = requests.filter(req => req.status === 'pending');
    pendingRequests.forEach(req => {
      alerts.push({
        id: `pending_${req.id}`,
        type: 'pending_approval',
        employeeId: req.employeeId,
        employeeName: req.employeeName,
        message: `Solicitação de férias pendente de aprovação`,
        priority: 'medium',
        date: req.requestDate
      });
    });
    
    // Check for expiring vacation balances
    balances.forEach(balance => {
      const expirationDate = new Date(balance.expirationDate);
      const monthsUntilExpiration = (expirationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsUntilExpiration <= 3 && balance.remainingDays > 0) {
        alerts.push({
          id: `expiring_${balance.employeeId}`,
          type: 'expiring_vacation',
          employeeId: balance.employeeId,
          employeeName: 'Employee', // This would need to be fetched from employee data
          message: `${balance.remainingDays} dias de férias vencem em ${expirationDate.toLocaleDateString()}`,
          priority: 'high',
          date: currentDate.toISOString().split('T')[0]
        });
      }
    });
    
    return alerts;
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <VacationContext.Provider value={{
      requests,
      balances,
      isLoading,
      addVacationRequest,
      updateVacationRequest,
      deleteVacationRequest,
      getVacationAlerts,
      refreshData
    }}>
      {children}
    </VacationContext.Provider>
  );
};

export const useVacation = () => {
  const context = useContext(VacationContext);
  if (context === undefined) {
    throw new Error('useVacation must be used within a VacationProvider');
  }
  return context;
};
