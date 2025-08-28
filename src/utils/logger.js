const winston = require('winston');
const { config } = require('../config/settings');

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'camfit-getter' },
  transports: [
    // 에러 로그 파일
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // 모든 로그 파일
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

// 개발 환경에서는 콘솔 출력 추가
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
