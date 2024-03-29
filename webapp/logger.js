const winston = require('winston');

const addSeverity = winston.format((info) => {
    const severityMap = {
        error: 'ERROR',
        warn: 'WARNING',
        info: 'INFO',
        http: 'DEBUG',
        verbose: 'DEBUG',
        debug: 'DEBUG',
        silly: 'DEBUG'
    };
    info.severity = severityMap[info.level] || info.level.toUpperCase();
    return info;
})();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        addSeverity,
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/application.log' })
    ],
});

module.exports = logger;