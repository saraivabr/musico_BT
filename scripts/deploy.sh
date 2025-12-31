#!/bin/bash

echo "Iniciando deploy do Jesus Cristo Bot..."

# Check for GEMINI_API_KEY
if [ -z "$GEMINI_API_KEY" ]; then
    echo "GEMINI_API_KEY nao configurada!"
    echo "Execute: export GEMINI_API_KEY=sua_chave"
    exit 1
fi

# Stop existing containers
docker-compose down

# Build and start
docker-compose up -d --build

echo "Deploy concluido!"
echo "Logs: docker-compose logs -f jesus-bot"
