
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ScheduleUnit } from '@/types/unit';

interface UnitContextType {
  selectedUnits: ScheduleUnit[];
  toggleUnit: (unit: ScheduleUnit) => void;
  selectAllUnits: () => void;
  clearUnitSelection: () => void;
  isUnitSelected: (unit: ScheduleUnit) => boolean;
  hasAnyUnitSelected: boolean;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [selectedUnits, setSelectedUnits] = useState<ScheduleUnit[]>([
    ScheduleUnit.CAMPO_GRANDE,
    ScheduleUnit.RECREIO,
    ScheduleUnit.BARRA
  ]);

  const toggleUnit = useCallback((unit: ScheduleUnit) => {
    setSelectedUnits(prev => {
      if (prev.includes(unit)) {
        return prev.filter(u => u !== unit);
      } else {
        return [...prev, unit];
      }
    });
  }, []);

  const selectAllUnits = useCallback(() => {
    setSelectedUnits([ScheduleUnit.CAMPO_GRANDE, ScheduleUnit.RECREIO, ScheduleUnit.BARRA]);
  }, []);

  const clearUnitSelection = useCallback(() => {
    setSelectedUnits([]);
  }, []);

  const isUnitSelected = useCallback((unit: ScheduleUnit) => {
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
}

export { UnitContext };
