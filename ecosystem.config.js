module.exports = {
  apps: [{
    name: 'video-to-mp3-converter',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    // Limites e configurações específicas
    max_restarts: 10,
    min_uptime: '5s',
    max_memory_restart: '1G',
    // Configurações de cluster
    exec_mode: 'fork', // Usar 'fork' ao invés de 'cluster' devido ao FFmpeg
    // Monitoramento
    monitoring: true,
    // Rotação de logs
    log_rotate_interval: '1d',
    log_rotate_max: 30,
    // Variáveis de ambiente adicionais
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      CORS_ORIGIN: 'https://seu-frontend.vercel.app',
      MAX_FILE_SIZE: '5GB',
      CLEANUP_INTERVAL: '1h'
    }
  }]
};