module.exports = {
  apps: [
    {
      name: 'bot',
      script: './dist/index.js',
      restart_delay: 1000,
      stop_exit_codes: [0],
      instances: -1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
