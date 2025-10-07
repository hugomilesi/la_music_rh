import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  RefreshCw,
  Settings,
  Columns
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { colaboradorService } from '@/services/colaboradorService';
import { 
  Colaborador, 
  FiltrosColaborador,
  UnidadeColaborador,
  TipoContratacao,
  StatusColaborador,
  UNIDADES_OPTIONS,
  TIPOS_CONTRATACAO_OPTIONS,
  STATUS_OPTIONS,
  formatCPF
} from '@/types/colaborador';
import { NovoColaboradorDialog } from '@/components/colaboradores/NovoColaboradorDialog';
import { EditarColaboradorDialog } from '@/components/colaboradores/EditarColaboradorDialog';
import { DetalhesColaboradorDialog } from '@/components/colaboradores/DetalhesColaboradorDialog';

// Definir as colunas disponíveis
const AVAILABLE_COLUMNS = [
  { key: 'nome', label: 'Nome', required: true },
  { key: 'email', label: 'Email', required: false },
  { key: 'cpf', label: 'CPF', required: false },
  { key: 'telefone', label: 'Telefone', required: false },
  { key: 'cargo', label: 'Cargo', required: false },
  { key: 'departamento', label: 'Departamento', required: false },
  { key: 'unidade', label: 'Unidade', required: false },
  { key: 'tipo_contratacao', label: 'Tipo', required: false },
  { key: 'status', label: 'Status', required: false },
  { key: 'data_admissao', label: 'Data Admissão', required: false },
  { key: 'banco', label: 'Banco', required: false },
  { key: 'agencia', label: 'Agência', required: false },
  { key: 'conta', label: 'Conta', required: false },
  { key: 'tipo_conta', label: 'Tipo Conta', required: false },
];

export const ColaboradoresPage: React.FC = () => {
  const { toast } = useToast();
  const { canViewModule, canManageModule, loading: permissionsLoading } = usePermissionsV2();
  
  // Estados
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosColaborador>({
    searchTerm: '',
    unidade: '',
    departamento: '',
    tipo_contratacao: '',
    status: ''
  });
  
  // Estados dos diálogos
  const [novoColaboradorOpen, setNovoColaboradorOpen] = useState(false);
  const [editarColaboradorOpen, setEditarColaboradorOpen] = useState(false);
  const [detalhesColaboradorOpen, setDetalhesColaboradorOpen] = useState(false);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null);
  
  // Estados para seleção múltipla
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estado para colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem('colaboradores-visible-columns');
    return saved ? JSON.parse(saved) : ['nome', 'email', 'cpf', 'cargo', 'unidade', 'tipo_contratacao', 'status'];
  });
  
  // Verificar permissões
  const canView = canViewModule('colaboradores');
  const canManage = canManageModule('colaboradores');
  
  // Carregar colaboradores
  const carregarColaboradores = useCallback(async () => {
    try {
      setLoading(true);
      const data = await colaboradorService.getColaboradores();
      console.log('Dados dos colaboradores carregados:', data);
      console.log('Status dos colaboradores:', data.map(c => ({ nome: c.nome, status: c.status })));
      setColaboradores(data);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar colaboradores. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Carregar dados na inicialização
  useEffect(() => {
    if (!permissionsLoading && canView) {
      carregarColaboradores();
    }
  }, [permissionsLoading, canView, carregarColaboradores]);
  
  // Salvar colunas visíveis no localStorage
  useEffect(() => {
    localStorage.setItem('colaboradores-visible-columns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);
  
  // Filtrar colaboradores
  const colaboradoresFiltrados = useMemo(() => {
    return colaboradores.filter(colaborador => {
      const matchesSearch = !filtros.searchTerm || 
        colaborador.nome.toLowerCase().includes(filtros.searchTerm.toLowerCase()) ||
        colaborador.email.toLowerCase().includes(filtros.searchTerm.toLowerCase()) ||
        colaborador.cpf.includes(filtros.searchTerm) ||
        colaborador.cargo.toLowerCase().includes(filtros.searchTerm.toLowerCase());
      
      const matchesUnidade = !filtros.unidade || colaborador.unidade === filtros.unidade;
      const matchesDepartamento = !filtros.departamento || colaborador.departamento === filtros.departamento;
      const matchesTipo = !filtros.tipo_contratacao || colaborador.tipo_contratacao === filtros.tipo_contratacao;
      const matchesStatus = !filtros.status || colaborador.status === filtros.status;
      
      return matchesSearch && matchesUnidade && matchesDepartamento && matchesTipo && matchesStatus;
    });
  }, [colaboradores, filtros]);
  
  // Obter departamentos únicos para o filtro
  const departamentosUnicos = useMemo(() => {
    const departamentos = colaboradores.map(c => c.departamento).filter(Boolean);
    return [...new Set(departamentos)].sort();
  }, [colaboradores]);
  
  // Handlers
  const handleNovoColaborador = () => {
    setNovoColaboradorOpen(true);
  };
  
  const handleEditarColaborador = (colaborador: Colaborador) => {
    setColaboradorSelecionado(colaborador);
    setEditarColaboradorOpen(true);
  };
  
  const handleVerDetalhes = (colaborador: Colaborador) => {
    setColaboradorSelecionado(colaborador);
    setDetalhesColaboradorOpen(true);
  };
  
  const handleDeletarColaborador = async (colaborador: Colaborador) => {
    try {
      
      await colaboradorService.deletarColaborador(colaborador.id);
      
      toast({
        title: "Sucesso",
        description: `Colaborador ${colaborador.nome} removido com sucesso.`,
      });
      
      // Recarregar lista
      await carregarColaboradores();
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover colaborador. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Handlers para seleção múltipla
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(colaboradoresFiltrados.map(c => c.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedEmployees.length === 0) return;
    
    setIsDeleting(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      for (const employeeId of selectedEmployees) {
        try {
          await colaboradorService.deletarColaborador(employeeId);
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast({
          title: "Sucesso",
          description: `${successCount} colaborador(es) removido(s) com sucesso.`,
        });
      }
      
      if (errorCount > 0) {
        toast({
          title: "Atenção",
          description: `${errorCount} colaborador(es) não puderam ser removidos.`,
          variant: "destructive",
        });
      }
      
      // Limpar seleção e recarregar lista
      setSelectedEmployees([]);
      await carregarColaboradores();
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover colaboradores. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleColaboradorCriado = () => {
    setNovoColaboradorOpen(false);
    carregarColaboradores();
  };
  
  const handleColaboradorAtualizado = () => {
    setEditarColaboradorOpen(false);
    setColaboradorSelecionado(null);
    carregarColaboradores();
  };
  
  const limparFiltros = () => {
    setFiltros({
      searchTerm: '',
      unidade: '',
      departamento: '',
      tipo_contratacao: '',
      status: ''
    });
  };
  
  // Função para alternar visibilidade da coluna
  const toggleColumn = (columnKey: string) => {
    const column = AVAILABLE_COLUMNS.find(col => col.key === columnKey);
    if (column?.required) return; // Não permitir ocultar colunas obrigatórias
    
    setVisibleColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  // Função para resetar colunas para o padrão
  const resetColumns = () => {
    setVisibleColumns(['nome', 'email', 'cpf', 'cargo', 'unidade', 'tipo_contratacao', 'status']);
  };
  
  // Verificar se o usuário tem permissão para visualizar
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-500">
            Você não tem permissão para visualizar esta página.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colaboradores</h1>
          <p className="text-muted-foreground">
            Gerencie os colaboradores da empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedEmployees.length > 0 && canManage && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover Selecionados ({selectedEmployees.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão Múltipla</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover {selectedEmployees.length} colaborador(es) selecionado(s)? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteMultiple}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Removendo...' : 'Remover Todos'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {canManage && (
            <Button onClick={handleNovoColaborador}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Colaborador
            </Button>
          )}
        </div>
      </div>
      
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome, email, CPF ou cargo..."
                value={filtros.searchTerm}
                onChange={(e) => setFiltros(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            {/* Unidade */}
            <Select
              value={filtros.unidade || 'all_units'}
              onValueChange={(value) => setFiltros(prev => ({ ...prev, unidade: value === 'all_units' ? '' : value as UnidadeColaborador }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_units">Todas as unidades</SelectItem>
                {UNIDADES_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Departamento */}
            <Select
              value={filtros.departamento || 'all_departments'}
              onValueChange={(value) => setFiltros(prev => ({ ...prev, departamento: value === 'all_departments' ? '' : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_departments">Todos os departamentos</SelectItem>
                {departamentosUnicos.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Tipo de Contratação */}
            <Select
              value={filtros.tipo_contratacao || 'all_types'}
              onValueChange={(value) => setFiltros(prev => ({ ...prev, tipo_contratacao: value === 'all_types' ? '' : value as TipoContratacao }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_types">Todos os tipos</SelectItem>
                {TIPOS_CONTRATACAO_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Status */}
            <Select
              value={filtros.status || 'all_status'}
              onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value === 'all_status' ? '' : value as StatusColaborador }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_status">Todos os status</SelectItem>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Botão limpar filtros */}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabela de Colaboradores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Colaboradores ({colaboradoresFiltrados.length})
            </div>
            
            {/* Seletor de Colunas */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns className="w-4 h-4 mr-2" />
                  Colunas
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 sm:w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Selecionar Colunas</h4>
                    <Button variant="ghost" size="sm" onClick={resetColumns} className="h-7 px-2 text-xs">
                      Resetar
                    </Button>
                  </div>
                  
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {AVAILABLE_COLUMNS.map((column) => (
                      <div key={column.key} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={column.key}
                          checked={visibleColumns.includes(column.key)}
                          onCheckedChange={() => toggleColumn(column.key)}
                          disabled={column.required}
                          className="h-3.5 w-3.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label 
                          htmlFor={column.key} 
                          className={`text-xs leading-tight flex-1 ${column.required ? 'text-gray-500' : 'cursor-pointer hover:text-gray-900'} transition-colors`}
                        >
                          {column.label}
                          {column.required && <span className="text-gray-400 ml-1">(obrigatório)</span>}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    {visibleColumns.length} de {AVAILABLE_COLUMNS.length} colunas selecionadas
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
          ) : colaboradoresFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum colaborador encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                {colaboradores.length === 0 
                  ? 'Ainda não há colaboradores cadastrados.' 
                  : 'Tente ajustar os filtros para encontrar colaboradores.'}
              </p>
              {canManage && colaboradores.length === 0 && (
                <Button onClick={handleNovoColaborador}>
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Colaborador
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {canManage && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedEmployees.length === colaboradoresFiltrados.length && colaboradoresFiltrados.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                    )}
                    {visibleColumns.includes('nome') && <TableHead>Nome</TableHead>}
                    {visibleColumns.includes('email') && <TableHead>Email</TableHead>}
                    {visibleColumns.includes('cpf') && <TableHead>CPF</TableHead>}
                    {visibleColumns.includes('telefone') && <TableHead>Telefone</TableHead>}
                    {visibleColumns.includes('cargo') && <TableHead>Cargo</TableHead>}
                    {visibleColumns.includes('departamento') && <TableHead>Departamento</TableHead>}
                    {visibleColumns.includes('unidade') && <TableHead>Unidade</TableHead>}
                    {visibleColumns.includes('tipo_contratacao') && <TableHead>Tipo</TableHead>}
                    {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
                    {visibleColumns.includes('data_admissao') && <TableHead>Data Admissão</TableHead>}
                    {visibleColumns.includes('banco') && <TableHead>Banco</TableHead>}
                    {visibleColumns.includes('agencia') && <TableHead>Agência</TableHead>}
                    {visibleColumns.includes('conta') && <TableHead>Conta</TableHead>}
                    {visibleColumns.includes('tipo_conta') && <TableHead>Tipo Conta</TableHead>}
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colaboradoresFiltrados.map((colaborador) => (
                    <TableRow key={colaborador.id}>
                      {canManage && (
                        <TableCell>
                          <Checkbox
                            checked={selectedEmployees.includes(colaborador.id)}
                            onCheckedChange={(checked) => handleSelectEmployee(colaborador.id, checked as boolean)}
                          />
                        </TableCell>
                      )}
                      {visibleColumns.includes('nome') && (
                        <TableCell className="font-medium">
                          {colaborador.nome}
                        </TableCell>
                      )}
                      {visibleColumns.includes('email') && (
                        <TableCell>{colaborador.email}</TableCell>
                      )}
                      {visibleColumns.includes('cpf') && (
                        <TableCell>{formatCPF(colaborador.cpf)}</TableCell>
                      )}
                      {visibleColumns.includes('telefone') && (
                        <TableCell>{colaborador.telefone || '-'}</TableCell>
                      )}
                      {visibleColumns.includes('cargo') && (
                        <TableCell>{colaborador.cargo}</TableCell>
                      )}
                      {visibleColumns.includes('departamento') && (
                        <TableCell>{colaborador.departamento}</TableCell>
                      )}
                      {visibleColumns.includes('unidade') && (
                        <TableCell>{colaborador.unidade}</TableCell>
                      )}
                      {visibleColumns.includes('tipo_contratacao') && (
                        <TableCell>
                          <Badge variant="outline">
                            {colaborador.tipo_contratacao}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.includes('status') && (
                        <TableCell>
                          <Badge 
                            variant={colaborador.status === StatusColaborador.ATIVO ? "default" : "secondary"}
                          >
                            {colaborador.status}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.includes('data_admissao') && (
                        <TableCell>
                          {new Date(colaborador.data_admissao).toLocaleDateString('pt-BR')}
                        </TableCell>
                      )}
                      {visibleColumns.includes('banco') && (
                        <TableCell>{colaborador.banco || '-'}</TableCell>
                      )}
                      {visibleColumns.includes('agencia') && (
                        <TableCell>{colaborador.agencia || '-'}</TableCell>
                      )}
                      {visibleColumns.includes('conta') && (
                        <TableCell>{colaborador.conta || '-'}</TableCell>
                      )}
                      {visibleColumns.includes('tipo_conta') && (
                        <TableCell>{colaborador.tipo_conta || '-'}</TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerDetalhes(colaborador)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {canManage && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditarColaborador(colaborador)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover o colaborador {colaborador.nome}? 
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeletarColaborador(colaborador)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Diálogos */}
      <NovoColaboradorDialog
        open={novoColaboradorOpen}
        onOpenChange={setNovoColaboradorOpen}
        onColaboradorCriado={handleColaboradorCriado}
      />
      
      {colaboradorSelecionado && (
        <>
          <EditarColaboradorDialog
            open={editarColaboradorOpen}
            onOpenChange={setEditarColaboradorOpen}
            colaborador={colaboradorSelecionado}
            onColaboradorAtualizado={handleColaboradorAtualizado}
          />
          
          <DetalhesColaboradorDialog
            open={detalhesColaboradorOpen}
            onOpenChange={setDetalhesColaboradorOpen}
            colaborador={colaboradorSelecionado}
          />
        </>
      )}
    </div>
  );
};

export default ColaboradoresPage;