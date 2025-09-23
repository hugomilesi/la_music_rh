import { useContext } from 'react';
import { UnitContext } from '@/contexts/UnitContext';

export function useUnit() {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
}