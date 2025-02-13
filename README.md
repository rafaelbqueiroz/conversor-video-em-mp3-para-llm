# Conversor Universal de Vídeo para MP3 para LLMs

## 🎯 Problema e Solução

Ao trabalhar com treinamento de Large Language Models (LLMs), frequentemente nos deparamos com a necessidade de converter grandes arquivos de vídeo para MP3 para criar datasets de treinamento. As soluções gratuitas disponíveis geralmente apresentam limitações significativas:

- Limites pequenos de tamanho de arquivo
- Necessidade de selecionar manualmente o formato de entrada
- Interface complexa com muitas opções desnecessárias
- Tempo de processamento lento
- Limitação no número de conversões

Este projeto resolve esses problemas oferecendo:

- Suporte a arquivos grandes (até 5GB)
- Detecção automática de formato de entrada
- Interface simples e intuitiva
- Processamento local rápido
- Conversões ilimitadas
- Suporte a múltiplos formatos (.ts, .mp4, .avi, .mkv, .mov, .wmv, .flv, .webm, etc.)

## 🚀 Como Funciona

1. **Upload Simplificado**
   - Arraste e solte qualquer arquivo de vídeo
   - Suporta upload de arquivos grandes
   - Interface visual com barra de progresso

2. **Processamento Eficiente**
   - Conversão direta para MP3 (192kbps)
   - Extração apenas do áudio (sem processamento desnecessário)
   - Progresso em tempo real via WebSocket

3. **Download Automático**
   - Link de download disponível ao finalizar
   - Arquivo MP3 pronto para uso em datasets

## 💻 Tecnologias Utilizadas

- Frontend: HTML5, CSS3, JavaScript puro
- Backend: Node.js, Express
- Conversão: FFmpeg
- Comunicação em tempo real: Socket.IO
- Processamento de upload: Multer

## 🛠️ Deploy Local

### Pré-requisitos
- Node.js 14+
- FFmpeg instalado
```bash
# Windows (via Chocolatey)
choco install ffmpeg

# Linux
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg
```

### Instalação
```bash
# Clone o repositório
git clone https://github.com/rafaelbqueiroz/conversor-video-em-mp3-para-llm.git

# Instale as dependências
npm install

# Inicie o servidor
npm start
```

## 🌐 Deploy no Vercel

### Frontend (Vercel)

1. **Fork e Clone**
   ```bash
   git clone https://github.com/[seu-usuario]/conversor-video-em-mp3-para-llm.git
   cd conversor-video-em-mp3-para-llm
   ```

2. **Deploy no Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório do GitHub
   - Configure as variáveis de ambiente:
     ```
     NEXT_PUBLIC_API_URL=https://seu-backend.com
     ```
   - Clique em "Deploy"

### Backend (Servidor Dedicado)

Recomendamos usar um servidor dedicado (DigitalOcean, AWS, etc.) para o backend devido aos requisitos de processamento. Tutorial detalhado de deploy do backend está disponível em [BACKEND_DEPLOY.md](BACKEND_DEPLOY.md).

## 📝 Uso com LLMs

O áudio extraído pode ser utilizado para:

1. **Treinamento de Modelos**
   - Datasets de reconhecimento de fala
   - Fine-tuning de modelos de áudio
   - Análise de sentimento em áudio

2. **Transcrição**
   - Uso com Whisper ou outros modelos de STT
   - Criação de legendas automáticas
   - Indexação de conteúdo de vídeo

## ⚠️ Limites e Considerações

- Tamanho máximo do arquivo: 5GB
- Formatos suportados: Todos os principais formatos de vídeo
- Qualidade do MP3: 192kbps (configurável)
- Requisitos de servidor: 
  - CPU: 2+ cores
  - RAM: 4GB+
  - Armazenamento: SSD recomendado

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e o processo para enviar pull requests.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## 🙏 Agradecimentos

- FFmpeg por fornecer as ferramentas de conversão
- Comunidade open source por feedback e contribuições
- Todos os desenvolvedores trabalhando em LLMs e IA