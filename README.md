# Video to MP3 Converter

Conversor de vídeo para MP3 desenvolvido com Node.js, Express e FFmpeg.

## Estrutura do Projeto

O projeto está dividido em duas partes:

### Frontend (client/)
- Interface web para upload e download
- HTML, CSS e JavaScript puro
- Suporta drag-and-drop
- Mostra progresso em tempo real

### Backend (server/)
- API Node.js com Express
- Processamento de vídeo com FFmpeg
- WebSockets para progresso em tempo real
- Gerenciamento de arquivos temporários

## Requisitos

- Node.js 14+
- FFmpeg instalado no sistema
- Redis (para fila de processamento - opcional)

## Limites e Considerações

### Vercel (Frontend)
- Ideal apenas para servir o frontend estático
- Não suporta processos longos (>60s)
- Limite de payload de 4.5MB

### Backend (Requer servidor dedicado)
- Recomendado: DigitalOcean, AWS, GCP
- Necessita FFmpeg instalado
- Requer armazenamento adequado para arquivos
- Processo de conversão pode ser longo

## Setup do Servidor

1. Instalar FFmpeg:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg

# CentOS
sudo yum install ffmpeg

# Windows (via Chocolatey)
choco install ffmpeg
```

2. Instalar dependências:
```bash
npm install
```

3. Configurar variáveis de ambiente (.env):
```
PORT=3001
CORS_ORIGIN=https://seu-frontend.vercel.app
```

## Desenvolvimento Local

1. Frontend (client/):
```bash
npx serve client
```

2. Backend (server/):
```bash
node server/index.js
```

## Deploy

### Frontend (Vercel)
1. Push para GitHub
2. Conectar com Vercel
3. Definir variáveis de ambiente
4. Deploy automático

### Backend (Servidor dedicado)
1. Configurar servidor
2. Instalar Node.js e FFmpeg
3. Clonar repositório
4. Instalar dependências
5. Configurar PM2 ou systemd
6. Configurar Nginx (opcional)

## Otimizações Recomendadas

### Backend
- Implementar sistema de filas para processos longos
- Limitar tamanho máximo de arquivo
- Gerenciar espaço em disco
- Implementar limpeza automática de arquivos

### Frontend
- Compressão de vídeo no cliente (opcional)
- Chunk upload para arquivos grandes
- Cache de arquivos convertidos

## Segurança

- Validação de tipos de arquivo
- Limite de tamanho de upload
- Sanitização de nomes de arquivo
- CORS configurado
- Rate limiting

## Manutenção

- Monitorar uso de disco
- Limpar arquivos temporários
- Verificar logs do FFmpeg
- Backup de configurações