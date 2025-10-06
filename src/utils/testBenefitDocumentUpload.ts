import { supabase } from '@/integrations/supabase/client'

/**
 * Teste abrangente de upload de documento para benefício, com verificação de RLS.
 * - Faz upload de um arquivo pequeno para o bucket `documents` em `benefit-documents/`
 * - Insere metadados na tabela `benefit_documents`
 * - Verifica existência do usuário em `users` (auth_user_id -> users.id)
 * - Testa políticas de RLS (insert com usuário correto/incorreto, update e delete)
 */
export interface BenefitDocumentUploadTestParams {
  benefitId: string
  colaboradorId?: string | null
  documentName?: string
  content?: string
}

export interface BenefitDocumentUploadTestResult {
  userId?: string
  usersTableId?: string
  bucketExists?: boolean
  storageUploadPath?: string
  dbInsertId?: string
  insertWithWrongUserBlocked?: boolean
  updateStatusSucceeded?: boolean
  deleteSucceeded?: boolean
  errors: { step: string; error: any }[]
}

function logStep(step: string, details?: any) {
  const ts = new Date().toISOString()
  if (details !== undefined) {
  } else {
  }
}

function randomId() {
  return Math.random().toString(36).slice(2)
}

export async function runBenefitDocumentUploadTest(params: BenefitDocumentUploadTestParams): Promise<BenefitDocumentUploadTestResult> {
  const result: BenefitDocumentUploadTestResult = {
    errors: []
  }

  try {
    logStep('🔄 Iniciando teste de upload de documento', params)

    // 1) Autenticação
    const { data: userResp, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userResp?.user) {
      result.errors.push({ step: 'auth.getUser', error: userErr || 'No user' })
      throw new Error('Usuário não autenticado')
    }
    const user = userResp.user
    result.userId = user.id
    logStep('✅ Usuário autenticado', { auth_user_id: user.id })

    // 2) Verificar usuário na tabela users
    const { data: userRow, error: userRowErr } = await supabase
      .from('users')
      .select('id, auth_user_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (userRowErr) {
      result.errors.push({ step: 'select users', error: userRowErr })
      logStep('❌ Erro ao buscar usuário na tabela users', userRowErr)
    }
    if (!userRow) {
      logStep('⚠️ Nenhum registro encontrado na tabela users para este auth_user_id')
    } else {
      result.usersTableId = userRow.id
      logStep('✅ Usuário encontrado na tabela users', userRow)
    }

    // 3) Checar bucket e listar prefixo (testa existência do bucket/prefixo)
    const { data: listData, error: listErr } = await supabase.storage
      .from('documents')
      .list('benefit-documents', { limit: 1 })

    if (listErr) {
      result.errors.push({ step: 'storage.list benefit-documents', error: listErr })
      logStep('❌ Erro ao listar bucket/prefixo (verificar se bucket "documents" existe e RLS)', listErr)
    } else {
      result.bucketExists = true
      logStep('✅ Listagem no bucket realizada (bucket/prefixo existe)', listData)
    }

    // Preparar arquivo de teste
    const timestamp = Date.now()
    const defaultName = params.documentName || `teste-beneficio-${timestamp}.txt`
    const content = params.content || `Teste de upload (${new Date(timestamp).toISOString()})\nID aleatório: ${randomId()}`
    const file = new File([content], defaultName, { type: 'text/plain' })

    const filePath = `benefit-documents/${params.benefitId}_${defaultName.replace(/[^a-zA-Z0-9_.-]/g, '_')}_${result.usersTableId || 'unknown'}_${timestamp}_${randomId()}`
    logStep('📝 Preparando upload para Storage', { filePath, fileType: file.type, fileSize: file.size })

    // 4) Upload para Storage
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (uploadErr) {
      result.errors.push({ step: 'storage.upload', error: uploadErr })
      logStep('❌ Erro no upload para Storage', uploadErr)
      throw uploadErr
    }
    result.storageUploadPath = uploadData.path
    logStep('✅ Upload para Storage concluído', uploadData)

    // 5) Inserir metadados na tabela benefit_documents (RLS: deve permitir com uploaded_by correto)
    const insertPayload = {
      benefit_id: params.benefitId,
      name: defaultName,
      file_path: uploadData.path,
      file_type: file.type,
      file_size: file.size,
      status: 'pending',
      uploaded_by: result.usersTableId || null,
      colaborador_id: params.colaboradorId || null
    }
    logStep('🧩 Preparando insert em benefit_documents', insertPayload)

    const { data: insertedRows, error: insertErr } = await supabase
      .from('benefit_documents')
      .insert(insertPayload)
      .select('*')

    if (insertErr || !insertedRows || insertedRows.length === 0) {
      result.errors.push({ step: 'db.insert benefit_documents', error: insertErr || 'No data returned' })
      logStep('❌ Erro ao inserir em benefit_documents', insertErr)
      throw insertErr || new Error('Falha na inserção (sem retorno)')
    }
    const inserted = insertedRows[0]
    result.dbInsertId = inserted.id
    logStep('✅ Registro inserido em benefit_documents', inserted)

    // 6) RLS: tentar inserir com uploaded_by errado (espera falhar)
    const wrongPayload = { ...insertPayload, uploaded_by: '00000000-0000-0000-0000-000000000000', name: `WRONG-${defaultName}` }
    const { data: wrongInsert, error: wrongInsertErr } = await supabase
      .from('benefit_documents')
      .insert(wrongPayload)
      .select('*')

    if (wrongInsertErr) {
      result.insertWithWrongUserBlocked = true
      logStep('✅ RLS bloqueou insert com uploaded_by incorreto (esperado)', wrongInsertErr)
    } else {
      result.insertWithWrongUserBlocked = false
      logStep('⚠️ RLS NÃO bloqueou insert com uploaded_by incorreto', wrongInsert)
    }

    // 7) RLS: tentar atualizar status do registro inserido (espera permitir para o dono)
    const { data: updateData, error: updateErr } = await supabase
      .from('benefit_documents')
      .update({ status: 'approved' })
      .eq('id', inserted.id)
      .select('*')

    if (updateErr) {
      result.errors.push({ step: 'db.update benefit_documents', error: updateErr })
      logStep('❌ Erro ao atualizar status do documento', updateErr)
    } else {
      result.updateStatusSucceeded = true
      logStep('✅ Status atualizado para approved', updateData)
    }

    // 8) RLS: tentar deletar o registro inserido (espera permitir para o dono)
    const { error: deleteErr } = await supabase
      .from('benefit_documents')
      .delete()
      .eq('id', inserted.id)

    if (deleteErr) {
      result.errors.push({ step: 'db.delete benefit_documents', error: deleteErr })
      logStep('❌ Erro ao deletar documento (cleanup)', deleteErr)
    } else {
      result.deleteSucceeded = true
      logStep('✅ Documento deletado (cleanup)')
    }

    logStep('🏁 Teste concluído')
    return result
  } catch (err) {
    // Erro geral do fluxo
    result.errors.push({ step: 'general', error: err })
    logStep('🛑 Falha geral no teste', err)
    return result
  }
}

// Anexar ao window para fácil execução via console
if (typeof window !== 'undefined') {
  ;(window as any).runBenefitDocumentUploadTest = runBenefitDocumentUploadTest
  logStep('🔗 Função runBenefitDocumentUploadTest anexada ao window')
}

export default runBenefitDocumentUploadTest