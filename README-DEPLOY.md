# Configuração de Deploy na Vercel

## Variáveis de Ambiente Necessárias

Para que o deploy funcione corretamente na Vercel, você deve configurar as seguintes variáveis de ambiente no painel da Vercel:

### ⚠️ OBRIGATÓRIAS (sem essas o app não funciona):

```
VITE_SUPABASE_URL=https://jrphwjkgepmgdgiqebyr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpycGh3amtnZXBtZ2RnaXFlYnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzE0NDAsImV4cCI6MjA3MzgwNzQ0MH0.KPahOWtolr8wSQc81D0dl23t3lNvS6RpSt_eQFa2SRs
```

### 📋 Opcionais (para funcionalidades específicas):

```
VITE_PROJECT_ID=jrphwjkgepmgdgiqebyr
VITE_RESEND_API_KEY=re_placeholder_key
VITE_EVOLUTION_API_URL=
VITE_EVOLUTION_API_KEY=
VITE_EVOLUTION_INSTANCE_NAME=
VITE_EVOLUTION_API_ENABLED=false
```

## Como Configurar na Vercel

1. Acesse o painel da Vercel
2. Vá para o projeto LA Music RH
3. Clique em "Settings" → "Environment Variables"
4. Adicione cada variável uma por uma:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://jrphwjkgepmgdgiqebyr.supabase.co`
   - Environment: `Production`, `Preview`, `Development` (todas marcadas)

5. Repita para `VITE_SUPABASE_ANON_KEY`

6. Após adicionar as variáveis, faça um novo deploy ou redeploy do projeto

## Verificação

Após configurar as variáveis, o erro "Missing required Supabase environment variables" deve desaparecer e a aplicação deve carregar normalmente.

## Troubleshooting

- Se ainda aparecer tela branca, verifique o console do navegador para outros erros
- Certifique-se de que as variáveis estão marcadas para todos os ambientes (Production, Preview, Development)
- Aguarde alguns minutos após adicionar as variáveis antes de testar