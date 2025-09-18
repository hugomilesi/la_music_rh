# Diagnóstico - Problemas na Folha de Pagamento

## Resumo Executivo

Após análise detalhada da tabela `folha_pagamento` no Supabase e do sistema frontend, foram identificados múltiplos problemas que afetam a integridade e visualização dos dados da folha de pagamento.

## Problemas Identificados

### 1. Inconsistência de Dados na Base de Dados

#### 1.1 Registros com Campos Nulos
- **Total de registros**: 10
- **Registros com `nome_colaborador` nulo**: 8 (80%)
- **Registros com `cpf_colaborador` nulo**: 8 (80%)
- **Registros com `unidade` nula**: 8 (80%)
- **Registros com `colaborador_id` nulo**: 1 (10%)

#### 1.2 Registros com Valores Zerados
- **Registros com `salario_base` = 0**: 3 (30%)

#### 1.3 Duplicação de Dados
Alguns registros possuem dados duplicados entre as colunas da tabela `folha_pagamento` e os dados vindos da tabela `users`:
- Exemplo: Anne Susan Cordeiro Teixeira tem CPF diferente na folha (123.456.789-00) vs users (987.654.321-02)

### 2. Problemas de Mapeamento Frontend-Backend

#### 2.1 Discrepâncias no Serviço PayrollService
O serviço `payrollService.getPayrollEntries()` faz JOIN com a tabela `users` mas:
- Nem todos os registros da folha têm `colaborador_id` válido
- Dados de colaboradores não cadastrados no sistema ficam perdidos
- Mapeamento inconsistente entre campos da base e frontend

#### 2.2 Função mapPayrollEntryToEmployee
A função de mapeamento no frontend tenta compensar as inconsistências:
- Prioriza dados de `entry.unidade` sobre `users.units`
- Usa fallbacks múltiplos para nome: `nome_colaborador` → `collaborator_name` → `users.full_name`
- Campos podem ficar com valores padrão ("Nome não informado", "Unidade não informada")

### 3. Problemas Específicos por Categoria

#### 3.1 Colaboradores Cadastrados no Sistema
- **Problema**: Dados duplicados entre tabelas
- **Impacto**: Inconsistência entre CPF, unidades e outros dados pessoais
- **Exemplo**: Anne Susan tem dados diferentes na folha vs tabela users

#### 3.2 Colaboradores Não Cadastrados
- **Problema**: Dados incompletos na tabela folha_pagamento
- **Impacto**: Registros aparecem sem nome, CPF ou unidade no frontend
- **Exemplo**: Registro "jorge lafas" tem dados básicos mas falta informações complementares

#### 3.3 Registros com Valores Zerados
- **Problema**: Entradas com salário base = 0
- **Impacto**: Distorção nos cálculos e relatórios financeiros
- **Quantidade**: 3 registros identificados

### 4. Problemas de Visualização no Frontend

#### 4.1 Filtros por Unidade
- Tab "Professores Multi-Unidade" pode não mostrar todos os registros relevantes
- Filtro baseado em `unidade = "professores-multi-unidade"` mas alguns registros têm `unidade` nula

#### 4.2 Exibição de Dados
- Registros aparecem com "Nome não informado" quando `nome_colaborador` é nulo
- Unidades aparecem como "Unidade não informada" quando dados estão inconsistentes
- Valores zerados podem confundir usuários sobre status real dos pagamentos

## Análise de Causa Raiz

### 1. Estrutura de Dados Híbrida
O sistema permite cadastro de folha para:
- Colaboradores cadastrados no sistema (com `colaborador_id`)
- Colaboradores externos (sem `colaborador_id`, dados diretos na folha)

Esta flexibilidade causa inconsistências quando:
- Dados são inseridos parcialmente
- Há conflito entre dados da folha e dados do usuário cadastrado

### 2. Validação Insuficiente
- Falta validação obrigatória para campos essenciais
- Permite inserção de registros com dados incompletos
- Não há verificação de consistência entre tabelas relacionadas

### 3. Processo de Migração/Importação
- Possível importação de dados legados sem validação adequada
- Registros criados sem preenchimento completo dos campos obrigatórios

## Impactos Identificados

### 1. Impactos Funcionais
- **Relatórios incorretos**: Dados nulos/zerados afetam cálculos
- **Filtros ineficazes**: Registros não aparecem nos filtros corretos
- **Experiência do usuário**: Informações "não informado" confundem usuários

### 2. Impactos de Integridade
- **Dados duplicados**: Mesma informação em locais diferentes
- **Inconsistência referencial**: Dados conflitantes entre tabelas
- **Perda de rastreabilidade**: Dificulta auditoria e correções

### 3. Impactos de Performance
- **Queries complexas**: JOINs desnecessários para compensar inconsistências
- **Processamento adicional**: Múltiplos fallbacks no frontend
- **Logs excessivos**: Debug logs para compensar problemas de dados

## Dados de Exemplo dos Problemas

### Registro com Dados Completos (Funcionando)
```json
{
  "id": "30a210a6-d097-4852-b9c5-a68dc9ff06b7",
  "colaborador_id": "f989bd1a-cc43-4e3e-8d0f-bad13fe791b1",
  "nome_colaborador": "Anne Susan Cordeiro Teixeira",
  "cpf_colaborador": "123.456.789-00",
  "unidade": "professores-multi-unidade",
  "salario_base": "2500.00",
  "user_full_name": "Anne Susan Cordeiro Teixeira",
  "user_cpf": "987.654.321-02" // ⚠️ CPF diferente!
}
```

### Registro com Dados Incompletos (Problemático)
```json
{
  "id": "526d25a0-8e06-46aa-bc35-da194a6139a5",
  "colaborador_id": "32349eb8-daae-4c8f-849c-18af9552c000",
  "nome_colaborador": null, // ⚠️ Nulo
  "cpf_colaborador": null,  // ⚠️ Nulo
  "unidade": null,          // ⚠️ Nulo
  "salario_base": "40.00",
  "user_full_name": "Hugo Teste" // Dados vêm da tabela users
}
```

### Registro Sem Colaborador Cadastrado (Problemático)
```json
{
  "id": "d98338e6-af24-4566-969d-a6232671f89c",
  "colaborador_id": null,   // ⚠️ Sem vínculo
  "nome_colaborador": "jorge lafas",
  "cpf_colaborador": "12345569800",
  "unidade": "professores-multi-unidade",
  "user_full_name": null,   // ⚠️ Sem dados complementares
  "user_cpf": null
}
```

## Recomendações para Correção

### 1. Imediatas (Correção de Dados)
- Identificar e corrigir registros com campos nulos obrigatórios
- Padronizar dados duplicados entre tabelas
- Validar e corrigir registros com valores zerados incorretos

### 2. Estruturais (Melhoria do Sistema)
- Implementar validação obrigatória para campos essenciais
- Criar processo de sincronização entre dados da folha e usuários
- Estabelecer fonte única de verdade para dados pessoais

### 3. Preventivas (Evitar Recorrência)
- Adicionar constraints de banco de dados
- Implementar validação no frontend antes da submissão
- Criar processo de auditoria regular dos dados

## Conclusão

Os problemas identificados são principalmente relacionados à inconsistência de dados e falta de validação adequada. Embora o sistema frontend tenha mecanismos de fallback que minimizam o impacto visual, a integridade dos dados está comprometida, afetando relatórios, filtros e a confiabilidade geral do sistema.

A correção deve priorizar a padronização dos dados existentes e a implementação de validações que previnam a recorrência desses problemas.