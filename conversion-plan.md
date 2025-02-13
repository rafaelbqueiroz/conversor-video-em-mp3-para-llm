# Plano de Modificação: Conversor TS para MP3

## Modificações Necessárias

### 1. Servidor (server/index.js)
- Alterar a extensão do arquivo de saída de .mp4 para .mp3
- Modificar as opções do FFmpeg para:
  - Remover o codec de vídeo
  - Usar apenas codec de áudio (libmp3lame)
  - Definir uma qualidade de áudio adequada (ex: 192k)
- Atualizar as mensagens de status para refletir conversão de áudio

### 2. Interface (client/index.html)
- Atualizar o título para "Conversor TS para MP3"
- Modificar textos na interface para refletir conversão de áudio
- Atualizar mensagens de progresso

### 3. Comandos FFmpeg

Substituir as opções atuais:
```
.outputOptions([
    '-c:v libx264',
    '-c:a aac',
    '-preset fast',
    '-movflags +faststart'
])
```

Por estas novas opções para extração de áudio:
```
.outputOptions([
    '-vn',               // Sem vídeo
    '-acodec libmp3lame', // Codec MP3
    '-ab 192k',         // Bitrate do áudio
    '-ar 44100'         // Sample rate
])
```

## Benefícios
- Menor tamanho do arquivo final (apenas áudio)
- Processo de conversão mais rápido
- Melhor para arquivos onde só o áudio é necessário

## Passos de Implementação

1. Parar o servidor atual
2. Fazer backup dos arquivos atuais
3. Modificar o código conforme especificado
4. Reiniciar o servidor
5. Testar com um arquivo TS para verificar:
   - Qualidade do áudio
   - Tempo de conversão
   - Tamanho do arquivo resultante

## Próximos Passos
Após aprovação deste plano, podemos mudar para o modo Code para implementar estas alterações.