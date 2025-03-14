const { log } = require('../utils/logger');

function errorHandler(err, req, res, next) {
    log('error', 'Server error', { error: err.message, stack: err.stack });
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal Server Error' 
            : err.message
    });
}

module.exports = errorHandler; 