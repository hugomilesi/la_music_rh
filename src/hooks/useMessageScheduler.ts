import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Interfaces para o sistema de agendamento unificado
export interface MessageSchedule {
  id: string;
  type: 'notification' | 'nps' | 'whatsapp' | 'email';
  title: string;
  description?: string;
  content: Record<string, any>;
  target_users: string[];
  schedule_type: 'immediate' | 'recurring' | 'conditional';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  scheduled_for?: string;
  recurrence_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    time?: string;
    days_of_week?: number[];
    day_of_month?: number;
  };
  next_execution_at?: string;
  last_executed_at?: string;
  execution_count: number;
  success_count: number;
  error_count: number;
  max_executions?: number;
  last_error?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  can_edit?: boolean;
  can_delete?: boolean;
  target_count?: number;
}

export interface ScheduleLog {
  id: string;
  schedule_id: string;
  log_type: 'info' | 'success' | 'warning' | 'error' | 'system_alert';
  message: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface ScheduleStatistics {
  activeSchedules: number;
  completedToday: number;
  failuresToday: number;
  successRate: number;
  nextExecution?: string;
  totalByType: Record<string, number>;
}

export interface UserPermissions {
  isAdmin: boolean;
  canManageNotifications: boolean;
  canViewNotifications: boolean;
  canManageNPS: boolean;
  canViewNPS: boolean;
  canManageWhatsApp: boolean;
  canViewWhatsApp: boolean;
  canManageEmail: boolean;
  canViewEmail: boolean;
  availableTypes: string[];
}

export interface CreateScheduleParams {
  type: 'notification' | 'nps' | 'whatsapp' | 'email';
  title: string;
  description?: string;
  content: Record<string, any>;
  target_users: string[];
  schedule_type: 'immediate' | 'recurring' | 'conditional';
  scheduled_for?: string;
  recurrence_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    time?: string;
    days_of_week?: number[];
    day_of_month?: number;
  };
}

export interface UseMessageSchedulerReturn {
  // Estado
  schedules: MessageSchedule[];
  loading: boolean;
  error: string | null;
  permissions: UserPermissions | null;
  statistics: ScheduleStatistics | null;
  
  // Funções de CRUD
  createSchedule: (params: CreateScheduleParams) => Promise<string | null>;
  updateSchedule: (id: string, updates: Partial<MessageSchedule>) => Promise<boolean>;
  deleteSchedule: (id: string) => Promise<boolean>;
  cancelSchedule: (id: string) => Promise<boolean>;
  
  // Funções de consulta
  fetchSchedules: (filters?: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  fetchScheduleLogs: (scheduleId: string) => Promise<ScheduleLog[]>;
  fetchStatistics: () => Promise<void>;
  
  // Funções de validação
  validatePermissions: () => Promise<void>;
  canManageType: (type: string) => boolean;
  canViewType: (type: string) => boolean;
  
  // Funções utilitárias
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export const useMessageScheduler = (): UseMessageSchedulerReturn => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<MessageSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [statistics, setStatistics] = useState<ScheduleStatistics | null>(null);

  // Função para limpar erros
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Função para validar permissões do usuário
  const validatePermissions = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error: permError } = await supabase
        .rpc('validate_user_schedule_permissions', {
          user_id: user.id
        });

      if (permError) throw permError;
      setPermissions(data);
    } catch (err) {
      setError('Erro ao validar permissões do usuário');
    }
  }, [user?.id]);

  // Função para verificar se pode gerenciar um tipo
  const canManageType = useCallback((type: string): boolean => {
    if (!permissions) return false;
    
    switch (type) {
      case 'notification':
        return permissions.canManageNotifications;
      case 'nps':
        return permissions.canManageNPS;
      case 'whatsapp':
        return permissions.canManageWhatsApp;
      case 'email':
        return permissions.canManageEmail;
      default:
        return false;
    }
  }, [permissions]);

  // Função para verificar se pode visualizar um tipo
  const canViewType = useCallback((type: string): boolean => {
    if (!permissions) return false;
    
    switch (type) {
      case 'notification':
        return permissions.canViewNotifications;
      case 'nps':
        return permissions.canViewNPS;
      case 'whatsapp':
        return permissions.canViewWhatsApp;
      case 'email':
        return permissions.canViewEmail;
      default:
        return false;
    }
  }, [permissions]);

  // Função para buscar agendamentos
  const fetchSchedules = useCallback(async (filters?: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('message_schedules')
        .select(`
          id,
          type,
          title,
          message,
          channel,
          schedule_type,
          status,
          scheduled_at,
          recurring_pattern,
          target_type,
          target_filters,
          channel_config,
          nps_data,
          next_execution_at,
          last_executed_at,
          execution_stats,
          created_at,
          created_by,
          updated_at
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros se fornecidos
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      // Mapear dados para a interface MessageSchedule
      const mappedSchedules: MessageSchedule[] = (data || []).map(schedule => {
        const executionStats = schedule.execution_stats || {};
        return {
          id: schedule.id,
          type: schedule.type || schedule.channel,
          title: schedule.title,
          description: schedule.message,
          content: schedule.channel_config || schedule.nps_data || {},
          target_users: schedule.target_filters?.user_ids || [],
          schedule_type: schedule.schedule_type,
          status: schedule.status,
          scheduled_for: schedule.scheduled_at,
          recurrence_pattern: schedule.recurring_pattern,
          next_execution_at: schedule.next_execution_at,
          last_executed_at: schedule.last_executed_at,
          execution_count: executionStats.execution_count || 0,
          success_count: executionStats.success_count || 0,
          error_count: executionStats.error_count || 0,
          max_executions: executionStats.max_executions,
          last_error: executionStats.last_error,
          created_at: schedule.created_at,
          created_by: schedule.created_by,
          updated_at: schedule.updated_at,
          can_edit: canManageType(schedule.type || schedule.channel),
          can_delete: canManageType(schedule.type || schedule.channel),
          target_count: Array.isArray(schedule.target_filters?.user_ids) ? schedule.target_filters.user_ids.length : 0
        };
      });

      setSchedules(mappedSchedules);
    } catch (err) {
      setError('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }, [user?.id, canManageType]);

  // Função para criar agendamento
  const createSchedule = useCallback(async (params: CreateScheduleParams): Promise<string | null> => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return null;
    }

    if (!canManageType(params.type)) {
      setError('Sem permissão para criar agendamentos deste tipo');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      let data, createError;
      
      // Para agendamentos NPS, usar a função específica que gera o link
      if (params.type === 'nps') {
        const result = await supabase
          .rpc('create_nps_schedule', {
            p_title: params.title,
            p_message: params.description || '',
            p_channel: 'whatsapp',
            p_schedule_type: params.schedule_type,
            p_scheduled_at: params.scheduled_for ? new Date(params.scheduled_for).toISOString() : null,
            p_recurring_pattern: params.recurrence_pattern || null,
            p_target_filters: { user_ids: params.target_users },
            p_nps_data: params.content,
            p_created_by: user.id
          });
        data = result.data;
        createError = result.error;
      } else {
        // Para outros tipos, usar a função genérica
        const result = await supabase
          .rpc('create_message_schedule', {
            p_title: params.title,
            p_message: params.description || '',
            p_channel: params.type,
            p_schedule_type: params.schedule_type,
            p_scheduled_at: params.scheduled_for ? new Date(params.scheduled_for).toISOString() : null,
            p_recurring_pattern: params.recurrence_pattern || null,
            p_conditions: null,
            p_target_type: 'specific',
            p_target_filters: { user_ids: params.target_users },
            p_channel_config: params.content,
            p_max_executions: null,
            p_created_by: user.id
          });
        data = result.data;
        createError = result.error;
      }

      if (createError) throw createError;
      
      // Recarregar dados após criação
      if (user?.id) {
        // Recarregar agendamentos sem usar fetchSchedules para evitar dependência circular
        const { data: schedulesData } = await supabase
          .from('message_schedules')
          .select(`
            id,
            type,
            title,
            message,
            channel,
            schedule_type,
            status,
            scheduled_at,
            recurring_pattern,
            target_type,
            target_filters,
            channel_config,
            nps_data,
            next_execution_at,
            last_executed_at,
            execution_stats,
            created_at,
            created_by,
            updated_at
          `)
          .order('created_at', { ascending: false });
        
        if (schedulesData) {
          const mappedSchedules: MessageSchedule[] = schedulesData.map(schedule => {
            const executionStats = schedule.execution_stats || {};
            return {
              id: schedule.id,
              type: schedule.type || schedule.channel,
              title: schedule.title,
              description: schedule.message,
              content: schedule.channel_config || schedule.nps_data || {},
              target_users: schedule.target_filters?.user_ids || [],
              schedule_type: schedule.schedule_type,
              status: schedule.status,
              scheduled_for: schedule.scheduled_at,
              recurrence_pattern: schedule.recurring_pattern,
              next_execution_at: schedule.next_execution_at,
              last_executed_at: schedule.last_executed_at,
              execution_count: executionStats.execution_count || 0,
              success_count: executionStats.success_count || 0,
              error_count: executionStats.error_count || 0,
              max_executions: executionStats.max_executions,
              last_error: executionStats.last_error,
              created_at: schedule.created_at,
              created_by: schedule.created_by,
              updated_at: schedule.updated_at,
              can_edit: canManageType(schedule.type || schedule.channel),
              can_delete: canManageType(schedule.type || schedule.channel),
              target_count: Array.isArray(schedule.target_filters?.user_ids) ? schedule.target_filters.user_ids.length : 0
            };
          });
          setSchedules(mappedSchedules);
        }
      }
      
      return data;
    } catch (err) {
      setError('Erro ao criar agendamento');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, canManageType]);

  // Função para atualizar agendamento
  const updateSchedule = useCallback(async (id: string, updates: Partial<MessageSchedule>): Promise<boolean> => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Mapear updates para a estrutura da tabela
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };

      // Mapear campos básicos
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.message = updates.description;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.scheduled_for) dbUpdates.scheduled_at = updates.scheduled_for;
      if (updates.recurrence_pattern) dbUpdates.recurring_pattern = updates.recurrence_pattern;
      if (updates.target_users) {
        dbUpdates.target_filters = { user_ids: updates.target_users };
      }
      if (updates.content) {
        if (updates.type === 'nps') {
          dbUpdates.nps_data = updates.content;
        } else {
          dbUpdates.channel_config = updates.content;
        }
      }

      // Mapear estatísticas de execução
      if (updates.execution_count !== undefined || 
          updates.success_count !== undefined || 
          updates.error_count !== undefined ||
          updates.max_executions !== undefined ||
          updates.last_error !== undefined) {
        
        // Buscar estatísticas atuais
        const { data: currentData } = await supabase
          .from('message_schedules')
          .select('execution_stats')
          .eq('id', id)
          .single();

        const currentStats = currentData?.execution_stats || {};
        
        dbUpdates.execution_stats = {
          ...currentStats,
          ...(updates.execution_count !== undefined && { execution_count: updates.execution_count }),
          ...(updates.success_count !== undefined && { success_count: updates.success_count }),
          ...(updates.error_count !== undefined && { error_count: updates.error_count }),
          ...(updates.max_executions !== undefined && { max_executions: updates.max_executions }),
          ...(updates.last_error !== undefined && { last_error: updates.last_error })
        };
      }

      const { error: updateError } = await supabase
        .from('message_schedules')
        .update(dbUpdates)
        .eq('id', id);

      if (updateError) throw updateError;
      
      // Atualizar estado local sem dependência circular
      setSchedules(prev => prev.map(schedule => 
        schedule.id === id ? { ...schedule, ...updates } : schedule
      ));
      
      return true;
    } catch (err) {
      setError('Erro ao atualizar agendamento');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Função para deletar agendamento
  const deleteSchedule = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('message_schedules')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      // Remover do estado local sem dependência circular
      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      
      return true;
    } catch (err) {
      setError('Erro ao deletar agendamento');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Função para cancelar agendamento
  const cancelSchedule = useCallback(async (id: string): Promise<boolean> => {
    return await updateSchedule(id, { status: 'cancelled' });
  }, [updateSchedule]);

  // Função para buscar logs de um agendamento
  const fetchScheduleLogs = useCallback(async (scheduleId: string): Promise<ScheduleLog[]> => {
    try {
      const { data, error: logsError } = await supabase
        .from('message_schedule_logs')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      return data || [];
    } catch (err) {
      setError('Erro ao carregar logs');
      return [];
    }
  }, []);

  // Função para buscar estatísticas
  const fetchStatistics = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error: statsError } = await supabase
        .rpc('get_schedule_statistics', {
          p_user_id: user.id,
          p_channel: null,
          p_date_from: null,
          p_date_to: null
        });

      if (statsError) throw statsError;
      setStatistics(data);
    } catch (err) {
      setError('Erro ao carregar estatísticas');
    }
  }, [user?.id]);

  // Função para atualizar todos os dados
  const refreshData = useCallback(async () => {
    await Promise.all([
      validatePermissions(),
      fetchSchedules(),
      fetchStatistics()
    ]);
  }, [validatePermissions, fetchSchedules, fetchStatistics]);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (user?.id) {
      validatePermissions();
      fetchSchedules();
      fetchStatistics();
    }
  }, [user?.id]); // Removido refreshData da dependência para evitar loop

  return {
    // Estado
    schedules,
    loading,
    error,
    permissions,
    statistics,
    
    // Funções de CRUD
    createSchedule,
    updateSchedule,
    deleteSchedule,
    cancelSchedule,
    
    // Funções de consulta
    fetchSchedules,
    fetchScheduleLogs,
    fetchStatistics,
    
    // Funções de validação
    validatePermissions,
    canManageType,
    canViewType,
    
    // Funções utilitárias
    refreshData,
    clearError
  };
};

export default useMessageScheduler;