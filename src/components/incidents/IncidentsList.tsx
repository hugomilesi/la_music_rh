import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { incidentService } from '../../services/incidentService';
import { Incident, IncidentFilter } from '../../types/incident';
import IncidentDialog from './IncidentDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'leve': return 'info';
    case 'moderado': return 'warning';
    case 'grave': return 'error';
    default: return 'default';
  }
};

const getSeverityBorderColor = (severity: string, theme: any) => {
  switch (severity) {
    case 'leve': return theme.palette.info.main;
    case 'moderado': return theme.palette.warning.main;
    case 'grave': return theme.palette.error.main;
    default: return theme.palette.grey[400];
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'error';
    case 'in_progress': return 'warning';
    case 'resolved': return 'success';
    case 'closed': return 'default';
    default: return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open': return 'Ativo';
    case 'in_progress': return 'Em Progresso';
    case 'resolved': return 'Resolvido';
    case 'closed': return 'Arquivado';
    default: return status;
  }
};

const IncidentsList: React.FC = () => {
  const theme = useTheme();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<IncidentFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [incidentToUpdateStatus, setIncidentToUpdateStatus] = useState<{id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed'} | null>(null);
  
  // Menu de ações
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      // Corrigindo a chamada para passar um objeto vazio ao invés de string
      const data = await incidentService.getFiltered(filter === 'all' ? {} : { status: filter });
      setIncidents(data);
    } catch (error) {
      // Log desabilitado: Erro ao buscar incidentes
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [filter]);

  // Nota: A subscrição em tempo real é gerenciada pelo IncidentsContext
  // Não é necessário criar subscrições adicionais aqui

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, incidentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedIncidentId(incidentId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedIncidentId(null);
  };

  const handleAddIncident = () => {
    setCurrentIncident(null);
    setDialogOpen(true);
  };

  const handleEditIncident = (incident: Incident) => {
    setCurrentIncident(incident);
    setDialogOpen(true);
    handleCloseMenu();
  };

  const handleDeleteIncident = (id: string) => {
    setIncidentToDelete(id);
    setConfirmDialogOpen(true);
    handleCloseMenu();
  };

  const handleUpdateStatus = (id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    setIncidentToUpdateStatus({ id, status });
    setStatusDialogOpen(true);
    handleCloseMenu();
  };

  const confirmDelete = async () => {
    if (incidentToDelete) {
      try {
        await incidentService.delete(incidentToDelete);
        setIncidents(incidents.filter(i => i.id !== incidentToDelete));
      } catch (error) {
        // Log desabilitado: Erro ao excluir incidente
      }
    }
    setConfirmDialogOpen(false);
    setIncidentToDelete(null);
  };

  const confirmStatusUpdate = async () => {
    if (incidentToUpdateStatus) {
      try {
        await incidentService.update(incidentToUpdateStatus.id, { status: incidentToUpdateStatus.status });
        await fetchIncidents();
      } catch (error) {
        // Log desabilitado: Erro ao atualizar status do incidente
      }
    }
    setStatusDialogOpen(false);
    setIncidentToUpdateStatus(null);
  };

  const handleSaveIncident = async (incident: Incident | Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if ('id' in incident) {
        await incidentService.update(incident.id, incident);
      } else {
        await incidentService.add(incident);
      }
      await fetchIncidents();
      setDialogOpen(false);
    } catch (error) {
      // Log desabilitado: Erro ao salvar incidente
    }
  };

  const handleFilterChange = (_: React.SyntheticEvent, newValue: IncidentFilter) => {
    setFilter(newValue);
  };

  if (loading) {
    return <LoadingState message="Carregando incidentes..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Incidentes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddIncident}
        >
          Novo Incidente
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={filter} onChange={handleFilterChange} aria-label="filtros de incidentes">
          <Tab label="Todos" value="all" />
          <Tab label="Ativos" value="open" />
          <Tab label="Resolvidos" value="resolved" />
          <Tab label="Este Mês" value="thisMonth" />
        </Tabs>
      </Box>

      {incidents.length === 0 ? (
        <EmptyState 
          message="Nenhum incidente encontrado"
          description={`Não há incidentes ${filter === 'open' ? 'ativos' : filter === 'resolved' ? 'resolvidos' : filter === 'thisMonth' ? 'neste mês' : ''} para exibir.`}
          actionText="Adicionar Incidente"
          onAction={handleAddIncident}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: 3
          }}
        >
          {incidents.map((incident) => (
            <Box key={incident.id}>
              <Card 
                elevation={2} 
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  borderLeft: `4px solid ${getSeverityBorderColor(incident.severity, theme)}`
                }}
              >
                <IconButton
                  aria-label="ações"
                  onClick={(e) => handleOpenMenu(e, incident.id)}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <MoreVertIcon />
                </IconButton>
                
                <CardContent sx={{ flexGrow: 1, pt: 2, pb: 2 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {incident.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {format(new Date(incident.incidentDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)} 
                        size="small" 
                        color={getSeverityColor(incident.severity)} 
                      />
                      <Chip 
                        label={getStatusLabel(incident.status)} 
                        size="small" 
                        color={getStatusColor(incident.status)} 
                      />
                    </Box>
                    
                    <Typography variant="body2">
                      {incident.description}
                    </Typography>
                    
                    <Divider />
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Funcionário:</strong> {incident.employeeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Reportado por:</strong> {incident.reporterName}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Menu de ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          const incident = incidents.find(i => i.id === selectedIncidentId);
          if (incident) handleEditIncident(incident);
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        
        {selectedIncidentId && incidents.find(i => i.id === selectedIncidentId)?.status === 'open' && (
          <MenuItem onClick={() => selectedIncidentId && handleUpdateStatus(selectedIncidentId, 'in_progress')}>
            <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
            Marcar como Em Progresso
          </MenuItem>
        )}
        
        {selectedIncidentId && incidents.find(i => i.id === selectedIncidentId)?.status !== 'closed' && incidents.find(i => i.id === selectedIncidentId)?.status !== 'resolved' && (
          <MenuItem onClick={() => selectedIncidentId && handleUpdateStatus(selectedIncidentId, 'resolved')}>
            <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
            Marcar como Resolvido
          </MenuItem>
        )}
        
        {selectedIncidentId && incidents.find(i => i.id === selectedIncidentId)?.status !== 'closed' && incidents.find(i => i.id === selectedIncidentId)?.status !== 'resolved' && (
          <MenuItem onClick={() => selectedIncidentId && handleUpdateStatus(selectedIncidentId, 'closed')}>
            <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
            Arquivar
          </MenuItem>
        )}
        
        <MenuItem onClick={() => selectedIncidentId && handleDeleteIncident(selectedIncidentId)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>

      {/* Diálogo de criação/edição */}
      <IncidentDialog 
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveIncident}
        incident={currentIncident}
      />

      {/* Diálogo de confirmação de exclusão */}
      <ConfirmDialog
        open={confirmDialogOpen}
        title="Excluir Incidente"
        content="Tem certeza que deseja excluir este incidente? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialogOpen(false)}
      />

      {/* Diálogo de confirmação de mudança de status */}
      <ConfirmDialog
        open={statusDialogOpen}
        title={`${incidentToUpdateStatus?.status === 'resolved' ? 'Resolver' : incidentToUpdateStatus?.status === 'in_progress' ? 'Atualizar' : 'Arquivar'} Incidente`}
        content={`Tem certeza que deseja marcar este incidente como ${incidentToUpdateStatus?.status === 'resolved' ? 'resolvido' : incidentToUpdateStatus?.status === 'in_progress' ? 'em progresso' : incidentToUpdateStatus?.status === 'open' ? 'ativo' : 'arquivado'}?`}
        onConfirm={confirmStatusUpdate}
        onCancel={() => setStatusDialogOpen(false)}
      />
    </Box>
  );
};

export default IncidentsList;
