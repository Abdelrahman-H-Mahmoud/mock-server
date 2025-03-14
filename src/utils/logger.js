function log(level, message, meta = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta
    };
    console.log(JSON.stringify(logEntry));
}

module.exports = { log }; 