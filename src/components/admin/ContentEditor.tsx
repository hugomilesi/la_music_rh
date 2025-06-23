
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

interface ContentSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface EditContentDialogProps {
  section: ContentSection;
}

const EditContentDialog: React.FC<EditContentDialogProps> = ({ section }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(section.title || '');
  const [subtitle, setSubtitle] = useState(section.subtitle || '');
  const [description, setDescription] = useState(section.description || '');
  const [saving, setSaving] = useState(false);
  const { updateContent } = useContent();

  const handleSave = async () => {
    setSaving(true);
    const success = await updateContent(section.id, {
      title: title || null,
      subtitle: subtitle || null,
      description: description || null
    });
    
    if (success) {
      setOpen(false);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setTitle(section.title || '');
    setSubtitle(section.subtitle || '');
    setDescription(section.description || '');
    setOpen(false);
  };

  const getSectionDisplayName = (key: string) => {
    const names: { [key: string]: string } = {
      hero: 'Seção Principal (Hero)',
      features: 'Funcionalidades',
      benefits: 'Benefícios',
      cta: 'Chamada para Ação'
    };
    return names[key] || key;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar {getSectionDisplayName(section.section_key)}</DialogTitle>
          <DialogDescription>
            Faça as alterações no conteúdo da seção e clique em salvar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Digite o subtítulo..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite a descrição..."
              rows={4}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ContentEditor: React.FC = () => {
  const { contentSections, loading, refreshContent } = useContent();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editor de Conteúdo</h2>
          <p className="text-gray-600">Gerencie o conteúdo da página inicial</p>
        </div>
        <Button variant="outline" onClick={refreshContent}>
          Atualizar
        </Button>
      </div>
      
      <div className="grid gap-4">
        {contentSections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {section.section_key === 'hero' && 'Seção Principal (Hero)'}
                    {section.section_key === 'features' && 'Funcionalidades'}
                    {section.section_key === 'benefits' && 'Benefícios'}
                    {section.section_key === 'cta' && 'Chamada para Ação'}
                  </CardTitle>
                  <CardDescription>
                    Chave: {section.section_key}
                  </CardDescription>
                </div>
                <EditContentDialog section={section} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {section.title && (
                  <div>
                    <span className="font-medium text-sm text-gray-600">Título:</span>
                    <p className="text-gray-900">{section.title}</p>
                  </div>
                )}
                {section.subtitle && (
                  <div>
                    <span className="font-medium text-sm text-gray-600">Subtítulo:</span>
                    <p className="text-gray-900">{section.subtitle}</p>
                  </div>
                )}
                {section.description && (
                  <div>
                    <span className="font-medium text-sm text-gray-600">Descrição:</span>
                    <p className="text-gray-900">{section.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
