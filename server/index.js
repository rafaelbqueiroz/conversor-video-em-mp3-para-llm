require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { Server } = require('socket.io');
const http = require('http');

// Set FFmpeg path
ffmpeg.setFfmpegPath('C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configurar diretórios
const uploadDir = path.join(__dirname, 'uploads');
const convertedDir = path.join(__dirname, 'converted');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(convertedDir)) {
    fs.mkdirSync(convertedDir, { recursive: true });
}

// Lista de formatos de vídeo aceitos
const acceptedFormats = [
    '.ts', '.mp4', '.avi', '.mkv', '.mov', 
    '.wmv', '.flv', '.webm', '.m4v', '.mpg',
    '.mpeg', '.3gp', '.3g2'
];

// Configurar multer para upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Remove caracteres especiais do nome do arquivo
        const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9\-\_\.]/g, '_');
        cb(null, Date.now() + '-' + cleanFileName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (acceptedFormats.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Formato de arquivo não suportado. Formatos aceitos: ' + acceptedFormats.join(', ')));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024 // 5GB
    }
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../client')));
app.use('/converted', express.static(convertedDir));

// Rota de upload
app.post('/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const inputPath = req.file.path;
    const outputFilename = path.parse(req.file.filename).name + '.mp3';
    const outputPath = path.join(convertedDir, outputFilename);

    // Enviar resposta inicial
    res.json({
        message: 'Upload recebido, iniciando extração de áudio',
        id: req.file.filename,
    });

    console.log('Iniciando conversão do arquivo:', inputPath);
    console.log('Arquivo de saída:', outputPath);

    // Iniciar conversão para MP3
    ffmpeg(inputPath)
        .outputOptions([
            '-vn',                // Remove o fluxo de vídeo
            '-acodec libmp3lame', // Use o codec MP3
            '-ab 192k',          // Bitrate do áudio
            '-ar 44100'          // Sample rate
        ])
        .on('start', (commandLine) => {
            console.log('Comando FFmpeg:', commandLine);
        })
        .on('progress', (progress) => {
            if (progress.percent) {
                console.log('Progresso:', progress.percent + '%');
                io.emit('conversionProgress', {
                    id: req.file.filename,
                    progress: progress.percent
                });
            }
        })
        .on('end', () => {
            console.log('Conversão concluída!');
            io.emit('conversionComplete', {
                id: req.file.filename,
                downloadUrl: `/converted/${outputFilename}`,
                filename: outputFilename
            });

            // Remover arquivo original
            fs.unlink(inputPath, (err) => {
                if (err) console.error('Erro ao remover arquivo original:', err);
            });
        })
        .on('error', (err, stdout, stderr) => {
            console.error('Erro na conversão:', err);
            console.error('FFmpeg stderr:', stderr);
            io.emit('conversionError', {
                id: req.file.filename,
                message: err.message
            });

            // Limpar arquivo em caso de erro
            fs.unlink(inputPath, (err) => {
                if (err) console.error('Erro ao remover arquivo com falha:', err);
            });
        })
        .save(outputPath);
});

// Gerenciar conexões Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('subscribeToConversion', (fileId) => {
        console.log('Cliente inscrito para atualizações:', fileId);
        socket.join(fileId);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});