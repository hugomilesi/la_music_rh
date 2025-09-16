
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Filter, Send, Calendar, Mail, MessageSquare, TestTube } from 'lucide-react';
import { NewNotificationDialog } from '@/components/notifications/NewNotificationDialog';

import { EditNotificationDialog } from '@/components/notifications/EditNotificationDialog';
import { EnhancedStatsModal } from '@/components/notifications/EnhancedStatsModal';
import { PerformanceAnalytics } from '@/components/notifications/PerformanceAnalytics';
import { QuickActions } from '@/components/notifications/QuickActions';
import { NotificationDetailsModal } from '@/components/notifications/NotificationDetailsModal';
import UnifiedScheduler from '@/components/UnifiedScheduler';
import TestController from '@/components/TestController';
import { useNotifications } from '@/contexts/NotificationContext';
import useMessageScheduler from '@/hooks/useMessageScheduler';
import { Notification } from '@/types/notification';

const NotificationsPage: React.FC = () => {
  const { notifications, stats, deleteNotification } = useNotifications();
  const { schedules, statistics } = useMessageScheduler();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const handleEditNotification = (notification: Notification) => {
    setEditingNotification(notification);
    setEditDialogOpen(true);
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailsModalOpen(true);
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id);
    setDetailsModalOpen(false);
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      'lembrete': 'bg-blue-100 text-blue-800',
      'aniversario': 'bg-pink-100 text-pink-800',
      'aviso': 'bg-yellow-100 text-yellow-800',
      'comunicado': 'bg-purple-100 text-purple-800',
      'personalizada': 'bg-gray-100 text-gray-800'
    };
    return variants[type as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'enviado': 'bg-green-100 text-green-800',
      'programado': 'bg-blue-100 text-blue-800',
      'rascunho': 'bg-gray-100 text-gray-800',
      'entregue': 'bg-green-100 text-green-800',
      'lido': 'bg-blue-100 text-blue-800',
      'falhado': 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      case 'ambos':
        return <Send className="w-4 h-4" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-600 mt-1">Comunicados, avisos e lembretes para a equipe</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTab('scheduling')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Programar Envio
          </Button>
          
          <NewNotificationDialog>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova Notificação
            </Button>
          </NewNotificationDialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="scheduler">Agendamento</TabsTrigger>
          <TabsTrigger value="test">Testes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <EnhancedStatsModal type="sent">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Enviadas Hoje</p>
                      <p className="text-2xl font-bold">{stats.sentToday}</p>
                      <p className="text-xs text-green-600 mt-1">+12% vs ontem</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Send className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </EnhancedStatsModal>

            <EnhancedStatsModal type="scheduled">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Programadas</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                      <p className="text-xs text-blue-600 mt-1">+5% vs semana passada</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </EnhancedStatsModal>

            <EnhancedStatsModal type="drafts">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Rascunhos</p>
                      <p className="text-2xl font-bold text-gray-600">{stats.drafts}</p>
                      <p className="text-xs text-red-600 mt-1">-8% vs mês passado</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Filter className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </EnhancedStatsModal>

            <EnhancedStatsModal type="openRate">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Taxa de Abertura</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.openRate}%</p>
                      <p className="text-xs text-green-600 mt-1">+3% vs média</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </EnhancedStatsModal>
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-6">
          {/* Unified Scheduler for Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Agendamento Unificado de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UnifiedScheduler defaultType="notification" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          {/* Test Controller for Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Controle de Testes - Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TestController scheduleType="notification" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PerformanceAnalytics />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Notificações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleViewDetails(notification)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{notification.title}</h3>
                        <Badge className={getTypeBadge(notification.type)}>
                          {notification.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Para: {notification.recipientNames.join(', ')}</span>
                        <div className="flex items-center gap-1">
                          {getChannelIcon(notification.channel)}
                          <span>{notification.channel}</span>
                        </div>
                        <span>{new Date(notification.createdAt).toLocaleDateString('pt-BR')}</span>
                        {notification.scheduledFor && (
                          <span>Programado: {new Date(notification.scheduledFor).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusBadge(notification.status)}>
                        {notification.status}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditNotification(notification);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Notification Dialog */}
      <EditNotificationDialog
        notification={editingNotification}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Notification Details Modal */}
      <NotificationDetailsModal
        notification={selectedNotification}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        onEdit={handleEditNotification}
        onDelete={handleDeleteNotification}
      />
    </div>
  );
};

export default NotificationsPage;
