
import { DetailedRankingEmployee, EmployeeAchievement, MonthlyProgress } from '@/types/recognition';

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
    { month: 'Jan 2024', fideliza: 38, matriculador: 8, professor: 25, total: 71 },
    { month: 'Fev 2024', fideliza: 42, matriculador: 10, professor: 32, total: 84 },
    { month: 'Mar 2024', fideliza: 45, matriculador: 12, professor: 38, total: 95 }
  ],
  '2': [
    { month: 'Jan 2024', fideliza: 35, matriculador: 12, professor: 28, total: 75 },
    { month: 'Fev 2024', fideliza: 40, matriculador: 14, professor: 30, total: 84 },
    { month: 'Mar 2024', fideliza: 42, matriculador: 15, professor: 35, total: 92 }
  ],
  '3': [
    { month: 'Jan 2024', fideliza: 32, matriculador: 8, professor: 35, total: 75 },
    { month: 'Fev 2024', fideliza: 35, matriculador: 9, professor: 40, total: 84 },
    { month: 'Mar 2024', fideliza: 38, matriculador: 10, professor: 42, total: 90 }
  ]
};

export const detailedRankingEmployees: DetailedRankingEmployee[] = [
  {
    id: '1',
    name: 'Aline Cristina Pessanha Faria',
    unit: 'Campo Grande',
    role: 'Coordenadora Pedagógica',
    stars: { fideliza: 45, matriculador: 12, professor: 38 },
    total: 95,
    position: 1,
    achievements: achievements.filter(a => a.employeeId === '1'),
    monthlyProgress: monthlyProgressData['1'],
    metCriteria: {
      fideliza: ['retention-rate', 'student-satisfaction', 'proactive-contact'],
      matriculador: ['monthly-target'],
      professor: ['class-preparation', 'student-engagement']
    },
    joinDate: '2022-08-15',
    evaluationPeriod: 'Março 2024'
  },
  {
    id: '2',
    name: 'Felipe Elias Carvalho',
    unit: 'Campo Grande',
    role: 'Consultor de Vendas',
    stars: { fideliza: 42, matriculador: 15, professor: 35 },
    total: 92,
    position: 2,
    achievements: achievements.filter(a => a.employeeId === '2'),
    monthlyProgress: monthlyProgressData['2'],
    metCriteria: {
      fideliza: ['retention-rate', 'proactive-contact'],
      matriculador: ['monthly-target', 'conversion-rate', 'follow-up-quality'],
      professor: ['class-preparation']
    },
    joinDate: '2023-01-10',
    evaluationPeriod: 'Março 2024'
  },
  {
    id: '3',
    name: 'Igor Esteves Alves Baiao',
    unit: 'Barra',
    role: 'Professor Senior',
    stars: { fideliza: 38, matriculador: 10, professor: 42 },
    total: 90,
    position: 3,
    achievements: achievements.filter(a => a.employeeId === '3'),
    monthlyProgress: monthlyProgressData['3'],
    metCriteria: {
      fideliza: ['student-satisfaction'],
      matriculador: ['conversion-rate'],
      professor: ['class-preparation', 'student-engagement', 'innovative-methods']
    },
    joinDate: '2021-05-20',
    evaluationPeriod: 'Março 2024'
  },
  {
    id: '4',
    name: 'Maria Silva Santos',
    unit: 'Tijuca',
    role: 'Coordenadora de Vendas',
    stars: { fideliza: 40, matriculador: 14, professor: 32 },
    total: 86,
    position: 4,
    achievements: [],
    monthlyProgress: [
      { month: 'Jan 2024', fideliza: 32, matriculador: 10, professor: 25, total: 67 },
      { month: 'Fev 2024', fideliza: 36, matriculador: 12, professor: 28, total: 76 },
      { month: 'Mar 2024', fideliza: 40, matriculador: 14, professor: 32, total: 86 }
    ],
    metCriteria: {
      fideliza: ['retention-rate', 'proactive-contact'],
      matriculador: ['monthly-target', 'conversion-rate'],
      professor: ['class-preparation']
    },
    joinDate: '2022-11-08',
    evaluationPeriod: 'Março 2024'
  },
  {
    id: '5',
    name: 'João Pedro Oliveira',
    unit: 'Copacabana',
    role: 'Professor',
    stars: { fideliza: 36, matriculador: 8, professor: 40 },
    total: 84,
    position: 5,
    achievements: [],
    monthlyProgress: [
      { month: 'Jan 2024', fideliza: 30, matriculador: 6, professor: 32, total: 68 },
      { month: 'Fev 2024', fideliza: 33, matriculador: 7, professor: 36, total: 76 },
      { month: 'Mar 2024', fideliza: 36, matriculador: 8, professor: 40, total: 84 }
    ],
    metCriteria: {
      fideliza: ['student-satisfaction'],
      matriculador: [],
      professor: ['class-preparation', 'student-engagement', 'innovative-methods', 'student-progress']
    },
    joinDate: '2023-03-12',
    evaluationPeriod: 'Março 2024'
  },
  {
    id: '6',
    name: 'Ana Carolina Lima',
    unit: 'Barra',
    role: 'Consultora de Vendas',
    stars: { fideliza: 35, matriculador: 13, professor: 30 },
    total: 78,
    position: 6,
    achievements: [],
    monthlyProgress: [
      { month: 'Jan 2024', fideliza: 28, matriculador: 8, professor: 22, total: 58 },
      { month: 'Fev 2024', fideliza: 32, matriculador: 10, professor: 26, total: 68 },
      { month: 'Mar 2024', fideliza: 35, matriculador: 13, professor: 30, total: 78 }
    ],
    metCriteria: {
      fideliza: ['retention-rate'],
      matriculador: ['monthly-target', 'conversion-rate'],
      professor: ['class-preparation']
    },
    joinDate: '2023-06-05',
    evaluationPeriod: 'Março 2024'
  }
];

export { achievements };
