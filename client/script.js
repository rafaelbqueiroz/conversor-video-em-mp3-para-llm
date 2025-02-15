// Configuração do endpoint do backend (altere para a URL do seu servidor)
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://seu-backend.com'; // Altere para a URL do seu backend em produção

const socket = io(API_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
});

const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress');
const progressValue = document.getElementById('progress-value');
const statusMessage = document.getElementById('status-message');
const downloadContainer = document.getElementById('download-container');
const downloadLink = document.getElementById('download-link');
const dropZone = document.getElementById('drop-zone');

// Debug logs
socket.on('connect', () => {
    console.log('Conectado ao servidor via Socket.IO');
    updateStatus('Conectado ao servidor', 'success');
});

socket.on('connect_error', (error) => {
    console.error('Erro de conexão Socket.IO:', error);
    updateStatus('Erro de conexão com o servidor: ' + error.message, 'error');
});

form.onsubmit = async (e) => {
    e.preventDefault();
    
    const file = fileInput.files[0];
    if (!file) {
        updateStatus('Por favor, selecione um arquivo de vídeo', 'error');
        return;
    }

    // Validar extensão do arquivo
    const ext = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['ts', 'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpg', 'mpeg', '3gp', '3g2'];
    if (!validExtensions.includes(ext)) {
        updateStatus('Formato de arquivo não suportado. Formatos aceitos: ' + validExtensions.join(', '), 'error');
        return;
    }

    // Mostrar container de progresso
    progressContainer.style.display = 'block';
    downloadContainer.style.display = 'none';
    updateStatus('Iniciando upload...', 'info');
    updateProgress(0);
    
    const formData = new FormData();
    formData.append('video', file);

    try {
        console.log('Iniciando upload para:', API_URL + '/upload');
        const response = await fetch(API_URL + '/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erro no upload');
        }

        const data = await response.json();
        console.log('Upload bem-sucedido:', data);
        updateStatus('Arquivo recebido, iniciando conversão...', 'info');
        
        socket.emit('subscribeToConversion', data.id);
    } catch (error) {
        console.error('Erro durante upload:', error);
        updateStatus('Erro: ' + error.message, 'error');
        progressContainer.style.display = 'none';
    }
};

// Funções de atualização da interface
function updateStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-' + type;
    console.log(`[${type}] ${message}`);
}

function updateProgress(percent) {
    progressBar.style.width = percent + '%';
    progressValue.textContent = Math.round(percent);
}

// Socket.IO event handlers
socket.on('conversionProgress', (data) => {
    console.log('Progresso da conversão:', data);
    updateProgress(data.progress);
    updateStatus(`Convertendo: ${Math.round(data.progress)}%`, 'info');
});

socket.on('conversionComplete', (data) => {
    console.log('Conversão concluída:', data);
    updateStatus('Conversão concluída!', 'success');
    downloadContainer.style.display = 'block';
    downloadLink.href = API_URL + data.downloadUrl;
    downloadLink.download = data.filename;
});

socket.on('conversionError', (error) => {
    console.error('Erro na conversão:', error);
    updateStatus('Erro na conversão: ' + error.message, 'error');
});

// Drag and drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropZone.classList.add('highlight');
}

function unhighlight(e) {
    dropZone.classList.remove('highlight');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    fileInput.files = dt.files;
    
    if (file) {
        console.log('Arquivo recebido via drag&drop:', file.name);
        form.requestSubmit();
    }
}