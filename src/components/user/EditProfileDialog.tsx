
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AvatarUpload } from './AvatarUpload';

const profileFormSchema = z.object({
  username: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  birth_date: z.string().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  start_date: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile?.username || '',
      phone: (profile as any)?.phone || '',
      bio: (profile as any)?.bio || '',
      birth_date: (profile as any)?.birth_date || '',
      address: (profile as any)?.address || '',
      emergency_contact: (profile as any)?.emergency_contact || '',
      emergency_phone: (profile as any)?.emergency_phone || '',
      start_date: (profile as any)?.start_date || '',
    },
  });

  React.useEffect(() => {
    if (profile && open) {
      form.reset({
        username: profile.username || '',
        phone: (profile as any)?.phone || '',
        bio: (profile as any)?.bio || '',
        birth_date: (profile as any)?.birth_date || '',
        address: (profile as any)?.address || '',
        emergency_contact: (profile as any)?.emergency_contact || '',
        emergency_phone: (profile as any)?.emergency_phone || '',
        start_date: (profile as any)?.start_date || '',
      });
    }
  }, [profile, open, form]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updates = {
        username: data.username,
        ...(data.phone && { phone: data.phone }),
        ...(data.bio && { bio: data.bio }),
        ...(data.birth_date && { birth_date: data.birth_date }),
        ...(data.address && { address: data.address }),
        ...(data.emergency_contact && { emergency_contact: data.emergency_contact }),
        ...(data.emergency_phone && { emergency_phone: data.emergency_phone }),
        ...(data.start_date && { start_date: data.start_date }),
      };

      const { error } = await updateProfile(updates);

      if (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar perfil.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });

      onOpenChange(false);
    } catch (error) {
      // Log desabilitado: Error updating profile
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao atualizar perfil.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais aqui.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center mb-6">
          <AvatarUpload size="lg" showUploadButton={false} showDeleteButton={false} />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome de Usuário *</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome de usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />



              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergency_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato de Emergência</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do contato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone de Emergência</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Conte um pouco sobre você..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
