
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
  Archive,
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
        // Log desabilitado: Erro ao buscar incidentes
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const getStats = () => {
    const total = incidents.length;
    const ativos = incidents.filter(i => i.status === 'open').length;
    const resolvidos = incidents.filter(i => i.status === 'resolved').length;
      const arquivados = incidents.filter(i => i.status === 'closed').length;
    
    // Severidade
    const graves = incidents.filter(i => i.severity === 'grave').length;
    const moderados = incidents.filter(i => i.severity === 'moderado').length;
    const leves = incidents.filter(i => i.severity === 'leve').length;

    return {
      total,
      ativos,
      resolvidos,
      arquivados,
      graves,
      moderados,
      leves,
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
      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 3
        }}
      >
        <StatsCard
          title="Incidentes Ativos"
          value={stats.ativos}
          total={stats.total}
          icon={<Error color="error" />}
          color="error"
          trend="up"
          percentage={12}
        />
        
        <StatsCard
          title="Arquivados"
          value={stats.arquivados}
          total={stats.total}
          icon={<Archive color="default" />}
          color="default"
          trend="neutral"
        />

        <StatsCard
          title="Resolvidos"
          value={stats.resolvidos}
          total={stats.total}
          icon={<CheckCircle color="success" />}
          color="success"
          trend="up"
          percentage={8}
        />

        <StatsCard
          title="Total de Incidentes"
          value={stats.total}
          icon={<Warning color="info" />}
          color="info"
          trend="up"
          percentage={5}
        />
      </Box>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Distribuição por Severidade
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2
            }}
          >
            {[
              { label: 'Grave', value: stats.graves, color: 'error' as const },
              { label: 'Moderado', value: stats.moderados, color: 'warning' as const },
              { label: 'Leve', value: stats.leves, color: 'success' as const },
            ].map((severity) => (
              <Box key={severity.label} textAlign="center">
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
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IncidentsStats;
