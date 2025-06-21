
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Filter, Search, Upload, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const mockDocuments = [
  {
    id: 1,
    employee: 'Ana Silva',
    document: 'Contrato de Trabalho',
    type: 'obrigatorio',
    uploadDate: '2024-01-15',
    expiryDate: '2025-01-15',
    status: 'válido'
  },
  {
    id: 2,
    employee: 'Carlos Santos',
    document: 'Atestado Médico',
    type: 'temporario',
    uploadDate: '2024-03-10',
    expiryDate: '2024-03-20',
    status: 'vencido'
  },
  {
    id: 3,
    employee: 'Maria Oliveira',
    document: 'Carteira de Trabalho',
    type: 'obrigatorio',
    uploadDate: '2024-02-05',
    expiryDate: null,
    status: 'válido'
  },
  {
    id: 4,
    employee: 'João Pereira',
    document: 'Certificado de Curso',
    type: 'complementar',
    uploadDate: '2024-03-01',
    expiryDate: '2025-03-01',
    status: 'vencendo'
  }
];

const DocumentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600 mt-1">Gestão de contratos, atestados e documentação</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Enviar Documento
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Documentos</p>
                <p className="text-2xl font-bold">284</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Válidos</p>
                <p className="text-2xl font-bold text-green-600">245</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencendo (30 dias)</p>
                <p className="text-2xl font-bold text-yellow-600">15</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">24</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por colaborador ou documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Todos os Tipos</option>
                <option value="obrigatorio">Obrigatórios</option>
                <option value="temporario">Temporários</option>
                <option value="complementar">Complementares</option>
              </select>

              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="valido">Válidos</option>
                <option value="vencendo">Vencendo</option>
                <option value="vencido">Vencidos</option>
              </select>

              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Documentos</CardTitle>
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
              {mockDocuments.map((doc) => (
                <TableRow key={doc.id}>
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
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
    </div>
  );
};

export default DocumentsPage;
