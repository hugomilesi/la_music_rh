
import React from 'react';
import { UserSettings } from '@/components/user/UserSettings';

const UserSettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Configurações</h1>
        <UserSettings />
      </div>
    </div>
  );
};

export default UserSettingsPage;
