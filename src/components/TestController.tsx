import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  TextField,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useUsers } from '../hooks/useUsers';
import useMessageScheduler from '../hooks/useMessageScheduler';

interface TestControllerProps {
  scheduleId?: string;
  messageType: 'notification' | 'nps' | 'whatsapp' | 'email';
  onTestComplete?: (results: TestResult[]) => void;
  disabled?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role?: string;
}

interface TestResult {
  userId: string;
  userName: string;
  status: 'success' | 'error' | 'pending';
  message?: string;
  timestamp: Date;
}

interface TestSettings {
  maxRecipients: number;
  enableLogging: boolean;
  simulateOnly: boolean;
  delayBetweenSends: number;
}

const TestController: React.FC<TestControllerProps> = ({
  scheduleId,
  messageType,
  onTestComplete,
  disabled = false
}) => {
  const { users, fetchUsers } = useUsers();
  const { executeSchedule, loading } = useMessageScheduler();

  // Estados principais
  const [isTestMode, setIsTestMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [testSettings, setTestSettings] = useState<TestSettings>({
    maxRecipients: 5,
    enableLogging: true,
    simulateOnly: false,
    delayBetweenSends: 1000
  });

  // Estados de filtro
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Carregar usuários
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesDepartment = !departmentFilter || user.department === departmentFilter;
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesSearch = !searchFilter || 
      user.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      user.email.toLowerCase().includes(searchFilter.toLowerCase());
    
    return matchesDepartment && matchesRole && matchesSearch;
  });

  // Obter departamentos únicos
  const departments = [...new Set(users.map(u => u.department).filter(Boolean))];
  
  // Obter cargos únicos
  const roles = [...new Set(users.map(u => u.role).filter(Boolean))];

  // Função para adicionar usuário ao teste
  const handleAddUser = (user: User) => {
    if (selectedUsers.length >= testSettings.maxRecipients) {
      alert(`Máximo de ${testSettings.maxRecipients} destinatários permitidos para teste`);
      return;
    }
    
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  // Função para remover usuário do teste
  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
    setTestResults(prev => prev.filter(r => r.userId !== userId));
  };

  // Função para executar teste
  const handleRunTest = async () => {
    if (selectedUsers.length === 0) {
      alert('Selecione pelo menos um destinatário para o teste');
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    // Inicializar resultados como pending
    const initialResults: TestResult[] = selectedUsers.map(user => ({
      userId: user.id,
      userName: user.name,
      status: 'pending',
      timestamp: new Date()
    }));
    setTestResults(initialResults);

    try {
      for (let i = 0; i < selectedUsers.length; i++) {
        const user = selectedUsers[i];
        
        try {
          if (testSettings.simulateOnly) {
            // Simular envio
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setTestResults(prev => prev.map(result => 
              result.userId === user.id 
                ? { ...result, status: 'success', message: 'Simulação bem-sucedida' }
                : result
            ));
          } else {
            // Envio real (se scheduleId fornecido)
            if (scheduleId) {
              await executeSchedule(scheduleId, [user.id]);
            }
            
            setTestResults(prev => prev.map(result => 
              result.userId === user.id 
                ? { ...result, status: 'success', message: 'Enviado com sucesso' }
                : result
            ));
          }
        } catch (error) {
          setTestResults(prev => prev.map(result => 
            result.userId === user.id 
              ? { 
                  ...result, 
                  status: 'error', 
                  message: error instanceof Error ? error.message : 'Erro desconhecido'
                }
              : result
          ));
        }

        // Delay entre envios
        if (i < selectedUsers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, testSettings.delayBetweenSends));
        }
      }
    } finally {
      setIsRunning(false);
      
      // Chamar callback com resultados
      const finalResults = testResults.filter(r => r.status !== 'pending');
      onTestComplete?.(finalResults);
    }
  };

  // Função para parar teste
  const handleStopTest = () => {
    setIsRunning(false);
  };

  // Função para limpar teste
  const handleClearTest = () => {
    setSelectedUsers([]);
    setTestResults([]);
  };

  // Renderizar ícone de status
  const renderStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'pending':
        return <InfoIcon color="info" />;
      default:
        return null;
    }
  };

  // Renderizar seletor de usuários
  const renderUserSelector = () => (
    <Dialog
      open={showUserSelector}
      onClose={() => setShowUserSelector(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Selecionar Usuários para Teste
        <Typography variant="caption" display="block">
          Máximo: {testSettings.maxRecipients} usuários
        </Typography>
      </DialogTitle>
      <DialogContent>
        {/* Filtros */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Departamento</InputLabel>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Cargo</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {roles.map(role => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Lista de usuários */}
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredUsers.map((user) => {
            const isSelected = selectedUsers.some(u => u.id === user.id);
            const isDisabled = !isSelected && selectedUsers.length >= testSettings.maxRecipients;
            
            return (
              <ListItem key={user.id}>
                <ListItemIcon>
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleAddUser(user);
                      } else {
                        handleRemoveUser(user.id);
                      }
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={user.name}
                  secondary={`${user.email} • ${user.department || 'N/A'} • ${user.role || 'N/A'}`}
                />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowUserSelector(false)}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );

  // Renderizar configurações
  const renderSettings = () => (
    <Dialog
      open={showSettings}
      onClose={() => setShowSettings(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Configurações de Teste</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Máximo de Destinatários"
              type="number"
              value={testSettings.maxRecipients}
              onChange={(e) => setTestSettings(prev => ({
                ...prev,
                maxRecipients: Math.max(1, Math.min(50, parseInt(e.target.value) || 1))
              }))}
              inputProps={{ min: 1, max: 50 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Delay entre Envios (ms)"
              type="number"
              value={testSettings.delayBetweenSends}
              onChange={(e) => setTestSettings(prev => ({
                ...prev,
                delayBetweenSends: Math.max(0, parseInt(e.target.value) || 0)
              }))}
              inputProps={{ min: 0, max: 10000 }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={testSettings.simulateOnly}
                  onChange={(e) => setTestSettings(prev => ({
                    ...prev,
                    simulateOnly: e.target.checked
                  }))}
                />
              }
              label="Apenas Simular (não enviar realmente)"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={testSettings.enableLogging}
                  onChange={(e) => setTestSettings(prev => ({
                    ...prev,
                    enableLogging: e.target.checked
                  }))}
                />
              }
              label="Habilitar Logs Detalhados"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowSettings(false)}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Controle de Teste - {messageType?.toUpperCase() || 'DESCONHECIDO'}
          </Typography>
          <Box>
            <Tooltip title="Configurações">
              <IconButton onClick={() => setShowSettings(true)} size="small">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <FormControlLabel
              control={
                <Switch
                  checked={isTestMode}
                  onChange={(e) => setIsTestMode(e.target.checked)}
                  disabled={disabled}
                />
              }
              label="Modo Teste"
            />
          </Box>
        </Box>

        {!isTestMode ? (
          <Alert severity="info">
            Ative o modo teste para selecionar destinatários específicos e evitar envios indesejados.
          </Alert>
        ) : (
          <>
            {/* Aviso de Teste */}
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon />
                <Typography variant="body2">
                  Modo teste ativo. {testSettings.simulateOnly ? 'Apenas simulação' : 'Envios reais'} para usuários selecionados.
                </Typography>
              </Box>
            </Alert>

            {/* Usuários Selecionados */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2">
                  Destinatários Selecionados ({selectedUsers.length}/{testSettings.maxRecipients})
                </Typography>
                <Button
                  startIcon={<GroupIcon />}
                  onClick={() => setShowUserSelector(true)}
                  size="small"
                  variant="outlined"
                >
                  Selecionar
                </Button>
              </Box>
              
              {selectedUsers.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum destinatário selecionado
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedUsers.map((user) => (
                    <Chip
                      key={user.id}
                      label={user.name}
                      onDelete={() => handleRemoveUser(user.id)}
                      size="small"
                      disabled={isRunning}
                    />
                  ))}
                </Box>
              )}
            </Paper>

            {/* Resultados do Teste */}
            {testResults.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Resultados do Teste
                </Typography>
                <List dense>
                  {testResults.map((result) => (
                    <ListItem key={result.userId}>
                      <ListItemIcon>
                        {renderStatusIcon(result.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={result.userName}
                        secondary={result.message || result.status}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* Botões de Controle */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                onClick={handleClearTest}
                disabled={isRunning || selectedUsers.length === 0}
              >
                Limpar
              </Button>
              {isRunning ? (
                <Button
                  startIcon={<StopIcon />}
                  onClick={handleStopTest}
                  color="error"
                  variant="contained"
                >
                  Parar Teste
                </Button>
              ) : (
                <Button
                  startIcon={<PlayIcon />}
                  onClick={handleRunTest}
                  disabled={selectedUsers.length === 0 || loading}
                  variant="contained"
                >
                  Executar Teste
                </Button>
              )}
            </Box>
          </>
        )}
      </CardContent>

      {/* Dialogs */}
      {renderUserSelector()}
      {renderSettings()}
    </Card>
  );
};

export default TestController;