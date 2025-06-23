
import React from 'react';
import { UserProfile } from '@/components/user/UserProfile';

const UserProfilePage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Meu Perfil</h1>
        <UserProfile />
      </div>
    </div>
  );
};

export default UserProfilePage;
