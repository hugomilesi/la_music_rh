
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Plus, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import { useBenefits } from '@/contexts/BenefitsContext';
import { NewBenefitDialog } from '@/components/benefits/NewBenefitDialog';
import { BenefitDetailsModal } from '@/components/benefits/BenefitDetailsModal';
import { EditBenefitDialog } from '@/components/benefits/EditBenefitDialog';
import { EnrollmentModal } from '@/components/benefits/EnrollmentModal';
import { BenefitStatsModal } from '@/components/benefits/BenefitStatsModal';
import { Benefit } from '@/types/benefits';

const BenefitsPage: React.FC = () => {
  const { benefits, stats, deleteBenefit } = useBenefits();
  const [showNewBenefitDialog, setShowNewBenefitDialog] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const handleViewDetails = (benefit: Benefit) => {
    setSelectedBenefit(benefit);
    setShowDetailsModal(true);
  };

  const handleEditBenefit = (benefit: Benefit) => {
    setSelectedBenefit(benefit);
    setShowEditDialog(true);
  };

  const handleEnrollEmployee = (benefit: Benefit) => {
    setSelectedBenefit(benefit);
    setShowEnrollmentModal(true);
  };

  const handleDeleteBenefit = (benefitId: string) => {
    if (confirm('Tem certeza que deseja excluir este benefício?')) {
      deleteBenefit(benefitId);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      health: 'bg-red-100 text-red-800',
      dental: 'bg-blue-100 text-blue-800',
      food: 'bg-green-100 text-green-800',
      transport: 'bg-yellow-100 text-yellow-800',
      education: 'bg-purple-100 text-purple-800',
      life: 'bg-gray-100 text-gray-800',
      other: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Benefícios</h1>
          <p className="text-gray-600">Gerencie planos e benefícios dos colaboradores</p>
        </div>
        <Button onClick={() => setShowNewBenefitDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Benefício
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowStatsModal(true)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Benefícios</p>
                <p className="text-2xl font-bold">{stats.totalBenefits}</p>
              </div>
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowStatsModal(true)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Benefícios Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeBenefits}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowStatsModal(true)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inscrições Ativas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEnrollments}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowStatsModal(true)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Benefícios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {benefits.map((benefit) => (
              <Card key={benefit.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{benefit.name}</h3>
                      <Badge className={getCategoryColor(benefit.type.category)}>
                        {benefit.type.name}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">{benefit.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span>R$ {benefit.value.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Max: {benefit.maxBeneficiaries}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={benefit.isActive ? "default" : "secondary"}>
                        {benefit.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <span className="text-xs text-gray-500">{benefit.provider}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(benefit)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditBenefit(benefit)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEnrollEmployee(benefit)}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBenefit(benefit.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {benefits.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Nenhum benefício cadastrado</p>
              <Button
                className="mt-4"
                onClick={() => setShowNewBenefitDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Benefício
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <NewBenefitDialog
        open={showNewBenefitDialog}
        onOpenChange={setShowNewBenefitDialog}
      />

      {selectedBenefit && (
        <>
          <BenefitDetailsModal
            open={showDetailsModal}
            onOpenChange={setShowDetailsModal}
            benefit={selectedBenefit}
          />
          
          <EditBenefitDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            benefit={selectedBenefit}
          />
          
          <EnrollmentModal
            open={showEnrollmentModal}
            onOpenChange={setShowEnrollmentModal}
            benefit={selectedBenefit}
          />
        </>
      )}

      <BenefitStatsModal
        open={showStatsModal}
        onOpenChange={setShowStatsModal}
      />
    </div>
  );
};

export default BenefitsPage;
