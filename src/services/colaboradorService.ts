import { supabase } from '@/integrations/supabase/client';
import { 
  Colaborador, 
  NovoColaborador, 
  AtualizarColaborador, 
  FiltrosColaborador,
  StatusColaborador,
  ColaboradorUnidade
} from '@/types/colaborador';

export const colaboradorService = {
  /**
   * Buscar todos os colaboradores COM suas unidades
   */
  async getColaboradores(): Promise<Colaborador[]> {
    const { data, error } = await (supabase as any)
      .from('colaboradores')
      .select(`
        *,
        colaborador_unidades (
          id,
          unidade_id,
          created_at,
          unidade:unidades (*)
        )
      `)
      .order('nome', { ascending: true });

    if (error) {
      throw error;
    }

    // Renomear colaborador_unidades para unidades
    return (data || []).map((colab: any) => ({
      ...colab,
      unidades: colab.colaborador_unidades
    }));
  },

  /**
   * Buscar colaborador por ID COM suas unidades
   */
  async getColaboradorById(id: string): Promise<Colaborador | null> {
    const { data, error } = await (supabase as any)
      .from('colaboradores')
      .select(`
        *,
        colaborador_unidades (
          id,
          unidade_id,
          created_at,
          unidade:unidades (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return {
      ...data,
      unidades: data.colaborador_unidades
    };
  },

  /**
   * Criar novo colaborador COM unidades
   */
  async criarColaborador(colaboradorData: NovoColaborador): Promise<Colaborador> {
    // Validar que pelo menos uma unidade foi selecionada
    if (!colaboradorData.unidade_ids || colaboradorData.unidade_ids.length === 0) {
      throw new Error('Pelo menos uma unidade deve ser selecionada');
    }

    // 1. Criar colaborador
    const insertData = {
      nome: colaboradorData.nome,
      email: colaboradorData.email,
      telefone: colaboradorData.telefone,
      cpf: colaboradorData.cpf,
      cargo: colaboradorData.cargo,
      departamento: colaboradorData.departamento,
      tipo_contratacao: colaboradorData.tipo_contratacao,
      banco: colaboradorData.banco || null,
      agencia: colaboradorData.agencia || null,
      conta: colaboradorData.conta || null,
      tipo_conta: colaboradorData.tipo_conta || null,
      status: colaboradorData.status || StatusColaborador.ATIVO
    };

    const { data: colaborador, error: colaboradorError } = await (supabase as any)
      .from('colaboradores')
      .insert(insertData)
      .select()
      .single();

    if (colaboradorError) {
      throw colaboradorError;
    }

    // 2. Vincular unidades
    await this.vincularUnidades(colaborador.id, colaboradorData.unidade_ids);

    // 3. Retornar colaborador completo com unidades
    return await this.getColaboradorById(colaborador.id) as Colaborador;
  },

  /**
   * Atualizar colaborador (incluindo unidades se fornecido)
   */
  async atualizarColaborador(id: string, colaboradorData: AtualizarColaborador): Promise<Colaborador> {
    const updateData: any = {};

    // Campos básicos
    if (colaboradorData.nome !== undefined) updateData.nome = colaboradorData.nome;
    if (colaboradorData.email !== undefined) updateData.email = colaboradorData.email;
    if (colaboradorData.telefone !== undefined) updateData.telefone = colaboradorData.telefone;
    if (colaboradorData.cpf !== undefined) updateData.cpf = colaboradorData.cpf;
    if (colaboradorData.cargo !== undefined) updateData.cargo = colaboradorData.cargo;
    if (colaboradorData.departamento !== undefined) updateData.departamento = colaboradorData.departamento;
    if (colaboradorData.tipo_contratacao !== undefined) updateData.tipo_contratacao = colaboradorData.tipo_contratacao;
    if (colaboradorData.banco !== undefined) updateData.banco = colaboradorData.banco;
    if (colaboradorData.agencia !== undefined) updateData.agencia = colaboradorData.agencia;
    if (colaboradorData.conta !== undefined) updateData.conta = colaboradorData.conta;
    if (colaboradorData.tipo_conta !== undefined) updateData.tipo_conta = colaboradorData.tipo_conta;
    if (colaboradorData.status !== undefined) updateData.status = colaboradorData.status;

    // Atualizar dados básicos
    const { data, error } = await (supabase as any)
      .from('colaboradores')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Se unidades foram fornecidas, atualizar vínculos
    if (colaboradorData.unidade_ids !== undefined) {
      if (colaboradorData.unidade_ids.length === 0) {
        throw new Error('Pelo menos uma unidade deve ser selecionada');
      }
      await this.substituirUnidades(id, colaboradorData.unidade_ids);
    }

    // Retornar colaborador completo com unidades
    return await this.getColaboradorById(id) as Colaborador;
  },

  /**
   * Deletar colaborador
   */
  async deletarColaborador(id: string): Promise<void> {
    
    const { error } = await supabase
      .from('colaboradores')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
  },

  /**
   * Buscar colaboradores com filtros
   */
  async getColaboradoresFiltrados(filtros: FiltrosColaborador): Promise<Colaborador[]> {
    
    let query = supabase
      .from('colaboradores')
      .select('*');
    
    // Aplicar filtros
    if (filtros.unidade && filtros.unidade !== '') {
      query = query.eq('unidade', filtros.unidade);
    }
    
    if (filtros.departamento && filtros.departamento !== '') {
      query = query.eq('departamento', filtros.departamento);
    }
    
    if (filtros.tipo_contratacao && filtros.tipo_contratacao !== '') {
      query = query.eq('tipo_contratacao', filtros.tipo_contratacao);
    }
    
    if (filtros.status && filtros.status !== '') {
      query = query.eq('status', filtros.status);
    }
    
    // Filtro de busca por texto (nome, email, cpf)
    if (filtros.searchTerm && filtros.searchTerm.trim() !== '') {
      const searchTerm = filtros.searchTerm.trim();
      query = query.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`);
    }
    
    query = query.order('nome', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data || [];
  },

  /**
   * Buscar colaboradores por unidade
   */
  async getColaboradoresPorUnidade(unidade: string): Promise<Colaborador[]> {
    
    const { data, error } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('unidade', unidade)
      .eq('status', StatusColaborador.ATIVO)
      .order('nome', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  },

  /**
   * Vincular múltiplas unidades a um colaborador
   */
  async vincularUnidades(colaboradorId: string, unidadeIds: string[]): Promise<void> {
    const inserts = unidadeIds.map(unidadeId => ({
      colaborador_id: colaboradorId,
      unidade_id: unidadeId
    }));

    const { error } = await (supabase as any)
      .from('colaborador_unidades')
      .insert(inserts);

    if (error) {
      throw error;
    }
  },

  /**
   * Substituir todas as unidades de um colaborador
   */
  async substituirUnidades(colaboradorId: string, novasUnidadeIds: string[]): Promise<void> {
    // 1. Remover vínculos existentes
    const { error: deleteError } = await (supabase as any)
      .from('colaborador_unidades')
      .delete()
      .eq('colaborador_id', colaboradorId);

    if (deleteError) {
      throw deleteError;
    }

    // 2. Criar novos vínculos
    await this.vincularUnidades(colaboradorId, novasUnidadeIds);
  },

  /**
   * Desvincular uma unidade específica
   */
  async desvincularUnidade(colaboradorId: string, unidadeId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('colaborador_unidades')
      .delete()
      .eq('colaborador_id', colaboradorId)
      .eq('unidade_id', unidadeId);

    if (error) {
      throw error;
    }
  },

  /**
   * Verificar se email já existe
   */
  async emailJaExiste(email: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('colaboradores')
      .select('id')
      .eq('email', email);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return (data?.length || 0) > 0;
  },

  /**
   * Verificar se CPF já existe
   */
  async cpfJaExiste(cpf: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('colaboradores')
      .select('id')
      .eq('cpf', cpf);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return (data?.length || 0) > 0;
  }
};