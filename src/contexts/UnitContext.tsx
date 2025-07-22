
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Unit } from '@/types/employee';

interface UnitContextType {
  selectedUnits: Unit[];
  toggleUnit: (unit: Unit) => void;
  selectAllUnits: () => void;
  clearUnitSelection: () => void;
  isUnitSelected: (unit: Unit) => boolean;
  hasAnyUnitSelected: boolean;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedUnits, setSelectedUnits] = useState<Unit[]>([
    Unit.CAMPO_GRANDE,
    Unit.RECREIO,
    Unit.BARRA
  ]);

  const toggleUnit = useCallback((unit: Unit) => {
    setSelectedUnits(prev => {
      if (prev.includes(unit)) {
        return prev.filter(u => u !== unit);
      } else {
        return [...prev, unit];
      }
    });
  }, []);

  const selectAllUnits = useCallback(() => {
    setSelectedUnits([Unit.CAMPO_GRANDE, Unit.RECREIO, Unit.BARRA]);
  }, []);

  const clearUnitSelection = useCallback(() => {
    setSelectedUnits([]);
  }, []);

  const isUnitSelected = useCallback((unit: Unit) => {
    return selectedUnits.includes(unit);
  }, [selectedUnits]);

  const hasAnyUnitSelected = selectedUnits.length > 0;

  return (
    <UnitContext.Provider value={{
      selectedUnits,
      toggleUnit,
      selectAllUnits,
      clearUnitSelection,
      isUnitSelected,
      hasAnyUnitSelected
    }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
};
