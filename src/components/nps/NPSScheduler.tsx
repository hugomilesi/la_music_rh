import React, { useState, useEffect } from 'react';
import { useNPS } from '@/contexts/NPSContext';
import { useMessageScheduler, CreateScheduleParams } from '@/hooks/useMessageScheduler';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Send,
  X,
  Eye,
  Save,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  Loader2,
  Plus,
  Trash2,
  Bell,
  FileText,
  Target
} from 'lucide-react';
import { NPSSurvey } from '@/types/nps';

interface NPSSchedulerProps {
  onScheduleCreated?: (scheduleId: string) => void;
  onCancel?: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role?: string;
}

const NPSScheduler: React.FC<NPSSchedulerProps> = ({
  onScheduleCreated,
  onCancel
}) => {
  const { surveys, departments } = useNPS();
  const {
    createSchedule,
    loading,
    error,
    clearError
  } = useMessageScheduler();
  const { users, fetchUsers } = useUsers();

  // Estado do formulário específico para NPS
  const [formData, setFormData] = useState({
    selectedSurvey: '',
    title: '',
    description: '',
    targetDepartments: [] as string[],
    targetUsers: [] as string[],
    scheduleType: 'immediate' as 'immediate' | 'scheduled' | 'recurring',
    scheduledFor: '',
    recurrencePattern: '',
    sendViaWhatsApp: true,
    includeLink: true,
    customMessage: ''
  });

  // Estados de UI
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Carregar usuários ao montar o componente
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Limpar erros quando dados mudam
  useEffect(() => {
    if (formData.selectedSurvey) {
      clearError();
      setValidationErrors({});
    }
  }, [formData.selectedSurvey, clearError]);

  // Função para validar se uma string é um UUID válido
  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Função para validar formulário
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.selectedSurvey) {
      errors.selectedSurvey = 'Selecione uma pesquisa NPS';
    }

    if (!formData.title.trim()) {
      errors.title = 'Título é obrigatório';
    }

    if (formData.scheduleType === 'scheduled' && !formData.scheduledFor) {
      errors.scheduledFor = 'Data e hora são obrigatórias para agendamento';
    }

    if (formData.scheduleType === 'recurring' && !formData.recurrencePattern) {
      errors.recurrencePattern = 'Padrão de recorrência é obrigatório';
    }

    if (formData.targetDepartments.length === 0 && formData.targetUsers.length === 0) {
      errors.target = 'Selecione pelo menos um departamento ou usuário';
    }

    // Validar se todos os IDs de usuário são UUIDs válidos
    const invalidUserIds = formData.targetUsers.filter(userId => !isValidUUID(userId));
    if (invalidUserIds.length > 0) {
      errors.targetUsers = `IDs de usuário inválidos encontrados: ${invalidUserIds.join(', ')}. Apenas UUIDs válidos são aceitos.`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Função para gerar mensagem automática
  const generateMessage = (survey: NPSSurvey | undefined): string => {
    if (!survey) return '';
    
    const baseMessage = `Olá! Você foi convidado(a) para participar da pesquisa "${survey.title}".`;
    const linkMessage = formData.includeLink ? ' Clique no link para responder: [LINK_DA_PESQUISA]' : '';
    const customPart = formData.customMessage ? `\n\n${formData.customMessage}` : '';
    
    return `${baseMessage}${linkMessage}${customPart}`;
  };

  // Função para obter pesquisa selecionada
  const getSelectedSurvey = (): NPSSurvey | undefined => {
    return surveys.find(s => s.id === formData.selectedSurvey);
  };

  // Função para lidar com seleção de departamentos
  const handleDepartmentToggle = (departmentId: string) => {
    setFormData(prev => ({
      ...prev,
      targetDepartments: prev.targetDepartments.includes(departmentId)
        ? prev.targetDepartments.filter(id => id !== departmentId)
        : [...prev.targetDepartments, departmentId]
    }));
  };

  // Função para lidar com seleção de usuários
  const handleUserToggle = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setFormData(prev => ({
      ...prev,
      targetUsers: prev.targetUsers.includes(userId)
        ? prev.targetUsers.filter(id => id !== userId)
        : [...prev.targetUsers, userId]
    }));

    setSelectedUsers(prev => 
      prev.find(u => u.id === userId)
        ? prev.filter(u => u.id !== userId)
        : [...prev, user]
    );
  };

  // Função para submeter o formulário
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const selectedSurvey = getSelectedSurvey();
    if (!selectedSurvey) return;

    try {
      const scheduleParams: CreateScheduleParams = {
        type: 'nps',
        title: formData.title,
        description: formData.description,
        content: {
          survey_id: selectedSurvey.id,
          survey_title: selectedSurvey.title,
          message: generateMessage(selectedSurvey),
          send_via_whatsapp: formData.sendViaWhatsApp,
          include_link: formData.includeLink,
          custom_message: formData.customMessage
        },
        target_users: formData.targetUsers,
        schedule_type: formData.scheduleType,
        scheduled_for: formData.scheduleType === 'scheduled' ? new Date(formData.scheduledFor) : undefined,
        recurrence_pattern: formData.scheduleType === 'recurring' ? formData.recurrencePattern : undefined,
        target_filters: {
          departments: formData.targetDepartments
        }
      };

      const scheduleId = await createSchedule(scheduleParams);
      
      if (onScheduleCreated) {
        onScheduleCreated(scheduleId);
      }

      // Reset form
      setFormData({
        selectedSurvey: '',
        title: '',
        description: '',
        targetDepartments: [],
        targetUsers: [],
        scheduleType: 'immediate',
        scheduledFor: '',
        recurrencePattern: '',
        sendViaWhatsApp: true,
        includeLink: true,
        customMessage: ''
      });
      setSelectedUsers([]);
      
    } catch (error) {
      // Erro será tratado pelo hook useMessageScheduler
    }
  };

  const selectedSurvey = getSelectedSurvey();

  return (
    <div className="space-y-6">
      {/* Seleção de Pesquisa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Selecionar Pesquisa NPS
          </CardTitle>
          <CardDescription>
            Escolha uma pesquisa existente para enviar aos colaboradores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="survey-select">Pesquisa Disponível</Label>
            <Select
              value={formData.selectedSurvey}
              onValueChange={(value) => setFormData(prev => ({ ...prev, selectedSurvey: value }))}
            >
              <SelectTrigger className={validationErrors.selectedSurvey ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione uma pesquisa..." />
              </SelectTrigger>
              <SelectContent>
                {surveys.filter(s => s.status === 'active').map((survey) => (
                  <SelectItem key={survey.id} value={survey.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{survey.title}</span>
                      <span className="text-sm text-gray-500">
                        {survey.survey_type === 'nps' ? 'NPS' : 'Satisfação'} • 
                        {survey.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.selectedSurvey && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.selectedSurvey}</p>
            )}
          </div>

          {selectedSurvey && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Pesquisa selecionada:</strong> {selectedSurvey.title}<br />
                <strong>Tipo:</strong> {selectedSurvey.survey_type === 'nps' ? 'NPS' : 'Satisfação'}<br />
                <strong>Pergunta:</strong> {selectedSurvey.question}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configurações do Agendamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Configurações do Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título do Agendamento</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Pesquisa NPS Mensal"
                className={validationErrors.title ? 'border-red-500' : ''}
              />
              {validationErrors.title && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="schedule-type">Tipo de Agendamento</Label>
              <Select
                value={formData.scheduleType}
                onValueChange={(value: 'immediate' | 'scheduled' | 'recurring') => 
                  setFormData(prev => ({ ...prev, scheduleType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Enviar Agora</SelectItem>
                  <SelectItem value="scheduled">Agendar para Data Específica</SelectItem>
                  <SelectItem value="recurring">Envio Recorrente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o objetivo deste agendamento..."
              rows={3}
            />
          </div>

          {formData.scheduleType === 'scheduled' && (
            <div>
              <Label htmlFor="scheduled-for">Data e Hora</Label>
              <Input
                id="scheduled-for"
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                className={validationErrors.scheduledFor ? 'border-red-500' : ''}
              />
              {validationErrors.scheduledFor && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.scheduledFor}</p>
              )}
            </div>
          )}

          {formData.scheduleType === 'recurring' && (
            <div>
              <Label htmlFor="recurrence">Padrão de Recorrência</Label>
              <Select
                value={formData.recurrencePattern}
                onValueChange={(value) => setFormData(prev => ({ ...prev, recurrencePattern: value }))}
              >
                <SelectTrigger className={validationErrors.recurrencePattern ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a frequência..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.recurrencePattern && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.recurrencePattern}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seleção de Destinatários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Destinatários
          </CardTitle>
          <CardDescription>
            Selecione os departamentos ou usuários específicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationErrors.target && (
            <Alert variant="destructive">
              <AlertDescription>{validationErrors.target}</AlertDescription>
            </Alert>
          )}

          {validationErrors.targetUsers && (
            <Alert variant="destructive">
              <AlertDescription>{validationErrors.targetUsers}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label>Departamentos</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {departments.map((dept) => (
                <div key={dept.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dept-${dept.id}`}
                    checked={formData.targetDepartments.includes(dept.id)}
                    onCheckedChange={() => handleDepartmentToggle(dept.id)}
                  />
                  <Label htmlFor={`dept-${dept.id}`} className="text-sm">
                    {dept.name} ({dept.employeeCount})
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between">
              <Label>Usuários Específicos</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUserSelector(!showUserSelector)}
              >
                <Users className="w-4 h-4 mr-2" />
                {showUserSelector ? 'Ocultar' : 'Selecionar'} Usuários
              </Button>
            </div>

            {showUserSelector && (
              <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={formData.targetUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <Label htmlFor={`user-${user.id}`} className="text-sm flex-1">
                      {user.name} - {user.department}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedUsers.map((user) => (
                  <Badge key={user.id} variant="secondary" className="text-xs">
                    {user.name}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleUserToggle(user.id)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Envio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Configurações de Envio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enviar via WhatsApp</Label>
              <p className="text-sm text-gray-500">Utilizar WhatsApp para envio da pesquisa</p>
            </div>
            <Switch
              checked={formData.sendViaWhatsApp}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendViaWhatsApp: checked }))}
            />
          </div>

          {formData.sendViaWhatsApp && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Incluir Link da Pesquisa</Label>
                  <p className="text-sm text-gray-500">Adicionar link direto para a pesquisa na mensagem</p>
                </div>
                <Switch
                  checked={formData.includeLink}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeLink: checked }))}
                />
              </div>

              <div>
                <Label htmlFor="custom-message">Mensagem Personalizada (Opcional)</Label>
                <Textarea
                  id="custom-message"
                  value={formData.customMessage}
                  onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
                  placeholder="Adicione uma mensagem personalizada..."
                  rows={3}
                />
              </div>

              {selectedSurvey && (
                <div>
                  <Label>Pré-visualização da Mensagem</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm whitespace-pre-wrap">
                      {generateMessage(selectedSurvey)}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        
        <Button
          onClick={() => setPreviewMode(!previewMode)}
          variant="outline"
        >
          <Eye className="w-4 h-4 mr-2" />
          {previewMode ? 'Ocultar' : 'Visualizar'} Resumo
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={loading || !formData.selectedSurvey}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {formData.scheduleType === 'immediate' ? 'Enviar Agora' : 'Criar Agendamento'}
            </>
          )}
        </Button>
      </div>

      {/* Preview */}
      {previewMode && selectedSurvey && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <strong>Pesquisa:</strong> {selectedSurvey.title}
            </div>
            <div>
              <strong>Título:</strong> {formData.title || 'Sem título'}
            </div>
            <div>
              <strong>Tipo:</strong> {
                formData.scheduleType === 'immediate' ? 'Envio Imediato' :
                formData.scheduleType === 'scheduled' ? 'Agendado' : 'Recorrente'
              }
            </div>
            {formData.scheduledFor && (
              <div>
                <strong>Data/Hora:</strong> {new Date(formData.scheduledFor).toLocaleString('pt-BR')}
              </div>
            )}
            <div>
              <strong>Departamentos:</strong> {formData.targetDepartments.length > 0 
                ? departments.filter(d => formData.targetDepartments.includes(d.id)).map(d => d.name).join(', ')
                : 'Nenhum'
              }
            </div>
            <div>
              <strong>Usuários específicos:</strong> {selectedUsers.length > 0 
                ? selectedUsers.map(u => u.name).join(', ')
                : 'Nenhum'
              }
            </div>
            <div>
              <strong>Envio via WhatsApp:</strong> {formData.sendViaWhatsApp ? 'Sim' : 'Não'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default NPSScheduler;