# Deploy ThunderBet - Tutorial Prático

## 📋 Pré-requisitos
- Servidor Ubuntu 20.04+
- Domínio thunderbet.site apontando para o servidor
- Acesso SSH ao servidor
- Usuário com privilégios sudo

## 🚀 Instalação Rápida (Método Automático)

### 1. Baixar arquivos para o servidor
```bash
# No seu servidor Ubuntu
cd /tmp
wget https://github.com/seu-repo/thunderbet/archive/main.zip
unzip main.zip
cd thunderbet-main
```

### 2. Executar instalação automática
```bash
chmod +x install.sh
./install.sh
```

O script irá:
- Instalar Node.js, PostgreSQL, Nginx, PM2, Certbot
- Configurar banco de dados (você deve digitar uma senha)
- Copiar arquivos para /var/www/html
- Configurar SSL automaticamente
- Iniciar aplicação

### 3. Verificar instalação
```bash
pm2 status
sudo systemctl status nginx
curl -I https://thunderbet.site
```

## 🔧 Instalação Manual (Passo a Passo)

### 1. Instalar dependências
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Nginx
sudo apt install nginx -y

# PM2
sudo npm install -g pm2

# Certbot (SSL)
sudo apt install snapd -y
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 2. Configurar PostgreSQL
```bash
sudo -u postgres psql
```
```sql
CREATE USER thunderbet WITH PASSWORD 'SUA_SENHA_AQUI';
CREATE DATABASE thunderbet OWNER thunderbet;
GRANT ALL PRIVILEGES ON DATABASE thunderbet TO thunderbet;
\q
```

### 3. Transferir arquivos da aplicação
```bash
# Comprimir no seu computador local (sem node_modules)
tar -czf thunderbet.tar.gz --exclude=node_modules --exclude=.git .

# Enviar para servidor
scp thunderbet.tar.gz usuario@thunderbet.site:/var/www/html/

# No servidor
cd /var/www/html
sudo tar -xzf thunderbet.tar.gz
sudo chown -R www-data:www-data /var/www/html
```

### 4. Configurar aplicação
```bash
cd /var/www/html
npm install

# Criar .env
nano .env
```

Conteúdo do .env:
```env
NODE_ENV=production
DATABASE_URL=postgresql://thunderbet:SUA_SENHA_AQUI@localhost:5432/thunderbet
SUPABASE_URL=https://kgpmvqfehzkeyrtexdkb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncG12cWZlaHprZXlydGV4ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzc5MTUsImV4cCI6MjA0OTk1MzkxNX0.Fyl4NTGZ0dNJFJ0NzBE3Y6hMTIhGYOCtYgMcGSwOE2s
ZYONPAY_SECRET_KEY=sk_live_v2UNcCWtzQAKrVaQZ8mvJKzQGr8fwvebUyCrCLCdAG
PORT=3000
```

### 5. Build e iniciar
```bash
npm run db:push
npm run build
pm2 start ecosystem.config.js
```

### 6. Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/thunderbet
```

Copiar configuração do arquivo `deployment-guide.md`

```bash
sudo ln -s /etc/nginx/sites-available/thunderbet /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Configurar SSL
```bash
sudo certbot --nginx -d thunderbet.site -d www.thunderbet.site
```

## 📊 Comandos de Manutenção

### Ver logs
```bash
pm2 logs thunderbet
sudo tail -f /var/log/nginx/error.log
```

### Reiniciar aplicação
```bash
pm2 restart thunderbet
```

### Atualizar aplicação
```bash
cd /var/www/html
./update.sh
```

### Status dos serviços
```bash
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Backup banco de dados
```bash
sudo -u postgres pg_dump thunderbet > backup_$(date +%Y%m%d).sql
```

## 🔥 Resolução de Problemas

### Aplicação não inicia
```bash
pm2 logs thunderbet --err
# Verificar .env e permissões
```

### Nginx erro 502
```bash
sudo nginx -t
sudo systemctl status nginx
# Verificar se aplicação está rodando na porta 3000
```

### Erro de banco de dados
```bash
sudo systemctl status postgresql
# Verificar DATABASE_URL no .env
```

### SSL não funciona
```bash
sudo certbot renew --dry-run
sudo systemctl reload nginx
```

## 🎯 Checklist Final

- [ ] Domínio aponta para o servidor
- [ ] PostgreSQL rodando
- [ ] Aplicação compilada (npm run build)
- [ ] PM2 rodando a aplicação
- [ ] Nginx configurado e rodando
- [ ] SSL configurado
- [ ] Firewall configurado (ufw)
- [ ] Site acessível em https://thunderbet.site

## 📝 Estrutura de Arquivos no Servidor

```
/var/www/html/
├── dist/               # Aplicação compilada
├── node_modules/       # Dependências
├── server/            # Código do servidor
├── client/            # Código do frontend
├── .env               # Variáveis de ambiente
├── package.json       # Dependências do projeto
├── ecosystem.config.js # Configuração PM2
└── update.sh          # Script de atualização
```

---

**Importante**: Substitua `SUA_SENHA_AQUI` por uma senha forte para PostgreSQL e mantenha todas as credenciais seguras.

Após completar todos os passos, sua aplicação ThunderBet estará rodando em produção no domínio https://thunderbet.site/