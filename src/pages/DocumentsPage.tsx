
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Filter, Search, Upload, Download, AlertTriangle, CheckCircle, Clock, MoreVertical } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DocumentUploadDialog } from '@/components/documents/DocumentUploadDialog';
import { AdvancedFiltersDialog } from '@/components/documents/AdvancedFiltersDialog';
import { DocumentManagementDialog } from '@/components/documents/DocumentManagementDialog';
import { useDocuments } from '@/contexts/DocumentContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { Document } from '@/types/document';

const DocumentsPage: React.FC = () => {
  const { filteredDocuments, filter, setFilter, stats, exportDocuments } = useDocuments();
  const { employees } = useEmployees();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [managementDialogOpen, setManagementDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const getStatusBadge = (status: string) => {
    const variants = {
      'válido': 'bg-green-100 text-green-800',
      'vencido': 'bg-red-100 text-red-800',
      'vencendo': 'bg-yellow-100 text-yellow-800',
      'pendente': 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'válido':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'vencido':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'vencendo':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'obrigatorio': 'bg-red-50 text-red-700 border-red-200',
      'temporario': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'complementar': 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document);
    setManagementDialogOpen(true);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    exportDocuments(format);
  };

  // Calculate dynamic stats
  const dynamicStats = {
    total: filteredDocuments.length,
    valid: filteredDocuments.filter(doc => doc.status === 'válido').length,
    expiring: filteredDocuments.filter(doc => doc.status === 'vencendo').length,
    expired: filteredDocuments.filter(doc => doc.status === 'vencido').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600 mt-1">Gestão de contratos, atestados e documentação</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                Exportar para Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Exportar para PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Enviar Documento
          </Button>
        </div>
      </div>

      {/* Interactive Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter({ status: 'all' })}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Documentos</p>
                <p className="text-2xl font-bold">{dynamicStats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter({ status: 'válido' })}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Válidos</p>
                <p className="text-2xl font-bold text-green-600">{dynamicStats.valid}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter({ status: 'vencendo' })}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencendo (30 dias)</p>
                <p className="text-2xl font-bold text-yellow-600">{dynamicStats.expiring}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter({ status: 'vencido' })}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{dynamicStats.expired}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por colaborador ou documento..."
                  value={filter.searchTerm}
                  onChange={(e) => setFilter({ searchTerm: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={filter.type}
                onValueChange={(value) => setFilter({ type: value as any })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="obrigatorio">Obrigatórios</SelectItem>
                  <SelectItem value="temporario">Temporários</SelectItem>
                  <SelectItem value="complementar">Complementares</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filter.status}
                onValueChange={(value) => setFilter({ status: value as any })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="válido">Válidos</SelectItem>
                  <SelectItem value="vencendo">Vencendo</SelectItem>
                  <SelectItem value="vencido">Vencidos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => setFiltersDialogOpen(true)}>
                <Filter className="w-4 h-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Documentos ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data de Upload</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleDocumentClick(doc)}>
                  <TableCell className="font-medium">{doc.employee}</TableCell>
                  <TableCell>{doc.document}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(doc.type)}>
                      {doc.type === 'obrigatorio' ? 'Obrigatório' : 
                       doc.type === 'temporario' ? 'Temporário' : 'Complementar'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(doc.uploadDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('pt-BR') : 'Sem validade'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <Badge className={getStatusBadge(doc.status)}>
                        {doc.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); console.log(`Download ${doc.fileName}`); }}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDocumentClick(doc)}>
                            Visualizar/Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log(`Download ${doc.fileName}`)}>
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredDocuments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum documento encontrado com os filtros atuais.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist de Documentos Obrigatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Contrato de Trabalho',
              'Carteira de Trabalho',
              'CPF',
              'RG',
              'Comprovante de Residência',
              'Atestado de Saúde Ocupacional',
              'PIS/PASEP',
              'Título de Eleitor'
            ].map((docType, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">{docType}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <DocumentUploadDialog 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen}
      />
      
      <AdvancedFiltersDialog 
        open={filtersDialogOpen} 
        onOpenChange={setFiltersDialogOpen}
      />
      
      <DocumentManagementDialog 
        document={selectedDocument}
        open={managementDialogOpen} 
        onOpenChange={setManagementDialogOpen}
      />
    </div>
  );
};

export default DocumentsPage;
