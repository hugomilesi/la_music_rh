import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert
} from '@mui/material';
import {
  Info as InfoIcon
} from '@mui/icons-material';

const ScheduleDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Dashboard de Agendamentos
          </Typography>
          <Alert severity="info" icon={<InfoIcon />}>
            O dashboard de agendamentos foi simplificado. 
            As funcionalidades de agendamento foram removidas desta versão.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ScheduleDashboard;