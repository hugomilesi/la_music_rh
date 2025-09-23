
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';
import { useUnit } from '@/hooks/useUnit';
import { SCHEDULE_UNITS } from '@/types/unit';

interface UnitSelectorProps {
  variant?: 'button' | 'compact';
  showCount?: boolean;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({ 
  variant = 'button',
  showCount = true 
}) => {
  const { 
    selectedUnits, 
    toggleUnit, 
    selectAllUnits, 
    clearUnitSelection,
    isUnitSelected,
    hasAnyUnitSelected 
  } = useUnit();

  if (variant === 'compact') {
    return (
      <div className="flex gap-2">
        {SCHEDULE_UNITS.map(unit => (
          <Badge
            key={unit.id}
            variant={isUnitSelected(unit.id) ? 'default' : 'outline'}
            className={`cursor-pointer transition-colors ${
              isUnitSelected(unit.id) ? unit.color + ' text-white' : ''
            }`}
            onClick={() => toggleUnit(unit.id)}
          >
            {unit.name}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Unidades
          {showCount && selectedUnits.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedUnits.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white" align="start">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Filtrar por Unidades</h4>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAllUnits}
              >
                Todas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearUnitSelection}
              >
                Limpar
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {SCHEDULE_UNITS.map(unit => (
              <div key={unit.id} className="flex items-center space-x-3">
                <Checkbox
                  id={unit.id}
                  checked={isUnitSelected(unit.id)}
                  onCheckedChange={() => toggleUnit(unit.id)}
                />
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-3 h-3 rounded-full ${unit.color}`}></div>
                  <label 
                    htmlFor={unit.id}
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    {unit.name}
                  </label>
                </div>
              </div>
            ))}
          </div>
          
          {!hasAnyUnitSelected && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              ⚠️ Nenhuma unidade selecionada. Selecione pelo menos uma unidade para ver os eventos.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
