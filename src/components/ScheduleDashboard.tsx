import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  NotificationsActive as NotificationIcon,
  Poll as PollIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import useMessageScheduler, { MessageSchedule, ScheduleStatistics } from '../hooks/useMessageScheduler';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ScheduleDashboard: React.FC = () => {
  const {
    schedules,
    statistics,
    loading,
    error,
    fetchSchedules,
    fetchStatistics,
    updateSchedule,
    deleteSchedule,
    permissions
  } = useMessageScheduler();

  // Estados
  const [tabValue, setTabValue] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 segundos

  // Cores para gráficos
  const COLORS = {
    notification: '#2196F3',
    nps: '#4CAF50',
    whatsapp: '#25D366',
    email: '#FF9800',
    success: '#4CAF50',
    error: '#F44336',
    pending: '#FF9800',
    paused: '#9E9E9E'
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchSchedules();
    fetchStatistics();
  }, [fetchSchedules, fetchStatistics]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchSchedules();
        fetchStatistics();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchSchedules, fetchStatistics]);

  // Filtrar agendamentos
  const filteredSchedules = schedules.filter(schedule => {
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    const matchesType = typeFilter === 'all' || schedule.type === typeFilter;
    const matchesSearch = !searchFilter || 
      schedule.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      schedule.description?.toLowerCase().includes(searchFilter.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  // Função para obter ícone do tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'notification':
        return <NotificationIcon />;
      case 'nps':
        return <PollIcon />;
      case 'whatsapp':
        return <WhatsAppIcon />;
      case 'email':
        return <EmailIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  // Função para obter cor do status
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'failed':
        return 'error';
      case 'paused':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Função para pausar/reativar agendamento
  const handleTogglePause = async (schedule: MessageSchedule) => {
    const newStatus = schedule.status === 'paused' ? 'active' : 'paused';
    await updateSchedule(schedule.id, { status: newStatus });
  };

  // Função para deletar agendamento
  const handleDelete = async (scheduleId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este agendamento?')) {
      await deleteSchedule(scheduleId);
    }
  };

  // Preparar dados para gráficos
  const chartData = statistics ? {
    typeDistribution: [
      { name: 'Notificações', value: statistics.byType.notification || 0, color: COLORS.notification },
      { name: 'NPS', value: statistics.byType.nps || 0, color: COLORS.nps },
      { name: 'WhatsApp', value: statistics.byType.whatsapp || 0, color: COLORS.whatsapp },
      { name: 'Email', value: statistics.byType.email || 0, color: COLORS.email }
    ],
    statusDistribution: [
      { name: 'Ativos', value: statistics.byStatus.active || 0, color: COLORS.success },
      { name: 'Concluídos', value: statistics.byStatus.completed || 0, color: COLORS.success },
      { name: 'Falharam', value: statistics.byStatus.failed || 0, color: COLORS.error },
      { name: 'Pausados', value: statistics.byStatus.paused || 0, color: COLORS.paused }
    ],
    executionTrend: statistics.executionTrend || []
  } : null;

  // Renderizar métricas principais
  const renderMetrics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: COLORS.success, mr: 2 }}>
                <ScheduleIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {statistics?.total || 0}
                </Typography>
                <Typography color="text.secondary">
                  Total de Agendamentos
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: COLORS.success, mr: 2 }}>
                <CheckCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {statistics?.byStatus.active || 0}
                </Typography>
                <Typography color="text.secondary">
                  Ativos
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: COLORS.error, mr: 2 }}>
                <ErrorIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {statistics?.byStatus.failed || 0}
                </Typography>
                <Typography color="text.secondary">
                  Falharam
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: COLORS.notification, mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {statistics?.successRate ? `${Math.round(statistics.successRate)}%` : '0%'}
                </Typography>
                <Typography color="text.secondary">
                  Taxa de Sucesso
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Renderizar gráficos
  const renderCharts = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribuição por Tipo
            </Typography>
            {chartData && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Status dos Agendamentos
            </Typography>
            {chartData && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.statusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill={(entry) => entry.color} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {chartData?.executionTrend.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tendência de Execução
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.executionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="executions" stroke={COLORS.notification} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  // Renderizar lista de agendamentos
  const renderSchedulesList = () => (
    <Card>
      <CardContent>
        {/* Filtros */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Buscar"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="completed">Concluído</MenuItem>
                <MenuItem value="failed">Falhado</MenuItem>
                <MenuItem value="paused">Pausado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="notification">Notificação</MenuItem>
                <MenuItem value="nps">NPS</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="email">Email</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchSchedules();
                fetchStatistics();
              }}
              disabled={loading}
            >
              Atualizar
            </Button>
          </Grid>
        </Grid>

        {/* Tabela */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Agendado Para</TableCell>
                <TableCell>Última Execução</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTypeIcon(schedule.type)}
                      <Typography variant="body2">
                        {schedule.type}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {schedule.title}
                    </Typography>
                    {schedule.description && (
                      <Typography variant="caption" color="text.secondary">
                        {schedule.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={schedule.status}
                      color={getStatusColor(schedule.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {schedule.scheduled_for ? (
                      <Typography variant="body2">
                        {format(new Date(schedule.scheduled_for), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Imediato
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {schedule.last_executed_at ? (
                      <Typography variant="body2">
                        {formatDistanceToNow(new Date(schedule.last_executed_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nunca
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title={schedule.status === 'paused' ? 'Reativar' : 'Pausar'}>
                        <IconButton
                          size="small"
                          onClick={() => handleTogglePause(schedule)}
                          disabled={schedule.status === 'completed'}
                        >
                          {schedule.status === 'paused' ? <PlayArrowIcon /> : <PauseIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Visualizar">
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Deletar">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(schedule.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredSchedules.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Nenhum agendamento encontrado
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (!permissions) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Carregando permissões...
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Agendamentos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Visão Geral" />
          <Tab label="Gráficos" />
          <Tab label="Agendamentos" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderMetrics()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderCharts()}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {renderSchedulesList()}
      </TabPanel>
    </Box>
  );
};

export default ScheduleDashboard;