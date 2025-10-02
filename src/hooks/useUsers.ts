import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role?: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, phone, department, role, status')
      .order('username');

      if (error) throw error;

      setUsers(data?.map(user => ({
        id: user.id,
        name: user.username,
        email: user.email,
        phone: user.phone,
        department: user.department,
        role: user.role
      })) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar usuários'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    // Inscrever-se para atualizações em tempo real
    const subscription = supabase
      .channel(`users-changes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users'
      }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUsers]);

  const getActiveUsers = () => {
    return users.filter(user => user.role !== 'inativo');
  };

  const getUsersByDepartment = (department: string) => {
    return users.filter(user => user.department === department);
  };

  const getUsersByRole = (role: string) => {
    return users.filter(user => user.role === role);
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    getActiveUsers,
    getUsersByDepartment,
    getUsersByRole
  };
};