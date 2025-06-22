
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Benefit, EmployeeBenefit, BenefitStats, BenefitType, BenefitUsage } from '@/types/benefits';

interface BenefitsContextType {
  benefits: Benefit[];
  benefitTypes: BenefitType[];
  employeeBenefits: EmployeeBenefit[];
  stats: BenefitStats;
  usage: BenefitUsage[];
  addBenefit: (benefit: Omit<Benefit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBenefit: (id: string, benefit: Partial<Benefit>) => void;
  deleteBenefit: (id: string) => void;
  enrollEmployee: (employeeId: string, benefitId: string, dependents?: any[]) => void;
  updateEnrollment: (id: string, data: Partial<EmployeeBenefit>) => void;
  cancelEnrollment: (id: string) => void;
  refreshStats: () => void;
}

const BenefitsContext = createContext<BenefitsContextType | undefined>(undefined);

// Mock data
const mockBenefitTypes: BenefitType[] = [
  { id: '1', name: 'Plano de Saúde', category: 'health', icon: 'Heart', color: 'bg-red-500' },
  { id: '2', name: 'Plano Odontológico', category: 'dental', icon: 'Smile', color: 'bg-blue-500' },
  { id: '3', name: 'Vale Refeição', category: 'food', icon: 'Utensils', color: 'bg-green-500' },
  { id: '4', name: 'Vale Transporte', category: 'transport', icon: 'Car', color: 'bg-yellow-500' },
  { id: '5', name: 'Auxílio Educação', category: 'education', icon: 'GraduationCap', color: 'bg-purple-500' },
  { id: '6', name: 'Seguro de Vida', category: 'life', icon: 'Shield', color: 'bg-gray-500' }
];

const mockBenefits: Benefit[] = [
  {
    id: '1',
    name: 'Plano de Saúde Premium',
    type: mockBenefitTypes[0],
    description: 'Cobertura completa incluindo consultas, exames e internações',
    value: 450.00,
    coverage: ['Consultas médicas', 'Exames laboratoriais', 'Internações', 'Cirurgias'],
    eligibilityRules: [{ id: '1', rule: 'tempo_empresa', value: 90, operator: 'greater_than' }],
    provider: 'Unimed',
    isActive: true,
    startDate: '2024-01-01',
    documents: ['contrato_unimed.pdf'],
    maxBeneficiaries: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Vale Refeição',
    type: mockBenefitTypes[2],
    description: 'Cartão para alimentação com valor mensal',
    value: 600.00,
    coverage: ['Restaurantes', 'Supermercados', 'Lanchonetes'],
    eligibilityRules: [],
    provider: 'Alelo',
    isActive: true,
    startDate: '2024-01-01',
    documents: ['contrato_alelo.pdf'],
    maxBeneficiaries: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockEmployeeBenefits: EmployeeBenefit[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'João Silva',
    benefitId: '1',
    benefitName: 'Plano de Saúde Premium',
    enrollmentDate: '2024-02-01',
    status: 'active',
    dependents: [
      {
        id: '1',
        name: 'Maria Silva',
        relationship: 'spouse',
        birthDate: '1990-05-15',
        documentNumber: '123.456.789-01',
        isActive: true
      }
    ],
    documents: [],
    lastUpdate: '2024-02-01T00:00:00Z'
  }
];

export const BenefitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [benefits, setBenefits] = useState<Benefit[]>(mockBenefits);
  const [benefitTypes] = useState<BenefitType[]>(mockBenefitTypes);
  const [employeeBenefits, setEmployeeBenefits] = useState<EmployeeBenefit[]>(mockEmployeeBenefits);
  const [stats, setStats] = useState<BenefitStats>({
    totalBenefits: 0,
    activeBenefits: 0,
    totalEnrollments: 0,
    pendingApprovals: 0,
    totalCost: 0,
    mostPopularBenefit: '',
    utilizationRate: 0
  });
  const [usage, setUsage] = useState<BenefitUsage[]>([]);

  const refreshStats = () => {
    const activeBenefits = benefits.filter(b => b.isActive).length;
    const totalEnrollments = employeeBenefits.filter(eb => eb.status === 'active').length;
    const pendingApprovals = employeeBenefits.filter(eb => eb.status === 'pending').length;
    const totalCost = employeeBenefits
      .filter(eb => eb.status === 'active')
      .reduce((sum, eb) => {
        const benefit = benefits.find(b => b.id === eb.benefitId);
        return sum + (benefit?.value || 0);
      }, 0);

    setStats({
      totalBenefits: benefits.length,
      activeBenefits,
      totalEnrollments,
      pendingApprovals,
      totalCost,
      mostPopularBenefit: 'Plano de Saúde Premium',
      utilizationRate: benefits.length > 0 ? (totalEnrollments / benefits.length) * 100 : 0
    });

    // Calculate usage statistics
    const usageStats = benefits.map(benefit => {
      const enrollments = employeeBenefits.filter(eb => eb.benefitId === benefit.id && eb.status === 'active').length;
      return {
        benefitId: benefit.id,
        benefitName: benefit.name,
        enrollments,
        utilizationRate: enrollments > 0 ? (enrollments / 100) * 100 : 0, // Assuming 100 total employees
        totalCost: enrollments * benefit.value,
        avgCostPerEmployee: benefit.value
      };
    });
    setUsage(usageStats);
  };

  useEffect(() => {
    refreshStats();
  }, [benefits, employeeBenefits]);

  const addBenefit = (benefitData: Omit<Benefit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBenefit: Benefit = {
      ...benefitData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBenefits(prev => [...prev, newBenefit]);
  };

  const updateBenefit = (id: string, benefitData: Partial<Benefit>) => {
    setBenefits(prev => prev.map(benefit => 
      benefit.id === id 
        ? { ...benefit, ...benefitData, updatedAt: new Date().toISOString() }
        : benefit
    ));
  };

  const deleteBenefit = (id: string) => {
    setBenefits(prev => prev.filter(benefit => benefit.id !== id));
    setEmployeeBenefits(prev => prev.filter(eb => eb.benefitId !== id));
  };

  const enrollEmployee = (employeeId: string, benefitId: string, dependents: any[] = []) => {
    const benefit = benefits.find(b => b.id === benefitId);
    if (!benefit) return;

    const newEnrollment: EmployeeBenefit = {
      id: Date.now().toString(),
      employeeId,
      employeeName: `Funcionário ${employeeId}`, // In real app, get from employee data
      benefitId,
      benefitName: benefit.name,
      enrollmentDate: new Date().toISOString(),
      status: 'pending',
      dependents: dependents || [],
      documents: [],
      lastUpdate: new Date().toISOString()
    };
    setEmployeeBenefits(prev => [...prev, newEnrollment]);
  };

  const updateEnrollment = (id: string, data: Partial<EmployeeBenefit>) => {
    setEmployeeBenefits(prev => prev.map(enrollment =>
      enrollment.id === id
        ? { ...enrollment, ...data, lastUpdate: new Date().toISOString() }
        : enrollment
    ));
  };

  const cancelEnrollment = (id: string) => {
    updateEnrollment(id, { status: 'cancelled' });
  };

  return (
    <BenefitsContext.Provider value={{
      benefits,
      benefitTypes,
      employeeBenefits,
      stats,
      usage,
      addBenefit,
      updateBenefit,
      deleteBenefit,
      enrollEmployee,
      updateEnrollment,
      cancelEnrollment,
      refreshStats
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
