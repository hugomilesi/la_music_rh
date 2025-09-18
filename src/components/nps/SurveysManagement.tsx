import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  Link,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useNPS } from '@/contexts/NPSContext';
import { NPSSurvey } from '@/types/nps';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface SurveyDetailsModalProps {
  survey: NPSSurvey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SurveyDetailsModal: React.FC<SurveyDetailsModalProps> = ({ 
  survey, 
  open, 
  onOpenChange 
}) => {
  const [linkCopied, setLinkCopied] = useState(false);

  const copyLink = async () => {
    if (survey?.surveyLink) {
      try {
        await navigator.clipboard.writeText(survey.surveyLink);
        setLinkCopied(true);
        toast.success('Link copiado para a área de transferência!');
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (error) {
        toast.error('Erro ao copiar link');
      }
    }
  };

  if (!survey) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Detalhes da Pesquisa
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Título</label>
              <p className="text-lg font-semibold">{survey.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge 
                  variant={
                    survey.status === 'active' ? 'default' : 
                    survey.status === 'completed' ? 'secondary' : 
                    'outline'
                  }
                >
                  {survey.status === 'active' ? 'Ativa' : 
                   survey.status === 'completed' ? 'Finalizada' : 
                   'Rascunho'}
                </Badge>
              </div>
            </div>
          </div>

          {survey.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">Descrição</label>
              <p className="text-gray-700 mt-1">{survey.description}</p>
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            {survey.startDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Data de Início</label>
                <p className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(survey.startDate), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            )}
            {survey.endDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Data de Fim</label>
                <p className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(survey.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            )}
          </div>

          {/* Público Alvo */}
          {(survey.targetDepartments?.length > 0 || survey.targetEmployees?.length > 0) && (
            <div>
              <label className="text-sm font-medium text-gray-500">Público Alvo</label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-4 h-4" />
                <span>
                  {survey.targetDepartments?.length > 0 && 
                    `${survey.targetDepartments.length} departamento(s)`}
                  {survey.targetDepartments?.length > 0 && survey.targetEmployees?.length > 0 && ', '}
                  {survey.targetEmployees?.length > 0 && 
                    `${survey.targetEmployees.length} colaborador(es)`}
                </span>
              </div>
            </div>
          )}

          {/* Link da Pesquisa */}
          {survey.surveyLink && (
            <div>
              <label className="text-sm font-medium text-gray-500">Link da Pesquisa</label>
              <div className="flex items-center gap-2 mt-1 p-3 bg-gray-50 rounded-lg">
                <Link className="w-4 h-4 text-gray-500" />
                <code className="flex-1 text-sm text-gray-700 break-all">
                  {survey.surveyLink}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyLink}
                  className="shrink-0"
                >
                  {linkCopied ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Perguntas */}
          {survey.questions && survey.questions.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Perguntas</label>
              <div className="space-y-2 mt-1">
                {survey.questions.map((question, index) => (
                  <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {index + 1}. {question.question}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" size="sm">
                        {question.type === 'nps' ? 'NPS (0-10)' : 
                         question.type === 'satisfaction' ? 'Satisfação' : 
                         question.type}
                      </Badge>
                      {question.required && (
                        <Badge variant="secondary" size="sm">
                          Obrigatória
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {survey.responses?.length || 0}
              </p>
              <p className="text-sm text-gray-500">Respostas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {survey.createdAt ? format(new Date(survey.createdAt), 'dd/MM') : '-'}
              </p>
              <p className="text-sm text-gray-500">Criada em</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {survey.surveyType === 'nps' ? 'NPS' : 'Satisfação'}
              </p>
              <p className="text-sm text-gray-500">Tipo</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface SurveyEditModalProps {
  survey: NPSSurvey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedSurvey: NPSSurvey) => void;
}

const SurveyEditModal: React.FC<SurveyEditModalProps> = ({ 
  survey, 
  open, 
  onOpenChange,
  onSave 
}) => {
  const [editingSurvey, setEditingSurvey] = useState<NPSSurvey | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (survey && open) {
      setEditingSurvey({ ...survey });
    }
  }, [survey, open]);

  const handleSave = async () => {
    if (!editingSurvey) return;

    setLoading(true);
    try {
      onSave(editingSurvey);
      onOpenChange(false);
      toast.success('Pesquisa atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar pesquisa');
    } finally {
      setLoading(false);
    }
  };

  if (!editingSurvey) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Editar Pesquisa
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={editingSurvey.title}
              onChange={(e) => setEditingSurvey({
                ...editingSurvey,
                title: e.target.value
              })}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={editingSurvey.description}
              onChange={(e) => setEditingSurvey({
                ...editingSurvey,
                description: e.target.value
              })}
            />
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={editingSurvey.status}
              onValueChange={(value) => setEditingSurvey({
                ...editingSurvey,
                status: value as 'draft' | 'active' | 'completed'
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="completed">Finalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={editingSurvey.startDate.split('T')[0]}
                onChange={(e) => setEditingSurvey({
                  ...editingSurvey,
                  startDate: e.target.value
                })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data de Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={editingSurvey.endDate.split('T')[0]}
                onChange={(e) => setEditingSurvey({
                  ...editingSurvey,
                  endDate: e.target.value
                })}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SurveysManagement: React.FC = () => {
  const { surveys, deleteSurvey, updateSurvey } = useNPS();
  const [selectedSurvey, setSelectedSurvey] = useState<NPSSurvey | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<NPSSurvey | null>(null);

  const handleViewDetails = (survey: NPSSurvey) => {
    setSelectedSurvey(survey);
    setDetailsModalOpen(true);
  };

  const handleEdit = (survey: NPSSurvey) => {
    setSelectedSurvey(survey);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedSurvey: NPSSurvey) => {
    try {
      await updateSurvey(updatedSurvey.id, updatedSurvey);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteClick = (survey: NPSSurvey) => {
    setSurveyToDelete(survey);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (surveyToDelete) {
      try {
        await deleteSurvey(surveyToDelete.id);
        toast.success('Pesquisa excluída com sucesso!');
        setDeleteDialogOpen(false);
        setSurveyToDelete(null);
      } catch (error) {
        toast.error('Erro ao excluir pesquisa');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Ativa</Badge>;
      case 'completed':
        return <Badge variant="secondary">Finalizada</Badge>;
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'nps':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">NPS</Badge>;
      case 'satisfaction':
        return <Badge variant="default" className="bg-green-100 text-green-800">Satisfação</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Pesquisas Criadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {surveys.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma pesquisa encontrada
              </h3>
              <p className="text-gray-500">
                Crie sua primeira pesquisa NPS ou de satisfação para começar.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Respostas</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{survey.title}</p>
                        {survey.description && (
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {survey.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(survey.surveyType)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(survey.status)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {survey.responses?.length || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {survey.createdAt ? 
                        format(new Date(survey.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(survey)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(survey)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(survey)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <SurveyDetailsModal
        survey={selectedSurvey}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />

      {/* Modal de Edição */}
      <SurveyEditModal
        survey={selectedSurvey}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleSaveEdit}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a pesquisa "{surveyToDelete?.title}"? 
              Esta ação não pode ser desfeita e todas as respostas associadas também serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SurveysManagement;