
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, MessageSquare, BarChart, Clock, History, FileText, Calendar, TrendingUp, TestTube } from 'lucide-react';
import { WhatsAppDashboard } from '@/components/whatsapp/WhatsAppDashboard';
import { WhatsAppConfigDialog } from '@/components/whatsapp/WhatsAppConfigDialog';
import { SendMessageDialog } from '@/components/whatsapp/SendMessageDialog';
import { AutomationManager } from '@/components/whatsapp/AutomationManager';
import { WhatsAppIntegration } from '@/components/whatsapp/WhatsAppIntegration';
import { MessageHistory } from '@/components/whatsapp/MessageHistory';

import { WhatsAppReports } from '@/components/whatsapp/WhatsAppReports';
import { TemplateManager } from '@/components/whatsapp/TemplateManager';
import UnifiedScheduler from '@/components/UnifiedScheduler';
import TestController from '@/components/TestController';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import useMessageScheduler from '@/hooks/useMessageScheduler';

const WhatsAppPage: React.FC = () => {
  const { config } = useWhatsApp();
  const { schedules, statistics } = useMessageScheduler();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Business</h1>
          <p className="text-gray-600 mt-1">
            Integração completa e automação de mensagens via WhatsApp
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <WhatsAppConfigDialog>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              {config.isConfigured ? 'Configurações' : 'Configurar API'}
            </Button>
          </WhatsAppConfigDialog>
          
          <SendMessageDialog>
            <Button size="sm" disabled={!config.isConfigured}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Enviar Mensagem
            </Button>
          </SendMessageDialog>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid grid-cols-10 w-full max-w-7xl">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="unified-scheduler" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Agend. Unificado
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Testes
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Agendamento
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Automações
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Integração
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <WhatsAppDashboard />
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <WhatsAppIntegration />
        </TabsContent>

        <TabsContent value="unified-scheduler" className="space-y-6">
          <UnifiedScheduler />
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <TestController />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <MessageHistory />
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agendador Antigo (Legado)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Este agendador foi migrado para o sistema unificado. Use a aba "Agend. Unificado" para novas funcionalidades.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplateManager />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <AutomationManager />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <WhatsAppReports />
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <WhatsAppIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppPage;
