#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Inicializando repositório Git...${NC}"
git init

echo -e "${BLUE}Adicionando arquivos ao Git...${NC}"
git add .

echo -e "${BLUE}Criando primeiro commit...${NC}"
git commit -m "Initial commit: Video to MP3 Converter"

echo -e "${GREEN}Repositório Git inicializado com sucesso!${NC}"
echo -e "${BLUE}Para fazer deploy:${NC}"
echo -e "1. Crie um novo repositório no GitHub"
echo -e "2. Adicione o remote origin:"
echo -e "   git remote add origin <seu-repo-url>"
echo -e "3. Push para o GitHub:"
echo -e "   git push -u origin main"
echo -e "4. No Vercel:"
echo -e "   - Importe o repositório"
echo -e "   - Configure as variáveis de ambiente"
echo -e "   - Deploy automático será iniciado"
echo -e ""
echo -e "5. Para o backend:"
echo -e "   - Configure um servidor (DigitalOcean, AWS, etc.)"
echo -e "   - Instale as dependências:"
echo -e "     sudo apt-get update"
echo -e "     sudo apt-get install ffmpeg nodejs npm"
echo -e "   - Clone o repositório"
echo -e "   - Instale PM2:"
echo -e "     npm install -g pm2"
echo -e "   - Inicie a aplicação:"
echo -e "     pm2 start ecosystem.config.js"
echo -e ""
echo -e "${GREEN}Pronto para deploy!${NC}"