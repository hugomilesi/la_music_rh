
import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string()
    .min(1, 'Nome de usuário é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .refine(val => val.trim().length > 0, 'Nome não pode estar vazio'),
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido')
    .max(255, 'Email não pode ter mais de 255 caracteres'),
  role: z.enum(['admin', 'gestor_rh', 'gerente'], {
    errorMap: () => ({ message: 'Perfil de usuário é obrigatório' })
  }),
  position: z.string()
    .min(1, 'Cargo é obrigatório')
    .min(2, 'Cargo deve ter pelo menos 2 caracteres')
    .max(100, 'Cargo não pode ter mais de 100 caracteres'),
  department: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active')
});

export const updateUserSchema = z.object({
  username: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.enum(['admin', 'gestor_rh', 'gerente']),
  position: z.string().min(2, 'Cargo é obrigatório'),
  department: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active')
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
