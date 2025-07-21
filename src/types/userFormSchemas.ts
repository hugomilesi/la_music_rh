
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'coordenador', 'professor', 'usuario']),
  position: z.string().min(2, 'Cargo é obrigatório'),
  department: z.string().optional(),
  phone: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active')
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'coordenador', 'professor', 'usuario']),
  position: z.string().min(2, 'Cargo é obrigatório'),
  department: z.string().optional(),
  phone: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active')
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
