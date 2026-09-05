#!/usr/bin/env bash
# ==========================================================================
# Publica a landing no VPS. Rodar da raiz do projeto:  bash deploy/publicar.sh
# ==========================================================================
set -euo pipefail

SERVIDOR="${SERVIDOR:-root@balcaonaweb.com.br}"
DESTINO="${DESTINO:-/var/www/balcaonaweb-landing}"

echo "==> build"
npm run build

echo "==> enviando para $SERVIDOR:$DESTINO"
# --delete tira do servidor o que saiu do dist; o CSS/JS antigo tem hash no
# nome, entao nao adianta acumular.
rsync -avz --delete dist/ "$SERVIDOR:$DESTINO/"

echo "==> recarregando o Caddy"
ssh "$SERVIDOR" 'caddy reload --config /etc/caddy/Caddyfile 2>/dev/null || systemctl reload caddy'

echo "==> pronto: https://balcaonaweb.com.br/"
