
import { Birthday, MonthlyBirthday } from './types';

export const mockBirthdays: Birthday[] = [
  {
    id: '1',
    name: 'João Lima',
    position: 'Professor',
    unit: 'Campo Grande',
    date: 'Hoje',
    fullDate: new Date(),
    initials: 'JL',
    gradient: 'from-purple-500 to-pink-500',
    celebrated: false
  },
  {
    id: '2',
    name: 'Ana Silva',
    position: 'Coordenação',
    unit: 'Recreio',
    date: 'Hoje',
    fullDate: new Date(),
    initials: 'AS',
    gradient: 'from-blue-500 to-cyan-500',
    celebrated: true
  }
];

export const mockMonthlyBirthdays: MonthlyBirthday[] = [
  {
    id: '1',
    name: 'João Lima',
    position: 'Professor',
    unit: 'Campo Grande',
    date: new Date(),
    initials: 'JL',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: '2',
    name: 'Ana Silva',
    position: 'Coordenação',
    unit: 'Recreio',
    date: new Date(),
    initials: 'AS',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    position: 'Bartender',
    unit: 'Barra',
    date: new Date(2024, new Date().getMonth(), 5),
    initials: 'CO',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: '4',
    name: 'Fernanda Costa',
    position: 'Segurança',
    unit: 'Campo Grande',
    date: new Date(2024, new Date().getMonth(), 12),
    initials: 'FC',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: '5',
    name: 'Roberto Santos',
    position: 'DJ',
    unit: 'Recreio',
    date: new Date(2024, new Date().getMonth(), 18),
    initials: 'RS',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    id: '6',
    name: 'Maria Fernandes',
    position: 'Recepção',
    unit: 'Barra',
    date: new Date(2024, new Date().getMonth(), 25),
    initials: 'MF',
    gradient: 'from-pink-500 to-rose-500'
  }
];
