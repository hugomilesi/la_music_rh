
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { getFirstAccessibleRoute } from '@/utils/redirectUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Filter, Search, Upload, Download, AlertTriangle, CheckCircle, Clock, Mail, Edit3, Lock } from 'lucide-react';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { DocumentUploadDialog } from '@/components/documents/DocumentUploadDialog';
import { AdvancedFiltersDialog } from '@/components/documents/AdvancedFiltersDialog';
import { DocumentManagementDialog } from '@/components/documents/DocumentManagementDialog';
import { SendToAccountantDialog } from '@/components/documents/SendToAccountantDialog';
import { EditChecklistDialog } from '@/components/documents/EditChecklistDialog';
import { EmployeeDocumentsModal } from '@/components/documents/EmployeeDocumentsModal';
import { GroupedDocumentsTable } from '@/components/documents/GroupedDocumentsTable';

import { useDocuments } from '@/contexts/DocumentContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { Document } from '@/types/document';

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { canViewModule, canManageModule, canManagePermissions, user, loading: permissionsLoading } = usePermissionsV2();
  const { profile } = useAuth();
  const canViewEmployees = canViewModule('usuarios');
  const canViewDocuments = canViewModule('documentos');
  const canAccessSettings = canViewModule('configuracoes');
  
  // Determine user access level based on profile
  const getUserAccessLevel = () => {
    if (!profile) return 'user';
    
    // Use permission-based access control instead of hardcoded roles
    if (canViewEmployees && canAccessSettings) return 'admin';
    if (canViewEmployees) return 'collaborator';
    if (canViewDocuments) return 'professor';
    return 'user';
  };
  
  const userAccessLevel = getUserAccessLevel();
  
  const { filteredDocuments, filter, setFilter, stats, exportDocuments } = useDocuments();
  const { employees } = useEmployees();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [managementDialogOpen, setManagementDialogOpen] = useState(false);
  const [sendToAccountantDialogOpen, setSendToAccountantDialogOpen] = useState(false);
  const [editChecklistDialogOpen, setEditChecklistDialogOpen] = useState(false);
  const [employeeDocumentsModalOpen, setEmployeeDocumentsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('');
  const [selectedDocumentsForAccountant, setSelectedDocumentsForAccountant] = useState<Document[]>([]);
  
  // Filter documents based on user access level
  const getVisibleDocuments = () => {
    if (!profile) return [];
    
    switch (userAccessLevel) {
      case 'admin':
        // Admins can see all documents
        return filteredDocuments;
      case 'collaborator':
        // Collaborators can see all documents (HR access)
        return filteredDocuments;
      case 'professor':
        // Professors can only see their own documents
        return filteredDocuments.filter(doc => doc.employeeId === profile.id);
      case 'user':
      default:
        // Regular users can only see their own documents
        return filteredDocuments.filter(doc => doc.employeeId === profile.id);
    }
  };
  
  const visibleDocuments = getVisibleDocuments();


  const handleExport = (format: 'pdf' | 'excel') => {
    exportDocuments(format);
  };

  const handleEmployeeClick = (employeeId: string, employeeName: string) => {
    setSelectedEmployeeId(employeeId);
    setSelectedEmployeeName(employeeName);
    setEmployeeDocumentsModalOpen(true);
  };

  const handleSendToAccountant = (documents: Document[]) => {
    setSelectedDocumentsForAccountant(documents);
    setSendToAccountantDialogOpen(true);
  };

  const handleSendToAccountantFromModal = (documents: Document[]) => {
    setEmployeeDocumentsModalOpen(false);
    setSelectedDocumentsForAccountant(documents);
    setSendToAccountantDialogOpen(true);
  };

  // Calculate dynamic stats based on visible documents
  const dynamicStats = {
    total: visibleDocuments.length,
    valid: visibleDocuments.filter(doc => doc.status === 'válido').length,
    expiring: visibleDocuments.filter(doc => doc.status === 'vencendo').length,
    expired: visibleDocuments.filter(doc => doc.status === 'vencido').length
  };

  // Aguardar carregamento das permissões
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando permissões...</p>
        </div>
      </div>
    );
  }

  // Verificar se o usuário tem permissão para visualizar documentos
  const canView = canViewModule('documentos');

  if (!canView) {
    const firstAccessibleRoute = getFirstAccessibleRoute(canViewModule, canManagePermissions());
    return <Navigate to={firstAccessibleRoute} replace />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600 mt-1">Gestão de contratos, atestados e documentação</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={() => setSendToAccountantDialogOpen(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Enviar ao Contador
          </Button>
          
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

      {/* Grouped Documents Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Documentos por Colaborador
          </h2>
          <p className="text-sm text-gray-600">
            Clique em um colaborador para expandir ou no nome para ver detalhes
          </p>
        </div>
        
        <GroupedDocumentsTable 
          documents={visibleDocuments}
          employees={employees}
          onEmployeeClick={handleEmployeeClick}
          onSendToAccountant={handleSendToAccountant}
        />
      </div>



      {/* Document Checklist */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Checklist de Documentos Obrigatórios</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditChecklistDialogOpen(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Editar Checklist
          </Button>
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

      <SendToAccountantDialog 
        open={sendToAccountantDialogOpen} 
        onOpenChange={setSendToAccountantDialogOpen}
        selectedDocuments={selectedDocumentsForAccountant}
      />

      <EditChecklistDialog 
        open={editChecklistDialogOpen} 
        onOpenChange={setEditChecklistDialogOpen}
      />

      <EmployeeDocumentsModal
        employeeId={selectedEmployeeId}
        employeeName={selectedEmployeeName}
        open={employeeDocumentsModalOpen}
        onOpenChange={setEmployeeDocumentsModalOpen}
        onSendToAccountant={handleSendToAccountantFromModal}
      />
    </div>
  );
};

export default DocumentsPage;
