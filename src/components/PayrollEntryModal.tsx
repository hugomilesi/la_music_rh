import React from 'react';
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {entry ? 'Editar Entrada da Folha' : 'Nova Entrada da Folha'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <PayrollEntryForm
            entry={entry}
            onSave={handleSave}
            onCancel={onClose}
            payrollId={payrollId}
            month={month}
            year={year}
          />
        </div>
      </div>
    </div>
  );
};

export default PayrollEntryModal;