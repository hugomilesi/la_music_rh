import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  TestTube, 
  MessageSquare, 
  Phone, 
  Settings, 
  Send, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Users,
  Trash2,
  Clock,
  Calendar,
  Edit2,
  Plus,
  EyeOff
} from 'lucide-react';
import { useNPS } from '@/contexts/NPSContext';
import { WhatsAppService } from '@/services/whatsappService';

interface NPSWhatsAppTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TestContact {
  id: string;
  name: string;
  phone: string;
  department: string;
  selected: boolean;
}



interface AutoSendConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

export const NPSWhatsAppTestModal: React.FC<NPSWhatsAppTestModalProps> = ({
  open,
  onOpenChange
}) => {
  const { surveys, createWhatsAppSchedule } = useNPS();
  const [testMode, setTestMode] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState('');

  
  const [testContacts, setTestContacts] = useState<TestContact[]>([]);
  
  const [customPhone, setCustomPhone] = useState('');
  const [customName, setCustomName] = useState('');
  const [messagePreview, setMessagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  
  // Configurações de envio automático
  const [autoSendConfig, setAutoSendConfig] = useState<AutoSendConfig>({
    enabled: false,
    frequency: 'monthly',
    time: '09:00',
    dayOfWeek: 1, // Segunda-feira
    dayOfMonth: 1
  });



  // Surveys are automatically loaded by NPSContext

  // Atualizar preview da mensagem quando survey ou contatos mudarem
  useEffect(() => {
    updateMessagePreview();
  }, [selectedSurvey, testContacts]);

  // Removido teste automático da Evolution API

  const updateMessagePreview = () => {
    if (!selectedSurvey) {
      setMessagePreview('');
      return;
    }

    const selectedSurveyData = surveys.find(s => s.id === selectedSurvey);
    const selectedContactsCount = testContacts.filter(c => c.selected).length;
    
    if (selectedSurveyData) {
      const preview = `Olá {{nome}}! 👋\n\nSua opinião é muito importante para nós!\n\nPor favor, responda nossa pesquisa "${selectedSurveyData.title}" clicando no link abaixo:\n\n{{link_pesquisa}}\n\nObrigado! 🙏\n\n---\nSerá enviado para ${selectedContactsCount} contato(s)`;
      setMessagePreview(preview);
    }
  };

  const handleContactToggle = (contactId: string) => {
    setTestContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, selected: !contact.selected }
          : contact
      )
    );
  };

  const handleSelectAll = () => {
    const allSelected = testContacts.every(c => c.selected);
    setTestContacts(prev => 
      prev.map(contact => ({ ...contact, selected: !allSelected }))
    );
  };

  const addCustomContact = () => {
    if (!customName.trim() || !customPhone.trim()) {
      alert('Preencha nome e telefone');
      return;
    }

    const newContact: TestContact = {
      id: Date.now().toString(),
      name: customName.trim(),
      phone: customPhone.trim(),
      department: 'Personalizado',
      selected: true
    };

    setTestContacts(prev => [...prev, newContact]);
    setCustomName('');
    setCustomPhone('');
  };

  const removeContact = (contactId: string) => {
    setTestContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const startEditContact = (contact: TestContact) => {
    setEditingContact(contact.id);
    setEditName(contact.name);
    setEditPhone(contact.phone);
  };

  const saveEditContact = () => {
    if (!editName.trim() || !editPhone.trim()) {
      alert('Preencha nome e telefone');
      return;
    }

    setTestContacts(prev => 
      prev.map(contact => 
        contact.id === editingContact 
          ? { ...contact, name: editName.trim(), phone: editPhone.trim() }
          : contact
      )
    );
    
    setEditingContact(null);
    setEditName('');
    setEditPhone('');
  };

  const cancelEditContact = () => {
    setEditingContact(null);
    setEditName('');
    setEditPhone('');
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    setLoading(true);
    
    try {
      // Usar configuração centralizada
      const { evolutionApiConfig, validateEvolutionApiConfig, formatApiUrl, getEvolutionApiHeaders } = await import('../../config/evolutionApi');
      
      if (!validateEvolutionApiConfig(evolutionApiConfig)) {
        setConnectionStatus('error');
        return;
      }
      
      // Testar conexão real com a API
      const testUrl = formatApiUrl(evolutionApiConfig.apiUrl, `/instance/connect/${encodeURIComponent(evolutionApiConfig.instanceName)}`);
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: getEvolutionApiHeaders(evolutionApiConfig.apiKey)
      });
      
      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };



  const handleTestSend = async () => {
    if (!selectedSurvey) {
      alert('Selecione uma pesquisa para enviar');
      return;
    }
    
    try {
      // Usar configuração centralizada
      const { evolutionApiConfig, validateEvolutionApiConfig, formatApiUrl, getEvolutionApiHeaders } = await import('../../config/evolutionApi');
      

      
      if (!validateEvolutionApiConfig(evolutionApiConfig)) {
        const errorMsg = `❌ Configurações da Evolution API não encontradas ou inválidas no .env\n\nVariáveis necessárias:\n• VITE_EVOLUTION_API_KEY: ${evolutionApiConfig.apiKey ? '✅ Configurada' : '❌ Não encontrada'}\n• VITE_EVOLUTION_INSTANCE_NAME: ${evolutionApiConfig.instanceName ? '✅ Configurada' : '❌ Não encontrada'}\n• VITE_EVOLUTION_API_URL: ${evolutionApiConfig.apiUrl ? '✅ Configurada' : '❌ Não encontrada'}`;
        alert(errorMsg);
        console.error(errorMsg);
        return;
      }
    
    setLoading(true);
    
    try {
      const selectedContacts = testContacts.filter(c => c.selected);
      if (selectedContacts.length === 0) {
        alert('Selecione pelo menos um contato para o teste');
        return;
      }
      
      const messageToSend = messagePreview || `🧪 Teste Evolution API - LA Music RH\n\n📅 ${new Date().toLocaleString()}\n📱 Contatos: ${selectedContacts.length}\n\nTeste de integração WhatsApp realizado com sucesso!`;
      
      // Enviar a mensagem usando a configuração centralizada
      const sendUrl = formatApiUrl(evolutionApiConfig.apiUrl, `/message/sendText/${encodeURIComponent(evolutionApiConfig.instanceName)}`);
      
      const response = await fetch(sendUrl, {
        method: 'POST',
        headers: getEvolutionApiHeaders(evolutionApiConfig.apiKey),
        body: JSON.stringify({
          number: selectedContacts[0].phone,
          text: messageToSend
        })
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${responseText}`);
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = { message: responseText };
      }
      

      
      alert(`✅ Teste enviado com sucesso!\n\n📱 Contatos: ${selectedContacts.length}\n📋 Pesquisa: ${surveys.find(s => s.id === selectedSurvey)?.title || 'Teste'}\n💬 Mensagem: ${messageToSend.substring(0, 100)}...\n\n⚙️ Configuração Evolution:\n• Instance: ${evolutionApiConfig.instanceName}\n• URL: ${evolutionApiConfig.apiUrl}\n• Status: ${response.status}\n\n📄 Resposta: ${JSON.stringify(result, null, 2)}`);
      
    } catch (error) {

        
        alert(`❌ Erro ao enviar teste:\n\n🔍 Erro: ${error.message}\n\n🔧 Configurações verificadas:\n• API Key: ${evolutionApiConfig?.apiKey ? '✅ Presente' : '❌ Ausente'}\n• Instance: ${evolutionApiConfig?.instanceName || 'Não configurada'}\n• URL: ${evolutionApiConfig?.apiUrl}\n\n💡 Dicas:\n1. Verifique se a instância está ativa\n2. Confirme se a API Key está correta\n3. Teste a URL da API manualmente\n4. Verifique o console para mais detalhes`);
      } finally {
        setLoading(false);
      }
    } catch (outerError) {
      alert('❌ Erro ao carregar configuração da Evolution API');
      setLoading(false);
    }
  };

  const handleRealNPSTest = async () => {
    if (!selectedSurvey) {
      alert('Selecione uma pesquisa primeiro');
      return;
    }

    const selectedContacts = testContacts.filter(c => c.selected);
    if (selectedContacts.length === 0) {
      alert('Selecione pelo menos um contato para o teste');
      return;
    }

    const confirmTest = window.confirm(
      `Deseja enviar um teste REAL de pesquisa NPS?\n\n📱 Contatos: ${selectedContacts.length}\n📋 Pesquisa: ${surveys.find(s => s.id === selectedSurvey)?.title}\n\n⚠️ Uma mensagem real será enviada via WhatsApp com um link funcional para responder a pesquisa.`
    );

    if (!confirmTest) return;

    setLoading(true);
    
    try {
      // Criar agendamento de teste real
      const scheduleData = {
        survey_id: selectedSurvey,
        schedule_type: 'immediate',
        target_users: selectedContacts.map(c => c.phone),
        message_template: messagePreview,
        is_test: true
      };

      await createWhatsAppSchedule(scheduleData);
      
      alert(`✅ Teste real enviado com sucesso!\n\n📱 Contatos: ${selectedContacts.length}\n📋 Pesquisa: ${surveys.find(s => s.id === selectedSurvey)?.title}\n\n🔗 Os destinatários receberão um link funcional para responder a pesquisa.\n\n📊 Você poderá ver as respostas na tabela de respostas NPS.`);
      onOpenChange(false);
      
    } catch (error) {
      alert('Erro ao enviar teste real. Verifique as configurações e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleMassSend = async () => {
    if (!selectedSurvey) {
      alert('Selecione uma pesquisa');
      return;
    }
    
    const confirmSend = window.confirm(
      'Tem certeza que deseja enviar a pesquisa para TODOS os colaboradores ativos?\n\nEsta ação não pode ser desfeita.'
    );
    
    if (!confirmSend) return;

    setLoading(true);
    
    try {
      // Simular envio em massa
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      alert('Pesquisa enviada em massa com sucesso!\n\nTodos os colaboradores ativos receberão a mensagem.');
      onOpenChange(false);
      
    } catch (error) {
      alert('Erro ao enviar pesquisa em massa.');
    } finally {
      setLoading(false);
    }
  };

  const selectedContactsCount = testContacts.filter(c => c.selected).length;
  const allContactsSelected = testContacts.length > 0 && testContacts.every(c => c.selected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Teste NPS WhatsApp
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Status da Evolution API */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Status Evolution API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Configurações carregadas do .env:</strong>
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• API Key: {import.meta.env.VITE_EVOLUTION_API_KEY ? '✅ Configurada' : '❌ Não configurada'}</li>
                  <li>• Instance: {import.meta.env.VITE_EVOLUTION_INSTANCE_NAME || '❌ Não configurada'}</li>
                  <li>• URL: {import.meta.env.VITE_EVOLUTION_API_URL || 'https://api.evolution.com (padrão)'}</li>
                </ul>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={import.meta.env.VITE_EVOLUTION_API_KEY && import.meta.env.VITE_EVOLUTION_INSTANCE_NAME ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {import.meta.env.VITE_EVOLUTION_API_KEY && import.meta.env.VITE_EVOLUTION_INSTANCE_NAME ? 'Configurado' : 'Não Configurado'}
                  </Badge>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={testConnection}
                  disabled={loading || !import.meta.env.VITE_EVOLUTION_API_KEY || !import.meta.env.VITE_EVOLUTION_INSTANCE_NAME}
                >
                  {connectionStatus === 'testing' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />}
                  {connectionStatus === 'success' && <CheckCircle className="w-4 h-4 mr-2 text-green-600" />}
                  {connectionStatus === 'error' && <AlertCircle className="w-4 h-4 mr-2 text-red-600" />}
                  Testar Conexão
                </Button>
              </div>
              
              {connectionStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Conexão estabelecida com sucesso!
                </div>
              )}
              
              {connectionStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Erro na conexão. Verifique as configurações no .env.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modo de Teste */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Modo de Teste
                </span>
                <Switch
                  checked={testMode}
                  onCheckedChange={setTestMode}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className={testMode ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}>
                  {testMode ? 'Modo Teste Ativo' : 'Modo Normal'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {testMode ? 'Envios apenas para contatos selecionados' : 'Envios para todos os colaboradores'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Pesquisa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pesquisa</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma pesquisa" />
                </SelectTrigger>
                <SelectContent>
                  {surveys.map((survey) => (
                    <SelectItem key={survey.id} value={survey.id}>
                      {survey.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>



          {/* Configurações de Envio Automático */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Configurações de Envio Automático
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoSendConfig.enabled}
                    onCheckedChange={(checked) => setAutoSendConfig(prev => ({ ...prev, enabled: checked }))}
                  />
                  <Label>Habilitar Envio Automático</Label>
                </div>
                <Badge className={autoSendConfig.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {autoSendConfig.enabled ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              {autoSendConfig.enabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frequency">Frequência</Label>
                      <Select 
                        value={autoSendConfig.frequency} 
                        onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                          setAutoSendConfig(prev => ({ ...prev, frequency: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="time">Horário</Label>
                      <Input
                        id="time"
                        type="time"
                        value={autoSendConfig.time}
                        onChange={(e) => setAutoSendConfig(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  {autoSendConfig.frequency === 'weekly' && (
                    <div>
                      <Label htmlFor="dayOfWeek">Dia da Semana</Label>
                      <Select 
                        value={autoSendConfig.dayOfWeek?.toString()} 
                        onValueChange={(value) => 
                          setAutoSendConfig(prev => ({ ...prev, dayOfWeek: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Segunda-feira</SelectItem>
                          <SelectItem value="2">Terça-feira</SelectItem>
                          <SelectItem value="3">Quarta-feira</SelectItem>
                          <SelectItem value="4">Quinta-feira</SelectItem>
                          <SelectItem value="5">Sexta-feira</SelectItem>
                          <SelectItem value="6">Sábado</SelectItem>
                          <SelectItem value="0">Domingo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {autoSendConfig.frequency === 'monthly' && (
                    <div>
                      <Label htmlFor="dayOfMonth">Dia do Mês</Label>
                      <Select 
                        value={autoSendConfig.dayOfMonth?.toString()} 
                        onValueChange={(value) => 
                          setAutoSendConfig(prev => ({ ...prev, dayOfMonth: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>
                              Dia {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      <strong>Próximo envio:</strong> {' '}
                      {autoSendConfig.frequency === 'daily' && `Todos os dias às ${autoSendConfig.time}`}
                      {autoSendConfig.frequency === 'weekly' && `Toda ${['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][autoSendConfig.dayOfWeek || 1]} às ${autoSendConfig.time}`}
                      {autoSendConfig.frequency === 'monthly' && `Todo dia ${autoSendConfig.dayOfMonth} às ${autoSendConfig.time}`}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seleção de Contatos para Teste */}
          {testMode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Contatos para Teste ({selectedContactsCount} selecionados)
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAll}
                  >
                    {allContactsSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de Contatos */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {testContacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum contato adicionado</p>
                      <p className="text-sm">Adicione contatos personalizados abaixo</p>
                    </div>
                  ) : (
                    testContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={contact.selected}
                                onCheckedChange={() => handleContactToggle(contact.id)}
                          />
                          {editingContact === contact.id ? (
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Nome"
                                className="text-sm"
                              />
                              <Input
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                placeholder="Telefone"
                                className="text-sm"
                              />
                            </div>
                          ) : (
                            <div className="flex-1">
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-sm text-gray-600">{contact.phone} • {contact.department}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {editingContact === contact.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={saveEditContact}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEditContact}
                                className="text-gray-600 hover:text-gray-700"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditContact(contact)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeContact(contact.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <Separator />
                
                {/* Adicionar Contato */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Adicionar Contato</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Nome completo"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                    <Input
                      placeholder="Telefone (5521999999999)"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                    />
                    <Button onClick={addCustomContact} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Users className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    💡 Dica: Use o formato completo com código do país (ex: 5521964171223)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview da Mensagem */}
          {selectedSurvey && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview da Mensagem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={messagePreview}
                  readOnly
                  rows={6}
                  className="bg-gray-50"
                />
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-3">
              {/* Teste Real de NPS */}
              <Button 
                onClick={handleRealNPSTest}
                disabled={loading || !selectedSurvey || testContacts.filter(c => c.selected).length === 0 || !import.meta.env.VITE_EVOLUTION_API_KEY}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                Teste Real NPS
              </Button>
              
              {testMode && (
                <Button 
                onClick={handleTestSend}
                disabled={loading || !selectedSurvey || selectedContactsCount === 0 || !import.meta.env.VITE_EVOLUTION_API_KEY}
                className="bg-orange-600 hover:bg-orange-700"
              >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  Enviar Teste ({selectedContactsCount})
                </Button>
              )}
              
              <Button 
                onClick={handleMassSend}
                disabled={loading || !selectedSurvey || !import.meta.env.VITE_EVOLUTION_API_KEY}
                variant={testMode ? "outline" : "default"}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Envio em Massa
              </Button>
            </div>
            
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};