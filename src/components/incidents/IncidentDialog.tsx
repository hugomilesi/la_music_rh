import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  SelectChangeEvent,
  Box
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
  incidentDate?: string;
  reporterId?: string;
}

const IncidentDialog: React.FC<IncidentDialogProps> = ({ open, onClose, onSave, incident }) => {
  const { employees, isLoading: loadingEmployees } = useEmployees();
  const [formData, setFormData] = useState<Omit<Incident, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }>({
    employeeId: '',
    employeeName: '',
    type: '',
    severity: 'leve',
    description: '',
    incidentDate: new Date().toISOString().split('T')[0],
    reporterId: '',
    reporterName: '',
    status: 'ativo'
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (incident) {
      setFormData({
        id: incident.id,
        employeeId: incident.employeeId,
        employeeName: incident.employeeName,
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        incidentDate: incident.incidentDate,
        reporterId: incident.reporterId,
        reporterName: incident.reporterName,
        status: incident.status
      });
    } else {
      setFormData({
        employeeId: '',
        employeeName: '',
        type: '',
        severity: 'leve',
        description: '',
        incidentDate: new Date().toISOString().split('T')[0],
        reporterId: '',
        reporterName: '',
        status: 'ativo'
      });
    }
    setErrors({});
  }, [incident, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
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
            employeeName: selectedEmployee.name
          }));
        }
      }

      // Se o campo for reporterId, atualizar o nome do relator
      if (name === 'reporterId') {
        const selectedReporter = employees.find(emp => emp.id === value);
        if (selectedReporter) {
          setFormData(prev => ({
            ...prev,
            reporterName: selectedReporter.name
          }));
        }
      }
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        incidentDate: date.toISOString().split('T')[0]
      }));
      
      // Limpar erro do campo quando ele for alterado
      if (errors.incidentDate) {
        setErrors(prev => ({
          ...prev,
          incidentDate: undefined
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
    
    if (!formData.incidentDate) {
      newErrors.incidentDate = 'Data é obrigatória';
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
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 3, 
            mt: 2 
          }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Funcionário *
              </Typography>
              <EmployeeSelector
                value={formData.employeeId}
                onChange={(employeeId, employeeName) => {
                  setFormData(prev => ({
                    ...prev,
                    employeeId,
                    employeeName: employeeName
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
            </Box>
            
            <Box>
              <DatePicker
                label="Data do Incidente"
                value={formData.incidentDate ? new Date(formData.incidentDate) : null}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.incidentDate,
                    helperText: errors.incidentDate
                  }
                }}
              />
            </Box>
            
            <Box>
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
            </Box>
            
            <Box>
              <FormControl fullWidth error={!!errors.severity}>
                <InputLabel id="severity-label">Gravidade</InputLabel>
                <Select
                  labelId="severity-label"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  label="Gravidade"
                >
                  <MenuItem value="leve">Leve</MenuItem>
                  <MenuItem value="moderado">Moderado</MenuItem>
                  <MenuItem value="grave">Grave</MenuItem>
                </Select>
                {errors.severity && <FormHelperText>{errors.severity}</FormHelperText>}
              </FormControl>
            </Box>
            
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
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
            </Box>
            
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Reportado por *
              </Typography>
              <EmployeeSelector
                value={formData.reporterId}
                onChange={(reporterId, reporterName) => {
                  setFormData(prev => ({
                    ...prev,
                    reporterId,
                    reporterName: reporterName
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
            </Box>
            
            {incident && (
              <Box>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="ativo">Ativo</MenuItem>
                    <MenuItem value="resolvido">Resolvido</MenuItem>
                    <MenuItem value="arquivado">Arquivado</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
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

// NOTA: O EmployeeContextType no arquivo src/contexts/EmployeeContext.tsx 
// já possui a propriedade 'isLoading: boolean' que está sendo usada corretamente neste arquivo.