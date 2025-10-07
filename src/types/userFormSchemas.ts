
import { z } from 'zod';
import { Unit } from './unit';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  role: z.enum(['super_admin', 'admin', 'gestor_rh', 'gerente'], {
    required_error: 'Função é obrigatória',
  }),
  phone: z.string().optional(),
  unit: z.nativeEnum(Unit).optional(),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  role: z.enum(['super_admin', 'admin', 'gestor_rh', 'gerente'], {
    required_error: 'Função é obrigatória',
  }),
  phone: z.string().optional(),
  unit: z.nativeEnum(Unit).optional(),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
