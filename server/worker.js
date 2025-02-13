require('dotenv').config();
const Queue = require('bull');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const http = require('http');

const conversionQueue = new Queue('video conversion', process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const io = require('socket.io-client'); // Cliente Socket.IO para se comunicar com o servidor principal

const socket = io(`http://localhost:${process.env.PORT || 3000}`); // Conecta ao servidor principal


conversionQueue.process(async (job) => {
    const inputPath = job.data.filePath;
    const filename = job.data.filename;
    const outputFilename = filename.replace(/\.ts$/, '.mp4'); // Substitui .ts por .mp4
    const outputPath = path.join(__dirname, 'converted', outputFilename);


    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .videoCodec('libx264')  // Codec de vídeo H.264 (boa compatibilidade)
            .audioCodec('aac')    // Codec de áudio AAC (boa compatibilidade)
            .outputOptions('-preset', 'fast') // Preset de codificação (fast, medium, slow, etc. - ajuste conforme necessário)
            .on('progress', (progress) => {
                // Enviar progresso para o servidor principal via Socket.IO
                job.progress(progress.percent);
                 socket.emit('conversionProgress', { jobId: job.id, progress: progress.percent }); // Envia para o servidor, que reenvia para o cliente correto
            })
            .on('end', () => {

                //Notifica que a conversão terminou
                console.log('Conversão concluída:', outputPath);
                // Envia mensagem de conclusão para o servidor (e para o cliente)
                socket.emit('conversionComplete', {
                    jobId: job.id,
                    filename: outputFilename,
                    downloadUrl: `/download/${outputFilename}` // Rota para download (veja abaixo)
                });
                resolve({ outputPath });

                // Remove o arquivo original após a conversão (opcional, mas recomendado)
                fs.unlink(inputPath, (err) => {
                    if (err) console.error('Erro ao remover arquivo original:', err);
                });
            })
            .on('error', (err) => {
                console.error('Erro na conversão:', err);
                reject(err); // Rejeita a promessa em caso de erro
                 // Enviar mensagem de erro para o cliente (opcional)
                 socket.emit('conversionError', { jobId: job.id, error: err.message });
            })
            .run();
    });
});

// Rota de download (no worker.js, pois precisa estar acessível ao servidor)
const express = require('express');
const app = express();

// Rota de download (adicionada ao worker para que o servidor possa acessá-la)
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'converted', filename);

  //Verifica se o arquivo existe, para evitar erros e falhas de segurança
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if(err) {
        console.error("Arquivo não encontrado", err);
        return res.status(404).send('Arquivo não encontrado');
    }

    res.download(filePath, (err) => { // Envia o arquivo para download
        if (err) {
          console.error("Erro no download:", err);
            res.status(500).send('Erro ao baixar o arquivo.');
        } else {
            console.log("Download do arquivo:", filename);
              //Remover o arquivo após download (opcional):
                /*
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error('Erro ao remover arquivo convertido após download:', unlinkErr);
                });
                */
        }
      });
  });
});

// Inicia o servidor para a rota de download (em uma porta diferente, para não conflitar)
const downloadServer = http.createServer(app); //mesmo que o app, para usar o socket.io
downloadServer.listen(3001, () => { // Use uma porta diferente do servidor principal!
  console.log('Servidor de download rodando na porta 3001');
});