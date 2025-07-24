import { useState, useEffect, useMemo } from 'react';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useNPS } from '@/contexts/NPSContext';
import { useIncidents } from '@/contexts/IncidentsContext';

export interface DashboardMetrics {
  activeEmployees: number;
  totalEmployees: number;
  turnoverRate: string;
  currentNPS: number;
  npsChange: number;
  pendingIncidents: number;
  recentAdmissions: number;
  totalIncidents: number;
  unitDistribution: Record<string, number>;
  isLoading: boolean;
  hasError: boolean;
}

export const useDashboardData = (): DashboardMetrics => {
  const { employees, isLoading: employeesLoading, error: employeesError } = useEmployees();
  const { stats: npsStats, loading: npsLoading } = useNPS();
  const { incidents, stats: incidentStats, loading: incidentsLoading } = useIncidents();
  
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(Date.now());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const metrics = useMemo(() => {
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    const totalEmployees = employees.length;
    
    // Cálculo de turnover baseado em dados reais (simulado)
    const turnoverRate = totalEmployees > 0 ? 
      ((totalEmployees * 0.032)).toFixed(1) : '0.0';
    
    const currentNPS = npsStats?.currentScore || 0;
    const npsChange = npsStats?.currentScore && npsStats?.previousScore ? 
      npsStats.currentScore - npsStats.previousScore : 0;
    
    const pendingIncidents = incidents.filter(inc => inc.status === 'pending').length;
    const totalIncidents = incidents.length;
    
    // Admissões dos últimos 30 dias
    const recentAdmissions = employees.filter(emp => {
      const startDate = new Date(emp.start_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return startDate >= thirtyDaysAgo;
    }).length;
    
    // Distribuição por unidades
    const unitDistribution = employees.reduce((acc, emp) => {
      emp.units?.forEach(unit => {
        acc[unit] = (acc[unit] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const isLoading = employeesLoading || npsLoading || incidentsLoading;
    const hasError = !!employeesError;

    return {
      activeEmployees,
      totalEmployees,
      turnoverRate,
      currentNPS,
      npsChange,
      pendingIncidents,
      recentAdmissions,
      totalIncidents,
      unitDistribution,
      isLoading,
      hasError
    };
  }, [employees, npsStats, incidents, employeesLoading, npsLoading, incidentsLoading, employeesError, lastRefresh]);

  return metrics;
};

export const useUnitSummary = (unitDistribution: Record<string, number>, isLoading: boolean): string => {
  return useMemo(() => {
    if (isLoading) return 'Carregando...';
    
    const units = Object.entries(unitDistribution);
    if (units.length === 0) return 'Nenhuma unidade';
    
    return units
      .slice(0, 3)
      .map(([unit, count]) => `${unit}: ${count}`)
      .join(' | ');
  }, [unitDistribution, isLoading]);
};

export const useDashboardAlerts = () => {
  const { incidents } = useIncidents();
  const { employees } = useEmployees();
  
  return useMemo(() => {
    const pendingIncidents = incidents.filter(inc => inc.status === 'pending');
    
    // Simulação de aniversários próximos
    const birthdays = employees.slice(0, 3).map((emp, index) => ({
      id: emp.id,
      name: emp.name,
      when: index === 0 ? 'Hoje' : index === 1 ? 'Amanhã' : 'Esta semana'
    }));
    
    // Simulação de alertas de férias
    const vacations = [
      { description: '5 solicitações pendentes' },
      { description: 'Carlos sai em 3 dias' },
      { description: 'Luana retorna segunda' }
    ];
    
    return {
      incidents: pendingIncidents.map(inc => ({
        id: inc.id,
        description: inc.description || `Incidente ${inc.type}`
      })),
      birthdays,
      vacations,
      totalPendingIncidents: pendingIncidents.length
    };
  }, [incidents, employees]);
};