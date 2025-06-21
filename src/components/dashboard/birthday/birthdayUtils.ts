
import { MonthlyBirthday } from './types';

export const getCurrentMonthBirthdays = (monthlyBirthdays: MonthlyBirthday[]) => {
  const today = new Date();
  return monthlyBirthdays.filter(birthday => 
    birthday.date.getMonth() === today.getMonth() &&
    birthday.date.getFullYear() === today.getFullYear()
  );
};

export const getUpcomingMonthlyBirthdays = (monthlyBirthdays: MonthlyBirthday[]) => {
  const today = new Date();
  const currentMonthBirthdays = getCurrentMonthBirthdays(monthlyBirthdays);
  
  const upcoming = currentMonthBirthdays
    .filter(birthday => birthday.date.getDate() > today.getDate())
    .sort((a, b) => a.date.getDate() - b.date.getDate())
    .slice(0, 4);
  
  return upcoming;
};

export const getFilteredMonthlyBirthdays = (monthlyBirthdays: MonthlyBirthday[], currentMonth: Date) => {
  return monthlyBirthdays.filter(birthday => 
    birthday.date.getMonth() === currentMonth.getMonth() &&
    birthday.date.getFullYear() === currentMonth.getFullYear()
  );
};

export const organizeByWeeks = (birthdays: MonthlyBirthday[], currentMonth: Date) => {
  const weeks: MonthlyBirthday[][] = [[], [], [], [], [], []];
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startOfWeek = new Date(firstDay);
  startOfWeek.setDate(firstDay.getDate() - firstDay.getDay());

  birthdays.forEach(birthday => {
    const daysDiff = Math.floor((birthday.date.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(daysDiff / 7);
    if (weekIndex >= 0 && weekIndex < 6) {
      weeks[weekIndex].push(birthday);
    }
  });

  return weeks.filter(week => week.length > 0);
};

export const formatMonthYear = (date: Date) => {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

export const getBirthdayStatus = (date: Date) => {
  const today = new Date();
  const birthdayThisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  
  if (birthdayThisYear.toDateString() === today.toDateString()) {
    return 'today';
  } else if (birthdayThisYear < today) {
    return 'past';
  } else {
    return 'future';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'today':
      return 'bg-green-100 border-green-300';
    case 'past':
      return 'bg-gray-100 border-gray-300';
    case 'future':
      return 'bg-blue-100 border-blue-300';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};
