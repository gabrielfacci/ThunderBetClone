# Guia de Deploy - ThunderBet no Ubuntu Server

## Pré-requisitos no Servidor Ubuntu

### 1. Atualizar o sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js 20 (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Instalar PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Instalar Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Instalar PM2 (Gerenciador de Processos)
```bash
sudo npm install -g pm2
```

### 6. Instalar Certbot (SSL)
```bash
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

## Configuração do Banco de Dados

### 1. Criar usuário e banco PostgreSQL
```bash
sudo -u postgres psql
```

Dentro do PostgreSQL:
```sql
CREATE USER thunderbet WITH PASSWORD 'sua_senha_segura_aqui';
CREATE DATABASE thunderbet OWNER thunderbet;
GRANT ALL PRIVILEGES ON DATABASE thunderbet TO thunderbet;
\q
```

### 2. Configurar autenticação PostgreSQL
```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Adicionar esta linha antes das outras:
```
local   thunderbet      thunderbet                              md5
```

Reiniciar PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Preparação dos Arquivos da Aplicação

### 1. Transferir arquivos para o servidor
```bash
# No seu computador local, comprimir a aplicação (excluindo node_modules)
tar -czf thunderbet.tar.gz --exclude=node_modules --exclude=.git .

# Transferir para o servidor
scp thunderbet.tar.gz usuario@thunderbet.site:/var/www/html/

# No servidor, extrair
cd /var/www/html
sudo tar -xzf thunderbet.tar.gz
sudo rm thunderbet.tar.gz
sudo chown -R www-data:www-data /var/www/html
```

### 2. Instalar dependências
```bash
cd /var/www/html
sudo -u www-data npm install
```

### 3. Criar arquivo de ambiente (.env)
```bash
sudo nano /var/www/html/.env
```

Conteúdo do .env:
```env
NODE_ENV=production
DATABASE_URL=postgresql://thunderbet:sua_senha_segura_aqui@localhost:5432/thunderbet
SUPABASE_URL=https://kgpmvqfehzkeyrtexdkb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncG12cWZlaHprZXlydGV4ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzc5MTUsImV4cCI6MjA0OTk1MzkxNX0.Fyl4NTGZ0dNJFJ0NzBE3Y6hMTIhGYOCtYgMcGSwOE2s
ZYONPAY_SECRET_KEY=sk_live_v2UNcCWtzQAKrVaQZ8mvJKzQGr8fwvebUyCrCLCdAG
PORT=3000
```

### 4. Executar migrações do banco
```bash
cd /var/www/html
sudo -u www-data npm run db:push
```

### 5. Build da aplicação
```bash
cd /var/www/html
sudo -u www-data npm run build
```

## Configuração do PM2

### 1. Criar arquivo de configuração PM2
```bash
sudo nano /var/www/html/ecosystem.config.js
```

Conteúdo:
```javascript
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
```

### 2. Criar diretório de logs
```bash
sudo mkdir -p /var/log/thunderbet
sudo chown www-data:www-data /var/log/thunderbet
```

### 3. Iniciar aplicação com PM2
```bash
cd /var/www/html
sudo -u www-data pm2 start ecosystem.config.js
sudo -u www-data pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u www-data --hp /var/www
```

## Configuração do Nginx

### 1. Criar configuração do site
```bash
sudo nano /etc/nginx/sites-available/thunderbet
```

Conteúdo:
```nginx
server {
    listen 80;
    server_name thunderbet.site www.thunderbet.site;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name thunderbet.site www.thunderbet.site;

    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/thunderbet.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thunderbet.site/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Root directory
    root /var/www/html/dist/public;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Block access to sensitive files
    location ~ /\.(env|git) {
        deny all;
        return 404;
    }
}
```

### 2. Ativar site e remover padrão
```bash
sudo ln -s /etc/nginx/sites-available/thunderbet /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
```

## Configuração SSL com Let's Encrypt

### 1. Obter certificado SSL
```bash
sudo certbot --nginx -d thunderbet.site -d www.thunderbet.site
```

### 2. Configurar renovação automática
```bash
sudo crontab -e
```

Adicionar:
```
0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

## Inicialização Final

### 1. Reiniciar serviços
```bash
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

### 2. Verificar status dos serviços
```bash
sudo systemctl status nginx
sudo systemctl status postgresql
sudo -u www-data pm2 status
```

### 3. Testar aplicação
```bash
curl -I https://thunderbet.site
```

## Comandos Úteis para Manutenção

### Logs da aplicação
```bash
sudo -u www-data pm2 logs thunderbet
```

### Reiniciar aplicação
```bash
sudo -u www-data pm2 restart thunderbet
```

### Atualizar aplicação
```bash
cd /var/www/html
sudo -u www-data git pull  # Se usando Git
sudo -u www-data npm install
sudo -u www-data npm run build
sudo -u www-data pm2 restart thunderbet
```

### Backup do banco de dados
```bash
sudo -u postgres pg_dump thunderbet > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Firewall (Opcional mas Recomendado)

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Monitoramento

### Instalar htop para monitoramento
```bash
sudo apt install htop -y
```

### Ver uso de recursos
```bash
htop
sudo -u www-data pm2 monit
```

---

**Importante**: Substitua `sua_senha_segura_aqui` por uma senha forte para o PostgreSQL e mantenha as credenciais seguras.

Após seguir todos os passos, sua aplicação ThunderBet estará rodando em https://thunderbet.site/ com SSL, banco de dados PostgreSQL e alta disponibilidade através do PM2.