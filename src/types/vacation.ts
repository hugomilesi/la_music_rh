
export interface VacationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado';
  requestDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  type: 'vacation' | 'medical' | 'personal' | 'maternity' | 'paternity';
}

export interface VacationBalance {
  employeeId: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  yearlyAllowance: number;
  expirationDate: string;
}

export interface NewVacationRequest {
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: VacationRequest['type'];
}

export interface VacationAlert {
  id: string;
  type: 'expiring_vacation' | 'pending_approval' | 'balance_low';
  employeeId: string;
  employeeName: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  date: string;
}
