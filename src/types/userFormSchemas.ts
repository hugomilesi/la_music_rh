
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'coordenador', 'professor', 'usuario']),
  department: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  permissions: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'coordenador', 'professor', 'usuario']),
  department: z.string().optional(),
  phone: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active')
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
