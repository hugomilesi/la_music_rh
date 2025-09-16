import React, { useState, useEffect } from 'react';
import { useMessageScheduler, MessageSchedule, CreateScheduleParams } from '../hooks/useMessageScheduler';
import { useUsers } from '../hooks/useUsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Send,
  X,
  Eye,
  Save,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  Mail,
  Phone,
  Loader2,
  Plus,
  Trash2,
  Bell
} from 'lucide-react';

interface UnifiedSchedulerProps {
  defaultType?: 'notification' | 'nps' | 'whatsapp' | 'email';
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

const UnifiedScheduler: React.FC<UnifiedSchedulerProps> = ({
  defaultType = 'notification',
  onScheduleCreated,
  onCancel
}) => {
  const {
    createSchedule,
    loading,
    error,
    permissions,
    canManageType,
    clearError
  } = useMessageScheduler();
  
  const { users, fetchUsers } = useUsers();

  // Estado do formulário
  const [formData, setFormData] = useState<CreateScheduleParams>({
    type: defaultType,
    title: '',
    description: '',
    content: {},
    target_users: [],
    schedule_type: 'immediate',
    scheduled_for: undefined,
    recurrence_pattern: undefined
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

  // Limpar erros quando o tipo muda
  useEffect(() => {
    clearError();
    setValidationErrors({});
  }, [formData.type, clearError]);

  // Função para validar formulário
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Título é obrigatório';
    }

    if (formData.target_users.length === 0) {
      errors.target_users = 'Selecione pelo menos um destinatário';
    }

    if (formData.schedule_type === 'immediate' && formData.scheduled_for) {
      const scheduledDate = new Date(formData.scheduled_for);
      if (scheduledDate <= new Date()) {
        errors.scheduled_for = 'Data deve ser no futuro';
      }
    }

    // Validações específicas por tipo
    switch (formData.type) {
      case 'notification':
        if (!formData.content.message?.trim()) {
          errors.message = 'Mensagem é obrigatória';
        }
        break;
      case 'nps':
        if (!formData.content.survey_id) {
          errors.survey_id = 'Pesquisa NPS é obrigatória';
        }
        break;
      case 'whatsapp':
        if (!formData.content.message?.trim()) {
          errors.message = 'Mensagem é obrigatória';
        }
        break;
      case 'email':
        if (!formData.content.body?.trim()) {
          errors.body = 'Corpo do email é obrigatório';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Função para atualizar campo do formulário
  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para atualizar conteúdo específico do tipo
  const updateContent = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  // Função para adicionar usuários selecionados
  const handleAddUsers = (users: User[]) => {
    const userIds = users.map(u => u.id);
    setFormData(prev => ({
      ...prev,
      target_users: [...new Set([...prev.target_users, ...userIds])]
    }));
    setSelectedUsers(prev => [...prev, ...users.filter(u => !prev.find(p => p.id === u.id))]);
    setShowUserSelector(false);
  };

  // Função para remover usuário
  const handleRemoveUser = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      target_users: prev.target_users.filter(id => id !== userId)
    }));
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Função para enviar formulário
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const scheduleId = await createSchedule(formData);
    if (scheduleId) {
      onScheduleCreated?.(scheduleId);
      // Reset form
      setFormData({
        type: defaultType,
        title: '',
        description: '',
        content: {},
        target_users: [],
        schedule_type: 'immediate',
        scheduled_for: undefined,
        recurrence_pattern: undefined
      });
      setSelectedUsers([]);
    }
  };

  if (!permissions) {
    return (
      <Card>
        <CardContent>
          <p>Carregando permissões...</p>
        </CardContent>
      </Card>
    );
  }

  if (!canManageType(formData.type)) {
    return (
      <Card>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            Você não tem permissão para criar agendamentos do tipo {formData.type}.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Agendamento Unificado
          </CardTitle>
          <CardDescription>
            Configure e agende mensagens para seus usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Tipo de Agendamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipo de Agendamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.type}
                onValueChange={(value) => updateFormField('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notification">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notificação
                    </div>
                  </SelectItem>
                  <SelectItem value="nps">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Pesquisa NPS
                    </div>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      WhatsApp
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Digite o título do agendamento"
                  value={formData.title}
                  onChange={(e) => updateFormField('title', e.target.value)}
                  className={validationErrors.title ? 'border-red-500' : ''}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-500">{validationErrors.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Digite uma descrição (opcional)"
                  value={formData.description}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Destinatários */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Destinatários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} usuário(s) selecionado(s)
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUserSelector(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Usuários
                </Button>
              </div>
              
              {selectedUsers.length > 0 && (
                <div className="space-y-2">
                  {selectedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {validationErrors.target_users && (
                <p className="text-sm text-red-500">{validationErrors.target_users}</p>
              )}
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Agendamento
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Seleção de Usuários */}
      <Dialog open={showUserSelector} onOpenChange={setShowUserSelector}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Selecionar Destinatários
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto border rounded-md">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 border-b last:border-b-0">
                  <Checkbox
                    id={`modal-user-${user.id}`}
                    checked={selectedUsers.some(u => u.id === user.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers(prev => [...prev, user]);
                      } else {
                        setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
                      }
                    }}
                  />
                  <Label htmlFor={`modal-user-${user.id}`} className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.role && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {user.role}
                        </Badge>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-sm text-gray-500">
                {selectedUsers.length} usuário(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUserSelector(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={() => handleAddUsers(selectedUsers)}
                >
                  Adicionar Selecionados
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnifiedScheduler;