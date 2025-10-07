
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAvatarUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { user, updateProfile, forceRefreshProfile } = useAuth();
  const { toast } = useToast();

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return null;
    }

    setIsUploading(true);

    try {
      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo deve ter menos de 5MB');
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Debug logs
      console.log('🔍 Avatar Upload Debug:', {
        fileName,
        fileType: file.type,
        fileSize: file.size,
        fileName: file.name
      });

      // Converter arquivo para ArrayBuffer para garantir upload binário puro
      const arrayBuffer = await file.arrayBuffer();
      
      // Upload para Supabase Storage com dados binários puros
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('❌ Avatar Upload Error:', error);
        throw error;
      }

      console.log('✅ Avatar Upload Success:', data);

      // Obter URL público
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      console.log('🔗 Avatar URL Generated:', urlData.publicUrl);

      // Atualizar perfil com nova URL
      await updateProfile({
        avatar_url: urlData.publicUrl
      });

      console.log('✅ Profile updated with new avatar URL');

      // Forçar atualização do contexto para garantir que a imagem apareça
      await forceRefreshProfile();

      console.log('✅ Profile context refreshed');

      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso",
      });

      return urlData.publicUrl;

    } catch (error: any) {
      // Error uploading avatar logging disabled
      toast({
        title: "Erro no upload",
        description: error.message || "Erro ao fazer upload da imagem",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAvatar = async (avatarUrl: string) => {
    if (!user) return;

    try {
      // Extrair path do avatar da URL
      const path = avatarUrl.split('/avatars/')[1];
      if (!path) return;

      // Deletar arquivo do storage
      const { error } = await supabase.storage
        .from('avatars')
        .remove([path]);

      if (error) {
        throw error;
      }

      // Remover URL do perfil
      await updateProfile({
        avatar_url: null
      });

      // Forçar atualização do contexto
      await forceRefreshProfile();

      toast({
        title: "Avatar removido",
        description: "Sua foto de perfil foi removida",
      });

    } catch (error: any) {
      // Error deleting avatar logging disabled
      toast({
        title: "Erro",
        description: "Erro ao remover avatar",
        variant: "destructive"
      });
    }
  };

  return {
    uploadAvatar,
    deleteAvatar,
    isUploading
  };
};
