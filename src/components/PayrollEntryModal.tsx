import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PayrollEntry } from '../types/payroll';
import PayrollEntryForm from './PayrollEntryForm';

interface PayrollEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: PayrollEntry;
  onSave: (entry: PayrollEntry) => void;
  payrollId?: string;
  month?: number;
  year?: number;
}

const PayrollEntryModal: React.FC<PayrollEntryModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSave,
  payrollId,
  month,
  year
}) => {
  if (!isOpen) return null;

  const handleSave = (savedEntry: PayrollEntry) => {
    onSave(savedEntry);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {entry ? 'Editar Entrada da Folha' : 'Nova Entrada da Folha'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <PayrollEntryForm
            entry={entry}
            onSave={handleSave}
            onCancel={onClose}
            payrollId={payrollId}
            month={month}
            year={year}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayrollEntryModal;