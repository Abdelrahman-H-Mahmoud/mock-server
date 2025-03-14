const fs = require('fs');
const path = require('path');

// Create necessary directories
const dirs = [
  'logs',
  'src/data'
];

// Log files to create
const logFiles = [
  'error.log',
  'out.log',
  'combined.log'
];

dirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }

  // Create log files if this is the logs directory
  if (dir === 'logs') {
    logFiles.forEach(logFile => {
      const logPath = path.join(dirPath, logFile);
      if (!fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, '', { encoding: 'utf8', flag: 'w' });
        // Set read/write permissions for user and group
        fs.chmodSync(logPath, 0o664);
        console.log(`Created log file: ${logPath}`);
      }
    });
  }
});

// Ensure log files are writable
const logsDir = path.join(process.cwd(), 'logs');
logFiles.forEach(logFile => {
  const logPath = path.join(logsDir, logFile);
  try {
    // Test write access by appending empty string
    fs.appendFileSync(logPath, '');
    console.log(`Verified write access to: ${logPath}`);
  } catch (error) {
    console.error(`Cannot write to log file: ${logPath}`, error);
    process.exit(1);
  }
}); 