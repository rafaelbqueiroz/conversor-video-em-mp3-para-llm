// Get Uppy instance from global window.Uppy
const uppy = new Uppy.Core({
    restrictions: {
        maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB (ajuste conforme necessário)
        allowedFileTypes: ['.ts'], // Apenas arquivos .ts
    },
    autoProceed: false, // O usuário precisa clicar para iniciar
})
.use(Uppy.Dashboard, {
    inline: true,
    target: '#uppy-container',
    proudlyDisplayPoweredByUppy: false,
})
.use(Uppy.XHRUpload, {
    endpoint: '/upload',
    fieldName: 'videoFile',
    chunkSize: 10 * 1024 * 1024, // 10MB (ajuste conforme necessário)
});

const socket = io(); // Conecta ao servidor Socket.IO

uppy.on('upload-success', (file, response) => {
    console.log('Upload completo!', file, response);
    // Iniciar a conversão no servidor (o servidor retorna o jobId)
    socket.emit('subscribeToProgress', response.body.jobId);
});

uppy.on('upload-progress', (file, progress) => {
    document.getElementById('upload-progress').textContent = progress.percentage.toFixed(0);
});

socket.on('conversionProgress', (data) => {
    document.getElementById('conversion-progress').textContent = data.progress.toFixed(0);
});

socket.on('conversionComplete', (data) => {
    console.log('Conversão completa!', data);
    // Exibir link para download ou fazer redirecionamento, etc.
    const downloadLink = document.createElement('a');
    downloadLink.href = data.downloadUrl; // URL do arquivo convertido (o servidor enviará)
    downloadLink.download = data.filename; // Nome do arquivo para download
    downloadLink.textContent = 'Baixar MP4';
    document.getElementById('progress-container').appendChild(downloadLink);
});

uppy.on('error', (error) => {
    console.error('Uppy error:', error);
});

socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
});

socket.on('connect', () => {
    console.log('Conectado ao Socket.IO');
});