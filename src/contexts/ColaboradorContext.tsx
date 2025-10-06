import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Colaborador, 
  NovoColaborador, 
  AtualizarColaborador, 
  FiltrosColaborador,
  StatusColaborador 
} from '@/types/colaborador';
import { colaboradorService } from '@/services/colaboradorService';
import { useToast } from '@/hooks/use-toast';

interface ColaboradorContextType {
  colaboradores: Colaborador[];
  colaboradoresFiltrados: Colaborador[];
  colaboradoresAtivos: Colaborador[];
  isLoading: boolean;
  error: string | null;
  filtros: FiltrosColaborador;
  setFiltros: (filtros: FiltrosColaborador) => void;
  criarColaborador: (colaborador: NovoColaborador) => Promise<Colaborador>;
  atualizarColaborador: (id: string, updates: AtualizarColaborador) => Promise<Colaborador>;
  deletarColaborador: (id: string) => Promise<void>;
  getColaboradorById: (id: string) => Colaborador | null;
  getColaboradoresPorUnidade: (unidade: string) => Colaborador[];
  refreshColaboradores: () => Promise<void>;
}

const ColaboradorContext = createContext<ColaboradorContextType | undefined>(undefined);

export const ColaboradorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosColaborador>({
    searchTerm: '',
    unidade: '',
    departamento: '',
    tipo_contratacao: '',
    status: ''
  });
  const { toast } = useToast();

  // Carregar colaboradores
  const loadColaboradores = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await colaboradorService.getColaboradores();
      setColaboradores(data);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao carregar colaboradores: " + errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar colaboradores na inicialização
  useEffect(() => {
    loadColaboradores();
  }, []);

  // Filtrar colaboradores baseado nos filtros
  const colaboradoresFiltrados = React.useMemo(() => {
    return colaboradores.filter(colaborador => {
      const matchesSearch = !filtros.searchTerm || 
        colaborador.nome?.toLowerCase().includes(filtros.searchTerm.toLowerCase()) ||
        colaborador.email?.toLowerCase().includes(filtros.searchTerm.toLowerCase()) ||
        colaborador.cpf?.includes(filtros.searchTerm);
      
      const matchesUnidade = !filtros.unidade || colaborador.unidade === filtros.unidade;
      const matchesDepartamento = !filtros.departamento || colaborador.departamento === filtros.departamento;
      const matchesTipoContratacao = !filtros.tipo_contratacao || colaborador.tipo_contratacao === filtros.tipo_contratacao;
      const matchesStatus = !filtros.status || colaborador.status === filtros.status;
      
      return matchesSearch && matchesUnidade && matchesDepartamento && matchesTipoContratacao && matchesStatus;
    });
  }, [colaboradores, filtros]);

  // Colaboradores ativos
  const colaboradoresAtivos = React.useMemo(() => {
    return colaboradores.filter(colaborador => colaborador.status === StatusColaborador.ATIVO);
  }, [colaboradores]);

  // Criar colaborador
  const criarColaborador = async (colaboradorData: NovoColaborador): Promise<Colaborador> => {
    try {
      
      const novoColaborador = await colaboradorService.criarColaborador(colaboradorData);
      
      // Adicionar à lista local
      setColaboradores(prev => [...prev, novoColaborador]);
      
      toast({
        title: "Sucesso",
        description: `Colaborador ${novoColaborador.nome} criado com sucesso.`,
      });
      
      return novoColaborador;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: "Erro ao criar colaborador: " + errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Atualizar colaborador
  const atualizarColaborador = async (id: string, updates: AtualizarColaborador): Promise<Colaborador> => {
    try {
      
      const colaboradorAtualizado = await colaboradorService.atualizarColaborador(id, updates);
      
      // Atualizar na lista local
      setColaboradores(prev => prev.map(c => c.id === id ? colaboradorAtualizado : c));
      
      toast({
        title: "Sucesso",
        description: `Colaborador ${colaboradorAtualizado.nome} atualizado com sucesso.`,
      });
      
      return colaboradorAtualizado;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: "Erro ao atualizar colaborador: " + errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Deletar colaborador
  const deletarColaborador = async (id: string): Promise<void> => {
    try {
      const colaborador = colaboradores.find(c => c.id === id);
      
      await colaboradorService.deletarColaborador(id);
      
      // Remover da lista local
      setColaboradores(prev => prev.filter(c => c.id !== id));
      
      toast({
        title: "Sucesso",
        description: `Colaborador ${colaborador?.nome || 'selecionado'} removido com sucesso.`,
      });
      
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: "Erro ao remover colaborador: " + errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Buscar colaborador por ID
  const getColaboradorById = (id: string): Colaborador | null => {
    return colaboradores.find(c => c.id === id) || null;
  };

  // Buscar colaboradores por unidade
  const getColaboradoresPorUnidade = (unidade: string): Colaborador[] => {
    return colaboradoresAtivos.filter(c => c.unidade === unidade);
  };

  // Refresh colaboradores
  const refreshColaboradores = async () => {
    await loadColaboradores();
  };

  return (
    <ColaboradorContext.Provider value={{
      colaboradores,
      colaboradoresFiltrados,
      colaboradoresAtivos,
      isLoading,
      error,
      filtros,
      setFiltros,
      criarColaborador,
      atualizarColaborador,
      deletarColaborador,
      getColaboradorById,
      getColaboradoresPorUnidade,
      refreshColaboradores
    }}>
      {children}
    </ColaboradorContext.Provider>
  );
};

export const useColaboradores = () => {
  const context = useContext(ColaboradorContext);
  if (context === undefined) {
    throw new Error('useColaboradores must be used within a ColaboradorProvider');
  }
  return context;
};

// Hook para buscar colaboradores ativos (útil para seleções)
export const useColaboradoresAtivos = () => {
  const { colaboradoresAtivos, isLoading } = useColaboradores();
  return { colaboradoresAtivos, isLoading };
};

// Hook para buscar colaboradores por unidade (útil para filtros)
export const useColaboradoresPorUnidade = (unidade?: string) => {
  const { getColaboradoresPorUnidade, isLoading } = useColaboradores();
  
  const colaboradoresDaUnidade = React.useMemo(() => {
    if (!unidade) return [];
    return getColaboradoresPorUnidade(unidade);
  }, [unidade, getColaboradoresPorUnidade]);
  
  return { colaboradores: colaboradoresDaUnidade, isLoading };
};