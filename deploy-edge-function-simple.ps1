# Script para fazer deploy da Edge Function whatsapp-nps-v2
# Usando curl para fazer o deploy via API do Supabase

$PROJECT_ID = "dzmatfnltgtgjvbputtb"
$ACCESS_TOKEN = "sbp_18ff6f3c6239abe1bcab2cbaa5f771f297134145"
$FUNCTION_NAME = "whatsapp-nps-v2"

# Ler o conteúdo da função
$FUNCTION_PATH = "supabase\functions\$FUNCTION_NAME\index.ts"

if (-not (Test-Path $FUNCTION_PATH)) {
    Write-Host "❌ Arquivo da função não encontrado: $FUNCTION_PATH" -ForegroundColor Red
    exit 1
}

$FUNCTION_CONTENT = Get-Content $FUNCTION_PATH -Raw

# Criar payload JSON
$payload = @{
    name = $FUNCTION_NAME
    source = $FUNCTION_CONTENT
    verify_jwt = $false
} | ConvertTo-Json -Depth 10

# Fazer deploy usando Invoke-RestMethod
try {
    Write-Host "🚀 Fazendo deploy da Edge Function $FUNCTION_NAME..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$PROJECT_ID/functions" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $ACCESS_TOKEN"
            "Content-Type" = "application/json"
        } `
        -Body $payload
    
    Write-Host "✅ Deploy realizado com sucesso!" -ForegroundColor Green
    Write-Host "📋 Resposta:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
} catch {
    Write-Host "❌ Erro no deploy:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $responseBody" -ForegroundColor Red
    }
}