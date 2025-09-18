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

interface TestControllerProps {
  scheduleId?: string;
  messageType: 'notification' | 'nps' | 'whatsapp' | 'email';
  onTestComplete?: (results: any[]) => void;
  disabled?: boolean;
}

const TestController: React.FC<TestControllerProps> = ({
  scheduleId,
  messageType,
  onTestComplete,
  disabled = false
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Controlador de Testes
          </Typography>
          <Alert severity="info" icon={<InfoIcon />}>
            O sistema de testes foi simplificado. 
            As funcionalidades de teste foram removidas desta versão.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TestController;