const express = require('express');
const logger = require('../utils/logger');

class HealthServer {
  constructor(port = 3000) {
    this.port = port;
    this.app = express();
    this.server = null;
    this.setupRoutes();
  }

  setupRoutes() {
    // 헬스체크 엔드포인트
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'camfit-getter',
        uptime: process.uptime()
      });
    });

    // 기본 루트
    this.app.get('/', (req, res) => {
      res.status(200).json({
        message: 'Camfit Getter Service',
        status: 'running',
        timestamp: new Date().toISOString()
      });
    });

    // 404 핸들러
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        path: req.originalUrl
      });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, '0.0.0.0', (err) => {
        if (err) {
          logger.error('헬스체크 서버 시작 실패', { error: err.message });
          reject(err);
        } else {
          logger.info(`헬스체크 서버가 포트 ${this.port}에서 시작되었습니다`);
          resolve();
        }
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          logger.info('헬스체크 서버가 종료되었습니다');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = HealthServer;
