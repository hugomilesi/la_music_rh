
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { FileText, Plus, Edit, Trash2, Copy, Eye, CheckCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MessageTemplate {
  id: string;
  name: string;
  category: 'birthday' | 'meeting' | 'reminder' | 'announcement' | 'custom';
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  requiresApproval: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

const mockTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Aniversário Padrão',
    category: 'birthday',
    subject: 'Parabéns!',
    content: 'Parabéns pelo seu aniversário, {nome}! Desejamos muito sucesso e felicidade! 🎉',
    variables: ['nome'],
    isActive: true,
    requiresApproval: false,
    approvalStatus: 'approved',
    createdBy: 'Admin',
    createdAt: new Date('2024-03-01'),
    lastUsed: new Date('2024-03-21'),
    usageCount: 15
  },
  {
    id: '2',
    name: 'Lembrete de Reunião',
    category: 'meeting',
    subject: 'Lembrete de Reunião',
    content: 'Olá {nome}, lembrete da reunião {tipo} agendada para {data} às {hora}. Local: {local}.',
    variables: ['nome', 'tipo', 'data', 'hora', 'local'],
    isActive: true,
    requiresApproval: true,
    approvalStatus: 'approved',
    createdBy: 'Coordenador',
    createdAt: new Date('2024-03-05'),
    lastUsed: new Date('2024-03-20'),
    usageCount: 8
  },
  {
    id: '3',
    name: 'Comunicado Urgente',
    category: 'announcement',
    subject: 'Comunicado Importante',
    content: 'Atenção: {mensagem}. Para mais informações, entre em contato conosco.',
    variables: ['mensagem'],
    isActive: false,
    requiresApproval: true,
    approvalStatus: 'pending',
    createdBy: 'Manager',
    createdAt: new Date('2024-03-15'),
    usageCount: 0
  }
];

export const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>(mockTemplates);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'custom' as MessageTemplate['category'],
    subject: '',
    content: '',
    variables: [] as string[],
    requiresApproval: false
  });

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e conteúdo do template.",
        variant: "destructive",
      });
      return;
    }

    const variables = extractVariables(formData.content);
    
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id 
          ? {
              ...t,
              ...formData,
              variables,
              approvalStatus: formData.requiresApproval ? 'pending' as const : 'approved' as const
            }
          : t
      ));
      toast({
        title: "Template atualizado",
        description: "O template foi atualizado com sucesso.",
      });
    } else {
      const newTemplate: MessageTemplate = {
        id: Date.now().toString(),
        ...formData,
        variables,
        isActive: true,
        approvalStatus: formData.requiresApproval ? 'pending' : 'approved',
        createdBy: 'Usuário Atual',
        createdAt: new Date(),
        usageCount: 0
      };
      
      setTemplates(prev => [newTemplate, ...prev]);
      toast({
        title: "Template criado",
        description: "O template foi criado com sucesso.",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'custom',
      subject: '',
      content: '',
      variables: [],
      requiresApproval: false
    });
    setEditingTemplate(null);
    setShowNewDialog(false);
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setFormData({
      name: template.name,
      category: template.category,
      subject: template.subject,
      content: template.content,
      variables: template.variables,
      requiresApproval: template.requiresApproval
    });
    setEditingTemplate(template);
    setShowNewDialog(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Template excluído",
      description: "O template foi excluído com sucesso.",
    });
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, isActive } : t
    ));
  };

  const handleApprovalAction = (id: string, action: 'approve' | 'reject') => {
    setTemplates(prev => prev.map(t => 
      t.id === id 
        ? { 
            ...t, 
            approvalStatus: action === 'approve' ? 'approved' as const : 'rejected' as const,
            isActive: action === 'approve'
          } 
        : t
    ));
    
    toast({
      title: action === 'approve' ? "Template aprovado" : "Template rejeitado",
      description: `O template foi ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso.`,
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      birthday: 'Aniversário',
      meeting: 'Reunião',
      reminder: 'Lembrete',
      announcement: 'Comunicado',
      custom: 'Personalizado'
    };
    return labels[category] || category;
  };

  const getApprovalStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Gerenciamento de Templates
            </CardTitle>
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingTemplate(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Editar Template' : 'Novo Template'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nome do Template</Label>
                      <Input
                        placeholder="Ex: Lembrete de Reunião"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <Select value={formData.category} onValueChange={(value: MessageTemplate['category']) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="birthday">Aniversário</SelectItem>
                          <SelectItem value="meeting">Reunião</SelectItem>
                          <SelectItem value="reminder">Lembrete</SelectItem>
                          <SelectItem value="announcement">Comunicado</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Assunto</Label>
                    <Input
                      placeholder="Assunto da mensagem"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Conteúdo da Mensagem</Label>
                    <Textarea
                      placeholder="Digite o conteúdo do template. Use {variavel} para campos dinâmicos."
                      value={formData.content}
                      onChange={(e) => {
                        const content = e.target.value;
                        const variables = extractVariables(content);
                        setFormData(prev => ({ ...prev, content, variables }));
                      }}
                      className="min-h-[120px]"
                    />
                  </div>

                  {formData.variables.length > 0 && (
                    <div>
                      <Label>Variáveis Detectadas</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.variables.map((variable, index) => (
                          <Badge key={index} variant="outline">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requiresApproval"
                      checked={formData.requiresApproval}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresApproval: checked }))}
                    />
                    <Label htmlFor="requiresApproval">Requer aprovação antes do uso</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveTemplate}>
                      {editingTemplate ? 'Atualizar' : 'Criar'} Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="birthday">Aniversário</SelectItem>
                <SelectItem value="meeting">Reunião</SelectItem>
                <SelectItem value="reminder">Lembrete</SelectItem>
                <SelectItem value="announcement">Comunicado</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Templates List */}
          <div className="space-y-4">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant="outline">{getCategoryLabel(template.category)}</Badge>
                      <Badge className={getApprovalStatusColor(template.approvalStatus)}>
                        {template.approvalStatus === 'pending' && 'Pendente'}
                        {template.approvalStatus === 'approved' && 'Aprovado'}
                        {template.approvalStatus === 'rejected' && 'Rejeitado'}
                      </Badge>
                      {template.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-2">{template.content}</p>
                    
                    {template.variables.length > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-sm text-gray-500">Variáveis:</span>
                        {template.variables.map((variable, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Criado por: {template.createdBy}</span>
                      <span>Usado {template.usageCount} vezes</span>
                      {template.lastUsed && (
                        <span>Último uso: {template.lastUsed.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {template.approvalStatus === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprovalAction(template.id, 'approve')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprovalAction(template.id, 'reject')}
                        >
                          Rejeitar
                        </Button>
                      </>
                    )}
                    
                    <Switch
                      checked={template.isActive}
                      onCheckedChange={(checked) => handleToggleActive(template.id, checked)}
                      disabled={template.approvalStatus !== 'approved'}
                    />
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
