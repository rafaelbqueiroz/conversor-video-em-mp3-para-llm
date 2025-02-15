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

// Desabilitar botão inicialmente
uploadButton.disabled = true;

// Monitorar seleção de arquivo
fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        validateAndUpdateUI(file);
    } else {
        resetUI();
    }
}

function validateAndUpdateUI(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['ts', 'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpg', 'mpeg', '3gp', '3g2'];
    
    if (validExtensions.includes(ext)) {
        uploadButton.disabled = false;
        updateStatus(`Arquivo selecionado: ${file.name} (${formatFileSize(file.size)})`, 'info');
        dropZone.classList.add('file-selected');
    } else {
        uploadButton.disabled = true;
        updateStatus(`Formato não suportado. Use: ${validExtensions.join(', ')}`, 'error');
        dropZone.classList.remove('file-selected');
    }
}

function resetUI() {
    uploadButton.disabled = true;
    dropZone.classList.remove('file-selected');
    updateStatus('Nenhum arquivo selecionado', 'info');
}

function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

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

    // Desabilitar botão durante o upload
    uploadButton.disabled = true;
    uploadButton.classList.add('loading');
    
    // Mostrar container de progresso
    progressContainer.style.display = 'block';
    downloadContainer.style.display = 'none';
    updateStatus('Iniciando upload...', 'info');
    updateProgress(0);
    
    const formData = new FormData();
    formData.append('video', file);

    try {
        console.log('Iniciando upload para:', API_URL + '/upload');
        
        const xhr = new XMLHttpRequest();
        
        // Monitorar progresso do upload
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                updateProgress(percentComplete);
                updateStatus(`Enviando arquivo: ${percentComplete.toFixed(1)}%`, 'info');
            }
        };

        // Configurar promessa para o XHR
        const uploadPromise = new Promise((resolve, reject) => {
            xhr.onload = () => {
                if (xhr.status === 200) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (e) {
                        reject(new Error('Resposta inválida do servidor'));
                    }
                } else {
                    reject(new Error(`Erro ${xhr.status}: ${xhr.statusText}`));
                }
            };
            xhr.onerror = () => reject(new Error('Erro de rede'));
        });

        // Configurar e enviar XHR
        xhr.open('POST', API_URL + '/upload', true);
        xhr.send(formData);

        // Aguardar resposta
        const data = await uploadPromise;
        
        console.log('Upload bem-sucedido:', data);
        updateStatus('Arquivo recebido, iniciando conversão...', 'info');
        
        socket.emit('subscribeToConversion', data.id);
    } catch (error) {
        console.error('Erro durante upload:', error);
        updateStatus('Erro: ' + error.message, 'error');
        progressContainer.style.display = 'none';
        uploadButton.disabled = false;
        uploadButton.classList.remove('loading');
    }
};

// Funções de atualização da interface
function updateStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-${type}`;
    console.log(`[${type}] ${message}`);
}

function updateProgress(percent) {
    const formattedPercent = Math.min(100, Math.max(0, percent)); // Garantir entre 0 e 100
    progressBar.style.width = formattedPercent + '%';
    progressValue.textContent = Math.round(formattedPercent);
}

// Socket.IO event handlers
socket.on('conversionProgress', (data) => {
    console.log('Progresso da conversão:', data);
    updateProgress(data.progress);
    updateStatus(`Convertendo: ${Math.round(data.progress)}%`, 'info');
});

socket.on('conversionComplete', (data) => {
    console.log('Conversão concluída:', data);
    updateStatus('Conversão concluída! Clique abaixo para baixar.', 'success');
    downloadContainer.style.display = 'block';
    downloadLink.href = API_URL + data.downloadUrl;
    downloadLink.download = data.filename;
    
    // Resetar interface para novo upload
    uploadButton.disabled = false;
    uploadButton.classList.remove('loading');
    resetUI();
});

socket.on('conversionError', (error) => {
    console.error('Erro na conversão:', error);
    updateStatus('Erro na conversão: ' + error.message, 'error');
    uploadButton.disabled = false;
    uploadButton.classList.remove('loading');
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
        validateAndUpdateUI(file);
    }
}