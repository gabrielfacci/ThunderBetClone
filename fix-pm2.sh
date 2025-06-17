#!/bin/bash

# Script para corrigir erro de permissões PM2 - ThunderBet
# Execute este script no diretório /var/www/html

set -e

echo "🔧 Corrigindo erro de permissões PM2..."

# Parar processos PM2 existentes
echo "Parando processos PM2..."
sudo pkill -f PM2 2>/dev/null || true
sudo pkill -f pm2 2>/dev/null || true

# Limpar diretórios problemáticos
echo "Limpando diretórios problemáticos..."
sudo rm -rf /var/www/.pm2 2>/dev/null || true
sudo rm -rf /home/www-data/.pm2 2>/dev/null || true

# Ajustar propriedade dos arquivos
echo "Ajustando permissões..."
sudo chown -R $USER:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Criar .env correto (apenas Supabase)
echo "Criando arquivo .env..."
cat > /var/www/html/.env << 'EOF'
NODE_ENV=production
SUPABASE_URL=https://kgpmvqfehzkeyrtexdkb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncG12cWZlaHprZXlydGV4ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzc5MTUsImV4cCI6MjA0OTk1MzkxNX0.Fyl4NTGZ0dNJFJ0NzBE3Y6hMTIhGYOCtYgMcGSwOE2s
ZYONPAY_SECRET_KEY=sk_live_v2UNcCWtzQAKrVaQZ8mvJKzQGr8fwvebUyCrCLCdAG
PORT=3000
EOF

# Criar configuração PM2 simplificada
echo "Criando configuração PM2..."
cat > /var/www/html/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'thunderbet',
    script: 'dist/index.js',
    cwd: '/var/www/html',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/thunderbet/error.log',
    out_file: '/var/log/thunderbet/out.log',
    log_file: '/var/log/thunderbet/combined.log',
    time: true,
    watch: false
  }]
}
EOF

# Criar diretório de logs
echo "Criando diretório de logs..."
sudo mkdir -p /var/log/thunderbet
sudo chown $USER:www-data /var/log/thunderbet

# Instalar dependências e build
echo "Instalando dependências..."
cd /var/www/html
npm install

echo "Compilando aplicação..."
npm run build

# Iniciar com usuário atual (não www-data)
echo "Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

echo "✅ PM2 configurado com sucesso!"
echo ""
echo "Status da aplicação:"
pm2 status

echo ""
echo "Para verificar se está funcionando:"
echo "curl -I http://localhost:3000"

echo ""
echo "Logs da aplicação:"
echo "pm2 logs thunderbet"