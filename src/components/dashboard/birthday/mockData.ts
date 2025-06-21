
import { Birthday, MonthlyBirthday } from './types';

export const mockBirthdays: Birthday[] = [
  {
    id: '1',
    name: 'Ana Carolina Santos',
    position: 'Professor de Piano',
    unit: 'Campo Grande',
    date: 'Hoje',
    fullDate: new Date(),
    initials: 'AS',
    gradient: 'from-purple-500 to-pink-500',
    celebrated: false
  },
  {
    id: '2',
    name: 'Felipe Santos Barbosa',
    position: 'Professor de Bateria',
    unit: 'Barra',
    date: 'Hoje',
    fullDate: new Date(),
    initials: 'FB',
    gradient: 'from-blue-500 to-cyan-500',
    celebrated: true
  }
];

export const mockMonthlyBirthdays: MonthlyBirthday[] = [
  {
    id: '1',
    name: 'Ana Carolina Santos',
    position: 'Professor de Piano',
    unit: 'Campo Grande',
    date: new Date(),
    initials: 'AS',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: '2',
    name: 'Felipe Santos Barbosa',
    position: 'Professor de Bateria',
    unit: 'Barra',
    date: new Date(),
    initials: 'FB',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: '3',
    name: 'Bruno Silva Costa',
    position: 'Técnico de Som',
    unit: 'Barra',
    date: new Date(2024, new Date().getMonth(), 5),
    initials: 'BC',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: '4',
    name: 'Carla Fernanda Lima',
    position: 'Coordenadora Pedagógica',
    unit: 'Campo Grande',
    date: new Date(2024, new Date().getMonth(), 12),
    initials: 'CL',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: '5',
    name: 'Diego Oliveira Rocha',
    position: 'Professor de Violão',
    unit: 'Recreio',
    date: new Date(2024, new Date().getMonth(), 18),
    initials: 'DR',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    id: '6',
    name: 'Elena Martins Souza',
    position: 'Recepcionista',
    unit: 'Campo Grande',
    date: new Date(2024, new Date().getMonth(), 25),
    initials: 'ES',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: '7',
    name: 'Gabriel Henrique Alves',
    position: 'Professor de Teclado',
    unit: 'Recreio',
    date: new Date(2024, new Date().getMonth(), 8),
    initials: 'GA',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    id: '8',
    name: 'Helena Torres Melo',
    position: 'Assistente Administrativa',
    unit: 'Barra',
    date: new Date(2024, new Date().getMonth(), 22),
    initials: 'HM',
    gradient: 'from-emerald-500 to-green-500'
  }
];
