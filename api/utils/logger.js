// Simple logger for the application
const logger = {
    info: (message, meta = {}) => {
        console.log(JSON.stringify({ level: 'info', message, timestamp: new Date().toISOString(), ...meta }));
    },
    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({ level: 'warn', message, timestamp: new Date().toISOString(), ...meta }));
    },
    error: (message, error, meta = {}) => {
        console.error(JSON.stringify({ 
            level: 'error', 
            message, 
            error: error?.message || error,
            timestamp: new Date().toISOString(), 
            ...meta 
        }));
    }
};

module.exports = logger;
