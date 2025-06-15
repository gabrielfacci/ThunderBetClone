# Configurações Obrigatórias do Supabase

## 🚨 CONFIGURAÇÕES CRÍTICAS NECESSÁRIAS

Para que o sistema de autenticação funcione corretamente, você DEVE fazer estas configurações no painel do Supabase:

### 1. Desabilitar Confirmação de Email
1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Vá em: **Authentication** → **Email Settings** 
3. **DESMARQUE** a opção: "User must confirm their email address"
4. Clique em **Save**

### 2. Configurar Domínios Permitidos
1. Ainda em **Authentication** → **Email Settings**
2. Procure por **"Allowed email domains"** ou **"Email domain whitelist"**
3. Adicione os domínios que você quer permitir:
   - `gmail.com`
   - `hotmail.com`
   - `yahoo.com`
   - `outlook.com`
   - Ou deixe em branco para permitir TODOS os domínios

### 3. Verificar Configurações de Segurança
1. Vá em **Authentication** → **Settings**
2. Certifique-se de que **"Enable email confirmations"** está DESABILITADO

## ❌ Problemas Atuais

- **email_address_invalid**: Supabase está rejeitando domínios como @gmail.com
- **Email not confirmed**: Sistema exige confirmação de email mesmo após desabilitar

## ✅ Após Configurar

Depois de fazer essas configurações:
1. Teste o cadastro com: `teste3@gmail.com`
2. O usuário deve conseguir cadastrar E logar automaticamente
3. O header deve mostrar o usuário logado com saldo

## 🔧 Se Ainda Não Funcionar

Se mesmo após as configurações o erro persistir, pode ser necessário:
1. Aguardar alguns minutos para as configurações propagarem
2. Verificar se há políticas RLS (Row Level Security) bloqueando
3. Verificar logs do Supabase em **Logs** → **Auth logs**