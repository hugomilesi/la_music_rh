
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Divider,
  LinearProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Archive,
  Assessment
} from '@mui/icons-material';
import { LoadingState } from '@/components/common/LoadingState';
import { useIncidents } from '@/contexts/IncidentsContext';

interface IncidentStats {
  total: number;
  active: number;
  resolved: number;
  archived: number;
  thisMonth: number;
  lastMonth: number;
  severityDistribution: {
    baixa: number;
    media: number;
    alta: number;
    critica: number;
  };
}

const IncidentsStats: React.FC = () => {
  const { incidents, loading } = useIncidents();
  const [stats, setStats] = useState<IncidentStats>({
    total: 0,
    active: 0,
    resolved: 0,
    archived: 0,
    thisMonth: 0,
    lastMonth: 0,
    severityDistribution: {
      baixa: 0,
      media: 0,
      alta: 0,
      critica: 0
    }
  });

  useEffect(() => {
    if (incidents.length > 0) {
      calculateStats();
    }
  }, [incidents]);

  const calculateStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const thisMonthIncidents = incidents.filter(incident => {
      const incidentDate = new Date(incident.incidentDate);
      return incidentDate.getMonth() === currentMonth && incidentDate.getFullYear() === currentYear;
    });

    const lastMonthIncidents = incidents.filter(incident => {
      const incidentDate = new Date(incident.incidentDate);
      return incidentDate.getMonth() === lastMonth && incidentDate.getFullYear() === lastMonthYear;
    });

    const severityDistribution = {
      baixa: incidents.filter(i => i.severity === 'baixa').length,
      media: incidents.filter(i => i.severity === 'media').length,
      alta: incidents.filter(i => i.severity === 'alta').length,
      critica: incidents.filter(i => i.severity === 'critica').length
    };

    setStats({
      total: incidents.length,
      active: incidents.filter(i => i.status === 'aberto').length,
      resolved: incidents.filter(i => i.status === 'resolvido').length,
      archived: incidents.filter(i => i.status === 'cancelado').length,
      thisMonth: thisMonthIncidents.length,
      lastMonth: lastMonthIncidents.length,
      severityDistribution
    });
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp sx={{ color: 'error.main', fontSize: 16 }} />;
    } else if (current < previous) {
      return <TrendingDown sx={{ color: 'success.main', fontSize: 16 }} />;
    }
    return null;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'error.main';
    if (current < previous) return 'success.main';
    return 'text.secondary';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'baixa': return '#FFC107';
      case 'media': return '#FF9800';
      case 'alta': return '#F44336';
      case 'critica': return '#B71C1C';
      default: return '#9E9E9E';
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Estatísticas de Ocorrências
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total de Ocorrências
                </Typography>
              </Box>
              <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.active}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Ativas
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                  {getTrendIcon(stats.thisMonth, stats.lastMonth)}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: getTrendColor(stats.thisMonth, stats.lastMonth),
                      fontWeight: 600
                    }}
                  >
                    vs mês anterior
                  </Typography>
                </Stack>
              </Box>
              <Warning sx={{ fontSize: 40, opacity: 0.8 }} />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.resolved}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Resolvidas
                </Typography>
              </Box>
              <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, height: '100%', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.archived}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Arquivadas
                </Typography>
              </Box>
              <Archive sx={{ fontSize: 40, opacity: 0.6 }} />
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Severity Distribution */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Distribuição por Gravidade
        </Typography>
        
        <Grid container spacing={3}>
          {Object.entries(stats.severityDistribution).map(([severity, count]) => {
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            const color = getSeverityColor(severity);
            
            return (
              <Grid item xs={12} md={4} key={severity}>
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {severity}
                    </Typography>
                    <Chip 
                      label={count}
                      size="small"
                      sx={{ 
                        backgroundColor: color,
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: color,
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {percentage.toFixed(1)}% do total
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Card>
    </Box>
  );
};

export default IncidentsStats;
