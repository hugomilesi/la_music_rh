import React, { createContext, useContext, useState, useEffect } from 'react';
import { Benefit, EmployeeBenefit, BenefitStats, BenefitType, BenefitUsage, PerformanceGoal, RenewalSettings, PerformanceData } from '@/types/benefits';
import { benefitsService } from '@/services/benefitsService';
import { toast } from 'sonner';

interface BenefitsContextType {
  benefits: Benefit[];
  benefitTypes: BenefitType[];
  employeeBenefits: EmployeeBenefit[];
  stats: BenefitStats;
  usage: BenefitUsage[];
  loading: boolean;
  addBenefit: (benefit: Omit<Benefit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBenefit: (id: string, benefit: Partial<Benefit>) => Promise<void>;
  deleteBenefit: (id: string) => Promise<void>;
  enrollEmployee: (employeeId: string, benefitId: string, dependents?: any[]) => Promise<void>;
  updateEnrollment: (id: string, data: Partial<EmployeeBenefit>) => Promise<void>;
  cancelEnrollment: (id: string) => Promise<void>;
  refreshStats: () => void;
  // Universal functions - now available for all benefits
  updatePerformanceGoals: (benefitId: string, goals: PerformanceGoal[]) => Promise<void>;
  updateRenewalSettings: (benefitId: string, settings: RenewalSettings) => Promise<void>;
  updatePerformanceData: (enrollmentId: string, data: PerformanceData) => Promise<void>;
  checkRenewals: () => EmployeeBenefit[];
  // Renewal management functions
  approveRenewal: (enrollmentId: string, comments?: string) => Promise<void>;
  denyRenewal: (enrollmentId: string, comments: string) => Promise<void>;
  extendRenewal: (enrollmentId: string, newDate: string) => Promise<void>;
  loadInitialData: () => Promise<void>;
}

const BenefitsContext = createContext<BenefitsContextType | undefined>(undefined);







export const BenefitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [benefitTypes, setBenefitTypes] = useState<BenefitType[]>([]);
  const [employeeBenefits, setEmployeeBenefits] = useState<EmployeeBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BenefitStats>({
    totalBenefits: 0,
    activeBenefits: 0,
    totalEnrollments: 0,
    pendingApprovals: 0,
    totalCost: 0,
    mostPopularBenefit: '',
    utilizationRate: 0,
    benefitsWithGoals: 0,
    pendingRenewals: 0
  });
  const [usage, setUsage] = useState<BenefitUsage[]>([]);

  const refreshStats = async () => {
    try {
      // Get statistics from backend
      const { stats: backendStats, usage: backendUsage } = await benefitsService.getStats();
      
      // Calculate additional frontend-only stats
      const benefitsWithGoals = benefits.filter(b => b.performanceGoals && b.performanceGoals.length > 0).length;
      const pendingRenewals = employeeBenefits.filter(eb => {
        if (!eb.nextRenewalDate) return false;
        const renewalDate = new Date(eb.nextRenewalDate);
        const today = new Date();
        const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if renewal is due within 30 days or overdue
        return daysUntilRenewal <= 30;
      }).length;
      
      // Merge backend stats with frontend calculations
      setStats({
        ...backendStats,
        benefitsWithGoals,
        pendingRenewals
      });
      
      setUsage(backendUsage);
    } catch (error) {
      console.error('Error refreshing stats:', error);
      // Fallback to local calculation if backend fails
      const activeBenefits = benefits.filter(b => b.isActive).length;
      const benefitsWithGoals = benefits.filter(b => b.performanceGoals && b.performanceGoals.length > 0).length;
      // Consider active enrollments as those without end date or with future end date
      const currentDate = new Date();
      const activeEnrollments = employeeBenefits.filter(eb => 
        !eb.nextRenewalDate || new Date(eb.nextRenewalDate) > currentDate
      );
      
      const totalEnrollments = activeEnrollments.length;
      const pendingApprovals = 0; // Since we don't have status column, assume no pending approvals
      const pendingRenewals = employeeBenefits.filter(eb => eb.renewalStatus === 'requires_review').length;
      const totalCost = activeEnrollments.reduce((sum, eb) => {
        const benefit = benefits.find(b => b.id === eb.benefitId);
        return sum + (benefit?.value || 0);
      }, 0);

      setStats({
        totalBenefits: benefits.length,
        activeBenefits,
        totalEnrollments,
        pendingApprovals,
        totalCost,
        mostPopularBenefit: 'N/A',
        utilizationRate: benefits.length > 0 ? (totalEnrollments / benefits.length) * 100 : 0,
        benefitsWithGoals,
        pendingRenewals
      });

      // Calculate usage statistics as fallback
      const usageStats = benefits.map(benefit => {
        const benefitActiveEnrollments = activeEnrollments.filter(eb => eb.benefitId === benefit.id);
        const enrollments = benefitActiveEnrollments.length;
        return {
          benefitId: benefit.id,
          benefitName: benefit.name,
          enrollments,
          utilizationRate: enrollments > 0 ? (enrollments / 100) * 100 : 0,
          totalCost: enrollments * benefit.value,
          avgCostPerEmployee: benefit.value
        };
      });
      setUsage(usageStats);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    refreshStats();
  }, [benefits, employeeBenefits]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [benefitsData, benefitTypesData, employeeBenefitsData] = await Promise.all([
        benefitsService.getBenefits(),
        benefitsService.getBenefitTypes(),
        benefitsService.getEmployeeBenefits()
      ]);
      
      setBenefits(benefitsData);
      setBenefitTypes(benefitTypesData);
      setEmployeeBenefits(employeeBenefitsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Erro ao carregar dados dos benefícios');
    } finally {
      setLoading(false);
    }
  };

  const addBenefit = async (benefitData: Omit<Benefit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newBenefit = await benefitsService.createBenefit(benefitData);
      setBenefits(prev => [...prev, newBenefit]);
      toast.success('Benefício criado com sucesso!');
    } catch (error) {
      console.error('Error creating benefit:', error);
      toast.error('Erro ao criar benefício');
      throw error;
    }
  };

  const updateBenefit = async (id: string, benefitData: Partial<Benefit>) => {
    try {
      const updatedBenefit = await benefitsService.updateBenefit(id, benefitData);
      setBenefits(prev => prev.map(benefit => 
        benefit.id === id ? updatedBenefit : benefit
      ));
      toast.success('Benefício atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating benefit:', error);
      toast.error('Erro ao atualizar benefício');
      throw error;
    }
  };

  const deleteBenefit = async (id: string) => {
    try {
      await benefitsService.deleteBenefit(id);
      setBenefits(prev => prev.filter(benefit => benefit.id !== id));
      setEmployeeBenefits(prev => prev.filter(eb => eb.benefitId !== id));
      toast.success('Benefício excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting benefit:', error);
      toast.error('Erro ao excluir benefício');
      throw error;
    }
  };

  const enrollEmployee = async (employeeId: string, benefitId: string, dependents: any[] = []) => {
    try {
      const benefit = benefits.find(b => b.id === benefitId);
      if (!benefit) {
        toast.error('Benefício não encontrado');
        return;
      }

      const enrollmentData = {
        employeeId,
        benefitId,
        dependents: dependents || [],
        documents: []
      };

      const newEnrollment = await benefitsService.createEmployeeBenefit(enrollmentData);
      setEmployeeBenefits(prev => [...prev, newEnrollment]);
      toast.success('Funcionário inscrito no benefício com sucesso!');
    } catch (error) {
      console.error('Error enrolling employee:', error);
      toast.error('Erro ao inscrever funcionário no benefício');
      throw error;
    }
  };

  const updateEnrollment = async (id: string, data: Partial<EmployeeBenefit>) => {
    try {
      const updatedEnrollment = await benefitsService.updateEmployeeBenefit(id, data);
      setEmployeeBenefits(prev => prev.map(enrollment =>
        enrollment.id === id ? updatedEnrollment : enrollment
      ));
      toast.success('Inscrição atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating enrollment:', error);
      toast.error('Erro ao atualizar inscrição');
      throw error;
    }
  };

  const cancelEnrollment = async (id: string) => {
    try {
      // Set end date to today to mark as cancelled
      const today = new Date().toISOString().split('T')[0];
      await updateEnrollment(id, { nextRenewalDate: today });
      toast.success('Inscrição cancelada com sucesso!');
    } catch (error) {
      console.error('Error cancelling enrollment:', error);
      toast.error('Erro ao cancelar inscrição');
      throw error;
    }
  };

  // Universal functions - now available for all benefits
  const updatePerformanceGoals = async (benefitId: string, goals: PerformanceGoal[]) => {
    await updateBenefit(benefitId, { performanceGoals: goals });
  };

  const updateRenewalSettings = async (benefitId: string, settings: RenewalSettings) => {
    await updateBenefit(benefitId, { renewalSettings: settings });
  };

  const updatePerformanceData = async (enrollmentId: string, data: PerformanceData) => {
    await updateEnrollment(enrollmentId, { performanceData: data });
  };

  const checkRenewals = () => {
    return employeeBenefits.filter(eb => {
      if (!eb.nextRenewalDate) return false;
      const renewalDate = new Date(eb.nextRenewalDate);
      const today = new Date();
      const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if renewal is due within 30 days or overdue
      return daysUntilRenewal <= 30;
    });
  };

  // Renewal management functions
  const approveRenewal = async (enrollmentId: string, comments?: string) => {
    try {
      const enrollment = employeeBenefits.find(eb => eb.id === enrollmentId);
      if (!enrollment) {
        toast.error('Inscrição não encontrada');
        return;
      }

      const benefit = benefits.find(b => b.id === enrollment.benefitId);
      if (!benefit?.renewalSettings) {
        toast.error('Configurações de renovação não encontradas');
        return;
      }

      // Calculate next renewal date
      const renewalDate = new Date();
      switch (benefit.renewalSettings.renewalPeriod) {
        case 'monthly':
          renewalDate.setMonth(renewalDate.getMonth() + 1);
          break;
        case 'quarterly':
          renewalDate.setMonth(renewalDate.getMonth() + 3);
          break;
        case 'biannual':
          renewalDate.setMonth(renewalDate.getMonth() + 6);
          break;
        case 'annual':
          renewalDate.setFullYear(renewalDate.getFullYear() + 1);
          break;
      }

      await updateEnrollment(enrollmentId, {
        renewalStatus: 'automatic',
        nextRenewalDate: renewalDate.toISOString()
        // Status is now determined by dates, not a separate column
      });

      toast.success('Renovação aprovada com sucesso!');
      console.log(`Renewal approved for enrollment ${enrollmentId}`, comments);
    } catch (error) {
      console.error('Error approving renewal:', error);
      toast.error('Erro ao aprovar renovação');
    }
  };

  const denyRenewal = async (enrollmentId: string, comments: string) => {
    try {
      await updateEnrollment(enrollmentId, {
        renewalStatus: 'expired'
        // Status is now determined by dates, not a separate column
      });

      toast.success('Renovação negada');
      console.log(`Renewal denied for enrollment ${enrollmentId}: ${comments}`);
    } catch (error) {
      console.error('Error denying renewal:', error);
      toast.error('Erro ao negar renovação');
    }
  };

  const extendRenewal = async (enrollmentId: string, newDate: string) => {
    try {
      await updateEnrollment(enrollmentId, {
        nextRenewalDate: newDate,
        renewalStatus: 'requires_review'
      });

      toast.success('Prazo de renovação estendido');
      console.log(`Renewal extended for enrollment ${enrollmentId} to ${newDate}`);
    } catch (error) {
      console.error('Error extending renewal:', error);
      toast.error('Erro ao estender renovação');
    }
  };

  return (
    <BenefitsContext.Provider value={{
      benefits,
      benefitTypes,
      employeeBenefits,
      stats,
      usage,
      loading,
      addBenefit,
      updateBenefit,
      deleteBenefit,
      enrollEmployee,
      updateEnrollment,
      cancelEnrollment,
      refreshStats,
      updatePerformanceGoals,
      updateRenewalSettings,
      updatePerformanceData,
      checkRenewals,
      approveRenewal,
      denyRenewal,
      extendRenewal,
      loadInitialData
    }}>
      {children}
    </BenefitsContext.Provider>
  );
};

export const useBenefits = () => {
  const context = useContext(BenefitsContext);
  if (context === undefined) {
    throw new Error('useBenefits must be used within a BenefitsProvider');
  }
  return context;
};
