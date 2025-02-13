# Cores para output
$Green = [System.ConsoleColor]::Green
$Blue = [System.ConsoleColor]::Blue

Write-Host "Inicializando repositório Git..." -ForegroundColor $Blue
git init

Write-Host "Adicionando arquivos ao Git..." -ForegroundColor $Blue
git add .

Write-Host "Criando primeiro commit..." -ForegroundColor $Blue
git commit -m "Initial commit: Video to MP3 Converter"

Write-Host "Repositório Git inicializado com sucesso!" -ForegroundColor $Green
Write-Host "Para fazer deploy:" -ForegroundColor $Blue
Write-Host "1. Crie um novo repositório no GitHub"
Write-Host "2. Adicione o remote origin:"
Write-Host "   git remote add origin <seu-repo-url>"
Write-Host "3. Push para o GitHub:"
Write-Host "   git push -u origin main"
Write-Host "4. No Vercel:"
Write-Host "   - Importe o repositório"
Write-Host "   - Configure as variáveis de ambiente"
Write-Host "   - Deploy automático será iniciado"
Write-Host ""
Write-Host "5. Para o backend:"
Write-Host "   - Configure um servidor (DigitalOcean, AWS, etc.)"
Write-Host "   - Instale as dependências:"
Write-Host "     sudo apt-get update"
Write-Host "     sudo apt-get install ffmpeg nodejs npm"
Write-Host "   - Clone o repositório"
Write-Host "   - Instale PM2:"
Write-Host "     npm install -g pm2"
Write-Host "   - Inicie a aplicação:"
Write-Host "     pm2 start ecosystem.config.js"
Write-Host ""
Write-Host "Pronto para deploy!" -ForegroundColor $Green