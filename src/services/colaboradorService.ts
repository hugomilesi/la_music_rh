import { supabase } from '@/integrations/supabase/client';
import { 
  Colaborador, 
  NovoColaborador, 
  AtualizarColaborador, 
  FiltrosColaborador,
  StatusColaborador 
} from '@/types/colaborador';

export const colaboradorService = {
  /**
   * Buscar todos os colaboradores
   */
  async getColaboradores(): Promise<Colaborador[]> {
    console.log('🔍 Buscando colaboradores...');
    
    const { data, error } = await supabase
      .from('colaboradores')
      .select('*')
      .order('nome', { ascending: true });
    
    if (error) {
      console.error('❌ Erro ao buscar colaboradores:', error);
      throw error;
    }
    
    console.log('✅ Colaboradores encontrados:', data?.length || 0);
    return data || [];
  },

  /**
   * Buscar colaborador por ID
   */
  async getColaboradorById(id: string): Promise<Colaborador | null> {
    console.log('🔍 Buscando colaborador por ID:', id);
    
    const { data, error } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ Colaborador não encontrado:', id);
        return null;
      }
      console.error('❌ Erro ao buscar colaborador:', error);
      throw error;
    }
    
    console.log('✅ Colaborador encontrado:', data.nome);
    return data;
  },

  /**
   * Criar novo colaborador
   */
  async criarColaborador(colaboradorData: NovoColaborador): Promise<Colaborador> {
    console.log('➕ Criando novo colaborador:', colaboradorData.nome);
    
    const insertData = {
      nome: colaboradorData.nome,
      email: colaboradorData.email,
      cpf: colaboradorData.cpf,
      cargo: colaboradorData.cargo,
      departamento: colaboradorData.departamento,
      unidade: colaboradorData.unidade,
      tipo_contratacao: colaboradorData.tipo_contratacao,
      banco: colaboradorData.banco || null,
      agencia: colaboradorData.agencia || null,
      conta: colaboradorData.conta || null,
      tipo_conta: colaboradorData.tipo_conta || null,
      status: colaboradorData.status || StatusColaborador.ATIVO
    };
    
    const { data, error } = await supabase
      .from('colaboradores')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar colaborador:', error);
      throw error;
    }
    
    console.log('✅ Colaborador criado com sucesso:', data.nome);
    return data;
  },

  /**
   * Atualizar colaborador
   */
  async atualizarColaborador(id: string, colaboradorData: AtualizarColaborador): Promise<Colaborador> {
    console.log('✏️ Atualizando colaborador:', id);
    
    const updateData: any = {};
    
    // Apenas incluir campos que foram fornecidos
    if (colaboradorData.nome !== undefined) updateData.nome = colaboradorData.nome;
    if (colaboradorData.email !== undefined) updateData.email = colaboradorData.email;
    if (colaboradorData.cpf !== undefined) updateData.cpf = colaboradorData.cpf;
    if (colaboradorData.cargo !== undefined) updateData.cargo = colaboradorData.cargo;
    if (colaboradorData.departamento !== undefined) updateData.departamento = colaboradorData.departamento;
    if (colaboradorData.unidade !== undefined) updateData.unidade = colaboradorData.unidade;
    if (colaboradorData.tipo_contratacao !== undefined) updateData.tipo_contratacao = colaboradorData.tipo_contratacao;
    if (colaboradorData.banco !== undefined) updateData.banco = colaboradorData.banco;
    if (colaboradorData.agencia !== undefined) updateData.agencia = colaboradorData.agencia;
    if (colaboradorData.conta !== undefined) updateData.conta = colaboradorData.conta;
    if (colaboradorData.tipo_conta !== undefined) updateData.tipo_conta = colaboradorData.tipo_conta;
    if (colaboradorData.status !== undefined) updateData.status = colaboradorData.status;
    
    const { data, error } = await supabase
      .from('colaboradores')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao atualizar colaborador:', error);
      throw error;
    }
    
    console.log('✅ Colaborador atualizado com sucesso:', data.nome);
    return data;
  },

  /**
   * Deletar colaborador
   */
  async deletarColaborador(id: string): Promise<void> {
    console.log('🗑️ Deletando colaborador:', id);
    
    const { error } = await supabase
      .from('colaboradores')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao deletar colaborador:', error);
      throw error;
    }
    
    console.log('✅ Colaborador deletado com sucesso');
  },

  /**
   * Buscar colaboradores com filtros
   */
  async getColaboradoresFiltrados(filtros: FiltrosColaborador): Promise<Colaborador[]> {
    console.log('🔍 Buscando colaboradores com filtros:', filtros);
    
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
      console.error('❌ Erro ao buscar colaboradores filtrados:', error);
      throw error;
    }
    
    console.log('✅ Colaboradores filtrados encontrados:', data?.length || 0);
    return data || [];
  },

  /**
   * Buscar colaboradores por unidade
   */
  async getColaboradoresPorUnidade(unidade: string): Promise<Colaborador[]> {
    console.log('🔍 Buscando colaboradores por unidade:', unidade);
    
    const { data, error } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('unidade', unidade)
      .eq('status', StatusColaborador.ATIVO)
      .order('nome', { ascending: true });
    
    if (error) {
      console.error('❌ Erro ao buscar colaboradores por unidade:', error);
      throw error;
    }
    
    console.log('✅ Colaboradores da unidade encontrados:', data?.length || 0);
    return data || [];
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
      console.error('❌ Erro ao verificar email:', error);
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
      console.error('❌ Erro ao verificar CPF:', error);
      throw error;
    }
    
    return (data?.length || 0) > 0;
  }
};