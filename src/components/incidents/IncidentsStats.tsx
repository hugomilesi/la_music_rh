
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Schedule,
  Error,
} from '@mui/icons-material';
import { incidentService } from '../../services/incidentService';
import { Incident } from '../../types/incident';

interface StatsCardProps {
  title: string;
  value: number;
  total?: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  trend?: 'up' | 'down' | 'neutral';
  percentage?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  total,
  icon,
  color,
  trend,
  percentage
}) => {
  const theme = useTheme();
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp fontSize="small" color="success" />;
      case 'down':
        return <TrendingDown fontSize="small" color="error" />;
      default:
        return null;
    }
  };

  const getProgressValue = () => {
    if (total && total > 0) {
      return (value / total) * 100;
    }
    return 0;
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {icon}
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Box>
          {trend && (
            <Tooltip title={`${trend === 'up' ? 'Aumento' : 'Diminuição'} de ${percentage}%`}>
              <IconButton size="small">
                {getTrendIcon()}
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Typography variant="h4" component="div" color={`${color}.main`} gutterBottom>
          {value}
          {total && (
            <Typography variant="body2" component="span" color="text.secondary">
              {' '}/ {total}
            </Typography>
          )}
        </Typography>
        
        {total && (
          <Box mt={2}>
            <LinearProgress
              variant="determinate"
              value={getProgressValue()}
              color={color}
              sx={{ height: 8, borderRadius: 1 }}
            />
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              {getProgressValue().toFixed(1)}% do total
            </Typography>
          </Box>
        )}
        
        {percentage && (
          <Box display="flex" alignItems="center" gap={0.5} mt={1}>
            {getTrendIcon()}
            <Typography variant="body2" color="text.secondary">
              {percentage}% em relação ao mês anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const IncidentsStats: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await incidentService.getFiltered({});
        setIncidents(data);
      } catch (error) {
        console.error('Erro ao buscar incidentes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const getStats = () => {
    const total = incidents.length;
    const abertos = incidents.filter(i => i.status === 'aberto').length;
    const emAndamento = incidents.filter(i => i.status === 'em_andamento').length;
    const resolvidos = incidents.filter(i => i.status === 'resolvido').length;
    const cancelados = incidents.filter(i => i.status === 'cancelado').length;
    
    // Severidade
    const criticos = incidents.filter(i => i.severity === 'critica').length;
    const altos = incidents.filter(i => i.severity === 'alta').length;
    const medios = incidents.filter(i => i.severity === 'media').length;
    const baixos = incidents.filter(i => i.severity === 'baixa').length;

    return {
      total,
      abertos,
      emAndamento,
      resolvidos,
      cancelados,
      criticos,
      altos,
      medios,
      baixos,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Carregando estatísticas...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Estatísticas de Incidentes
      </Typography>
      
      <Grid container spacing={3}>
        {/* Status Cards */}
        <Grid component="div" item xs={12} md={6}>
          <StatsCard
            title="Incidentes Abertos"
            value={stats.abertos}
            total={stats.total}
            icon={<Error color="error" />}
            color="error"
            trend="up"
            percentage={12}
          />
        </Grid>
        
        <Grid component="div" item xs={12} md={6}>
          <StatsCard
            title="Em Andamento"
            value={stats.emAndamento}
            total={stats.total}
            icon={<Schedule color="warning" />}
            color="warning"
            trend="neutral"
          />
        </Grid>

        <Grid component="div" item xs={12} md={6}>
          <StatsCard
            title="Resolvidos"
            value={stats.resolvidos}
            total={stats.total}
            icon={<CheckCircle color="success" />}
            color="success"
            trend="up"
            percentage={8}
          />
        </Grid>

        <Grid component="div" item xs={12} md={6}>
          <StatsCard
            title="Total de Incidentes"
            value={stats.total}
            icon={<Warning color="info" />}
            color="info"
            trend="up"
            percentage={5}
          />
        </Grid>

        {/* Severity Distribution */}
        <Grid component="div" item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribuição por Severidade
              </Typography>
              
              <Grid container spacing={2}>
                {[
                  { label: 'Crítica', value: stats.criticos, color: 'error' as const },
                  { label: 'Alta', value: stats.altos, color: 'warning' as const },
                  { label: 'Média', value: stats.medios, color: 'info' as const },
                  { label: 'Baixa', value: stats.baixos, color: 'success' as const },
                ].map((severity) => (
                  <Grid component="div" item xs={6} md={3} key={severity.label}>
                    <Box textAlign="center">
                      <Typography variant="h4" color={`${severity.color}.main`}>
                        {severity.value}
                      </Typography>
                      <Chip
                        label={severity.label}
                        color={severity.color}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IncidentsStats;
