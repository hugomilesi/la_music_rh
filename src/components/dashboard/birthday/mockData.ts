
import { Birthday, MonthlyBirthday } from './types';

export const mockBirthdays: Birthday[] = [
  {
    id: '1',
    name: 'Aline Cristina Pessanha Faria',
    position: 'Coordenadora',
    unit: 'Campo Grande',
    date: 'Hoje',
    fullDate: new Date(),
    initials: 'AF',
    gradient: 'from-purple-500 to-pink-500',
    celebrated: false
  },
  {
    id: '2',
    name: 'Felipe Elias Carvalho',
    position: 'Professor de Violão e Guitarra',
    unit: 'Campo Grande',
    date: 'Hoje',
    fullDate: new Date(),
    initials: 'FC',
    gradient: 'from-blue-500 to-cyan-500',
    celebrated: true
  }
];

export const mockMonthlyBirthdays: MonthlyBirthday[] = [
  {
    id: '1',
    name: 'Aline Cristina Pessanha Faria',
    position: 'Coordenadora',
    unit: 'Campo Grande',
    date: new Date(),
    initials: 'AF',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: '2',
    name: 'Felipe Elias Carvalho',
    position: 'Professor de Violão e Guitarra',
    unit: 'Campo Grande',
    date: new Date(),
    initials: 'FC',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: '3',
    name: 'Luciano Nazario de Oliveira',
    position: 'Professor de Bateria',
    unit: 'Campo Grande',
    date: new Date(2024, new Date().getMonth(), 5),
    initials: 'LO',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: '4',
    name: 'Fabio Magarinos da Silva',
    position: 'Professor de Baixo',
    unit: 'Campo Grande',
    date: new Date(2024, new Date().getMonth(), 12),
    initials: 'FS',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: '5',
    name: 'Fabiana Candido de Assis Silva',
    position: 'Professora de Canto',
    unit: 'Campo Grande',
    date: new Date(2024, new Date().getMonth(), 18),
    initials: 'FS',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    id: '6',
    name: 'Igor Esteves Alves Baiao',
    position: 'Professor de Violão e Guitarra',
    unit: 'Barra',
    date: new Date(2024, new Date().getMonth(), 25),
    initials: 'IB',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: '7',
    name: 'Luana de Menezes Vieira',
    position: 'Professora de Teclado',
    unit: 'Barra',
    date: new Date(2024, new Date().getMonth(), 8),
    initials: 'LV',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    id: '8',
    name: 'Marcelo Vieira Soares',
    position: 'Professor de Bateria',
    unit: 'Barra',
    date: new Date(2024, new Date().getMonth(), 22),
    initials: 'MS',
    gradient: 'from-emerald-500 to-green-500'
  },
  {
    id: '9',
    name: 'Jessica Balbino da Silva',
    position: 'Professora de Canto',
    unit: 'Barra',
    date: new Date(2024, new Date().getMonth(), 15),
    initials: 'JS',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    id: '10',
    name: 'Douglas Carvalho de Azevedo',
    position: 'Professor de Violão e Guitarra',
    unit: 'Recreio',
    date: new Date(2024, new Date().getMonth(), 30),
    initials: 'DA',
    gradient: 'from-red-500 to-pink-500'
  },
  {
    id: '11',
    name: 'Denilson Macedo de Araujo',
    position: 'Professor de Teclado',
    unit: 'Recreio',
    date: new Date(2024, new Date().getMonth(), 3),
    initials: 'DA',
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    id: '12',
    name: 'Breno Elias de Carvalho',
    position: 'Professor de Bateria',
    unit: 'Recreio',
    date: new Date(2024, new Date().getMonth(), 28),
    initials: 'BC',
    gradient: 'from-teal-500 to-cyan-500'
  },
  {
    id: '13',
    name: 'Ayla de Souza Nunes',
    position: 'Professora de Canto',
    unit: 'Recreio',
    date: new Date(2024, new Date().getMonth(), 10),
    initials: 'AN',
    gradient: 'from-lime-500 to-green-500'
  }
];
