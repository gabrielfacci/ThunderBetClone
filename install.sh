#!/bin/bash

# ThunderBet - Script de Instalação Automática
# Para Ubuntu Server 20.04+ com domínio thunderbet.site

set -e

echo "🚀 Iniciando instalação do ThunderBet..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para logs
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verificar se é root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root"
fi

# Verificar Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    error "Este script é para Ubuntu. Sistema detectado: $(cat /etc/os-release | grep PRETTY_NAME)"
fi

log "Sistema Ubuntu detectado ✓"

# Atualizar sistema
log "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
log "Instalando Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    log "Node.js já instalado: $(node --version)"
fi

# PostgreSQL não necessário - usando Supabase
log "Usando Supabase como banco de dados (PostgreSQL local não necessário)"

# Instalar Nginx
log "Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    log "Nginx já instalado"
fi

# Instalar PM2
log "Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    log "PM2 já instalado"
fi

# Instalar Certbot
log "Instalando Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install snapd -y
    sudo snap install core; sudo snap refresh core
    sudo snap install --classic certbot
    sudo ln -s /snap/bin/certbot /usr/bin/certbot
else
    log "Certbot já instalado"
fi

# Banco de dados via Supabase - não precisa configurar PostgreSQL local
log "Banco de dados configurado via Supabase (nenhuma configuração local necessária)"

# Preparar diretório da aplicação
log "Preparando diretório da aplicação..."
sudo mkdir -p /var/www/html
sudo chown -R $USER:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Copiar arquivos (assumindo que o script está na raiz do projeto)
log "Copiando arquivos da aplicação..."
cp -r . /var/www/html/
cd /var/www/html

# Remover arquivos desnecessários
rm -rf node_modules .git *.md install.sh deployment-guide.md

# Instalar dependências
log "Instalando dependências..."
npm install

# Criar arquivo .env
log "Criando arquivo de configuração..."
cat > .env << EOF
NODE_ENV=production
SUPABASE_URL=https://kgpmvqfehzkeyrtexdkb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncG12cWZlaHprZXlydGV4ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzc5MTUsImV4cCI6MjA0OTk1MzkxNX0.Fyl4NTGZ0dNJFJ0NzBE3Y6hMTIhGYOCtYgMcGSwOE2s
ZYONPAY_SECRET_KEY=sk_live_v2UNcCWtzQAKrVaQZ8mvJKzQGr8fwvebUyCrCLCdAG
PORT=3000
EOF

# Build da aplicação
log "Compilando aplicação..."
npm run build

# Configurar PM2
log "Configurando PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'thunderbet',
    script: 'dist/index.js',
    cwd: '/var/www/html',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/thunderbet/error.log',
    out_file: '/var/log/thunderbet/out.log',
    log_file: '/var/log/thunderbet/combined.log',
    time: true
  }]
}
EOF

# Criar diretório de logs
sudo mkdir -p /var/log/thunderbet
sudo chown www-data:www-data /var/log/thunderbet

# Configurar Nginx
log "Configurando Nginx..."
sudo tee /etc/nginx/sites-available/thunderbet > /dev/null << EOF
server {
    listen 80;
    server_name thunderbet.site www.thunderbet.site;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name thunderbet.site www.thunderbet.site;

    ssl_certificate /etc/letsencrypt/live/thunderbet.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thunderbet.site/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    root /var/www/html/dist/public;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~ /\.(env|git) {
        deny all;
        return 404;
    }
}
EOF

# Ativar site Nginx
sudo ln -sf /etc/nginx/sites-available/thunderbet /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

# Configurar firewall
log "Configurando firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Configurar SSL
log "Configurando SSL com Let's Encrypt..."
warning "Para o SSL funcionar, o domínio thunderbet.site deve estar apontando para este servidor"
read -p "O domínio thunderbet.site já está apontando para este servidor? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo certbot --nginx -d thunderbet.site -d www.thunderbet.site --non-interactive --agree-tos --email admin@thunderbet.site
    
    # Configurar renovação automática
    (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | sudo crontab -
else
    warning "Configure o DNS primeiro e execute: sudo certbot --nginx -d thunderbet.site -d www.thunderbet.site"
fi

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Iniciar aplicação
log "Iniciando aplicação..."
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# Reiniciar serviços
sudo systemctl restart nginx

# Verificar status
log "Verificando serviços..."
if sudo systemctl is-active --quiet nginx; then
    log "Nginx: ✓ Rodando"
else
    error "Nginx: ✗ Falhou"
fi

if sudo systemctl is-active --quiet postgresql; then
    log "PostgreSQL: ✓ Rodando"
else
    error "PostgreSQL: ✗ Falhou"
fi

if pm2 status | grep -q "thunderbet"; then
    log "ThunderBet: ✓ Rodando"
else
    error "ThunderBet: ✗ Falhou"
fi

log "✅ Instalação concluída com sucesso!"
echo
echo "🎉 ThunderBet está rodando em:"
echo "   • HTTP:  http://thunderbet.site (redireciona para HTTPS)"
echo "   • HTTPS: https://thunderbet.site"
echo
echo "📊 Comandos úteis:"
echo "   • Ver logs:     pm2 logs thunderbet"
echo "   • Reiniciar:    pm2 restart thunderbet"
echo "   • Status:       pm2 status"
echo "   • Monitorar:    pm2 monit"
echo
echo "🔧 Arquivos importantes:"
echo "   • Aplicação:    /var/www/html"
echo "   • Nginx:        /etc/nginx/sites-available/thunderbet"
echo "   • Logs:         /var/log/thunderbet/"
echo "   • SSL:          /etc/letsencrypt/live/thunderbet.site/"