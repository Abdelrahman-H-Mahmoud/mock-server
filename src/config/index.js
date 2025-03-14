const config = {
  development: {
    port: process.env.PORT || 3000,
    dataDir: 'src/data',
    logLevel: 'debug'
  },
  production: {
    port: process.env.PORT || 80,
    dataDir: 'src/data',
    logLevel: 'error'
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env]; 