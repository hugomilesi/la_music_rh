
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
  UserPlus,
  Target,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useBenefits } from '@/contexts/BenefitsContext';
import { NewBenefitDialog } from '@/components/benefits/NewBenefitDialog';
import { BenefitDetailsModal } from '@/components/benefits/BenefitDetailsModal';
import { EditBenefitDialog } from '@/components/benefits/EditBenefitDialog';
import { EnrollmentModal } from '@/components/benefits/EnrollmentModal';
import { BenefitStatsModal } from '@/components/benefits/BenefitStatsModal';
import { PerformanceGoalsModal } from '@/components/benefits/PerformanceGoalsModal';
import { RenewalSettingsModal } from '@/components/benefits/RenewalSettingsModal';
import { Benefit } from '@/types/benefits';
import { RenewalManagementModal } from '@/components/benefits/RenewalManagementModal';

const BenefitsPage: React.FC = () => {
  const { 
    benefits, 
    stats, 
    deleteBenefit, 
    updatePerformanceGoals, 
    updateRenewalSettings, 
    checkRenewals,
    approveRenewal,
    denyRenewal,
    extendRenewal
  } = useBenefits();
  const [showNewBenefitDialog, setShowNewBenefitDialog] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPerformanceGoalsModal, setShowPerformanceGoalsModal] = useState(false);
  const [showRenewalSettingsModal, setShowRenewalSettingsModal] = useState(false);
  const [showRenewalManagementModal, setShowRenewalManagementModal] = useState(false);

  const pendingRenewals = checkRenewals();

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

  const handleManageGoals = (benefit: Benefit) => {
    setSelectedBenefit(benefit);
    setShowPerformanceGoalsModal(true);
  };

  const handleRenewalSettings = (benefit: Benefit) => {
    setSelectedBenefit(benefit);
    setShowRenewalSettingsModal(true);
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
      performance: 'bg-orange-100 text-orange-800',
      other: 'bg-slate-100 text-slate-800'
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

      {/* Renewal Alert */}
      {pendingRenewals.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800">Renovações Pendentes</h3>
                <p className="text-orange-700">
                  {pendingRenewals.length} benefício(s) precisam de revisão para renovação
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowRenewalManagementModal(true)}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Gerenciar Renovações
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                <p className="text-sm text-gray-600">Com Metas</p>
                <p className="text-2xl font-bold text-orange-600">{stats.benefitsWithGoals}</p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowStatsModal(true)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-red-600">{stats.pendingRenewals}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
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

                    {/* Feature indicators for all benefits */}
                    <div className="space-y-1">
                      {benefit.performanceGoals && benefit.performanceGoals.length > 0 && (
                        <div className="bg-orange-50 p-2 rounded text-xs">
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-orange-600" />
                            <span className="text-orange-800">
                              {benefit.performanceGoals.length} meta(s) configurada(s)
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {benefit.renewalSettings && (
                        <div className="bg-blue-50 p-2 rounded text-xs">
                          <div className="flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 text-blue-600" />
                            <span className="text-blue-800">
                              Renovação {benefit.renewalSettings.renewalPeriod === 'monthly' ? 'mensal' :
                                        benefit.renewalSettings.renewalPeriod === 'quarterly' ? 'trimestral' :
                                        benefit.renewalSettings.renewalPeriod === 'biannual' ? 'semestral' : 'anual'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={benefit.isActive ? "default" : "secondary"}>
                        {benefit.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <span className="text-xs text-gray-500">{benefit.provider}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 pt-2 border-t">
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
                      {/* Universal features - now available for all benefits */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManageGoals(benefit)}
                        title="Gerenciar Metas"
                      >
                        <Target className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRenewalSettings(benefit)}
                        title="Configurar Renovação"
                      >
                        <RefreshCw className="w-4 h-4" />
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

          {/* Universal modals - now available for all benefits */}
          <PerformanceGoalsModal
            open={showPerformanceGoalsModal}
            onOpenChange={setShowPerformanceGoalsModal}
            benefitId={selectedBenefit.id}
            goals={selectedBenefit.performanceGoals || []}
            onSaveGoals={(goals) => updatePerformanceGoals(selectedBenefit.id, goals)}
          />

          <RenewalSettingsModal
            open={showRenewalSettingsModal}
            onOpenChange={setShowRenewalSettingsModal}
            benefitId={selectedBenefit.id}
            settings={selectedBenefit.renewalSettings}
            onSaveSettings={(settings) => updateRenewalSettings(selectedBenefit.id, settings)}
          />
        </>
      )}

      <BenefitStatsModal
        open={showStatsModal}
        onOpenChange={setShowStatsModal}
      />

      <RenewalManagementModal
        open={showRenewalManagementModal}
        onOpenChange={setShowRenewalManagementModal}
        renewals={pendingRenewals}
        onApproveRenewal={approveRenewal}
        onDenyRenewal={denyRenewal}
        onExtendRenewal={extendRenewal}
      />
    </div>
  );
};

export default BenefitsPage;
