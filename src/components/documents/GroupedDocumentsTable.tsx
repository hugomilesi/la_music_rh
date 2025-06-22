
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight, User, FileText, Download, Mail, Package } from 'lucide-react';
import { useDocuments } from '@/contexts/DocumentContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { Document } from '@/types/document';

interface GroupedDocumentsTableProps {
  onEmployeeClick: (employeeId: string, employeeName: string) => void;
  onSendToAccountant: (documents: Document[]) => void;
}

interface EmployeeDocumentGroup {
  employeeId: string;
  employeeName: string;
  documents: Document[];
  totalDocuments: number;
  validDocuments: number;
  expiringDocuments: number;
  expiredDocuments: number;
}

export const GroupedDocumentsTable: React.FC<GroupedDocumentsTableProps> = ({
  onEmployeeClick,
  onSendToAccountant
}) => {
  const { filteredDocuments, downloadDocument, exportDocumentsByEmployee } = useDocuments();
  const { employees } = useEmployees();
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());

  const groupedDocuments = useMemo(() => {
    const groups = new Map<string, EmployeeDocumentGroup>();

    filteredDocuments.forEach(doc => {
      if (!groups.has(doc.employeeId)) {
        groups.set(doc.employeeId, {
          employeeId: doc.employeeId,
          employeeName: doc.employee,
          documents: [],
          totalDocuments: 0,
          validDocuments: 0,
          expiringDocuments: 0,
          expiredDocuments: 0
        });
      }

      const group = groups.get(doc.employeeId)!;
      group.documents.push(doc);
      group.totalDocuments++;

      switch (doc.status) {
        case 'válido':
          group.validDocuments++;
          break;
        case 'vencendo':
          group.expiringDocuments++;
          break;
        case 'vencido':
          group.expiredDocuments++;
          break;
      }
    });

    return Array.from(groups.values()).sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  }, [filteredDocuments]);

  const toggleEmployee = (employeeId: string) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedEmployees(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'válido': 'bg-green-100 text-green-800',
      'vencido': 'bg-red-100 text-red-800',
      'vencendo': 'bg-yellow-100 text-yellow-800',
      'pendente': 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'obrigatorio': 'bg-red-50 text-red-700 border-red-200',
      'temporario': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'complementar': 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const handleEmployeeExport = (employeeId: string, format: 'pdf' | 'excel', e: React.MouseEvent) => {
    e.stopPropagation();
    exportDocumentsByEmployee(employeeId, format);
  };

  const handleSendEmployeeDocuments = (documents: Document[], e: React.MouseEvent) => {
    e.stopPropagation();
    onSendToAccountant(documents);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Colaborador</TableHead>
              <TableHead>Total Docs</TableHead>
              <TableHead>Válidos</TableHead>
              <TableHead>Vencendo</TableHead>
              <TableHead>Vencidos</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedDocuments.map((group) => (
              <React.Fragment key={group.employeeId}>
                {/* Employee Row */}
                <TableRow 
                  className="cursor-pointer hover:bg-gray-50 border-b-2" 
                  onClick={() => toggleEmployee(group.employeeId)}
                >
                  <TableCell>
                    {expandedEmployees.has(group.employeeId) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span 
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEmployeeClick(group.employeeId, group.employeeName);
                        }}
                      >
                        {group.employeeName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{group.totalDocuments}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">{group.validDocuments}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">{group.expiringDocuments}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-red-100 text-red-800">{group.expiredDocuments}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => handleEmployeeExport(group.employeeId, 'excel', e)}
                        title="Exportar documentos do funcionário"
                      >
                        <Package className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => handleSendEmployeeDocuments(group.documents, e)}
                        title="Enviar documentos ao contador"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Documents Rows (when expanded) */}
                {expandedEmployees.has(group.employeeId) && group.documents.map((doc) => (
                  <TableRow key={doc.id} className="bg-gray-50">
                    <TableCell></TableCell>
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{doc.document}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(doc.type)} style={{ fontSize: '10px', padding: '2px 6px' }}>
                        {doc.type === 'obrigatorio' ? 'Obrigatório' : 
                         doc.type === 'temporario' ? 'Temporário' : 'Complementar'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('pt-BR') : 'Sem validade'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(doc.status)} style={{ fontSize: '10px', padding: '2px 6px' }}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadDocument(doc);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
        
        {groupedDocuments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum documento encontrado com os filtros atuais.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
