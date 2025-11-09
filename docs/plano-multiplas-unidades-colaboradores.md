# Plano de Implementação: Múltiplas Unidades por Colaborador

**Data:** 09/11/2025
**Autor:** Sistema LA Music RH
**Objetivo:** Permitir que colaboradores trabalhem em múltiplas unidades simultaneamente

---

## Índice

1. [Resumo Executivo](#resumo-executivo)
2. [Contexto do Negócio](#contexto-do-negócio)
3. [Diagnóstico da Situação Atual](#diagnóstico-da-situação-atual)
4. [Arquitetura da Solução](#arquitetura-da-solução)
5. [Implementação Detalhada](#implementação-detalhada)
6. [Plano de Migração](#plano-de-migração)
7. [Testes e Validação](#testes-e-validação)
8. [Cronograma](#cronograma)
9. [Riscos e Mitigações](#riscos-e-mitigações)

---

## Resumo Executivo

### Problema Atual
O sistema permite cadastrar colaboradores com apenas **uma unidade**, impossibilitando o registro correto de profissionais que trabalham em múltiplas unidades da empresa.

### Solução Proposta
Implementar uma **relação many-to-many** entre colaboradores e unidades através de uma tabela intermediária, permitindo que um colaborador esteja vinculado a 1, 2 ou 3 unidades simultaneamente.

### Principais Mudanças
- ✅ Criação de tabelas `unidades` e `colaborador_unidades`
- ✅ Remoção do campo `unidade` da tabela `colaboradores`
- ✅ Interface com multi-select (checkboxes)
- ✅ Filtros com seleção múltipla de unidades
- ✅ Visualização com badges
- ✅ **REMOÇÃO completa do conceito de "unidade principal"**

### Impacto
- 🔧 **Backend:** Migrations SQL + Services atualizados
- 🎨 **Frontend:** Formulários e filtros redesenhados
- 📊 **Dados:** Migração automática de colaboradores existentes
- ⏱️ **Tempo estimado:** ~15 horas de desenvolvimento

---

## Contexto do Negócio

### Estrutura da Empresa

**LA Music possui 3 unidades físicas:**

| Unidade | Descrição |
|---------|-----------|
| **Campo Grande** | Unidade principal com dois públicos (EMLA - adultos / LAMK - infantil) |
| **Barra** | Unidade completa |
| **Recreio** | Unidade completa |

### Diferença: Unidades vs Folha de Pagamento

**Unidades Físicas (Colaboradores):**
- Campo Grande
- Barra
- Recreio

**Unidades de Folha de Pagamento (Contabilidade):**
- Barra
- CG EMLA (Campo Grande - Escola de Música LA - Adultos)
- CG LAMK (Campo Grande - LA Music Kids - Infantil)
- Professores Multi-Unidade
- Recreio
- Staff Rateado

> **Importante:** A folha de pagamento usa classificações contábeis diferentes, mas os colaboradores trabalham nas **3 unidades físicas**.

### Regras de Negócio

1. ✅ Colaboradores podem trabalhar em 1, 2 ou 3 unidades
2. ✅ Todos os tipos de contratação podem ter múltiplas unidades
3. ✅ **NÃO existe conceito de "unidade principal"**
4. ✅ Folha de pagamento será preenchida manualmente pelo usuário (sem divisão automática)
5. ✅ Eventos podem ser vinculados a uma ou mais unidades
6. ✅ Filtros devem permitir seleção múltipla

---

## Diagnóstico da Situação Atual

### Estrutura do Banco de Dados (Antes)

```sql
CREATE TABLE public.colaboradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    cargo VARCHAR(255) NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    data_admissao TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- PROBLEMA: Apenas uma unidade
    unidade VARCHAR(50) NOT NULL,

    tipo_contratacao VARCHAR(50) NOT NULL,
    banco VARCHAR(255),
    agencia VARCHAR(20),
    conta VARCHAR(30),
    tipo_conta VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ativo',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    telefone VARCHAR(20),

    CONSTRAINT colaboradores_unidade_check
    CHECK (unidade IN ('Campo Grande', 'Barra', 'Recreio'))
);
```

### Tipos TypeScript (Antes)

```typescript
interface Colaborador {
  id: string;
  nome: string;
  // ... outros campos
  unidade: UnidadeColaborador; // ❌ Campo singular
  // ... mais campos
}
```

### Interface Frontend (Antes)

```tsx
<Select value={unidade} onChange={...}>
  <option>Campo Grande</option>
  <option>Barra</option>
  <option>Recreio</option>
</Select>
```

---

## Arquitetura da Solução

### Modelo de Dados (Depois)

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────┐
│  colaboradores  │         │ colaborador_unidades │         │  unidades   │
├─────────────────┤         ├──────────────────────┤         ├─────────────┤
│ id (PK)         │◄────────┤ colaborador_id (FK)  │         │ id (PK)     │
│ nome            │         │ unidade_id (FK)      ├────────►│ nome        │
│ email           │         │ created_at           │         │ codigo      │
│ cpf             │         └──────────────────────┘         │ ativa       │
│ cargo           │                                          │ created_at  │
│ departamento    │                                          └─────────────┘
│ data_admissao   │
│ tipo_contratacao│
│ banco           │
│ agencia         │
│ conta           │
│ tipo_conta      │
│ status          │
│ created_at      │
│ updated_at      │
│ telefone        │
└─────────────────┘

RELACIONAMENTO: Many-to-Many
- 1 colaborador → N unidades
- 1 unidade → N colaboradores
```

### Fluxo de Dados

```
┌──────────────┐
│   Frontend   │
│  (Checkboxes)│
└──────┬───────┘
       │
       │ POST { unidade_ids: ['uuid1', 'uuid2'] }
       ↓
┌──────────────────┐
│  Service Layer   │
│ criarColaborador │
└──────┬───────────┘
       │
       │ INSERT colaborador + vincularUnidades()
       ↓
┌──────────────────────────┐
│    Supabase Database     │
│  1. INSERT colaboradores │
│  2. INSERT colaborador_  │
│     unidades (batch)     │
└──────────────────────────┘
```

---

## Implementação Detalhada

### FASE 1: Migrations do Banco de Dados

#### Migration 1: Criar tabela `unidades`
**Arquivo:** `supabase/migrations/20250209000001_create_unidades_table.sql`

```sql
-- ==================================================
-- MIGRATION 1: Criar tabela de unidades
-- Data: 09/11/2025
-- Descrição: Tabela centralizada de unidades físicas
-- ==================================================

-- Criar tabela de unidades
CREATE TABLE public.unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) UNIQUE NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    ativa BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Comentários
COMMENT ON TABLE public.unidades IS 'Unidades físicas da LA Music (Campo Grande, Barra, Recreio)';
COMMENT ON COLUMN public.unidades.nome IS 'Nome completo da unidade';
COMMENT ON COLUMN public.unidades.codigo IS 'Código curto da unidade (CG, BAR, REC)';
COMMENT ON COLUMN public.unidades.ativa IS 'Se a unidade está ativa no sistema';

-- Inserir as 3 unidades
INSERT INTO public.unidades (nome, codigo) VALUES
    ('Campo Grande', 'CG'),
    ('Barra', 'BAR'),
    ('Recreio', 'REC');

-- Habilitar RLS
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir leitura para usuários autenticados"
    ON public.unidades
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir todas operações para administradores"
    ON public.unidades
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Criar índice
CREATE INDEX idx_unidades_ativa ON public.unidades(ativa);
CREATE INDEX idx_unidades_codigo ON public.unidades(codigo);

-- Grant de permissões
GRANT SELECT ON public.unidades TO authenticated;
```

#### Migration 2: Criar tabela `colaborador_unidades`
**Arquivo:** `supabase/migrations/20250209000002_create_colaborador_unidades_table.sql`

```sql
-- ==================================================
-- MIGRATION 2: Criar tabela de relacionamento
-- Data: 09/11/2025
-- Descrição: Tabela many-to-many entre colaboradores e unidades
-- ==================================================

-- Criar tabela de relacionamento
CREATE TABLE public.colaborador_unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
    unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraint: Não permitir duplicatas
    CONSTRAINT colaborador_unidades_unique UNIQUE(colaborador_id, unidade_id)
);

-- Comentários
COMMENT ON TABLE public.colaborador_unidades IS 'Relacionamento many-to-many entre colaboradores e unidades';
COMMENT ON COLUMN public.colaborador_unidades.colaborador_id IS 'Referência ao colaborador';
COMMENT ON COLUMN public.colaborador_unidades.unidade_id IS 'Referência à unidade';

-- Criar índices para performance
CREATE INDEX idx_colaborador_unidades_colaborador ON public.colaborador_unidades(colaborador_id);
CREATE INDEX idx_colaborador_unidades_unidade ON public.colaborador_unidades(unidade_id);

-- Habilitar RLS
ALTER TABLE public.colaborador_unidades ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir leitura para usuários autenticados"
    ON public.colaborador_unidades
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir insert para usuários autenticados"
    ON public.colaborador_unidades
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir update para usuários autenticados"
    ON public.colaborador_unidades
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Permitir delete para usuários autenticados"
    ON public.colaborador_unidades
    FOR DELETE
    TO authenticated
    USING (true);

-- Grant de permissões
GRANT ALL ON public.colaborador_unidades TO authenticated;
```

#### Migration 3: Migrar dados existentes
**Arquivo:** `supabase/migrations/20250209000003_migrate_existing_colaboradores_data.sql`

```sql
-- ==================================================
-- MIGRATION 3: Migrar dados existentes
-- Data: 09/11/2025
-- Descrição: Copiar unidades atuais dos colaboradores para nova tabela
-- ==================================================

-- Migrar dados existentes de colaboradores
INSERT INTO public.colaborador_unidades (colaborador_id, unidade_id)
SELECT
    c.id AS colaborador_id,
    u.id AS unidade_id
FROM
    public.colaboradores c
JOIN
    public.unidades u ON u.nome = c.unidade;

-- Verificar se a migração foi bem-sucedida
DO $$
DECLARE
    total_colaboradores INT;
    total_vinculos INT;
BEGIN
    SELECT COUNT(*) INTO total_colaboradores FROM public.colaboradores;
    SELECT COUNT(*) INTO total_vinculos FROM public.colaborador_unidades;

    IF total_colaboradores != total_vinculos THEN
        RAISE EXCEPTION 'Erro na migração: % colaboradores mas % vínculos', total_colaboradores, total_vinculos;
    END IF;

    RAISE NOTICE 'Migração bem-sucedida: % colaboradores migrados', total_colaboradores;
END $$;
```

#### Migration 4: Remover coluna antiga
**Arquivo:** `supabase/migrations/20250209000004_remove_unidade_column_from_colaboradores.sql`

```sql
-- ==================================================
-- MIGRATION 4: Remover coluna unidade (APÓS VALIDAÇÃO)
-- Data: 09/11/2025
-- Descrição: Remove coluna antiga após validação em produção
-- ATENÇÃO: Executar APENAS após validar que tudo funciona
-- ==================================================

-- Remover constraint CHECK
ALTER TABLE public.colaboradores
DROP CONSTRAINT IF EXISTS colaboradores_unidade_check;

-- Remover índice
DROP INDEX IF EXISTS public.idx_colaboradores_unidade;

-- Remover coluna unidade
ALTER TABLE public.colaboradores
DROP COLUMN IF EXISTS unidade;

-- Verificação final
DO $$
BEGIN
    -- Verificar se todos os colaboradores têm pelo menos uma unidade
    IF EXISTS (
        SELECT 1
        FROM public.colaboradores c
        WHERE NOT EXISTS (
            SELECT 1
            FROM public.colaborador_unidades cu
            WHERE cu.colaborador_id = c.id
        )
    ) THEN
        RAISE EXCEPTION 'Erro: Existem colaboradores sem unidade vinculada!';
    END IF;

    RAISE NOTICE 'Coluna "unidade" removida com sucesso';
END $$;
```

---

### FASE 2: Backend (TypeScript)

#### 2.1 Atualizar Tipos
**Arquivo:** `src/types/colaborador.ts`

```typescript
// ==================================================
// TIPOS ATUALIZADOS - Múltiplas Unidades
// ==================================================

// ===== NOVA INTERFACE: Unidade =====
export interface Unidade {
  id: string;
  nome: string;
  codigo: string;
  ativa: boolean;
  created_at: string;
}

// ===== NOVA INTERFACE: Vínculo Colaborador-Unidade =====
export interface ColaboradorUnidade {
  id: string;
  colaborador_id: string;
  unidade_id: string;
  created_at: string;
  unidade?: Unidade; // Join com dados da unidade
}

// ===== ENUM: UnidadeColaborador (mantido para compatibilidade) =====
export enum UnidadeColaborador {
  CAMPO_GRANDE = 'Campo Grande',
  BARRA = 'Barra',
  RECREIO = 'Recreio'
}

export enum TipoContratacao {
  CLT = 'CLT',
  PJ = 'PJ',
  ESTAGIARIO = 'Estágiário',
  FREELANCER = 'Freelancer',
  HORISTA = 'Horista'
}

export enum TipoConta {
  CORRENTE = 'corrente',
  POUPANCA = 'poupança'
}

export enum StatusColaborador {
  ATIVO = 'ativo',
  INATIVO = 'inativo'
}

// ===== INTERFACE PRINCIPAL: Colaborador (ATUALIZADA) =====
export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf: string;
  cargo: string;
  departamento: string;
  data_admissao: string;

  // ❌ REMOVIDO: unidade: UnidadeColaborador;
  // ✅ ADICIONADO: Array de unidades vinculadas
  unidades?: ColaboradorUnidade[];

  tipo_contratacao: TipoContratacao;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: TipoConta;
  status: StatusColaborador;
  created_at: string;
  updated_at: string;
}

// ===== INTERFACE: Criar Colaborador (ATUALIZADA) =====
export interface NovoColaborador {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string;

  // ❌ REMOVIDO: unidade: UnidadeColaborador;
  // ✅ ADICIONADO: Array de IDs de unidades
  unidade_ids: string[];

  tipo_contratacao?: TipoContratacao;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: TipoConta;
  status?: StatusColaborador;
}

// ===== INTERFACE: Atualizar Colaborador (ATUALIZADA) =====
export interface AtualizarColaborador {
  nome?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  cargo?: string;
  departamento?: string;

  // ❌ REMOVIDO: unidade?: UnidadeColaborador;
  // ✅ ADICIONADO: Array de IDs de unidades (opcional)
  unidade_ids?: string[];

  tipo_contratacao?: TipoContratacao;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: TipoConta;
  status?: StatusColaborador;
}

// ===== INTERFACE: Filtros (ATUALIZADA) =====
export interface FiltrosColaborador {
  searchTerm?: string;

  // ❌ REMOVIDO: unidade?: UnidadeColaborador | '';
  // ✅ ADICIONADO: Array de IDs de unidades (filtro múltiplo)
  unidade_ids?: string[];

  departamento?: string;
  tipo_contratacao?: TipoContratacao | '';
  status?: StatusColaborador | '';
}

// ===== OPÇÕES PARA UI (mantidas) =====
export const UNIDADES_OPTIONS = [
  { value: UnidadeColaborador.CAMPO_GRANDE, label: 'Campo Grande' },
  { value: UnidadeColaborador.BARRA, label: 'Barra' },
  { value: UnidadeColaborador.RECREIO, label: 'Recreio' }
];

export const TIPOS_CONTRATACAO_OPTIONS = [
  { value: TipoContratacao.CLT, label: 'CLT' },
  { value: TipoContratacao.PJ, label: 'PJ' },
  { value: TipoContratacao.ESTAGIARIO, label: 'Estágiário' },
  { value: TipoContratacao.FREELANCER, label: 'Freelancer' },
  { value: TipoContratacao.HORISTA, label: 'Horista' }
];

export const TIPOS_CONTA_OPTIONS = [
  { value: TipoConta.CORRENTE, label: 'Corrente' },
  { value: TipoConta.POUPANCA, label: 'Poupança' }
];

export const STATUS_OPTIONS = [
  { value: StatusColaborador.ATIVO, label: 'Ativo' },
  { value: StatusColaborador.INATIVO, label: 'Inativo' }
];

// ===== UTILITÁRIOS (mantidos) =====
export const formatCPF = (cpf: string): string => {
  const numbers = cpf.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const isValidCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');

  if (numbers.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.charAt(10))) return false;

  return true;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

#### 2.2 Novo Serviço: `unidadeService.ts`
**Arquivo:** `src/services/unidadeService.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';
import { Unidade } from '@/types/colaborador';

export const unidadeService = {
  /**
   * Buscar todas as unidades
   */
  async getUnidades(): Promise<Unidade[]> {
    const { data, error } = await supabase
      .from('unidades')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Buscar apenas unidades ativas
   */
  async getUnidadesAtivas(): Promise<Unidade[]> {
    const { data, error } = await supabase
      .from('unidades')
      .select('*')
      .eq('ativa', true)
      .order('nome', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Buscar unidade por ID
   */
  async getUnidadeById(id: string): Promise<Unidade | null> {
    const { data, error } = await supabase
      .from('unidades')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  },

  /**
   * Buscar unidade por código
   */
  async getUnidadeByCodigo(codigo: string): Promise<Unidade | null> {
    const { data, error } = await supabase
      .from('unidades')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }
};
```

#### 2.3 Atualizar `colaboradorService.ts`
**Arquivo:** `src/services/colaboradorService.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';
import {
  Colaborador,
  NovoColaborador,
  AtualizarColaborador,
  FiltrosColaborador,
  StatusColaborador,
  ColaboradorUnidade
} from '@/types/colaborador';

export const colaboradorService = {
  /**
   * Buscar todos os colaboradores COM suas unidades
   */
  async getColaboradores(): Promise<Colaborador[]> {
    const { data, error } = await supabase
      .from('colaboradores')
      .select(`
        *,
        colaborador_unidades (
          id,
          unidade_id,
          created_at,
          unidade:unidades (*)
        )
      `)
      .order('nome', { ascending: true });

    if (error) {
      throw error;
    }

    // Renomear colaborador_unidades para unidades
    return (data || []).map(colab => ({
      ...colab,
      unidades: colab.colaborador_unidades
    }));
  },

  /**
   * Buscar colaborador por ID COM suas unidades
   */
  async getColaboradorById(id: string): Promise<Colaborador | null> {
    const { data, error } = await supabase
      .from('colaboradores')
      .select(`
        *,
        colaborador_unidades (
          id,
          unidade_id,
          created_at,
          unidade:unidades (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return {
      ...data,
      unidades: data.colaborador_unidades
    };
  },

  /**
   * Criar novo colaborador COM unidades
   */
  async criarColaborador(colaboradorData: NovoColaborador): Promise<Colaborador> {
    // Validar que pelo menos uma unidade foi selecionada
    if (!colaboradorData.unidade_ids || colaboradorData.unidade_ids.length === 0) {
      throw new Error('Pelo menos uma unidade deve ser selecionada');
    }

    // 1. Criar colaborador
    const insertData = {
      nome: colaboradorData.nome,
      email: colaboradorData.email,
      telefone: colaboradorData.telefone,
      cpf: colaboradorData.cpf,
      cargo: colaboradorData.cargo,
      departamento: colaboradorData.departamento,
      tipo_contratacao: colaboradorData.tipo_contratacao,
      banco: colaboradorData.banco || null,
      agencia: colaboradorData.agencia || null,
      conta: colaboradorData.conta || null,
      tipo_conta: colaboradorData.tipo_conta || null,
      status: colaboradorData.status || StatusColaborador.ATIVO
    };

    const { data: colaborador, error: colaboradorError } = await supabase
      .from('colaboradores')
      .insert(insertData)
      .select()
      .single();

    if (colaboradorError) {
      throw colaboradorError;
    }

    // 2. Vincular unidades
    await this.vincularUnidades(colaborador.id, colaboradorData.unidade_ids);

    // 3. Retornar colaborador completo com unidades
    return await this.getColaboradorById(colaborador.id) as Colaborador;
  },

  /**
   * Atualizar colaborador (incluindo unidades se fornecido)
   */
  async atualizarColaborador(id: string, colaboradorData: AtualizarColaborador): Promise<Colaborador> {
    const updateData: any = {};

    // Campos básicos
    if (colaboradorData.nome !== undefined) updateData.nome = colaboradorData.nome;
    if (colaboradorData.email !== undefined) updateData.email = colaboradorData.email;
    if (colaboradorData.telefone !== undefined) updateData.telefone = colaboradorData.telefone;
    if (colaboradorData.cpf !== undefined) updateData.cpf = colaboradorData.cpf;
    if (colaboradorData.cargo !== undefined) updateData.cargo = colaboradorData.cargo;
    if (colaboradorData.departamento !== undefined) updateData.departamento = colaboradorData.departamento;
    if (colaboradorData.tipo_contratacao !== undefined) updateData.tipo_contratacao = colaboradorData.tipo_contratacao;
    if (colaboradorData.banco !== undefined) updateData.banco = colaboradorData.banco;
    if (colaboradorData.agencia !== undefined) updateData.agencia = colaboradorData.agencia;
    if (colaboradorData.conta !== undefined) updateData.conta = colaboradorData.conta;
    if (colaboradorData.tipo_conta !== undefined) updateData.tipo_conta = colaboradorData.tipo_conta;
    if (colaboradorData.status !== undefined) updateData.status = colaboradorData.status;

    // Atualizar dados básicos
    const { data, error } = await supabase
      .from('colaboradores')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Se unidades foram fornecidas, atualizar vínculos
    if (colaboradorData.unidade_ids !== undefined) {
      if (colaboradorData.unidade_ids.length === 0) {
        throw new Error('Pelo menos uma unidade deve ser selecionada');
      }
      await this.substituirUnidades(id, colaboradorData.unidade_ids);
    }

    // Retornar colaborador completo com unidades
    return await this.getColaboradorById(id) as Colaborador;
  },

  /**
   * Deletar colaborador (vínculos são deletados automaticamente por CASCADE)
   */
  async deletarColaborador(id: string): Promise<void> {
    const { error } = await supabase
      .from('colaboradores')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  },

  /**
   * Vincular múltiplas unidades a um colaborador
   */
  async vincularUnidades(colaboradorId: string, unidadeIds: string[]): Promise<void> {
    const inserts = unidadeIds.map(unidadeId => ({
      colaborador_id: colaboradorId,
      unidade_id: unidadeId
    }));

    const { error } = await supabase
      .from('colaborador_unidades')
      .insert(inserts);

    if (error) {
      throw error;
    }
  },

  /**
   * Substituir todas as unidades de um colaborador
   */
  async substituirUnidades(colaboradorId: string, novasUnidadeIds: string[]): Promise<void> {
    // 1. Remover vínculos existentes
    const { error: deleteError } = await supabase
      .from('colaborador_unidades')
      .delete()
      .eq('colaborador_id', colaboradorId);

    if (deleteError) {
      throw deleteError;
    }

    // 2. Criar novos vínculos
    await this.vincularUnidades(colaboradorId, novasUnidadeIds);
  },

  /**
   * Desvincular uma unidade específica
   */
  async desvincularUnidade(colaboradorId: string, unidadeId: string): Promise<void> {
    const { error } = await supabase
      .from('colaborador_unidades')
      .delete()
      .eq('colaborador_id', colaboradorId)
      .eq('unidade_id', unidadeId);

    if (error) {
      throw error;
    }
  },

  /**
   * Buscar colaboradores com filtros (ATUALIZADO para múltiplas unidades)
   */
  async getColaboradoresFiltrados(filtros: FiltrosColaborador): Promise<Colaborador[]> {
    let query = supabase
      .from('colaboradores')
      .select(`
        *,
        colaborador_unidades (
          id,
          unidade_id,
          created_at,
          unidade:unidades (*)
        )
      `);

    // Aplicar filtros básicos
    if (filtros.departamento && filtros.departamento !== '') {
      query = query.eq('departamento', filtros.departamento);
    }

    if (filtros.tipo_contratacao && filtros.tipo_contratacao !== '') {
      query = query.eq('tipo_contratacao', filtros.tipo_contratacao);
    }

    if (filtros.status && filtros.status !== '') {
      query = query.eq('status', filtros.status);
    }

    // Filtro de busca por texto
    if (filtros.searchTerm && filtros.searchTerm.trim() !== '') {
      const searchTerm = filtros.searchTerm.trim();
      query = query.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`);
    }

    query = query.order('nome', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    let colaboradores = (data || []).map(colab => ({
      ...colab,
      unidades: colab.colaborador_unidades
    }));

    // Filtro de unidades (client-side por enquanto)
    // Filtrar colaboradores que possuem PELO MENOS UMA das unidades selecionadas
    if (filtros.unidade_ids && filtros.unidade_ids.length > 0) {
      colaboradores = colaboradores.filter(colab =>
        colab.unidades?.some(cu =>
          filtros.unidade_ids!.includes(cu.unidade_id)
        )
      );
    }

    return colaboradores;
  },

  /**
   * Buscar colaboradores por unidade(s)
   */
  async getColaboradoresPorUnidades(unidadeIds: string[]): Promise<Colaborador[]> {
    if (unidadeIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('colaboradores')
      .select(`
        *,
        colaborador_unidades!inner (
          id,
          unidade_id,
          created_at,
          unidade:unidades (*)
        )
      `)
      .in('colaborador_unidades.unidade_id', unidadeIds)
      .eq('status', StatusColaborador.ATIVO)
      .order('nome', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map(colab => ({
      ...colab,
      unidades: colab.colaborador_unidades
    }));
  },

  /**
   * Verificar se email já existe
   */
  async emailJaExiste(email: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('colaboradores')
      .select('id')
      .eq('email', email);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data?.length || 0) > 0;
  },

  /**
   * Verificar se CPF já existe
   */
  async cpfJaExiste(cpf: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('colaboradores')
      .select('id')
      .eq('cpf', cpf);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data?.length || 0) > 0;
  }
};
```

---

### FASE 3: Frontend (React/TypeScript)

#### 3.1 Atualizar Contexto
**Arquivo:** `src/contexts/ColaboradorContext.tsx`

```typescript
// Atualizar apenas os métodos afetados:

// Método de filtro por unidade
const getColaboradoresPorUnidades = useCallback((unidadeIds: string[]) => {
  if (unidadeIds.length === 0) {
    return colaboradores;
  }

  return colaboradores.filter(c =>
    c.unidades?.some(cu => unidadeIds.includes(cu.unidade_id))
  );
}, [colaboradores]);
```

#### 3.2 Atualizar `NovoColaboradorDialog.tsx`

**Principais mudanças:**

```tsx
// 1. Estado para unidades
const [unidadesDisponiveis, setUnidadesDisponiveis] = useState<Unidade[]>([]);
const [unidadesSelecionadas, setUnidadesSelecionadas] = useState<string[]>([]);

// 2. Carregar unidades
useEffect(() => {
  const carregarUnidades = async () => {
    const unidades = await unidadeService.getUnidadesAtivas();
    setUnidadesDisponiveis(unidades);
  };
  carregarUnidades();
}, []);

// 3. Toggle de unidade
const handleToggleUnidade = (unidadeId: string) => {
  setUnidadesSelecionadas(prev =>
    prev.includes(unidadeId)
      ? prev.filter(id => id !== unidadeId)
      : [...prev, unidadeId]
  );
};

// 4. Validação
const validarFormulario = () => {
  if (unidadesSelecionadas.length === 0) {
    toast.error('Selecione pelo menos uma unidade');
    return false;
  }
  // ... outras validações
  return true;
};

// 5. Submit
const handleSubmit = async () => {
  if (!validarFormulario()) return;

  const novoColaborador: NovoColaborador = {
    // ... outros campos
    unidade_ids: unidadesSelecionadas
  };

  await criarColaborador(novoColaborador);
};

// 6. UI - Checkboxes de unidades
<div className="space-y-3">
  <Label className="text-sm font-medium">
    Unidades * <span className="text-muted-foreground">(selecione uma ou mais)</span>
  </Label>
  {unidadesDisponiveis.map(unidade => (
    <div key={unidade.id} className="flex items-center space-x-2">
      <Checkbox
        id={`unidade-${unidade.id}`}
        checked={unidadesSelecionadas.includes(unidade.id)}
        onCheckedChange={() => handleToggleUnidade(unidade.id)}
      />
      <label
        htmlFor={`unidade-${unidade.id}`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        {unidade.nome}
      </label>
    </div>
  ))}
  {unidadesSelecionadas.length === 0 && (
    <p className="text-sm text-destructive">Selecione pelo menos uma unidade</p>
  )}
</div>
```

#### 3.3 Atualizar `EditarColaboradorDialog.tsx`

**Mesma lógica do NovoColaboradorDialog, mas carregar unidades existentes:**

```tsx
// Carregar unidades do colaborador
useEffect(() => {
  if (colaborador?.unidades) {
    const ids = colaborador.unidades.map(cu => cu.unidade_id);
    setUnidadesSelecionadas(ids);
  }
}, [colaborador]);
```

#### 3.4 Atualizar `DetalhesColaboradorDialog.tsx`

```tsx
// Seção de Unidades
<Card>
  <CardHeader className="flex flex-row items-center gap-2">
    <Building2 className="h-5 w-5 text-primary" />
    <CardTitle className="text-lg">Unidades de Trabalho</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex flex-wrap gap-2">
      {colaborador.unidades && colaborador.unidades.length > 0 ? (
        colaborador.unidades.map(cu => (
          <Badge key={cu.id} variant="default">
            {cu.unidade?.nome}
          </Badge>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma unidade vinculada</p>
      )}
    </div>
  </CardContent>
</Card>
```

#### 3.5 Atualizar `ColaboradoresPage.tsx`

**Mudanças principais:**

```tsx
// 1. Coluna de Unidades na tabela
<TableCell>
  <div className="flex flex-wrap gap-1">
    {colaborador.unidades && colaborador.unidades.length > 0 ? (
      colaborador.unidades.map(cu => (
        <Badge key={cu.id} variant="outline" className="text-xs">
          {cu.unidade?.nome}
        </Badge>
      ))
    ) : (
      <span className="text-muted-foreground text-sm">-</span>
    )}
  </div>
</TableCell>

// 2. Filtro de múltiplas unidades
const [unidadesSelecionadas, setUnidadesSelecionadas] = useState<string[]>([]);

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-full justify-between">
      {unidadesSelecionadas.length === 0
        ? 'Todas as unidades'
        : `${unidadesSelecionadas.length} unidade(s)`}
      <ChevronDown className="ml-2 h-4 w-4" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-64">
    <div className="space-y-2">
      {unidadesDisponiveis.map(unidade => (
        <div key={unidade.id} className="flex items-center space-x-2">
          <Checkbox
            checked={unidadesSelecionadas.includes(unidade.id)}
            onCheckedChange={() => {
              setUnidadesSelecionadas(prev =>
                prev.includes(unidade.id)
                  ? prev.filter(id => id !== unidade.id)
                  : [...prev, unidade.id]
              );
            }}
          />
          <label className="text-sm">{unidade.nome}</label>
        </div>
      ))}
    </div>
  </PopoverContent>
</Popover>
```

---

## Plano de Migração

### Pré-requisitos
- ✅ Backup do banco de dados criado
- ✅ Ambiente de desenvolvimento testado
- ✅ Git commit antes das mudanças

### Ordem de Execução

#### Passo 1: Migrations SQL
```bash
# Aplicar migrations na ordem
psql "connection-string" < supabase/migrations/20250209000001_create_unidades_table.sql
psql "connection-string" < supabase/migrations/20250209000002_create_colaborador_unidades_table.sql
psql "connection-string" < supabase/migrations/20250209000003_migrate_existing_colaboradores_data.sql

# AGUARDAR VALIDAÇÃO (NÃO executar ainda)
# psql "connection-string" < supabase/migrations/20250209000004_remove_unidade_column_from_colaboradores.sql
```

#### Passo 2: Validar Migração de Dados
```sql
-- Verificar se todos os colaboradores têm unidade
SELECT
    c.nome,
    COALESCE(COUNT(cu.id), 0) as total_unidades
FROM colaboradores c
LEFT JOIN colaborador_unidades cu ON cu.colaborador_id = c.id
GROUP BY c.id, c.nome
HAVING COUNT(cu.id) = 0;

-- Resultado esperado: 0 linhas
```

#### Passo 3: Deploy Backend
```bash
# Commitar mudanças de tipos e serviços
git add src/types/colaborador.ts
git add src/services/colaboradorService.ts
git add src/services/unidadeService.ts
git commit -m "feat: adicionar suporte a múltiplas unidades - backend"
git push
```

#### Passo 4: Deploy Frontend
```bash
# Commitar mudanças de UI
git add src/components/colaboradores/
git add src/pages/ColaboradoresPage.tsx
git add src/contexts/ColaboradorContext.tsx
git commit -m "feat: adicionar suporte a múltiplas unidades - frontend"
git push
```

#### Passo 5: Validação em Produção
- ✅ Criar novo colaborador com múltiplas unidades
- ✅ Editar colaborador existente
- ✅ Filtrar por unidades
- ✅ Visualizar detalhes
- ✅ Verificar folha de pagamento

#### Passo 6: Limpeza (APÓS 30 DIAS)
```bash
# Aplicar migration final
psql "connection-string" < supabase/migrations/20250209000004_remove_unidade_column_from_colaboradores.sql
```

---

## Testes e Validação

### Checklist de Testes

#### Testes Backend
- [ ] Criar colaborador com 1 unidade
- [ ] Criar colaborador com 2 unidades
- [ ] Criar colaborador com 3 unidades
- [ ] Tentar criar colaborador sem unidade (deve falhar)
- [ ] Editar colaborador adicionando unidade
- [ ] Editar colaborador removendo unidade
- [ ] Editar colaborador alterando unidades
- [ ] Tentar editar para 0 unidades (deve falhar)
- [ ] Deletar colaborador (vínculos devem ser removidos)
- [ ] Filtrar por 1 unidade
- [ ] Filtrar por múltiplas unidades
- [ ] Buscar colaborador por ID com unidades
- [ ] Verificar performance com 100+ colaboradores

#### Testes Frontend
- [ ] Formulário exibe checkboxes
- [ ] Validação de pelo menos 1 unidade
- [ ] Submit com múltiplas unidades
- [ ] Carregar colaborador no edit com unidades corretas
- [ ] Editar e salvar unidades
- [ ] Visualizar badges na tabela
- [ ] Filtro múltiplo de unidades funciona
- [ ] Detalhes exibe todas as unidades
- [ ] Responsividade mobile

#### Testes de Integração
- [ ] Folha de pagamento não quebra
- [ ] Schedule events não quebra
- [ ] Relatórios funcionam corretamente
- [ ] Permissões RLS funcionam

---

## Cronograma

| Fase | Duração | Responsável | Status |
|------|---------|-------------|--------|
| **1. Migrations SQL** | 2h | Dev | 🔴 Pendente |
| **2. Validação Migração** | 1h | Dev | 🔴 Pendente |
| **3. Backend (Types + Services)** | 3h | Dev | 🔴 Pendente |
| **4. Frontend (Dialogs)** | 4h | Dev | 🔴 Pendente |
| **5. Frontend (Page + Filtros)** | 2h | Dev | 🔴 Pendente |
| **6. Testes Manuais** | 2h | Dev + QA | 🔴 Pendente |
| **7. Deploy Staging** | 1h | Dev | 🔴 Pendente |
| **8. Validação Produção** | 3 dias | Usuários | 🔴 Pendente |
| **9. Limpeza (remover coluna)** | 1h | Dev | 🔴 Pendente |
| **TOTAL** | **~15h + 3 dias validação** | | |

---

## Riscos e Mitigações

### Risco 1: Perda de dados na migração
**Probabilidade:** Baixa
**Impacto:** Alto
**Mitigação:**
- Backup completo antes de iniciar
- Validação SQL após cada migration
- Manter coluna antiga por 30 dias
- Rollback plan documentado

### Risco 2: Performance com queries complexas
**Probabilidade:** Média
**Impacto:** Médio
**Mitigação:**
- Índices criados em todas as FKs
- Usar `inner join` quando possível
- Monitorar slow queries
- Considerar cache se necessário

### Risco 3: Quebra de integrações externas
**Probabilidade:** Baixa
**Impacto:** Alto
**Mitigação:**
- Identificar integrações que usam campo `unidade`
- Criar adapter/wrapper se necessário
- Documentar mudanças na API

### Risco 4: Usuários não entendem nova UI
**Probabilidade:** Baixa
**Impacto:** Baixo
**Mitigação:**
- UI intuitiva com checkboxes
- Validações claras
- Mensagens de erro descritivas
- Tooltip explicativo

---

## Rollback Plan

### Se algo der errado ANTES da Migration 4:

```sql
-- 1. Restaurar coluna unidade (se foi removida)
ALTER TABLE colaboradores ADD COLUMN unidade VARCHAR(50);

-- 2. Copiar primeira unidade de volta
UPDATE colaboradores c
SET unidade = u.nome
FROM (
  SELECT DISTINCT ON (cu.colaborador_id)
    cu.colaborador_id,
    un.nome
  FROM colaborador_unidades cu
  JOIN unidades un ON un.id = cu.unidade_id
  ORDER BY cu.colaborador_id, cu.created_at
) u
WHERE c.id = u.colaborador_id;

-- 3. Dropar tabelas novas
DROP TABLE colaborador_unidades CASCADE;
DROP TABLE unidades CASCADE;

-- 4. Recriar constraint
ALTER TABLE colaboradores
ADD CONSTRAINT colaboradores_unidade_check
CHECK (unidade IN ('Campo Grande', 'Barra', 'Recreio'));

-- 5. Recriar índice
CREATE INDEX idx_colaboradores_unidade ON colaboradores(unidade);
```

### Se algo der errado DEPOIS da Migration 4:

```bash
# Restaurar dump completo
psql "connection-string" < backups/primeiro_dump.sql

# Reverter código
git reset --hard <commit-antes-das-mudanças>
```

---

## Checklist Final

### Antes de Começar
- [ ] Backup do banco criado
- [ ] Git commit limpo
- [ ] Ambiente de desenvolvimento funcionando
- [ ] Plano revisado e aprovado

### Durante Implementação
- [ ] Migrations aplicadas em ordem
- [ ] Dados validados após cada migration
- [ ] Testes unitários passando
- [ ] Code review realizado
- [ ] Documentação atualizada

### Antes do Deploy
- [ ] Todos os testes passando
- [ ] Performance validada
- [ ] Staging testado
- [ ] Rollback plan pronto
- [ ] Equipe comunicada

### Após Deploy
- [ ] Monitorar logs por 24h
- [ ] Validar com usuários reais
- [ ] Coletar feedback
- [ ] Ajustar se necessário
- [ ] Remover coluna antiga após 30 dias

---

## Contato e Suporte

**Desenvolvedor:** Sistema LA Music RH
**Data do Plano:** 09/11/2025
**Versão:** 1.0

**Para dúvidas ou problemas durante a implementação:**
- Revisar este documento
- Consultar logs do Supabase
- Verificar rollback plan
- Contatar equipe de desenvolvimento

---

**FIM DO DOCUMENTO**
