import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';

import { Incident, INCIDENT_TYPES } from '../../types/incident';
import { useEmployees } from '../../contexts/EmployeeContext';
import { EmployeeSelector } from './EmployeeSelector';

interface IncidentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (incident: Incident | Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => void;
  incident: Incident | null;
}

interface FormErrors {
  employeeId?: string;
  type?: string;
  severity?: string;
  description?: string;
  date?: string;
  reporterId?: string;
}

const IncidentDialog: React.FC<IncidentDialogProps> = ({ open, onClose, onSave, incident }) => {
  const { employees, loading: loadingEmployees } = useEmployees();
  const [formData, setFormData] = useState<Omit<Incident, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }>({
    employee: '',
    employeeId: '',
    type: '',
    severity: 'baixa',
    description: '',
    date: new Date().toISOString().split('T')[0],
    reporter: '',
    reporterId: '',
    status: 'aberto'
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (incident) {
      setFormData({
        ...incident
      });
    } else {
      setFormData({
        employee: '',
        employeeId: '',
        type: '',
        severity: 'baixa',
        description: '',
        date: new Date().toISOString().split('T')[0],
        reporter: '',
        reporterId: '',
        status: 'aberto'
      });
    }
    setErrors({});
  }, [incident, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Limpar erro do campo quando ele for alterado
      if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }

      // Se o campo for employeeId, atualizar o nome do funcionário
      if (name === 'employeeId') {
        const selectedEmployee = employees.find(emp => emp.id === value);
        if (selectedEmployee) {
          setFormData(prev => ({
            ...prev,
            employee: selectedEmployee.name
          }));
        }
      }

      // Se o campo for reporterId, atualizar o nome do relator
      if (name === 'reporterId') {
        const selectedReporter = employees.find(emp => emp.id === value);
        if (selectedReporter) {
          setFormData(prev => ({
            ...prev,
            reporter: selectedReporter.name
          }));
        }
      }
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0]
      }));
      
      // Limpar erro do campo quando ele for alterado
      if (errors.date) {
        setErrors(prev => ({
          ...prev,
          date: undefined
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.employeeId) {
      newErrors.employeeId = 'Selecione um funcionário';
    }
    
    if (!formData.type) {
      newErrors.type = 'Selecione um tipo de incidente';
    }
    
    if (!formData.severity) {
      newErrors.severity = 'Selecione a gravidade';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    
    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }
    
    if (!formData.reporterId) {
      newErrors.reporterId = 'Selecione quem reportou o incidente';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {incident ? 'Editar Incidente' : 'Novo Incidente'}
      </DialogTitle>
      
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Funcionário *
              </Typography>
              <EmployeeSelector
                value={formData.employeeId}
                onChange={(employeeId, employeeName) => {
                  setFormData(prev => ({
                    ...prev,
                    employeeId,
                    employee: employeeName
                  }));
                  if (errors.employeeId) {
                    setErrors(prev => ({
                      ...prev,
                      employeeId: undefined
                    }));
                  }
                }}
                placeholder="Buscar funcionário..."
                error={errors.employeeId}
                disabled={loadingEmployees}
              />
            </Grid>
            
            <Grid xs={12} md={6}>
              <DatePicker
                label="Data do Incidente"
                value={formData.date ? new Date(formData.date) : null}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date
                  }
                }}
              />
            </Grid>
            
            <Grid xs={12} md={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel id="type-label">Tipo de Incidente</InputLabel>
                <Select
                  labelId="type-label"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Tipo de Incidente"
                >
                  {INCIDENT_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid xs={12} md={6}>
              <FormControl fullWidth error={!!errors.severity}>
                <InputLabel id="severity-label">Gravidade</InputLabel>
                <Select
                  labelId="severity-label"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  label="Gravidade"
                >
                  <MenuItem value="baixa">Baixa</MenuItem>
                  <MenuItem value="media">Média</MenuItem>
                  <MenuItem value="alta">Alta</MenuItem>
                  <MenuItem value="critica">Crítica</MenuItem>
                </Select>
                {errors.severity && <FormHelperText>{errors.severity}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid size={12}>
              <TextField
                name="description"
                label="Descrição"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                fullWidth
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>
            
            <Grid xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Reportado por *
              </Typography>
              <EmployeeSelector
                value={formData.reporterId}
                onChange={(reporterId, reporterName) => {
                  setFormData(prev => ({
                    ...prev,
                    reporterId,
                    reporter: reporterName
                  }));
                  if (errors.reporterId) {
                    setErrors(prev => ({
                      ...prev,
                      reporterId: undefined
                    }));
                  }
                }}
                placeholder="Buscar quem reportou..."
                error={errors.reporterId}
                disabled={loadingEmployees}
              />
            </Grid>
            
            {incident && (
              <Grid xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="aberto">Aberto</MenuItem>
                    <MenuItem value="em_andamento">Em Andamento</MenuItem>
                    <MenuItem value="resolvido">Resolvido</MenuItem>
                    <MenuItem value="cancelado">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {incident ? 'Atualizar' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentDialog;