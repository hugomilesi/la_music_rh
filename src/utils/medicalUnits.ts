
import { MedicalUnit } from '@/types/schedule';

export interface MedicalUnitInfo {
  id: MedicalUnit;
  name: string;
  color: string;
  description?: string;
}

export const MEDICAL_UNITS: MedicalUnitInfo[] = [
  {
    id: 'uti_neonatal',
    name: 'UTI Neonatal',
    color: 'bg-blue-500',
    description: 'Unidade de Terapia Intensiva Neonatal'
  },
  {
    id: 'uti_pediatrica',
    name: 'UTI Pediátrica',
    color: 'bg-green-500',
    description: 'Unidade de Terapia Intensiva Pediátrica'
  },
  {
    id: 'emergencia_pediatrica',
    name: 'Emergência Pediátrica',
    color: 'bg-red-500',
    description: 'Pronto Socorro Pediátrico'
  },
  {
    id: 'internacao',
    name: 'Internação',
    color: 'bg-purple-500',
    description: 'Unidade de Internação'
  },
  {
    id: 'ambulatorio',
    name: 'Ambulatório',
    color: 'bg-orange-500',
    description: 'Atendimento Ambulatorial'
  }
];

export const getMedicalUnitInfo = (unitId: MedicalUnit): MedicalUnitInfo => {
  return MEDICAL_UNITS.find(unit => unit.id === unitId) || MEDICAL_UNITS[0];
};

export const getMedicalUnitColor = (unitId: MedicalUnit): string => {
  return getMedicalUnitInfo(unitId).color;
};
