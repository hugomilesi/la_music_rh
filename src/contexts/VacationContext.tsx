import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { VacationRequest, VacationBalance, NewVacationRequest, VacationAlert } from '@/types/vacation';
import { addDays, differenceInDays, format } from 'date-fns';

interface VacationContextType {
  vacationRequests: VacationRequest[];
  vacationBalances: VacationBalance[];
  vacationAlerts: VacationAlert[];
  isLoading: boolean;
  addVacationRequest: (data: NewVacationRequest) => void;
  updateVacationRequest: (id: string, data: Partial<VacationRequest>) => void;
  deleteVacationRequest: (id: string) => void;
  approveVacationRequest: (id: string, approvedBy: string) => void;
  rejectVacationRequest: (id: string, rejectionReason: string, rejectedBy: string) => void;
  getEmployeeVacations: (employeeId: string) => VacationRequest[];
  getEmployeeBalance: (employeeId: string) => VacationBalance | undefined;
  getActiveVacations: () => VacationRequest[];
  getPendingRequests: () => VacationRequest[];
  getVacationAlerts: () => VacationAlert[];
}

const VacationContext = createContext<VacationContextType | undefined>(undefined);

// Mock data
const mockVacationRequests: VacationRequest[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'João Silva',
    startDate: '2024-07-15',
    endDate: '2024-07-29',
    days: 15,
    reason: 'Férias de verão',
    status: 'approved',
    requestDate: '2024-06-01',
    approvedBy: 'Admin',
    approvedDate: '2024-06-05',
    type: 'vacation'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Maria Santos',
    startDate: '2024-08-10',
    endDate: '2024-08-20',
    days: 10,
    reason: 'Viagem familiar',
    status: 'pending',
    requestDate: '2024-06-20',
    type: 'vacation'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Pedro Costa',
    startDate: '2024-09-01',
    endDate: '2024-09-15',
    days: 15,
    reason: 'Descanso',
    status: 'approved',
    requestDate: '2024-06-25',
    approvedBy: 'Admin',
    approvedDate: '2024-06-30',
    type: 'vacation'
  }
];

const mockVacationBalances: VacationBalance[] = [
  {
    employeeId: '1',
    totalDays: 30,
    usedDays: 15,
    remainingDays: 15,
    yearlyAllowance: 30,
    expirationDate: '2024-12-31'
  },
  {
    employeeId: '2',
    totalDays: 30,
    usedDays: 0,
    remainingDays: 30,
    yearlyAllowance: 30,
    expirationDate: '2024-12-31'
  },
  {
    employeeId: '3',
    totalDays: 30,
    usedDays: 15,
    remainingDays: 15,
    yearlyAllowance: 30,
    expirationDate: '2024-12-31'
  }
];

export const VacationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>(mockVacationRequests);
  const [vacationBalances, setVacationBalances] = useState<VacationBalance[]>(mockVacationBalances);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('VacationProvider initialized');
    console.log('Initial vacation requests:', mockVacationRequests);
    console.log('Initial vacation balances:', mockVacationBalances);
  }, []);

  const calculateDays = useCallback((startDate: string, endDate: string): number => {
    const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
    console.log('Calculated days for vacation:', { startDate, endDate, days });
    return days;
  }, []);

  const addVacationRequest = useCallback((data: NewVacationRequest) => {
    console.log('Adding vacation request:', data);
    setIsLoading(true);
    
    setTimeout(() => {
      const days = calculateDays(data.startDate, data.endDate);
      const newRequest: VacationRequest = {
        ...data,
        id: Date.now().toString(),
        employeeName: 'Employee Name', // Would be fetched from employee data
        days,
        status: 'pending',
        requestDate: format(new Date(), 'yyyy-MM-dd')
      };
      
      console.log('New vacation request created:', newRequest);
      setVacationRequests(prev => {
        const updated = [...prev, newRequest];
        console.log('Updated vacation requests:', updated);
        return updated;
      });
      setIsLoading(false);
    }, 1000);
  }, [calculateDays]);

  const updateVacationRequest = useCallback((id: string, data: Partial<VacationRequest>) => {
    setVacationRequests(prev => prev.map(req => 
      req.id === id ? { ...req, ...data } : req
    ));
  }, []);

  const deleteVacationRequest = useCallback((id: string) => {
    setVacationRequests(prev => prev.filter(req => req.id !== id));
  }, []);

  const approveVacationRequest = useCallback((id: string, approvedBy: string) => {
    updateVacationRequest(id, {
      status: 'approved',
      approvedBy,
      approvedDate: format(new Date(), 'yyyy-MM-dd')
    });
  }, [updateVacationRequest]);

  const rejectVacationRequest = useCallback((id: string, rejectionReason: string, rejectedBy: string) => {
    updateVacationRequest(id, {
      status: 'rejected',
      rejectionReason,
      approvedBy: rejectedBy,
      approvedDate: format(new Date(), 'yyyy-MM-dd')
    });
  }, [updateVacationRequest]);

  const getEmployeeVacations = useCallback((employeeId: string) => {
    return vacationRequests.filter(req => req.employeeId === employeeId);
  }, [vacationRequests]);

  const getEmployeeBalance = useCallback((employeeId: string) => {
    return vacationBalances.find(balance => balance.employeeId === employeeId);
  }, [vacationBalances]);

  const getActiveVacations = useCallback(() => {
    const today = new Date();
    const active = vacationRequests.filter(req => {
      const startDate = new Date(req.startDate);
      const endDate = new Date(req.endDate);
      return req.status === 'approved' && startDate <= today && endDate >= today;
    });
    console.log('Active vacations:', active);
    return active;
  }, [vacationRequests]);

  const getPendingRequests = useCallback(() => {
    const pending = vacationRequests.filter(req => req.status === 'pending');
    console.log('Pending requests:', pending);
    return pending;
  }, [vacationRequests]);

  const getVacationAlerts = useCallback((): VacationAlert[] => {
    const alerts: VacationAlert[] = [];
    const today = new Date();

    // Check for expiring vacation balances
    vacationBalances.forEach(balance => {
      const expirationDate = new Date(balance.expirationDate);
      const daysUntilExpiration = differenceInDays(expirationDate, today);
      
      if (daysUntilExpiration <= 90 && balance.remainingDays > 0) {
        alerts.push({
          id: `expiring_${balance.employeeId}`,
          type: 'expiring_vacation',
          employeeId: balance.employeeId,
          employeeName: 'Employee Name', // Would be fetched from employee data
          message: `${balance.remainingDays} dias de férias expiram em ${daysUntilExpiration} dias`,
          priority: daysUntilExpiration <= 30 ? 'high' : 'medium',
          date: format(today, 'yyyy-MM-dd')
        });
      }
    });

    // Check for pending approvals
    const pendingRequests = getPendingRequests();
    pendingRequests.forEach(request => {
      const requestDate = new Date(request.requestDate);
      const daysPending = differenceInDays(today, requestDate);
      
      alerts.push({
        id: `pending_${request.id}`,
        type: 'pending_approval',
        employeeId: request.employeeId,
        employeeName: request.employeeName,
        message: `Solicitação de férias pendente há ${daysPending} dias`,
        priority: daysPending > 7 ? 'high' : 'medium',
        date: format(today, 'yyyy-MM-dd')
      });
    });

    console.log('Generated vacation alerts:', alerts);
    return alerts;
  }, [vacationBalances, getPendingRequests]);

  const vacationAlerts = getVacationAlerts();

  const contextValue = {
    vacationRequests,
    vacationBalances,
    vacationAlerts,
    isLoading,
    addVacationRequest,
    updateVacationRequest: useCallback((id: string, data: Partial<VacationRequest>) => {
      console.log('Updating vacation request:', { id, data });
      setVacationRequests(prev => prev.map(req => 
        req.id === id ? { ...req, ...data } : req
      ));
    }, []),
    deleteVacationRequest: useCallback((id: string) => {
      console.log('Deleting vacation request:', id);
      setVacationRequests(prev => prev.filter(req => req.id !== id));
    }, []),
    approveVacationRequest: useCallback((id: string, approvedBy: string) => {
      console.log('Approving vacation request:', { id, approvedBy });
      setVacationRequests(prev => prev.map(req => 
        req.id === id ? {
          ...req,
          status: 'approved' as const,
          approvedBy,
          approvedDate: format(new Date(), 'yyyy-MM-dd')
        } : req
      ));
    }, []),
    rejectVacationRequest: useCallback((id: string, rejectionReason: string, rejectedBy: string) => {
      console.log('Rejecting vacation request:', { id, rejectionReason, rejectedBy });
      setVacationRequests(prev => prev.map(req => 
        req.id === id ? {
          ...req,
          status: 'rejected' as const,
          rejectionReason,
          approvedBy: rejectedBy,
          approvedDate: format(new Date(), 'yyyy-MM-dd')
        } : req
      ));
    }, []),
    getEmployeeVacations: useCallback((employeeId: string) => {
      return vacationRequests.filter(req => req.employeeId === employeeId);
    }, [vacationRequests]),
    getEmployeeBalance: useCallback((employeeId: string) => {
      return vacationBalances.find(balance => balance.employeeId === employeeId);
    }, [vacationBalances]),
    getActiveVacations,
    getPendingRequests,
    getVacationAlerts
  };

  console.log('VacationContext value:', contextValue);

  return (
    <VacationContext.Provider value={contextValue}>
      {children}
    </VacationContext.Provider>
  );
};

export const useVacation = () => {
  const context = useContext(VacationContext);
  if (context === undefined) {
    console.error('useVacation must be used within a VacationProvider');
    throw new Error('useVacation must be used within a VacationProvider');
  }
  return context;
};
