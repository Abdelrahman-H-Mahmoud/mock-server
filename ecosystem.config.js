module.exports = {
  apps: [{
    name: 'mock-server',
    script: 'src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_restarts: 10,
    min_uptime: '10s',
    exec_mode: 'cluster',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    merge_logs: true,
    kill_timeout: 5000,
    wait_ready: true,
    log_type: 'json',
    combine_logs: true,
    time: true
  }]
}; 