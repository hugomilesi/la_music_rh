
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContentSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ContentContextType {
  contentSections: ContentSection[];
  loading: boolean;
  getContentByKey: (key: string) => ContentSection | undefined;
  updateContent: (id: string, updates: Partial<ContentSection>) => Promise<boolean>;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .order('section_key');

      if (error) {
        console.error('Error fetching content:', error);
        toast({
          title: 'Erro ao carregar conteúdo',
          description: 'Não foi possível carregar o conteúdo da página.',
          variant: 'destructive'
        });
        return;
      }

      setContentSections(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentByKey = (key: string) => {
    return contentSections.find(section => section.section_key === key);
  };

  const updateContent = async (id: string, updates: Partial<ContentSection>) => {
    try {
      const { error } = await supabase
        .from('content_sections')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating content:', error);
        toast({
          title: 'Erro ao atualizar conteúdo',
          description: 'Não foi possível salvar as alterações.',
          variant: 'destructive'
        });
        return false;
      }

      // Update local state
      setContentSections(prev => 
        prev.map(section => 
          section.id === id ? { ...section, ...updates } : section
        )
      );

      toast({
        title: 'Conteúdo atualizado',
        description: 'As alterações foram salvas com sucesso.',
        variant: 'default'
      });

      return true;
    } catch (error) {
      console.error('Error updating content:', error);
      return false;
    }
  };

  const refreshContent = async () => {
    setLoading(true);
    await fetchContent();
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const value = {
    contentSections,
    loading,
    getContentByKey,
    updateContent,
    refreshContent
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};
