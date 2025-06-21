
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, AlertTriangle, Users, Clock } from 'lucide-react';
import { useVacation } from '@/contexts/VacationContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { NewVacationDialog } from '@/components/vacation/NewVacationDialog';
import { VacationRequestsList } from '@/components/vacation/VacationRequestsList';
import { VacationCalendar } from '@/components/vacation/VacationCalendar';
import { VacationAlerts } from '@/components/vacation/VacationAlerts';
import { VacationStats } from '@/components/vacation/VacationStats';

const VacationPage = () => {
  const [showNewVacationDialog, setShowNewVacationDialog] = useState(false);
  
  // Add error handling for contexts
  const vacation = useVacation();
  const employees = useEmployees();

  useEffect(() => {
    console.log('VacationPage mounted');
    console.log('Vacation context:', vacation);
    console.log('Employees context:', employees);
  }, [vacation, employees]);

  if (!vacation) {
    console.error('Vacation context not available');
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro: Contexto de férias não está disponível. Verifique se o VacationProvider está configurado.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!employees) {
    console.error('Employee context not available');
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro: Contexto de colaboradores não está disponível. Verifique se o EmployeeProvider está configurado.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { 
    getActiveVacations, 
    getPendingRequests, 
    vacationAlerts 
  } = vacation;

  let activeVacations, pendingRequests;
  
  try {
    activeVacations = getActiveVacations();
    pendingRequests = getPendingRequests();
    console.log('Active vacations:', activeVacations);
    console.log('Pending requests:', pendingRequests);
  } catch (error) {
    console.error('Error getting vacation data:', error);
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados de férias. Tente recarregar a página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Férias</h1>
          <p className="text-gray-600 mt-1">
            Gerencie solicitações de férias e acompanhe o saldo dos colaboradores
          </p>
        </div>
        <Button onClick={() => setShowNewVacationDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Solicitação
        </Button>
      </div>

      {/* Stats Cards */}
      <VacationStats />

      {/* Alerts */}
      {vacationAlerts && vacationAlerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você tem {vacationAlerts.length} alertas de férias que requerem atenção.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Solicitações
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alertas
            {vacationAlerts && vacationAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {vacationAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <VacationRequestsList />
        </TabsContent>

        <TabsContent value="calendar">
          <VacationCalendar />
        </TabsContent>

        <TabsContent value="alerts">
          <VacationAlerts />
        </TabsContent>
      </Tabs>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Colaboradores em Férias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!activeVacations || activeVacations.length === 0 ? (
              <p className="text-gray-500">Nenhum colaborador em férias no momento</p>
            ) : (
              <div className="space-y-2">
                {activeVacations.map((vacation) => (
                  <div key={vacation.id} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="font-medium">{vacation.employeeName}</span>
                    <span className="text-sm text-gray-600">
                      {vacation.startDate} - {vacation.endDate}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Pendentes de Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!pendingRequests || pendingRequests.length === 0 ? (
              <p className="text-gray-500">Nenhuma solicitação pendente</p>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="font-medium">{request.employeeName}</span>
                    <Badge variant="outline">
                      {request.days} dias
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <NewVacationDialog 
        open={showNewVacationDialog}
        onOpenChange={setShowNewVacationDialog}
      />
    </div>
  );
};

export default VacationPage;
