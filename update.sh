#!/bin/bash

# ThunderBet - Script de Atualização
# Para atualizar a aplicação em produção

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script na raiz do projeto ThunderBet"
fi

log "Iniciando atualização do ThunderBet..."

# Fazer backup do banco de dados
log "Criando backup do banco de dados..."
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
sudo -u postgres pg_dump thunderbet > "/tmp/$BACKUP_FILE"
log "Backup salvo em: /tmp/$BACKUP_FILE"

# Parar aplicação
log "Parando aplicação..."
pm2 stop thunderbet || warning "Aplicação já estava parada"

# Instalar novas dependências
log "Instalando dependências..."
npm install

# Executar migrações se necessário
log "Verificando migrações do banco..."
npm run db:push

# Build da aplicação
log "Compilando nova versão..."
npm run build

# Reiniciar aplicação
log "Reiniciando aplicação..."
pm2 start thunderbet

# Verificar se está funcionando
sleep 5
if pm2 status | grep -q "thunderbet.*online"; then
    log "✅ Atualização concluída com sucesso!"
    log "Aplicação está rodando em: https://thunderbet.site"
else
    error "❌ Falha na atualização. Verifique os logs: pm2 logs thunderbet"
fi

# Recarregar Nginx se necessário
sudo nginx -t && sudo systemctl reload nginx

log "Status dos serviços:"
pm2 status