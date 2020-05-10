const moment = require('moment-timezone');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  });

const logConf = {
    format: combine(
        timestamp({ format: moment.tz('Europe/Moscow').format('DD/MM/YYYY:HH:mm:ss Z') }),
        myFormat
        ),
    transports : [
        new transports.Console()
    ]
}

module.exports = createLogger(logConf);
