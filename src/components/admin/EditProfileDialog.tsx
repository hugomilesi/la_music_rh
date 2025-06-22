
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  units: string[];
  avatar?: string;
  lastLogin: string;
  joinDate: string;
}

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AdminProfile;
  onUpdate: (updatedProfile: Partial<AdminProfile>) => void;
}

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdate(formData);
      
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Editar Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Digite seu email"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Digite seu telefone"
              />
            </div>

            <div>
              <Label htmlFor="role">Cargo</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="Digite seu cargo"
              />
            </div>

            {/* Read-only fields */}
            <div>
              <Label>Departamento</Label>
              <div className="mt-1">
                <Badge variant="secondary">{profile.department}</Badge>
              </div>
            </div>

            <div>
              <Label>Unidades</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {profile.units.map((unit) => (
                  <Badge key={unit} variant="outline" className="text-xs">
                    {unit}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
