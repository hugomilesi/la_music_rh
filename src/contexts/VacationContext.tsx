
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VacationRequest, VacationBalance, NewVacationRequest, VacationAlert } from '@/types/vacation';
import { vacationService } from '@/services/vacationService';
import { useToast } from '@/hooks/use-toast';

interface VacationContextType {
  requests: VacationRequest[];
  balances: VacationBalance[];
  vacationRequests: VacationRequest[];
  vacationAlerts: VacationAlert[];
  isLoading: boolean;
  addVacationRequest: (request: NewVacationRequest) => Promise<void>;
  updateVacationRequest: (id: string, updates: Partial<VacationRequest>) => Promise<void>;
  deleteVacationRequest: (id: string) => Promise<void>;
  approveVacationRequest: (id: string, approvedBy: string) => Promise<void>;
  rejectVacationRequest: (id: string, reason: string, rejectedBy: string) => Promise<void>;
  getActiveVacations: () => VacationRequest[];
  getPendingRequests: () => VacationRequest[];
  getEmployeeBalance: (employeeId: string) => VacationBalance | null;
  getEmployeeVacations: (employeeId: string) => VacationRequest[];
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

  const approveVacationRequest = async (id: string, approvedBy: string) => {
    try {
      const updatedRequest = await vacationService.approveVacationRequest(id, approvedBy);
      
      setRequests(prev => 
        prev.map(request => 
          request.id === id ? updatedRequest : request
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Solicitação aprovada com sucesso!",
      });
    } catch (error) {
      console.error('Error approving vacation request:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar solicitação",
        variant: "destructive",
      });
    }
  };

  const rejectVacationRequest = async (id: string, reason: string, rejectedBy: string) => {
    try {
      const updatedRequest = await vacationService.rejectVacationRequest(id, reason);
      
      setRequests(prev => 
        prev.map(request => 
          request.id === id ? updatedRequest : request
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Solicitação rejeitada com sucesso!",
      });
    } catch (error) {
      console.error('Error rejecting vacation request:', error);
      toast({
        title: "Erro",
        description: "Erro ao rejeitar solicitação",
        variant: "destructive",
      });
    }
  };

  const getActiveVacations = () => {
    const currentDate = new Date();
    return requests.filter(request => {
      if (request.status !== 'aprovado') return false;
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      return currentDate >= startDate && currentDate <= endDate;
    });
  };

  const getPendingRequests = () => {
    return requests.filter(request => request.status === 'pendente');
  };

  const getEmployeeBalance = (employeeId: string): VacationBalance | null => {
    return balances.find(balance => balance.employeeId === employeeId) || null;
  };

  const getEmployeeVacations = (employeeId: string): VacationRequest[] => {
    return requests.filter(request => request.employeeId === employeeId);
  };

  const getVacationAlerts = (): VacationAlert[] => {
    const alerts: VacationAlert[] = [];
    const currentDate = new Date();
    
    // Check for pending approvals
    const pendingRequests = requests.filter(req => req.status === 'pendente');
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

  // Computed properties for compatibility
  const vacationRequests = requests;
  const vacationAlerts = getVacationAlerts();

  return (
    <VacationContext.Provider value={{
      requests,
      balances,
      vacationRequests,
      vacationAlerts,
      isLoading,
      addVacationRequest,
      updateVacationRequest,
      deleteVacationRequest,
      approveVacationRequest,
      rejectVacationRequest,
      getActiveVacations,
      getPendingRequests,
      getEmployeeBalance,
      getEmployeeVacations,
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
