import React from 'react';
import { IncidentsProvider } from '@/contexts/IncidentsContext';
import IncidentsPage from '../IncidentsPage';

const IncidentsIndexPage: React.FC = () => {
  return (
    <IncidentsProvider>
      <IncidentsPage />
    </IncidentsProvider>
  );
};

export default IncidentsIndexPage;