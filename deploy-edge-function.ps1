# Script para fazer deploy da Edge Function whatsapp-nps-v2
# Como não temos Docker Desktop, vamos usar o método direto via API

$PROJECT_ID = "dzmatfnltgtgjvbputtb"
$FUNCTION_NAME = "whatsapp-nps-v2"
$ACCESS_TOKEN = "sbp_18ff6f3c6239abe1bcab2cbaa5f771f297134145"

# Lê o conteúdo da função
$functionContent = Get-Content -Path "supabase\functions\$FUNCTION_NAME\index.ts" -Raw

# Cria o payload para o deploy
$payload = @{
    name = $FUNCTION_NAME
    body = $functionContent
    verify_jwt = $false
} | ConvertTo-Json -Depth 10

# Headers para a requisição
$headers = @{
    "Authorization" = "Bearer $ACCESS_TOKEN"
    "Content-Type" = "application/json"
}

# URL da API do Supabase para deploy de Edge Functions
$url = "https://api.supabase.com/v1/projects/$PROJECT_ID/functions"

Write-Host "Fazendo deploy da Edge Function $FUNCTION_NAME..."

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $payload
    Write-Host "Deploy realizado com sucesso!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "Erro no deploy: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response | ConvertTo-Json -Depth 3)"
}