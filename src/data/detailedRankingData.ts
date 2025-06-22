
import { DetailedRankingEmployee, EmployeeAchievement, MonthlyProgress, getEligiblePrograms } from '@/types/recognition';

const achievements: EmployeeAchievement[] = [
  {
    id: '1',
    employeeId: '1',
    programId: 'fideliza',
    title: 'Meta de Retenção Superada',
    description: 'Alcançou 92% de retenção de alunos em março',
    starsAwarded: 10,
    date: '2024-03-15',
    type: 'milestone'
  },
  {
    id: '2',
    employeeId: '1',
    programId: 'fideliza',
    title: 'Excelência no Atendimento',
    description: 'Recebeu 5 elogios de alunos esta semana',
    starsAwarded: 8,
    date: '2024-03-10',
    type: 'bonus'
  },
  {
    id: '3',
    employeeId: '2',
    programId: 'matriculador',
    title: '15 Matrículas em Uma Semana',
    description: 'Bateu recorde pessoal de matrículas',
    starsAwarded: 15,
    date: '2024-03-14',
    type: 'milestone'
  },
  {
    id: '4',
    employeeId: '3',
    programId: 'professor',
    title: 'Avaliação Excepcional',
    description: 'Média 4.9/5 nas avaliações dos alunos',
    starsAwarded: 12,
    date: '2024-03-13',
    type: 'milestone'
  }
];

const monthlyProgressData: { [employeeId: string]: MonthlyProgress[] } = {
  '1': [
    { month: 'Jan 2024', fideliza: 38, matriculador: 0, professor: 0, total: 38 },
    { month: 'Fev 2024', fideliza: 42, matriculador: 0, professor: 0, total: 42 },
    { month: 'Mar 2024', fideliza: 45, matriculador: 0, professor: 0, total: 45 }
  ],
  '2': [
    { month: 'Jan 2024', fideliza: 0, matriculador: 12, professor: 0, total: 12 },
    { month: 'Fev 2024', fideliza: 0, matriculador: 14, professor: 0, total: 14 },
    { month: 'Mar 2024', fideliza: 0, matriculador: 15, professor: 0, total: 15 }
  ],
  '3': [
    { month: 'Jan 2024', fideliza: 0, matriculador: 0, professor: 35, total: 35 },
    { month: 'Fev 2024', fideliza: 0, matriculador: 0, professor: 40, total: 40 },
    { month: 'Mar 2024', fideliza: 0, matriculador: 0, professor: 42, total: 42 }
  ],
  '4': [
    { month: 'Jan 2024', fideliza: 0, matriculador: 10, professor: 0, total: 10 },
    { month: 'Fev 2024', fideliza: 0, matriculador: 12, professor: 0, total: 12 },
    { month: 'Mar 2024', fideliza: 0, matriculador: 14, professor: 0, total: 14 }
  ],
  '5': [
    { month: 'Jan 2024', fideliza: 0, matriculador: 0, professor: 32, total: 32 },
    { month: 'Fev 2024', fideliza: 0, matriculador: 0, professor: 36, total: 36 },
    { month: 'Mar 2024', fideliza: 0, matriculador: 0, professor: 40, total: 40 }
  ],
  '6': [
    { month: 'Jan 2024', fideliza: 0, matriculador: 8, professor: 0, total: 8 },
    { month: 'Fev 2024', fideliza: 0, matriculador: 10, professor: 0, total: 10 },
    { month: 'Mar 2024', fideliza: 0, matriculador: 13, professor: 0, total: 13 }
  ]
};

export const detailedRankingEmployees: DetailedRankingEmployee[] = [
  {
    id: '1',
    name: 'Aline Cristina Pessanha Faria',
    unit: 'Campo Grande',
    role: 'Coordenadora Pedagógica',
    stars: { fideliza: 45, matriculador: 0, professor: 0 },
    total: 45,
    position: 1,
    achievements: achievements.filter(a => a.employeeId === '1'),
    monthlyProgress: monthlyProgressData['1'],
    metCriteria: {
      fideliza: ['retention-rate', 'student-satisfaction', 'proactive-contact']
    },
    joinDate: '2022-08-15',
    evaluationPeriod: 'Março 2024',
    eligiblePrograms: getEligiblePrograms('Coordenadora Pedagógica')
  },
  {
    id: '3',
    name: 'Igor Esteves Alves Baiao',
    unit: 'Barra',
    role: 'Professor Senior',
    stars: { fideliza: 0, matriculador: 0, professor: 42 },
    total: 42,
    position: 2,
    achievements: achievements.filter(a => a.employeeId === '3'),
    monthlyProgress: monthlyProgressData['3'],
    metCriteria: {
      professor: ['class-preparation', 'student-engagement', 'innovative-methods']
    },
    joinDate: '2021-05-20',
    evaluationPeriod: 'Março 2024',
    eligiblePrograms: getEligiblePrograms('Professor Senior')
  },
  {
    id: '5',
    name: 'João Pedro Oliveira',
    unit: 'Copacabana',
    role: 'Professor',
    stars: { fideliza: 0, matriculador: 0, professor: 40 },
    total: 40,
    position: 3,
    achievements: [],
    monthlyProgress: monthlyProgressData['5'],
    metCriteria: {
      professor: ['class-preparation', 'student-engagement', 'innovative-methods', 'student-progress']
    },
    joinDate: '2023-03-12',
    evaluationPeriod: 'Março 2024',
    eligiblePrograms: getEligiblePrograms('Professor')
  },
  {
    id: '2',
    name: 'Felipe Elias Carvalho',
    unit: 'Campo Grande',
    role: 'Consultor de Vendas',
    stars: { fideliza: 0, matriculador: 15, professor: 0 },
    total: 15,
    position: 4,
    achievements: achievements.filter(a => a.employeeId === '2'),
    monthlyProgress: monthlyProgressData['2'],
    metCriteria: {
      matriculador: ['monthly-target', 'conversion-rate', 'follow-up-quality']
    },
    joinDate: '2023-01-10',
    evaluationPeriod: 'Março 2024',
    eligiblePrograms: getEligiblePrograms('Consultor de Vendas')
  },
  {
    id: '4',
    name: 'Maria Silva Santos',
    unit: 'Tijuca',
    role: 'Coordenadora de Vendas',
    stars: { fideliza: 0, matriculador: 14, professor: 0 },
    total: 14,
    position: 5,
    achievements: [],
    monthlyProgress: monthlyProgressData['4'],
    metCriteria: {
      matriculador: ['monthly-target', 'conversion-rate']
    },
    joinDate: '2022-11-08',
    evaluationPeriod: 'Março 2024',
    eligiblePrograms: getEligiblePrograms('Coordenadora de Vendas')
  },
  {
    id: '6',
    name: 'Ana Carolina Lima',
    unit: 'Barra',
    role: 'Consultora de Vendas',
    stars: { fideliza: 0, matriculador: 13, professor: 0 },
    total: 13,
    position: 6,
    achievements: [],
    monthlyProgress: monthlyProgressData['6'],
    metCriteria: {
      matriculador: ['monthly-target', 'conversion-rate']
    },
    joinDate: '2023-06-05',
    evaluationPeriod: 'Março 2024',
    eligiblePrograms: getEligiblePrograms('Consultora de Vendas')
  }
];

export { achievements };
