
export interface Birthday {
  id: string;
  name: string;
  position: string;
  unit: string;
  date: string;
  fullDate: Date;
  initials: string;
  gradient: string;
  celebrated: boolean;
}

export interface MonthlyBirthday {
  id: string;
  name: string;
  position: string;
  unit: string;
  date: Date;
  initials: string;
  gradient: string;
}
