
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trophy, Star, DollarSign, Award, Crown, Medal, Eye } from 'lucide-react';
import { CriteriaModal } from '@/components/recognition/CriteriaModal';
import { NewBonusDialog } from '@/components/recognition/NewBonusDialog';
import { DeliverPrizeDialog } from '@/components/recognition/DeliverPrizeDialog';
import { EmployeeRankingDetailsModal } from '@/components/recognition/EmployeeRankingDetailsModal';
import { recognitionPrograms } from '@/data/recognitionMockData';
import { detailedRankingEmployees } from '@/data/detailedRankingData';
import { RecognitionProgram, DetailedRankingEmployee } from '@/types/recognition';

const RecognitionPage: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<RecognitionProgram | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<DetailedRankingEmployee | null>(null);
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
  const [newBonusDialogOpen, setNewBonusDialogOpen] = useState(false);
  const [deliverPrizeDialogOpen, setDeliverPrizeDialogOpen] = useState(false);
  const [employeeDetailsModalOpen, setEmployeeDetailsModalOpen] = useState(false);

  const handleViewCriteria = (programId: string) => {
    const program = recognitionPrograms.find(p => p.id === programId);
    if (program) {
      setSelectedProgram(program);
      setCriteriaModalOpen(true);
    }
  };

  const handleEmployeeClick = (employee: DetailedRankingEmployee) => {
    setSelectedEmployee(employee);
    setEmployeeDetailsModalOpen(true);
  };

  const handleCreateBonus = (bonus: any) => {
    console.log('Nova bonificação criada:', bonus);
    // Here you would typically save to a backend or state management
  };

  const handleDeliverPrize = (prize: any) => {
    console.log('Prêmio entregue:', prize);
    // Here you would typically save to a backend or state management
  };

  const handleDeliverPrizeFromModal = () => {
    setEmployeeDetailsModalOpen(false);
    setDeliverPrizeDialogOpen(true);
  };

  const handleCreateBonusFromModal = () => {
    setEmployeeDetailsModalOpen(false);
    setNewBonusDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reconhecimento</h1>
          <p className="text-gray-600 mt-1">Gamificação e incentivos para os colaboradores</p>
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
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Star className="w-5 h-5" />
              Fideliza+
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Estrelas por retenção de alunos e encantamento</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Líder do mês:</span>
                <span className="font-semibold">Aline Cristina</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Estrelas:</span>
                <span className="font-bold text-blue-600">45 ⭐</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => handleViewCriteria('fideliza')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Critérios
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <DollarSign className="w-5 h-5" />
              Matriculador+ LA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Comissões por matrículas realizadas</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Líder do mês:</span>
                <span className="font-semibold">Felipe Elias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Matrículas:</span>
                <span className="font-bold text-green-600">15 📚</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => handleViewCriteria('matriculador')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Critérios
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Award className="w-5 h-5" />
              Professor+ LA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Estrelas por engajamento pedagógico</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Líder do mês:</span>
                <span className="font-semibold">Igor Esteves</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Estrelas:</span>
                <span className="font-bold text-purple-600">42 ⭐</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => handleViewCriteria('professor')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Critérios
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Ranking Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Ranking Geral - Março 2024
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posição</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Fideliza+</TableHead>
                <TableHead>Matriculador+</TableHead>
                <TableHead>Professor+</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailedRankingEmployees.map((person, index) => (
                <TableRow 
                  key={person.id} 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
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
                    <div className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                      {person.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{person.role}</TableCell>
                  <TableCell>{person.unit}</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">
                      {person.stars.fideliza} ⭐
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      {person.stars.matriculador} 📚
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-800">
                      {person.stars.professor} ⭐
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-lg">{person.total}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Conquistas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                employee: 'Aline Cristina Pessanha Faria',
                achievement: 'Meta de retenção superada',
                program: 'Fideliza+',
                points: 10,
                date: '2024-03-15'
              },
              {
                employee: 'Felipe Elias Carvalho',
                achievement: '15 matrículas em uma semana',
                program: 'Matriculador+',
                points: 15,
                date: '2024-03-14'
              },
              {
                employee: 'Igor Esteves Alves Baiao',
                achievement: 'Avaliação excepcional dos alunos',
                program: 'Professor+',
                points: 12,
                date: '2024-03-13'
              }
            ].map((achievement, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{achievement.employee}</h3>
                    <p className="text-sm text-gray-600">{achievement.achievement}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="text-xs">{achievement.program}</Badge>
                      <span className="text-xs text-gray-500">{achievement.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-600">+{achievement.points} pts</p>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
};

export default RecognitionPage;
