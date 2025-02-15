// Configuração do endpoint do backend
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://seu-backend.com';

const socket = io(API_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
});

// Elementos do DOM
const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress');
const progressValue = document.getElementById('progress-value');
const statusMessage = document.getElementById('status-message');
const downloadContainer = document.getElementById('download-container');
const downloadLink = document.getElementById('download-link');
const dropZone = document.getElementById('drop-zone');
const fileLabel = document.querySelector('.file-label');

// Estado inicial
let isUploading = false;
uploadButton.disabled = true;
resetUI();

// Event Listeners
fileInput.addEventListener('change', handleFileSelect);
form.addEventListener('submit', handleSubmit);

// Socket.IO event handlers
socket.on('connect', () => {
    console.log('Conectado ao servidor via Socket.IO');
    updateStatus('Pronto para converter arquivos', 'info');
});

socket.on('connect_error', (error) => {
    console.error('Erro de conexão Socket.IO:', error);
    updateStatus('Erro de conexão com o servidor: ' + error.message, 'error');
});

socket.on('conversionProgress', (data) => {
    console.log('Progresso da conversão:', data);
    updateProgress(data.progress);
    updateStatus(`Convertendo: ${Math.round(data.progress)}%`, 'info');
});

socket.on('conversionComplete', (data) => {
    console.log('Conversão concluída:', data);
    updateStatus('Conversão concluída! Clique abaixo para baixar.', 'success');
    showDownloadButton(data);
    resetUploadState();
});

socket.on('conversionError', (error) => {
    console.error('Erro na conversão:', error);
    updateStatus('Erro na conversão: ' + error.message, 'error');
    resetUploadState();
});

// Funções de manipulação de eventos
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        validateAndUpdateUI(file);
    } else {
        resetUI();
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    if (isUploading) return;

    const file = fileInput.files[0];
    if (!file) {
        updateStatus('Por favor, selecione um arquivo de vídeo', 'error');
        return;
    }

    startUpload(file);
}

// Funções de UI
function validateAndUpdateUI(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['ts', 'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpg', 'mpeg', '3gp', '3g2'];
    
    if (validExtensions.includes(ext)) {
        fileLabel.textContent = `${file.name} (${formatFileSize(file.size)})`;
        dropZone.classList.add('file-selected');
        uploadButton.disabled = false;
        updateStatus('Arquivo selecionado. Clique em "Converter para MP3" para iniciar.', 'info');
    } else {
        fileLabel.textContent = 'Formato não suportado';
        dropZone.classList.remove('file-selected');
        uploadButton.disabled = true;
        updateStatus(`Formato não suportado. Use: ${validExtensions.join(', ')}`, 'error');
    }
}

function resetUI() {
    fileLabel.textContent = 'Arraste um arquivo de vídeo aqui ou clique para selecionar';
    dropZone.classList.remove('file-selected', 'highlight');
    uploadButton.disabled = true;
    uploadButton.classList.remove('loading');
    progressContainer.style.display = 'none';
    downloadContainer.style.display = 'none';
    updateStatus('Selecione um arquivo para converter', 'info');
}

function updateStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = '';
    statusMessage.classList.add('status-' + type);
    console.log(`[${type}] ${message}`);
}

function updateProgress(percent) {
    const formattedPercent = Math.min(100, Math.max(0, percent));
    progressBar.style.width = formattedPercent + '%';
    progressValue.textContent = Math.round(formattedPercent);
}

function showDownloadButton(data) {
    downloadContainer.style.display = 'block';
    downloadLink.href = API_URL + data.downloadUrl;
    downloadLink.download = data.filename;
}

async function startUpload(file) {
    isUploading = true;
    uploadButton.disabled = true;
    uploadButton.classList.add('loading');
    progressContainer.style.display = 'block';
    downloadContainer.style.display = 'none';
    updateProgress(0);
    updateStatus('Iniciando upload...', 'info');

    const formData = new FormData();
    formData.append('video', file);

    try {
        const response = await fetch(API_URL + '/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(await response.text() || 'Erro no upload');
        }

        const data = await response.json();
        console.log('Upload bem-sucedido:', data);
        updateStatus('Arquivo recebido, iniciando conversão...', 'info');
        socket.emit('subscribeToConversion', data.id);
    } catch (error) {
        console.error('Erro durante upload:', error);
        updateStatus('Erro: ' + error.message, 'error');
        resetUploadState();
    }
}

function resetUploadState() {
    isUploading = false;
    uploadButton.disabled = false;
    uploadButton.classList.remove('loading');
    fileInput.value = ''; // Limpa o input para permitir novo upload
}

// Drag and drop
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    dropZone.classList.add('highlight');
}

function unhighlight(e) {
    dropZone.classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    fileInput.files = dt.files;
    
    if (file) {
        console.log('Arquivo recebido via drag&drop:', file.name);
        validateAndUpdateUI(file);
    }
}

// Utilitários
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Event listeners para drag and drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

dropZone.addEventListener('drop', handleDrop, false);