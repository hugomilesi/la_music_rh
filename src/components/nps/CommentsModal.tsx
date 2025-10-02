
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MessageSquare, User } from 'lucide-react';
import { useNPS } from '@/contexts/NPSContext';

interface CommentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  open,
  onOpenChange
}) => {
  const { responses } = useNPS();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredComments = responses.filter(response => {
    const matchesSearch = response.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || response.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    const variants = {
      'promotor': 'bg-green-100 text-green-800',
      'neutro': 'bg-yellow-100 text-yellow-800',
      'detrator': 'bg-red-100 text-red-800'
    };
    return variants[category as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryText = (category: string) => {
    const texts = {
      'promotor': 'Promotor',
      'neutro': 'Neutro',
      'detrator': 'Detrator'
    };
    return texts[category as keyof typeof texts] || category;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Todos os Comentários ({filteredComments.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar comentários ou colaboradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="promotor">Promotores</SelectItem>
                <SelectItem value="neutro">Neutros</SelectItem>
                <SelectItem value="detrator">Detratores</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Comentários */}
          <div className="space-y-4">
            {filteredComments.map((response) => (
              <div key={response.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{response.employeeName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(response.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryBadge(response.category)}>
                      {getCategoryText(response.category)}
                    </Badge>
                    <Badge variant="outline">
                      Nota {response.score}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-gray-800 leading-relaxed">{response.comment}</p>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Pesquisa: Clima Organizacional - Março 2024</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredComments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhum comentário encontrado</p>
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSearchTerm('')}
                    className="mt-2"
                  >
                    Limpar busca
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
