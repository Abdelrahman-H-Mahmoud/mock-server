const config = require('./src/config');
const { app } = require('./src/server');
const { log } = require('./src/utils/logger');
const { initStorage, loadMockRoutes } = require('./src/utils/fileStorage');

const PORT = config.port;
let mockRoutes = new Map();
// Initialize and start server
async function initialize() {
  try {
    log('info', 'Starting server initialization');
    await initStorage();
    mockRoutes = await loadMockRoutes();
    log('info', 'Server initialization complete', { routeCount: mockRoutes.size });
  } catch (error) {
    log('error', 'Failed to initialize server', { error: error.message });
    process.exit(1);
  }
}

// Initialize and start server
initialize()
  .then(() => {
    app.listen(PORT, () => {
      log('info', 'Server started', {
        port: PORT,
        env: process.env.NODE_ENV,
        pid: process.pid
      });
      if (process.send) {
        process.send('ready');
      }
    });
  })
  .catch(error => {
    log('error', 'Server failed to start', { error: error.message });
    process.exit(1);
  });