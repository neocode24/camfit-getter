const path = require('path');
const fs = require('fs');
const logger = require('./utils/logger');
const { config, validateConfig } = require('./config/settings');
const MonitoringScheduler = require('./scheduler/monitor');

// 전역 에러 핸들링
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

class CamfitGetterApp {
  constructor() {
    this.scheduler = new MonitoringScheduler();
    this.isShuttingDown = false;
  }

  // 애플리케이션 초기화
  initialize = async () => {
    try {
      logger.info('캠핏 게터 애플리케이션 시작');

      // 로그 디렉토리 생성
      this.ensureLogDirectory();

      // 환경설정 검증
      validateConfig();
      logger.info('환경설정 검증 완료', {
        campId: config.camping.campId,
        targetZones: config.camping.targetZones,
        searchPeriod: `${config.search.dateFrom} ~ ${config.search.dateTo}`,
        interval: `${config.monitoring.interval}분`
      });

      // 종료 시그널 핸들링 설정
      this.setupGracefulShutdown();

      logger.info('애플리케이션 초기화 완료');

    } catch (error) {
      logger.error('애플리케이션 초기화 실패', { error: error.message });
      throw error;
    }
  };

  // 로그 디렉토리 생성
  ensureLogDirectory = () => {
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      logger.info('로그 디렉토리 생성됨', { path: logsDir });
    }
  };

  // 모니터링 시작
  start = async () => {
    try {
      await this.initialize();
      await this.scheduler.start();
      
      logger.info('캠핏 모니터링이 시작되었습니다. 중지하려면 Ctrl+C를 눌러주세요.');
      
      // 상태 정보 주기적 출력
      this.startStatusReporting();

    } catch (error) {
      logger.error('애플리케이션 시작 실패', { error: error.message });
      process.exit(1);
    }
  };

  // 상태 정보 주기적 출력
  startStatusReporting = () => {
    setInterval(() => {
      if (!this.isShuttingDown) {
        const status = this.scheduler.getStatus();
        logger.info('모니터링 상태', status);
      }
    }, 30 * 60 * 1000); // 30분마다 상태 출력
  };

  // 종료 처리
  shutdown = async (signal) => {
    if (this.isShuttingDown) {
      logger.warn('이미 종료 처리 중입니다.');
      return;
    }

    this.isShuttingDown = true;
    logger.info(`종료 신호 수신: ${signal}`);

    try {
      // 모니터링 중지
      await this.scheduler.stop(`신호: ${signal}`);
      
      logger.info('애플리케이션 정상 종료 완료');
      process.exit(0);

    } catch (error) {
      logger.error('종료 처리 중 오류', { error: error.message });
      process.exit(1);
    }
  };

  // 종료 시그널 핸들링 설정
  setupGracefulShutdown = () => {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

    signals.forEach(signal => {
      process.on(signal, () => {
        this.shutdown(signal);
      });
    });

    logger.info('종료 시그널 핸들링 설정 완료');
  };

  // 상태 정보 출력
  printStatus = () => {
    const status = this.scheduler.getStatus();

    console.log('\n=== 캠핏 모니터링 상태 ===');
    console.log(`상태: ${status.isRunning ? '🟢 실행 중' : '🔴 중지됨'}`);
    console.log(`마지막 체크: ${status.lastCheckTime || '없음'}`);
    console.log(`체크 간격: ${status.interval}분`);
    console.log(`대상 존: ${status.targetZones.join(', ')}`);
    console.log(`검색 기간: ${status.searchPeriod}`);
    console.log(`총 체크 횟수: ${status.totalChecks}`);
    console.log(`연속 에러: ${status.consecutiveErrors}`);
    console.log(`알림 전송된 빈자리: ${status.previousResultsCount}`);
    console.log('========================\n');
  };
}

// 애플리케이션 실행
const app = new CamfitGetterApp();

// 직접 실행 시에만 시작
if (require.main === module) {
  app.start().catch(error => {
    console.error('애플리케이션 시작 실패:', error.message);
    process.exit(1);
  });
}

module.exports = CamfitGetterApp;
