import { supabase } from '@/integrations/supabase/client';
import { Unidade } from '@/types/colaborador';

export const unidadeService = {
  /**
   * Buscar todas as unidades
   */
  async getUnidades(): Promise<Unidade[]> {
    const { data, error } = await (supabase as any)
      .from('unidades')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Buscar apenas unidades ativas
   */
  async getUnidadesAtivas(): Promise<Unidade[]> {
    const { data, error } = await (supabase as any)
      .from('unidades')
      .select('*')
      .eq('ativa', true)
      .order('nome', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Buscar unidade por ID
   */
  async getUnidadeById(id: string): Promise<Unidade | null> {
    const { data, error } = await (supabase as any)
      .from('unidades')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  },

  /**
   * Buscar unidade por código
   */
  async getUnidadeByCodigo(codigo: string): Promise<Unidade | null> {
    const { data, error } = await (supabase as any)
      .from('unidades')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }
};
