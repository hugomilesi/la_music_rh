# Plano de Ação: Melhorias no Sistema de Documentos

**Data:** 10/11/2025
**Ambiente:** Desenvolvimento (Base: `colaboradores_multiplas_unidades.sql`)
**Objetivo:** Resolver problemas críticos e implementar melhorias no sistema de documentos

---

## 📊 Análise do Estado Atual

### Banco de Dados (Snapshot Atual)

```sql
-- Estrutura Confirmada

✅ TABELAS EXISTENTES:
- colaboradores (20+ registros ativos)
- unidades (3 registros: Campo Grande, Barra, Recreio)
- colaborador_unidades (relacionamento many-to-many implementado)
- documents (1 registro: CPF de Ana Silva)
- required_documents (10 registros: 3 ativos, 7 inativos)
- module_permissions (22 registros de permissões)

✅ RELAÇÕES:
- documents.employee_id → colaboradores.id (FK correta)
- documents.required_document_id → required_documents.id
- colaborador_unidades.colaborador_id → colaboradores.id
- colaborador_unidades.unidade_id → unidades.id
```

### Sistema de Permissões Atual

**Módulo `documentos` JÁ EXISTE:**

| Role | View | Create | Edit | Delete |
|------|------|--------|------|--------|
| **gestor_rh** | ✅ | ✅ | ✅ | ❌ |
| **gerente** | ✅ | ❌ | ❌ | ❌ |
| **admin** | ✅ | ✅ | ✅ | ✅ |
| **super_admin** | ✅ | ✅ | ✅ | ✅ |

**Ações necessárias:**
- Adicionar permissão `can_delete` para `gestor_rh`
- Criar permissão especial para gerenciar documentos obrigatórios
- Criar permissão especial para acessar auditoria

---

## ❌ Problemas Identificados

### 1. 🔴 CRÍTICO: Colaboradores Invisíveis

**Situação:**
- 20+ colaboradores cadastrados
- Apenas 1 tem documento (Ana Silva - CPF)
- Os outros 19+ **NÃO aparecem** na página de documentos
- RH não consegue enviar documentos para eles

**Causa:**
```tsx
// ImprovedDocumentsTable.tsx
const filteredEmployees = employees.filter(employee => {
  // ❌ Só mostra quem tem documentos ou pendências
  return hasSentDocuments || hasPendingMandatory;
});
```

**Impacto:** Bloqueia workflow básico do RH

---

### 2. 🟡 IMPORTANTE: Falta Gerenciamento Eficiente

**Problemas:**
- Difícil excluir documentos vencidos (um por um)
- Sem controle de versões (perde histórico ao substituir)
- Sem histórico de alterações
- Interface não otimizada para administração

---

### 3. 🟢 DESEJÁVEL: Melhorias de UX

**Faltam:**
- Dashboard com estatísticas
- Notificações automáticas de vencimento
- Exportação avançada (PDF, Excel, ZIP)
- Sistema de auditoria completo

---

## ✅ Decisões Tomadas

1. ✅ Documentos são do colaborador (não vinculados a unidade específica)
2. ✅ Documentos obrigatórios são iguais para todos
3. ✅ Ambiente é desenvolvimento (pode mexer livremente)
4. ✅ View `user_required_documents` será substituída (método mais eficiente)
5. ✅ Permissões dinâmicas já existem e serão aproveitadas
6. ✅ Notificações sempre ativas (não configurável)
7. ✅ Sem fluxo de aprovação (RH valida antes de enviar)
8. ✅ Implementar sequencialmente: Fase 1 → 2 → 3 → 4

---

## 🎯 Solução Completa

### FASE 1: Correções Críticas (1-2 dias) 🔴

#### Objetivo
Garantir que TODOS os colaboradores apareçam na página de documentos.

#### 1.1 Atualizar `documentChecklistService.ts`

**Arquivo:** `src/services/documentChecklistService.ts`

**Nova Implementação:**

```typescript
// ============================================================================
// CORREÇÃO: Buscar TODOS os colaboradores ativos
// ============================================================================

let requiredDocumentsCache: any[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const getRequiredDocumentsCache = async () => {
  const now = Date.now();

  if (
    requiredDocumentsCache &&
    cacheTimestamp &&
    (now - cacheTimestamp) < CACHE_TTL
  ) {
    return requiredDocumentsCache;
  }

  const { data, error } = await supabase
    .from('required_documents')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;

  requiredDocumentsCache = data || [];
  cacheTimestamp = now;

  return requiredDocumentsCache;
};

export const invalidateRequiredDocumentsCache = () => {
  requiredDocumentsCache = null;
  cacheTimestamp = null;
};

function getDocumentStatus(doc: any): string {
  if (!doc || !doc.expires_at) return 'pendente';

  const expiryDate = new Date(doc.expires_at);
  const today = new Date();
  const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'vencido';
  if (diffDays <= 30) return 'vencendo';
  return 'válido';
}

export const getEmployeesWithDocumentsSummary = async () => {
  // 1. Buscar TODOS os colaboradores ativos
  const { data: colaboradores, error: colabError } = await supabase
    .from('colaboradores')
    .select(`
      id,
      nome,
      email,
      status,
      telefone,
      cargo,
      departamento,
      colaborador_unidades (
        id,
        unidade_id,
        unidade:unidades (id, nome, codigo)
      )
    `)
    .eq('status', 'ativo')
    .order('nome');

  if (colabError) throw colabError;

  // 2. Buscar documentos obrigatórios (cache)
  const requiredDocs = await getRequiredDocumentsCache();

  // 3. Buscar TODOS os documentos de uma vez
  const { data: allDocuments } = await supabase
    .from('documents')
    .select('*')
    .in('employee_id', colaboradores.map(c => c.id));

  // 4. Processar cada colaborador
  return colaboradores.map(colaborador => {
    // Documentos deste colaborador
    const docs = allDocuments?.filter(d => d.employee_id === colaborador.id) || [];

    // Criar checklist
    const checklist = requiredDocs.map(reqDoc => {
      const sentDoc = docs.find(d => d.required_document_id === reqDoc.id);

      if (!sentDoc) {
        return {
          required_document_id: reqDoc.id,
          document_name: reqDoc.name,
          is_mandatory: reqDoc.is_mandatory,
          status: 'pendente',
          document_id: null
        };
      }

      return {
        required_document_id: reqDoc.id,
        document_name: reqDoc.name,
        is_mandatory: reqDoc.is_mandatory,
        status: getDocumentStatus(sentDoc),
        document_id: sentDoc.id,
        expires_at: sentDoc.expires_at,
        file_path: sentDoc.file_path
      };
    });

    // Calcular métricas
    const totalRequired = requiredDocs.filter(d => d.is_mandatory).length;
    const completed = checklist.filter(c =>
      c.status === 'enviado' || c.status === 'aprovado'
    ).length;
    const pending = checklist.filter(c => c.status === 'pendente').length;

    const documentsWithExpiry = checklist.filter(c => c.expires_at);
    const expiring = documentsWithExpiry.filter(c =>
      getDocumentStatus({ expires_at: c.expires_at }) === 'vencendo'
    ).length;
    const expired = documentsWithExpiry.filter(c =>
      getDocumentStatus({ expires_at: c.expires_at }) === 'vencido'
    ).length;

    return {
      id: colaborador.id,
      nome: colaborador.nome,
      email: colaborador.email,
      status: colaborador.status,
      telefone: colaborador.telefone,
      cargo: colaborador.cargo,
      departamento: colaborador.departamento,
      unidades: colaborador.colaborador_unidades?.map((cu: any) => ({
        id: cu.id,
        unidade_id: cu.unidade_id,
        unidade: cu.unidade
      })) || [],
      documents: docs,
      checklist: checklist,
      totalDocuments: totalRequired,
      completedDocuments: completed,
      completionPercentage: totalRequired > 0 ? Math.round((completed / totalRequired) * 100) : 0,
      pendingDocuments: pending,
      validDocuments: completed - expiring - expired,
      expiringDocuments: expiring,
      expiredDocuments: expired,
      hasSentDocuments: docs.length > 0
    };
  });
};
```

#### 1.2 Atualizar `ImprovedDocumentsTable.tsx`

**Arquivo:** `src/components/documents/ImprovedDocumentsTable.tsx`

**Mudança:**

```tsx
// ============================================================================
// CORREÇÃO: SEMPRE mostrar todos os colaboradores ativos
// ============================================================================

const filteredEmployees = useMemo(() => {
  if (!employees || employees.length === 0) return [];

  return employees.filter(employee => {
    // Filtro de busca por texto
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchName = employee.nome?.toLowerCase().includes(search);
      const matchEmail = employee.email?.toLowerCase().includes(search);
      if (!matchName && !matchEmail) return false;
    }

    // Filtro por status de documento
    if (statusFilter !== 'todos') {
      if (statusFilter === 'pendente') {
        return employee.pendingDocuments > 0;
      }
      if (statusFilter === 'vencido') {
        return employee.expiredDocuments > 0;
      }
      if (statusFilter === 'vencendo') {
        return employee.expiringDocuments > 0;
      }
      if (statusFilter === 'válido') {
        return employee.validDocuments > 0;
      }
    }

    // Filtro por unidade (múltiplas unidades)
    if (unidadeFilter && unidadeFilter.length > 0) {
      const temUnidade = employee.unidades?.some((cu: any) =>
        unidadeFilter.includes(cu.unidade?.id)
      );
      if (!temUnidade) return false;
    }

    // ✅ SEMPRE MOSTRAR colaboradores ativos
    return true;
  });
}, [employees, searchTerm, statusFilter, unidadeFilter]);
```

#### 1.3 Implementar `getDocumentsByEmployee` no Context

**Arquivo:** `src/contexts/DocumentContext.tsx`

**Adicionar:**

```typescript
const getDocumentsByEmployee = useCallback(async (employeeId: string) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        required_document:required_documents (
          id,
          name,
          document_type,
          is_mandatory
        )
      `)
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar documentos do colaborador:', error);
    throw error;
  }
}, []);

// Adicionar ao return do Provider
return (
  <DocumentContext.Provider value={{
    documents,
    filteredDocuments,
    isLoading,
    error,
    filters,
    setFilters,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    viewDocument,
    exportDocuments,
    loadDocuments,
    getDocumentsByEmployee,  // ✅ Adicionar
  }}>
    {children}
  </DocumentContext.Provider>
);
```

---

### FASE 2: Seção de Gerenciamento (3-5 dias) 🟡

#### Objetivo
Criar seção administrativa para gerenciar documentos eficientemente.

#### 2.1 Criar Migrations do Banco

**Migration 1: `document_history`**

```sql
-- supabase/migrations/20251110000001_create_document_history.sql

CREATE TABLE public.document_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  expires_at TIMESTAMPTZ,
  status VARCHAR(20),
  replaced_at TIMESTAMPTZ DEFAULT NOW(),
  replaced_by UUID REFERENCES public.users(id),
  replacement_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_history_document_id ON public.document_history(document_id);
CREATE INDEX idx_document_history_employee_id ON public.document_history(employee_id);

ALTER TABLE public.document_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para usuários autenticados"
  ON public.document_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir insert para sistema"
  ON public.document_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON TABLE public.document_history IS 'Histórico de versões de documentos substituídos';
```

**Migration 2: `deleted_documents`**

```sql
-- supabase/migrations/20251110000002_create_deleted_documents.sql

CREATE TABLE public.deleted_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  document_data JSONB NOT NULL,
  deleted_by UUID REFERENCES public.users(id),
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  deletion_reason TEXT,
  can_restore BOOLEAN DEFAULT true,
  restored_at TIMESTAMPTZ,
  restored_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_deleted_documents_deleted_at ON public.deleted_documents(deleted_at);
CREATE INDEX idx_deleted_documents_can_restore ON public.deleted_documents(can_restore);

ALTER TABLE public.deleted_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso para admins e RH"
  ON public.deleted_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'gestor_rh')
    )
  );

COMMENT ON TABLE public.deleted_documents IS 'Lixeira de documentos exclu\u00eddos (soft delete com restaura\u00e7\u00e3o em 30 dias)';
```

**Migration 3: Atualizar Permissões**

```sql
-- supabase/migrations/20251110000003_update_documents_permissions.sql

-- Adicionar can_delete para gestor_rh
UPDATE module_permissions
SET can_delete = true
WHERE role_name = 'gestor_rh' AND module_name = 'documentos';

-- Criar permissões especiais para gerenciamento
INSERT INTO module_permissions (role_name, module_name, can_view, can_create, can_edit, can_delete) VALUES
('super_admin', 'documentos_gerenciamento', true, true, true, true),
('admin', 'documentos_gerenciamento', true, true, true, true),
('gestor_rh', 'documentos_gerenciamento', true, true, true, true),
('gerente', 'documentos_gerenciamento', true, false, false, false);

-- Permissões para auditoria
INSERT INTO module_permissions (role_name, module_name, can_view, can_create, can_edit, can_delete) VALUES
('super_admin', 'documentos_auditoria', true, false, false, false),
('admin', 'documentos_auditoria', true, false, false, false),
('gestor_rh', 'documentos_auditoria', true, false, false, false),
('gerente', 'documentos_auditoria', false, false, false, false);
```

#### 2.2 Criar Componentes Frontend

**A. DocumentManagementTab.tsx (NOVO)**

```tsx
// src/components/documents/DocumentManagementTab.tsx

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Trash2, RefreshCw } from 'lucide-react';
import DocumentManagementTable from './DocumentManagementTable';
import BulkActionsToolbar from './BulkActionsToolbar';
import { useDocuments } from '@/hooks/useDocuments';

export default function DocumentManagementTab() {
  const { documents, loadDocuments } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = documents.length;
    const validos = documents.filter(d => getDocumentStatus(d) === 'válido').length;
    const vencendo = documents.filter(d => getDocumentStatus(d) === 'vencendo').length;
    const vencidos = documents.filter(d => getDocumentStatus(d) === 'vencido').length;

    return { total, validos, vencendo, vencidos };
  }, [documents]);

  // Agrupar documentos por status
  const groupedDocuments = useMemo(() => {
    const filtered = documents.filter(doc => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          doc.name?.toLowerCase().includes(search) ||
          doc.employee?.nome?.toLowerCase().includes(search)
        );
      }
      return true;
    });

    return {
      vencidos: filtered.filter(d => getDocumentStatus(d) === 'vencido'),
      vencendo: filtered.filter(d => getDocumentStatus(d) === 'vencendo'),
      validos: filtered.filter(d => getDocumentStatus(d) === 'válido'),
    };
  }, [documents, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Válidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.validos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vencendo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.vencendo}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.vencidos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar documento ou colaborador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <option value="todos">Todos os Status</option>
              <option value="vencido">Vencidos</option>
              <option value="vencendo">Vencendo</option>
              <option value="válido">Válidos</option>
            </Select>
            <Button variant="outline" onClick={loadDocuments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ações em Lote */}
      {selectedDocuments.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedDocuments.length}
          onDeleteSelected={() => {/* implementar */}}
          onDownloadSelected={() => {/* implementar */}}
          onClearSelection={() => setSelectedDocuments([])}
        />
      )}

      {/* Tabelas Agrupadas */}
      <DocumentManagementTable
        title="🔴 Vencidos"
        documents={groupedDocuments.vencidos}
        variant="danger"
        selectedDocuments={selectedDocuments}
        onSelectDocument={(id) => {/* implementar */}}
      />

      <DocumentManagementTable
        title="🟡 Vencendo"
        documents={groupedDocuments.vencendo}
        variant="warning"
        selectedDocuments={selectedDocuments}
        onSelectDocument={(id) => {/* implementar */}}
      />

      <DocumentManagementTable
        title="🟢 Válidos"
        documents={groupedDocuments.validos}
        variant="success"
        selectedDocuments={selectedDocuments}
        onSelectDocument={(id) => {/* implementar */}}
      />
    </div>
  );
}

function getDocumentStatus(doc: any): string {
  if (!doc.expires_at) return 'válido';

  const expiryDate = new Date(doc.expires_at);
  const today = new Date();
  const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'vencido';
  if (diffDays <= 30) return 'vencendo';
  return 'válido';
}
```

**B. Service para Substituição e Lixeira**

```typescript
// src/services/documentHistoryService.ts

import { supabase } from '@/integrations/supabase/client';

export const documentHistoryService = {
  /**
   * Substituir documento (mantém histórico)
   */
  async substituirDocumento(
    documentId: string,
    novoArquivo: File,
    novaValidade: Date,
    motivo?: string,
    userId?: string
  ) {
    // 1. Buscar documento atual
    const { data: docAtual, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Copiar para histórico
    const { error: historyError } = await supabase
      .from('document_history')
      .insert({
        document_id: docAtual.id,
        employee_id: docAtual.employee_id,
        file_path: docAtual.file_path,
        file_name: docAtual.file_name,
        file_size: docAtual.file_size,
        mime_type: docAtual.mime_type,
        expires_at: docAtual.expires_at,
        status: docAtual.status,
        replaced_by: userId,
        replacement_reason: motivo
      });

    if (historyError) throw historyError;

    // 3. Upload novo arquivo
    const timestamp = Date.now();
    const filePath = `documents/${docAtual.category}/${timestamp}_${novoArquivo.name}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, novoArquivo);

    if (uploadError) throw uploadError;

    // 4. Atualizar documento
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        file_path: filePath,
        file_name: novoArquivo.name,
        file_size: novoArquivo.size,
        mime_type: novoArquivo.type,
        expires_at: novaValidade.toISOString(),
        status: 'enviado',
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    return { success: true };
  },

  /**
   * Soft delete (move para lixeira)
   */
  async softDeleteDocument(
    documentId: string,
    userId: string,
    reason?: string
  ) {
    // 1. Buscar documento
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Copiar para lixeira
    const { error: trashError } = await supabase
      .from('deleted_documents')
      .insert({
        document_id: doc.id,
        document_data: doc,
        deleted_by: userId,
        deletion_reason: reason
      });

    if (trashError) throw trashError;

    // 3. Remover da tabela principal
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) throw deleteError;

    return { success: true };
  },

  /**
   * Restaurar documento da lixeira
   */
  async restoreDocument(deletedDocId: string, userId: string) {
    // 1. Buscar na lixeira
    const { data, error: fetchError } = await supabase
      .from('deleted_documents')
      .select('*')
      .eq('id', deletedDocId)
      .single();

    if (fetchError) throw fetchError;

    if (!data.can_restore) {
      throw new Error('Documento não pode ser restaurado');
    }

    // 2. Restaurar na tabela principal
    const { error: restoreError } = await supabase
      .from('documents')
      .insert(data.document_data);

    if (restoreError) throw restoreError;

    // 3. Atualizar lixeira
    const { error: updateError } = await supabase
      .from('deleted_documents')
      .update({
        can_restore: false,
        restored_at: new Date().toISOString(),
        restored_by: userId
      })
      .eq('id', deletedDocId);

    if (updateError) throw updateError;

    return { success: true };
  }
};
```

---

### FASE 3: Melhorias de UX (2-3 dias) 🟢

#### 3.1 Sistema de Notificações

**A. Badge no Header**

```tsx
// src/components/layout/Header.tsx (adicionar)

import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function DocumentNotifications() {
  const { data: notificacoes } = useQuery({
    queryKey: ['document-notifications'],
    queryFn: async () => {
      const { data } = await supabase
        .from('documents')
        .select(`
          *,
          employee:colaboradores (nome)
        `)
        .gte('expires_at', new Date().toISOString())
        .lte('expires_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('expires_at', { ascending: true });

      return data || [];
    }
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          {notificacoes && notificacoes.length > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white px-1.5 py-0.5 text-xs">
              {notificacoes.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <div className="px-3 py-2 font-semibold">
          Documentos Vencendo ({notificacoes?.length || 0})
        </div>
        {notificacoes?.map(notif => (
          <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1">
            <p className="font-medium">{notif.employee.nome}</p>
            <p className="text-sm text-muted-foreground">
              {notif.name} vence em {getDaysUntilExpiry(notif.expires_at)} dias
            </p>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getDaysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const today = new Date();
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
```

**B. Email Automático (Cron Job)**

```typescript
// src/services/emailNotificationService.ts

export const emailNotificationService = {
  /**
   * Enviar alertas de documentos vencendo
   * (Executar diariamente via cron)
   */
  async enviarAlertasDocumentosVencendo() {
    // Buscar documentos que vencem em 7, 15 e 30 dias
    const { data: documentosVencendo } = await supabase
      .from('documents')
      .select(`
        *,
        employee:colaboradores (nome, email)
      `)
      .gte('expires_at', new Date().toISOString())
      .lte('expires_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

    // Agrupar por colaborador
    const grupos: Record<string, any[]> = {};
    documentosVencendo?.forEach(doc => {
      if (!grupos[doc.employee_id]) {
        grupos[doc.employee_id] = [];
      }
      grupos[doc.employee_id].push(doc);
    });

    // Enviar emails
    for (const [employeeId, docs] of Object.entries(grupos)) {
      const employee = docs[0].employee;

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: employee.email,
          subject: `⚠️ Documentos vencendo - ${docs.length} documento(s)`,
          html: `
            <h2>Olá ${employee.nome},</h2>
            <p>Os seguintes documentos estão próximos do vencimento:</p>
            <ul>
              ${docs.map(d => `
                <li>
                  <strong>${d.name}</strong> -
                  Vence em ${formatDate(d.expires_at)}
                </li>
              `).join('')}
            </ul>
            <p>Por favor, entre em contato com o RH para atualizar esses documentos.</p>
          `
        })
      });
    }
  }
};
```

#### 3.2 Exportação Avançada

```typescript
// src/services/documentExportService.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const documentExportService = {
  /**
   * Exportar para PDF
   */
  async exportarPDF(documentos: any[]) {
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(18);
    doc.text('Relatório de Documentos', 20, 20);
    doc.setFontSize(12);
    doc.text(`Gerado em: ${formatDate(new Date())}`, 20, 30);

    // Estatísticas
    const stats = {
      total: documentos.length,
      validos: documentos.filter(d => getDocumentStatus(d) === 'válido').length,
      vencendo: documentos.filter(d => getDocumentStatus(d) === 'vencendo').length,
      vencidos: documentos.filter(d => getDocumentStatus(d) === 'vencido').length
    };

    doc.setFontSize(14);
    doc.text('Resumo', 20, 45);
    doc.setFontSize(10);
    doc.text(`Total: ${stats.total}`, 20, 55);
    doc.text(`Válidos: ${stats.validos}`, 20, 62);
    doc.text(`Vencendo: ${stats.vencendo}`, 20, 69);
    doc.text(`Vencidos: ${stats.vencidos}`, 20, 76);

    // Tabela
    autoTable(doc, {
      startY: 90,
      head: [['Colaborador', 'Documento', 'Validade', 'Status']],
      body: documentos.map(d => [
        d.employee?.nome || 'N/A',
        d.name,
        formatDate(d.expires_at),
        getDocumentStatus(d)
      ]),
    });

    doc.save(`relatorio-documentos-${Date.now()}.pdf`);
  },

  /**
   * Exportar para Excel
   */
  async exportarExcel(documentos: any[]) {
    const dados = documentos.map(d => ({
      Colaborador: d.employee?.nome || 'N/A',
      Email: d.employee?.email || 'N/A',
      Documento: d.name,
      Tipo: d.category,
      'Data de Validade': formatDate(d.expires_at),
      Status: getDocumentStatus(d),
      'Tamanho (MB)': (d.file_size / 1024 / 1024).toFixed(2),
      'Enviado em': formatDate(d.created_at)
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Documentos');

    XLSX.writeFile(wb, `documentos-${Date.now()}.xlsx`);
  },

  /**
   * Baixar múltiplos arquivos (ZIP)
   */
  async baixarZIP(documentIds: string[]) {
    // Implementar usando JSZip
    const JSZip = require('jszip');
    const zip = new JSZip();

    for (const docId of documentIds) {
      const { data: doc } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .single();

      if (doc) {
        const { data: fileData } = await supabase.storage
          .from('documents')
          .download(doc.file_path);

        if (fileData) {
          zip.file(doc.file_name, fileData);
        }
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `documentos-${Date.now()}.zip`;
    link.click();
  }
};
```

---

### FASE 4: Auditoria (1-2 dias) 🟢

#### 4.1 Tabela de Auditoria

```sql
-- supabase/migrations/20251110000004_create_document_audit_log.sql

CREATE TABLE public.document_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID,
  employee_id UUID REFERENCES public.colaboradores(id),
  action VARCHAR(50) NOT NULL,  -- created, updated, deleted, viewed, downloaded, restored
  performed_by UUID REFERENCES public.users(id),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(50),
  user_agent TEXT,
  changes JSONB,  -- {before: {...}, after: {...}}
  notes TEXT
);

CREATE INDEX idx_audit_log_document_id ON public.document_audit_log(document_id);
CREATE INDEX idx_audit_log_employee_id ON public.document_audit_log(employee_id);
CREATE INDEX idx_audit_log_performed_at ON public.document_audit_log(performed_at);
CREATE INDEX idx_audit_log_action ON public.document_audit_log(action);

ALTER TABLE public.document_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para admins e RH"
  ON public.document_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'gestor_rh')
    )
  );

CREATE POLICY "Permitir insert para sistema"
  ON public.document_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON TABLE public.document_audit_log IS 'Log de auditoria de todas as ações em documentos';
```

#### 4.2 Service de Auditoria

```typescript
// src/services/documentAuditService.ts

export const documentAuditService = {
  /**
   * Registrar ação
   */
  async logAction(
    action: string,
    documentId: string,
    employeeId: string,
    userId: string,
    changes?: any,
    notes?: string
  ) {
    const { error } = await supabase
      .from('document_audit_log')
      .insert({
        document_id: documentId,
        employee_id: employeeId,
        action: action,
        performed_by: userId,
        changes: changes,
        notes: notes,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
      });

    if (error) console.error('Erro ao registrar log de auditoria:', error);
  },

  /**
   * Buscar logs de um documento
   */
  async getDocumentLogs(documentId: string) {
    const { data, error } = await supabase
      .from('document_audit_log')
      .select(`
        *,
        performed_by_user:users!performed_by (username, email)
      `)
      .eq('document_id', documentId)
      .order('performed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Buscar logs de um colaborador
   */
  async getEmployeeLogs(employeeId: string) {
    const { data, error } = await supabase
      .from('document_audit_log')
      .select(`
        *,
        performed_by_user:users!performed_by (username, email),
        document:documents (name, category)
      `)
      .eq('employee_id', employeeId)
      .order('performed_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }
};

async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return null;
  }
}
```

#### 4.3 Interface de Auditoria

```tsx
// src/components/documents/DocumentAuditLog.tsx

export function DocumentAuditLog({ documentId }: { documentId: string }) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['document-audit', documentId],
    queryFn: () => documentAuditService.getDocumentLogs(documentId)
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Histórico de Ações</h3>
      {logs?.map(log => (
        <div key={log.id} className="border-l-2 border-primary pl-4 py-2">
          <div className="flex items-center gap-2">
            <Badge>{getActionLabel(log.action)}</Badge>
            <span className="text-sm font-medium">
              {log.performed_by_user?.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(log.performed_at)}
            </span>
          </div>
          {log.notes && (
            <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    created: 'Criado',
    updated: 'Atualizado',
    deleted: 'Excluído',
    restored: 'Restaurado',
    viewed: 'Visualizado',
    downloaded: 'Baixado',
    replaced: 'Substituído'
  };
  return labels[action] || action;
}
```

---

## 📁 Estrutura de Arquivos

### Novos Arquivos

```
src/
├── components/
│   └── documents/
│       ├── DocumentManagementTab.tsx           ✅ NOVO
│       ├── DocumentManagementTable.tsx         ✅ NOVO
│       ├── BulkActionsToolbar.tsx              ✅ NOVO
│       ├── DocumentSubstitutionDialog.tsx      ✅ NOVO
│       ├── DocumentHistoryDialog.tsx           ✅ NOVO
│       ├── DocumentTrashDialog.tsx             ✅ NOVO
│       └── DocumentAuditLog.tsx                ✅ NOVO
│
├── services/
│   ├── documentHistoryService.ts               ✅ NOVO
│   ├── documentAuditService.ts                 ✅ NOVO
│   └── emailNotificationService.ts             ✅ NOVO
│
├── hooks/
│   ├── useDocumentManagement.ts                ✅ NOVO
│   └── useDocumentHistory.ts                   ✅ NOVO
│
└── types/
    ├── documentHistory.ts                      ✅ NOVO
    └── documentAudit.ts                        ✅ NOVO
```

### Arquivos Modificados

```
src/
├── pages/
│   └── DocumentsPage.tsx                       📝 (adicionar tabs)
│
├── components/
│   ├── layout/Header.tsx                       📝 (adicionar notificações)
│   └── documents/
│       └── ImprovedDocumentsTable.tsx          📝 (remover filtro)
│
├── services/
│   └── documentChecklistService.ts             📝 (nova query + cache)
│
└── contexts/
    └── DocumentContext.tsx                     📝 (getDocumentsByEmployee)
```

### Migrations SQL

```
supabase/migrations/
├── 20251110000001_create_document_history.sql
├── 20251110000002_create_deleted_documents.sql
├── 20251110000003_update_documents_permissions.sql
└── 20251110000004_create_document_audit_log.sql
```

---

## 📅 Cronograma Detalhado

| Fase | Duração | Tarefas | Entregas |
|------|---------|---------|----------|
| **Fase 1** | 1-2 dias | • Atualizar documentChecklistService<br>• Implementar cache<br>• Atualizar ImprovedDocumentsTable<br>• Implementar getDocumentsByEmployee<br>• Testar | ✅ Todos colaboradores aparecem<br>✅ Cache funciona<br>✅ Modal funciona |
| **Fase 2** | 3-5 dias | • Migrations (history, trash, permissions)<br>• DocumentManagementTab<br>• Services (history, substituição)<br>• Lixeira<br>• Ações em lote | ✅ Gerenciamento completo<br>✅ Substituição com histórico<br>✅ Lixeira funcional |
| **Fase 3** | 2-3 dias | • Badge de notificações<br>• Email automático<br>• Exportação PDF/Excel/ZIP<br>• Dashboard melhorado | ✅ Notificações ativas<br>✅ Exportações funcionam |
| **Fase 4** | 1-2 dias | • Migration auditoria<br>• Service de logs<br>• Interface de auditoria<br>• Integração com ações | ✅ Auditoria completa<br>✅ Logs de todas ações |
| **Testes** | 2 dias | • Testes manuais<br>• Validação<br>• Ajustes finais | ✅ Sistema testado |
| **TOTAL** | **9-14 dias** | | |

---

## ✅ Checklist de Implementação

### Fase 1 - Correções Críticas
- [ ] Implementar cache de documentos obrigatórios
- [ ] Atualizar `getEmployeesWithDocumentsSummary`
- [ ] Atualizar filtro em `ImprovedDocumentsTable`
- [ ] Implementar `getDocumentsByEmployee` no Context
- [ ] Testar: colaborador sem documento aparece na lista
- [ ] Testar: modal de documentos abre corretamente

### Fase 2 - Gerenciamento
- [ ] Criar migration `document_history`
- [ ] Criar migration `deleted_documents`
- [ ] Criar migration de permissões
- [ ] Criar `DocumentManagementTab`
- [ ] Criar `DocumentManagementTable`
- [ ] Criar `BulkActionsToolbar`
- [ ] Implementar `documentHistoryService`
- [ ] Implementar substituição de documento
- [ ] Implementar soft delete
- [ ] Implementar restauração
- [ ] Testar: substituir documento mantém histórico
- [ ] Testar: excluir move para lixeira
- [ ] Testar: restaurar funciona
- [ ] Testar: ações em lote funcionam

### Fase 3 - UX
- [ ] Criar badge de notificações no header
- [ ] Implementar dropdown de notificações
- [ ] Criar service de email
- [ ] Implementar exportação PDF
- [ ] Implementar exportação Excel
- [ ] Implementar download ZIP
- [ ] Testar: notificações aparecem
- [ ] Testar: exportações funcionam

### Fase 4 - Auditoria
- [ ] Criar migration `document_audit_log`
- [ ] Implementar `documentAuditService`
- [ ] Criar `DocumentAuditLog` component
- [ ] Integrar logs em todas as ações
- [ ] Testar: logs são registrados
- [ ] Testar: interface de auditoria funciona

---

## 🎯 Resumo das Melhorias

| Problema | Solução | Status |
|----------|---------|--------|
| Colaboradores não aparecem | Query atualizada + sempre mostrar ativos | ✅ Fase 1 |
| Difícil excluir vencidos | Ações em lote + soft delete | ✅ Fase 2 |
| Sem controle de versões | Histórico de substituições | ✅ Fase 2 |
| Sem histórico de alterações | Sistema de auditoria completo | ✅ Fase 4 |
| Interface não otimizada | Nova aba de gerenciamento | ✅ Fase 2 |
| Sem notificações | Badge + emails automáticos | ✅ Fase 3 |
| Exportação limitada | PDF/Excel/CSV/ZIP | ✅ Fase 3 |
| Sem dashboard | Cards de estatísticas | ✅ Fase 2/3 |

---

## 🚀 Próximos Passos

1. ✅ Plano aprovado
2. 🔄 Implementar Fase 1 (correções críticas)
3. ⏳ Testar Fase 1 antes de prosseguir
4. ⏳ Implementar Fase 2 (gerenciamento)
5. ⏳ Implementar Fase 3 (UX)
6. ⏳ Implementar Fase 4 (auditoria)
7. ⏳ Testes finais e deploy

---

**Posso começar a implementação da Fase 1?** 😊
