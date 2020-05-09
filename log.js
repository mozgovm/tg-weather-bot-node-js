const moment = require('moment-timezone');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  });

const logConf = {
    format: combine(
        timestamp({ format: moment.tz('Europe/Moscow').format('DD/MM/YYYY:HH:mm:ss Z') }),
        myFormat
        ),
    transports : [
        // new transports.File({
        //     filename: './logs/test.log'
        // }),
        new (transports.File) ({ 
            level: 'info',
            filename: 'logs/access.log',
            json: true
        }),
        new (transports.File) ({ 
            level: 'error',
            filename: 'logs/error.log',
            json: true
        })
    ]
}

module.exports = createLogger(logConf);

// log.info('Test');
// log.error('BUG');
