# Deploy Simplificado - ThunderBet (Sem PostgreSQL)

## Comandos para resolver o erro do PM2

Execute estes comandos no seu servidor Ubuntu:

### 1. Corrigir permissões PM2
```bash
# Parar qualquer processo PM2 rodando
sudo pkill -f PM2 || true

# Remover diretórios problemáticos
sudo rm -rf /var/www/.pm2 || true

# Criar diretório home para www-data
sudo mkdir -p /home/www-data
sudo chown www-data:www-data /home/www-data

# Ajustar permissões da aplicação
sudo chown -R $USER:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

### 2. Configurar aplicação (sem PostgreSQL)
```bash
cd /var/www/html

# Criar .env apenas com Supabase
cat > .env << 'EOF'
NODE_ENV=production
SUPABASE_URL=https://kgpmvqfehzkeyrtexdkb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncG12cWZlaHprZXlydGV4ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzc5MTUsImV4cCI6MjA0OTk1MzkxNX0.Fyl4NTGZ0dNJFJ0NzBE3Y6hMTIhGYOCtYgMcGSwOE2s
ZYONPAY_SECRET_KEY=sk_live_v2UNcCWtzQAKrVaQZ8mvJKzQGr8fwvebUyCrCLCdAG
PORT=3000
EOF

# Instalar dependências
npm install

# Build da aplicação
npm run build
```

### 3. Configurar PM2 corretamente
```bash
# Criar configuração PM2 simplificada
cat > ecosystem.config.js << 'EOF'
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
    watch: false,
    ignore_watch: ["node_modules", "logs"]
  }]
}
EOF

# Criar diretório de logs
sudo mkdir -p /var/log/thunderbet
sudo chown $USER:www-data /var/log/thunderbet
```

### 4. Iniciar aplicação com seu usuário (não www-data)
```bash
# Usar seu usuário em vez de www-data para evitar problemas de permissão
pm2 start ecosystem.config.js
pm2 save

# Configurar startup
pm2 startup

# Verificar se está rodando
pm2 status
```

### 5. Configurar Nginx
```bash
# Criar configuração Nginx
sudo tee /etc/nginx/sites-available/thunderbet > /dev/null << 'EOF'
server {
    listen 80;
    server_name thunderbet.site www.thunderbet.site;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name thunderbet.site www.thunderbet.site;

    # SSL configuration (will be set up by Certbot)
    ssl_certificate /etc/letsencrypt/live/thunderbet.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thunderbet.site/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Root directory for static files
    root /var/www/html/dist/public;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API routes proxy
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
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/thunderbet /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 6. Configurar SSL (Let's Encrypt)
```bash
# Configurar SSL automaticamente
sudo certbot --nginx -d thunderbet.site -d www.thunderbet.site

# Configurar renovação automática
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | sudo crontab -
```

### 7. Configurar Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Verificação Final

```bash
# Status dos serviços
pm2 status
sudo systemctl status nginx

# Testar aplicação
curl -I http://localhost:3000
curl -I https://thunderbet.site

# Ver logs se houver problemas
pm2 logs thunderbet
sudo tail -f /var/log/nginx/error.log
```

## Comandos de Manutenção

```bash
# Reiniciar aplicação
pm2 restart thunderbet

# Ver logs em tempo real
pm2 logs thunderbet --lines 100

# Atualizar aplicação
cd /var/www/html
git pull  # ou upload de novos arquivos
npm install
npm run build
pm2 restart thunderbet

# Backup (opcional, já que usa Supabase)
# Não precisa backup de banco local
```

## Resolução de Problemas

### Aplicação não inicia
```bash
pm2 logs thunderbet --err
# Verificar se porta 3000 está livre
sudo netstat -tulpn | grep 3000
```

### Nginx 502 Bad Gateway
```bash
# Verificar se aplicação está rodando
pm2 status
# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### SSL não funciona
```bash
sudo certbot certificates
sudo nginx -t
sudo systemctl reload nginx
```

Esta configuração usa apenas Supabase como banco de dados, elimina problemas de permissão do PostgreSQL local e resolve os erros do PM2.