# Estrutura de Buckets - Sistema de Gestão RH

## Bucket: `documents`

Este documento descreve a organização dos arquivos no bucket `documents` do Supabase Storage para evitar conflitos entre diferentes funcionalidades.

### 📁 Estrutura de Pastas

```
documents/
├── benefit-documents/           # Documentos de benefícios
│   └── [benefitId]_[docName]_[userId]_[timestamp]_[randomId].[ext]
├── Atestado_de_Saude_Ocupacional/  # Documentos de funcionários
├── Comprovante_de_Residencia/      # Documentos de funcionários  
├── Contrato_de_Trabalho/           # Documentos de funcionários
├── CPF/                            # Documentos de funcionários
├── RG/                             # Documentos de funcionários
└── [outras_categorias]/            # Outras categorias de documentos
```

### 🔄 Serviços Responsáveis

#### 1. **documentService.ts** - Documentos de Funcionários
- **Pasta**: `documents/[categoria]/`
- **Formato**: `[timestamp]_[nomeArquivo]`
- **Banco**: Usa tabela `documents` para metadados
- **Funcionalidades**: Upload, listagem, download, atualização, exclusão
- **Categorias existentes**:
  - Atestado_de_Saude_Ocupacional
  - Comprovante_de_Residencia  
  - Contrato_de_Trabalho
  - CPF
  - RG

#### 2. **benefitDocumentService.ts** - Documentos de Benefícios
- **Pasta**: `documents/benefit-documents/`
- **Formato**: `[benefitId]_[docName]_[userId]_[timestamp]_[randomId].[ext]`
- **Banco**: **NÃO usa tabela** - metadados no nome do arquivo
- **Funcionalidades**: Upload, listagem, download, exclusão
- **Metadados no nome**:
  - `benefitId`: ID do benefício
  - `docName`: Nome do documento (sanitizado)
  - `userId`: ID do usuário que fez upload
  - `timestamp`: Timestamp do upload
  - `randomId`: ID aleatório único

### ⚠️ Separação e Não-Conflito

1. **Pastas diferentes**: Os serviços usam pastas completamente separadas
2. **Formatos diferentes**: Nomes de arquivo seguem padrões distintos
3. **Persistência diferente**: 
   - Documentos de funcionários: Tabela + Storage
   - Documentos de benefícios: Apenas Storage (metadados no nome)

### 🧪 Testes

Para testar ambos os sistemas:

```javascript
// Teste documentService (funcionários)
const testEmployeeDoc = new File(['test'], 'test.pdf', { type: 'application/pdf' });
await documentService.uploadDocument({
  name: 'Teste RG',
  category: 'RG',
  file: testEmployeeDoc,
  employee_id: 'employee-id'
});

// Teste benefitDocumentService (benefícios)  
const testBenefitDoc = new File(['test'], 'test.pdf', { type: 'application/pdf' });
await benefitDocumentService.uploadDocument({
  benefit_id: 'benefit-123',
  document_name: 'Comprovante Adesão',
  file: testBenefitDoc
});
```

### 📋 Políticas de Acesso

Ambos os serviços compartilham as mesmas políticas RLS:
- ✅ Usuários autenticados podem fazer upload
- ✅ Usuários autenticados podem visualizar
- ✅ Usuários autenticados podem atualizar  
- ✅ Usuários autenticados podem deletar

---
*Última atualização: Janeiro 2025*