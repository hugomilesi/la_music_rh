
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trophy, Star, DollarSign, Award, Crown, Medal, Eye, Filter, Loader2, Lock } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { CriteriaModal } from '@/components/recognition/CriteriaModal';
import { NewBonusDialog } from '@/components/recognition/NewBonusDialog';
import { DeliverPrizeDialog } from '@/components/recognition/DeliverPrizeDialog';
import { EmployeeRankingDetailsModal } from '@/components/recognition/EmployeeRankingDetailsModal';
import { RankingCRUDModal } from '@/components/recognition/RankingCRUDModal';
import { RecognitionService } from '@/services/recognitionService';
import '@/utils/testRecognition'; // Importar funções de teste
import { RecognitionProgram, DetailedRankingEmployee, isEligibleForProgram, getEligiblePrograms } from '@/types/recognition';
import type { RecognitionProgram as DBRecognitionProgram, EmployeeRanking } from '@/types/supabase-recognition';
import { toast } from 'sonner';

const RecognitionPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermissions();
  const canManageEmployees = checkPermission('canManageEmployees', false);
  
  const [selectedProgram, setSelectedProgram] = useState<RecognitionProgram | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<DetailedRankingEmployee | null>(null);
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
  const [newBonusDialogOpen, setNewBonusDialogOpen] = useState(false);
  const [deliverPrizeDialogOpen, setDeliverPrizeDialogOpen] = useState(false);
  const [employeeDetailsModalOpen, setEmployeeDetailsModalOpen] = useState(false);
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('all');
  const [showRankingCRUDModal, setShowRankingCRUDModal] = useState(false);
  const [selectedEmployeeForCRUD, setSelectedEmployeeForCRUD] = useState<{ id: string; name: string } | null>(null);
  
  // Estado para dados do Supabase
  const [programs, setPrograms] = useState<DBRecognitionProgram[]>([]);
  const [employeeRanking, setEmployeeRanking] = useState<EmployeeRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);

  // Carregar dados do Supabase
  useEffect(() => {
    loadData();
  }, [selectedProgramFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar programas
      const programsData = await RecognitionService.getPrograms();
      setPrograms(programsData);
      
      // Carregar ranking de funcionários
      const rankingData = await RecognitionService.getEmployeeRanking(selectedProgramFilter);
      setEmployeeRanking(rankingData);
      
      // Carregar conquistas recentes do banco de dados
      try {
        const achievementsData = await RecognitionService.getEmployeeAchievements();
        setAchievements(achievementsData);
      } catch (error) {
        console.error('Erro ao carregar conquistas:', error);
        setAchievements([]);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do reconhecimento');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCriteria = async (programId: string) => {
    try {
      const program = programs.find(p => p.id === programId);
      if (program) {
        // Converter para o formato esperado pelo modal
        const convertedProgram: RecognitionProgram = {
          id: program.id,
          name: program.name,
          description: program.description,
          color: program.color,
          icon: program.icon,
          totalPossibleStars: program.total_possible_stars,
          targetRoles: program.target_roles,
          criteria: await RecognitionService.getCriteriaByProgram(programId)
        };
        setSelectedProgram(convertedProgram);
        setCriteriaModalOpen(true);
      }
    } catch (error) {
      console.error('Erro ao carregar critérios:', error);
      toast.error('Erro ao carregar critérios do programa');
    }
  };

  // Função utilitária para fazer o parsing correto do campo employee_unit
  const parseEmployeeUnit = (employeeUnit: string | null | undefined): string => {
    if (!employeeUnit) return 'N/A';
    
    try {
      // Se for uma string que parece ser JSON array, fazer o parse
      if (typeof employeeUnit === 'string' && employeeUnit.startsWith('[')) {
        const parsed = JSON.parse(employeeUnit);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0]; // Retorna o primeiro item do array
        }
      }
      // Se for uma string normal, retornar como está
      return employeeUnit;
    } catch (error) {
      console.warn('Erro ao fazer parse do employee_unit:', error);
      return employeeUnit || 'N/A';
    }
  };

  const handleEmployeeClick = async (employee: EmployeeRanking) => {
    try {
      // Converter para o formato esperado pelo modal
      const detailedEmployee: DetailedRankingEmployee = {
        id: employee.employee_id,
        name: employee.employee_name,
        unit: parseEmployeeUnit(employee.employee_unit),
        role: employee.employee_role,
        stars: {
          fideliza: employee.fideliza_stars,
          matriculador: employee.matriculador_stars,
          professor: employee.professor_stars
        },
        total: employee.total_stars,
        position: employee.ranking_position,
        achievements: [],
        monthlyProgress: [],
        metCriteria: {},
        joinDate: new Date().toISOString(),
        evaluationPeriod: 'Março 2024',
        eligiblePrograms: getEligiblePrograms(employee.employee_role)
      };
      
      setSelectedEmployee(detailedEmployee);
      setEmployeeDetailsModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes do funcionário:', error);
      toast.error('Erro ao carregar detalhes do funcionário');
    }
  };

  const handleManageRanking = (employee: DetailedRankingEmployee) => {
    setSelectedEmployeeForCRUD({
      id: employee.id,
      name: employee.name
    });
    setShowRankingCRUDModal(true);
  };

  const handleRankingDataChange = () => {
    // Recarregar dados após mudanças no ranking
    loadData();
  };

  const handleCreateBonus = async (bonus: any) => {
    try {
      console.log('Nova bonificação criada:', bonus);
      toast.success('Bonificação criada com sucesso!');
      // Recarregar dados
      await loadData();
    } catch (error) {
      console.error('Erro ao criar bonificação:', error);
      toast.error('Erro ao criar bonificação');
    }
  };

  const handleDeliverPrize = async (prize: any) => {
    try {
      console.log('Prêmio entregue:', prize);
      toast.success('Prêmio entregue com sucesso!');
      // Recarregar dados
      await loadData();
    } catch (error) {
      console.error('Erro ao entregar prêmio:', error);
      toast.error('Erro ao entregar prêmio');
    }
  };

  const handleSaveProgram = async (updatedProgram: RecognitionProgram) => {
    try {
      console.log('Programa atualizado:', updatedProgram);
      toast.success('Programa atualizado com sucesso!');
      // Recarregar dados
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar programa:', error);
      toast.error('Erro ao atualizar programa');
    }
  };

  const handleDeliverPrizeFromModal = () => {
    setEmployeeDetailsModalOpen(false);
    setDeliverPrizeDialogOpen(true);
  };

  const handleCreateBonusFromModal = () => {
    setEmployeeDetailsModalOpen(false);
    setNewBonusDialogOpen(true);
  };

  // Obter líder para um programa específico
  const getLeaderForProgram = (programId: string) => {
    if (!employeeRanking.length) return null;
    
    const eligibleEmployees = employeeRanking.filter(employee => {
      if (programId === 'fideliza') {
        return ['Coordenadora Pedagógica', 'Recepcionista', 'Assistente Administrativo', 'Coordenador Administrativo'].includes(employee.employee_role);
      } else if (programId === 'matriculador') {
        return ['Consultor de Vendas', 'Consultora de Vendas', 'Coordenadora de Vendas', 'Coordenador de Vendas', 'Gerente de Vendas'].includes(employee.employee_role);
      } else if (programId === 'professor') {
        return ['Professor', 'Professor Senior', 'Professora', 'Coordenador Pedagógico'].includes(employee.employee_role);
      }
      return false;
    });
    
    if (eligibleEmployees.length === 0) return null;
    
    return eligibleEmployees.reduce((leader, current) => {
      const leaderStars = programId === 'fideliza' ? leader.fideliza_stars :
                         programId === 'matriculador' ? leader.matriculador_stars :
                         leader.professor_stars;
      const currentStars = programId === 'fideliza' ? current.fideliza_stars :
                          programId === 'matriculador' ? current.matriculador_stars :
                          current.professor_stars;
      return currentStars > leaderStars ? current : leader;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Carregando dados de reconhecimento...</span>
      </div>
    );
  }

  if (!canManageEmployees) {
    return (
      <Dialog open={true} onOpenChange={() => navigate(-1)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Acesso Negado
            </DialogTitle>
            <DialogDescription>
              Você não tem permissão para visualizar informações de reconhecimento e colaboradores.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-6">
              Entre em contato com o administrador para solicitar acesso.
            </p>
            <Button onClick={() => navigate(-1)} className="w-full">
              Voltar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gameficação - Incentivos e Reconhecimentos</h1>
          <p className="text-gray-600 mt-1">Sistema de gamificação e premiação para colaboradores</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDeliverPrizeDialogOpen(true)}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Entregar Prêmio
          </Button>
          <Button 
            size="sm"
            onClick={() => setNewBonusDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Bonificação
          </Button>
        </div>
      </div>

      {/* Programs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {programs.map((program) => {
          const leader = getLeaderForProgram(program.id);
          const iconMap: { [key: string]: any } = {
            'Star': Star,
            'DollarSign': DollarSign,
            'Award': Award
          };
          const IconComponent = iconMap[program.icon] || Star;
          
          return (
            <Card key={program.id} className={`border-l-4`} style={{
              borderLeftColor: program.color
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: program.color }}>
                  <IconComponent className="w-5 h-5" />
                  {program.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{program.description}</p>
                <div className="space-y-2">
                  {leader ? (
                    <>
                       <div className="flex justify-between">
                         <span className="text-sm">Líder do mês:</span>
                         <span className="font-semibold">{leader.employee_name.split(' ')[0]} {leader.employee_name.split(' ')[1]}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-sm">Cargo:</span>
                         <span className="text-sm text-gray-600">{leader.employee_role}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-sm">Unidade:</span>
                         <span className="text-sm text-gray-600">{parseEmployeeUnit(leader.employee_unit)}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-sm">{program.id === 'matriculador' ? 'Matrículas:' : 'Estrelas:'}:</span>
                         <span className="font-bold" style={{ color: program.color }}>
                           {program.id === 'fideliza' ? leader.fideliza_stars :
                            program.id === 'matriculador' ? leader.matriculador_stars :
                            leader.professor_stars} {program.id === 'matriculador' ? '📚' : '⭐'}
                         </span>
                       </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum participante elegível</p>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <p>Cargos elegíveis: {program.target_roles.join(', ')}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => handleViewCriteria(program.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Critérios
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Vencedores do Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            🏆 Vencedores do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posição</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Estrelas/Matrículas</TableHead>
                <TableHead>Unidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((program) => {
                const leader = getLeaderForProgram(program.id);
                if (!leader) return null;
                
                const score = program.id === 'fideliza' ? leader.fideliza_stars :
                             program.id === 'matriculador' ? leader.matriculador_stars :
                             leader.professor_stars;
                const emoji = program.id === 'matriculador' ? '📘' : '⭐';
                
                return (
                  <TableRow key={program.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold">1º</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{leader.employee_name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${
                          program.id === 'fideliza' ? 'bg-blue-100 text-blue-800' :
                          program.id === 'matriculador' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {program.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold" style={{ color: program.color }}>
                        {emoji} {score}
                      </span>
                    </TableCell>
                    <TableCell>{parseEmployeeUnit(leader.employee_unit)}</TableCell>
                  </TableRow>
                );
              }).filter(Boolean)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rankings por Programa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Rankings por Programa - Março 2024
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fideliza" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fideliza" className="text-blue-600">🟦 Fideliza+</TabsTrigger>
              <TabsTrigger value="matriculador" className="text-green-600">🟩 Matriculador+ LA</TabsTrigger>
              <TabsTrigger value="professor" className="text-purple-600">🟪 Professor+ LA</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fideliza">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Estrelas</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeRanking
                    .filter(person => isEligibleForProgram(person.employee_role, 'fideliza'))
                    .sort((a, b) => b.fideliza_stars - a.fideliza_stars)
                    .map((person, index) => (
                      <TableRow 
                        key={person.employee_id}
                        className="cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleEmployeeClick(person)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                            {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                            {index === 2 && <Medal className="w-4 h-4 text-yellow-600" />}
                            <span className="font-bold">{index + 1}º</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-blue-600">
                            {person.employee_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{person.employee_role}</TableCell>
                        <TableCell>{parseEmployeeUnit(person.employee_unit)}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">
                            {person.fideliza_stars} ⭐
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const detailedEmployee: DetailedRankingEmployee = {
                                id: person.employee_id,
                                name: person.employee_name,
                                unit: parseEmployeeUnit(person.employee_unit),
                                role: person.employee_role,
                                stars: {
                                  fideliza: person.fideliza_stars,
                                  matriculador: person.matriculador_stars,
                                  professor: person.professor_stars
                                },
                                total: person.total_stars,
                                position: person.ranking_position,
                                achievements: [],
                                monthlyProgress: [],
                                metCriteria: {},
                                joinDate: new Date().toISOString(),
                                evaluationPeriod: 'Março 2024',
                                eligiblePrograms: getEligiblePrograms(person.employee_role)
                              };
                              handleManageRanking(detailedEmployee);
                            }}
                          >
                            Gerenciar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="matriculador">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Matrículas</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeRanking
                    .filter(person => isEligibleForProgram(person.employee_role, 'matriculador'))
                    .sort((a, b) => b.matriculador_stars - a.matriculador_stars)
                    .map((person, index) => (
                      <TableRow 
                        key={person.employee_id}
                        className="cursor-pointer hover:bg-green-50 transition-colors"
                        onClick={() => handleEmployeeClick(person)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                            {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                            {index === 2 && <Medal className="w-4 h-4 text-yellow-600" />}
                            <span className="font-bold">{index + 1}º</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            {person.employee_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{person.employee_role}</TableCell>
                        <TableCell>{parseEmployeeUnit(person.employee_unit)}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {person.matriculador_stars} 📚
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const detailedEmployee: DetailedRankingEmployee = {
                                id: person.employee_id,
                                name: person.employee_name,
                                unit: parseEmployeeUnit(person.employee_unit),
                                role: person.employee_role,
                                stars: {
                                  fideliza: person.fideliza_stars,
                                  matriculador: person.matriculador_stars,
                                  professor: person.professor_stars
                                },
                                total: person.total_stars,
                                position: person.ranking_position,
                                achievements: [],
                                monthlyProgress: [],
                                metCriteria: {},
                                joinDate: new Date().toISOString(),
                                evaluationPeriod: 'Março 2024',
                                eligiblePrograms: getEligiblePrograms(person.employee_role)
                              };
                              handleManageRanking(detailedEmployee);
                            }}
                          >
                            Gerenciar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="professor">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Estrelas</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeRanking
                    .filter(person => isEligibleForProgram(person.employee_role, 'professor'))
                    .sort((a, b) => b.professor_stars - a.professor_stars)
                    .map((person, index) => (
                      <TableRow 
                        key={person.employee_id}
                        className="cursor-pointer hover:bg-purple-50 transition-colors"
                        onClick={() => handleEmployeeClick(person)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                            {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                            {index === 2 && <Medal className="w-4 h-4 text-yellow-600" />}
                            <span className="font-bold">{index + 1}º</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-purple-600">
                            {person.employee_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{person.employee_role}</TableCell>
                        <TableCell>{parseEmployeeUnit(person.employee_unit)}</TableCell>
                        <TableCell>
                          <Badge className="bg-purple-100 text-purple-800">
                            {person.professor_stars} ⭐
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const detailedEmployee: DetailedRankingEmployee = {
                                id: person.employee_id,
                                name: person.employee_name,
                                unit: parseEmployeeUnit(person.employee_unit),
                                role: person.employee_role,
                                stars: {
                                  fideliza: person.fideliza_stars,
                                  matriculador: person.matriculador_stars,
                                  professor: person.professor_stars
                                },
                                total: person.total_stars,
                                position: person.ranking_position,
                                achievements: [],
                                monthlyProgress: [],
                                metCriteria: {},
                                joinDate: new Date().toISOString(),
                                evaluationPeriod: 'Março 2024',
                                eligiblePrograms: getEligiblePrograms(person.employee_role)
                              };
                              handleManageRanking(detailedEmployee);
                            }}
                          >
                            Gerenciar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>


      {/* Criteria Modal */}
      {selectedProgram && (
        <CriteriaModal
          open={criteriaModalOpen}
          onOpenChange={setCriteriaModalOpen}
          program={selectedProgram}
          onSaveEvaluation={(evaluations) => {
            console.log('Avaliação salva:', evaluations);
            // Here you would typically save to a backend or state management
          }}
          onSaveProgram={handleSaveProgram}
        />
      )}

      {/* Employee Details Modal */}
      <EmployeeRankingDetailsModal
        open={employeeDetailsModalOpen}
        onOpenChange={setEmployeeDetailsModalOpen}
        employee={selectedEmployee}
        onDeliverPrize={handleDeliverPrizeFromModal}
        onCreateBonus={handleCreateBonusFromModal}
      />

      {/* New Bonus Dialog */}
      <NewBonusDialog
        open={newBonusDialogOpen}
        onOpenChange={setNewBonusDialogOpen}
        onCreateBonus={handleCreateBonus}
      />

      {/* Deliver Prize Dialog */}
      <DeliverPrizeDialog
        open={deliverPrizeDialogOpen}
        onOpenChange={setDeliverPrizeDialogOpen}
        onDeliverPrize={handleDeliverPrize}
      />

      {/* Ranking CRUD Modal */}
       {selectedEmployeeForCRUD && (
         <RankingCRUDModal
           open={showRankingCRUDModal}
           onOpenChange={setShowRankingCRUDModal}
           employeeId={selectedEmployeeForCRUD.id}
           employeeName={selectedEmployeeForCRUD.name}
           onDataChange={handleRankingDataChange}
         />
       )}
    </div>
  );
};

export default RecognitionPage;
