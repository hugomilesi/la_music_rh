
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trophy, Star, DollarSign, Award, Crown, Medal, Eye } from 'lucide-react';
import { CriteriaModal } from '@/components/recognition/CriteriaModal';
import { NewBonusDialog } from '@/components/recognition/NewBonusDialog';
import { DeliverPrizeDialog } from '@/components/recognition/DeliverPrizeDialog';
import { recognitionPrograms } from '@/data/recognitionMockData';
import { RecognitionProgram } from '@/types/recognition';

const mockRanking = [
  { id: 1, name: 'Aline Cristina Pessanha Faria', unit: 'Campo Grande', fideliza: 45, matriculador: 12, professor: 38, total: 95 },
  { id: 2, name: 'Felipe Elias Carvalho', unit: 'Campo Grande', fideliza: 42, matriculador: 15, professor: 35, total: 92 },
  { id: 3, name: 'Igor Esteves Alves Baiao', unit: 'Barra', fideliza: 38, matriculador: 10, professor: 42, total: 90 }
];

const RecognitionPage: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<RecognitionProgram | null>(null);
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
  const [newBonusDialogOpen, setNewBonusDialogOpen] = useState(false);
  const [deliverPrizeDialogOpen, setDeliverPrizeDialogOpen] = useState(false);

  const handleViewCriteria = (programId: string) => {
    const program = recognitionPrograms.find(p => p.id === programId);
    if (program) {
      setSelectedProgram(program);
      setCriteriaModalOpen(true);
    }
  };

  const handleCreateBonus = (bonus: any) => {
    console.log('Nova bonificação criada:', bonus);
    // Here you would typically save to a backend or state management
  };

  const handleDeliverPrize = (prize: any) => {
    console.log('Prêmio entregue:', prize);
    // Here you would typically save to a backend or state management
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
                <span className="font-semibold">Ana Silva</span>
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
                <span className="font-semibold">Carlos Santos</span>
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
                <span className="font-semibold">Maria Oliveira</span>
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

      {/* Ranking Table */}
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
                <TableHead>Unidade</TableHead>
                <TableHead>Fideliza+</TableHead>
                <TableHead>Matriculador+</TableHead>
                <TableHead>Professor+</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRanking.map((person, index) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                      {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                      {index === 2 && <Medal className="w-4 h-4 text-yellow-600" />}
                      <span className="font-bold">{index + 1}º</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>{person.unit}</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">
                      {person.fideliza} ⭐
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      {person.matriculador} 📚
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-800">
                      {person.professor} ⭐
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
                achievement: '5 matrículas em uma semana',
                program: 'Matriculador+',
                points: 15,
                date: '2024-03-14'
              },
              {
                employee: 'Luana de Menezes Vieira',
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
