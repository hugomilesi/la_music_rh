
import React from 'react';
import { EmployeeProvider } from './EmployeeContext';
import { DocumentProvider } from './DocumentContext';
import { EvaluationProvider } from './EvaluationContext';
import { VacationProvider } from './VacationContext';
import { ScheduleProvider } from './ScheduleContext';
import { UnitProvider } from './UnitContext';
import { IncidentsProvider } from './IncidentsContext';
import { NPSProvider } from './NPSContext';
import { BenefitsProvider } from './BenefitsContext';
import { NotificationProvider } from './NotificationContext';
import { WhatsAppProvider } from './WhatsAppContext';

interface GlobalContextProviderProps {
  children: React.ReactNode;
}

export const GlobalContextProvider: React.FC<GlobalContextProviderProps> = ({ children }) => {
  return (
    <UnitProvider>
      <EmployeeProvider>
        <DocumentProvider>
          <EvaluationProvider>
            <VacationProvider>
              <ScheduleProvider>
                <IncidentsProvider>
                  <NPSProvider>
                    <BenefitsProvider>
                      <NotificationProvider>
                        <WhatsAppProvider>
                          {children}
                        </WhatsAppProvider>
                      </NotificationProvider>
                    </BenefitsProvider>
                  </NPSProvider>
                </IncidentsProvider>
              </ScheduleProvider>
            </VacationProvider>
          </EvaluationProvider>
        </DocumentProvider>
      </EmployeeProvider>
    </UnitProvider>
  );
};
