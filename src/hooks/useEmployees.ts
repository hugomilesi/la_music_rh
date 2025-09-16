import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface Employee {
  id: string;
  name: string;
  department?: string;
  position?: string;
  status?: string;
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, department, position, status')
          .order('full_name');

        if (error) throw error;

        setEmployees(data?.map(user => ({
          id: user.id,
          name: user.full_name,
          department: user.department,
          position: user.position,
          status: user.status
        })) || []);
      } catch (err) {
        // Log desabilitado: Erro ao buscar funcionários
        setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar funcionários'));
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();

    // Inscrever-se para atualizações em tempo real
    const subscription = supabase
      .channel('users-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users'
      }, () => {
        fetchEmployees();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getActiveEmployees = () => {
    return employees.filter(emp => emp.status !== 'inativo');
  };

  const getEmployeesByDepartment = (department: string) => {
    return employees.filter(emp => emp.department === department);
  };

  return {
    employees,
    loading,
    error,
    getActiveEmployees,
    getEmployeesByDepartment
  };
};