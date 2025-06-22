
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useIncident } from '@/contexts/IncidentContext';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Calendar } from 'lucide-react';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportDialog: React.FC<ReportDialogProps> = ({ open, onOpenChange }) => {
  const { incidents } = useIncident();
  const { toast } = useToast();
  
  const [reportConfig, setReportConfig] = useState({
    format: 'pdf',
    dateRange: 'all',
    customStartDate: '',
    customEndDate: '',
    includeResolved: true,
    includeActive: true,
    includeArchived: false,
    groupBy: 'employee',
    includeSummary: true,
    includeCharts: true
  });

  const handleGenerateReport = () => {
    // Filter incidents based on configuration
    let filteredIncidents = incidents;

    // Filter by status
    filteredIncidents = filteredIncidents.filter(incident => {
      if (incident.status === 'ativo' && !reportConfig.includeActive) return false;
      if (incident.status === 'resolvido' && !reportConfig.includeResolved) return false;
      if (incident.status === 'arquivado' && !reportConfig.includeArchived) return false;
      return true;
    });

    // Filter by date range
    if (reportConfig.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (reportConfig.dateRange) {
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'custom':
          if (reportConfig.customStartDate) {
            startDate = new Date(reportConfig.customStartDate);
            const endDate = reportConfig.customEndDate ? new Date(reportConfig.customEndDate) : now;
            
            filteredIncidents = filteredIncidents.filter(incident => {
              const incidentDate = new Date(incident.date);
              return incidentDate >= startDate && incidentDate <= endDate;
            });
          }
          break;
        default:
          startDate = new Date(0);
      }

      if (reportConfig.dateRange !== 'custom') {
        filteredIncidents = filteredIncidents.filter(incident => {
          const incidentDate = new Date(incident.date);
          return incidentDate >= startDate;
        });
      }
    }

    // Simulate report generation
    toast({
      title: "Relatório Gerado",
      description: `Relatório em ${reportConfig.format.toUpperCase()} com ${filteredIncidents.length} ocorrências foi gerado com sucesso.`,
    });

    console.log('Report configuration:', reportConfig);
    console.log('Filtered incidents:', filteredIncidents);
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gerar Relatório de Ocorrências
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <Label>Formato do Relatório</Label>
            <Select 
              value={reportConfig.format} 
              onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel (XLSX)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <Label>Período</Label>
            <Select 
              value={reportConfig.dateRange} 
              onValueChange={(value) => setReportConfig(prev => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="lastMonth">Mês passado</SelectItem>
                <SelectItem value="thisYear">Este ano</SelectItem>
                <SelectItem value="custom">Período personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {reportConfig.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={reportConfig.customStartDate}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, customStartDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={reportConfig.customEndDate}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, customEndDate: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Status Filters */}
          <div>
            <Label>Status das Ocorrências</Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeActive"
                  checked={reportConfig.includeActive}
                  onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeActive: !!checked }))}
                />
                <Label htmlFor="includeActive" className="text-sm">Ativas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeResolved"
                  checked={reportConfig.includeResolved}
                  onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeResolved: !!checked }))}
                />
                <Label htmlFor="includeResolved" className="text-sm">Resolvidas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeArchived"
                  checked={reportConfig.includeArchived}
                  onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeArchived: !!checked }))}
                />
                <Label htmlFor="includeArchived" className="text-sm">Arquivadas</Label>
              </div>
            </div>
          </div>

          {/* Report Options */}
          <div>
            <Label>Opções do Relatório</Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSummary"
                  checked={reportConfig.includeSummary}
                  onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeSummary: !!checked }))}
                />
                <Label htmlFor="includeSummary" className="text-sm">Incluir resumo estatístico</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={reportConfig.includeCharts}
                  onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeCharts: !!checked }))}
                />
                <Label htmlFor="includeCharts" className="text-sm">Incluir gráficos</Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateReport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Gerar Relatório
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
