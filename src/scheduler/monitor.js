const cron = require('node-cron');
const logger = require('../utils/logger');
const { config } = require('../config/settings');
const CamfitCrawler = require('../crawler/camfit');
const TelegramNotifier = require('../telegram/bot');

class MonitoringScheduler {
  constructor() {
    this.crawler = new CamfitCrawler();
    this.notifier = new TelegramNotifier();
    this.isRunning = false;
    this.cronJob = null;
    this.lastCheckTime = null;
    this.previousResults = new Set(); // 중복 알림 방지를 위한 이전 결과 저장
  }

  // 모니터링 시작
  start = async () => {
    try {
      if (this.isRunning) {
        logger.warn('모니터링이 이미 실행 중입니다.');
        return;
      }

      // 텔레그램 봇 연결 테스트
      await this.notifier.testConnection();

      // 크론 표현식 생성 (N분마다 실행)
      const cronExpression = `*/${config.monitoring.interval} * * * *`;
      
      logger.info('모니터링 스케줄러 시작', {
        interval: config.monitoring.interval,
        cronExpression
      });

      // 스케줄 작업 생성
      this.cronJob = cron.schedule(cronExpression, async () => {
        await this.performCheck();
      }, {
        scheduled: true,
        timezone: 'Asia/Seoul'
      });

      this.isRunning = true;
      
      // 시작 알림 전송
      await this.notifier.sendStartAlert();

      // 즉시 첫 번째 체크 실행
      await this.performCheck();

      logger.info('모니터링 스케줄러가 성공적으로 시작되었습니다.');

    } catch (error) {
      logger.error('모니터링 시작 중 오류 발생', { error: error.message });
      await this.notifier.sendErrorAlert(error);
      throw error;
    }
  };

  // 모니터링 중지
  stop = async (reason = '수동 중지') => {
    try {
      if (!this.isRunning) {
        logger.warn('모니터링이 실행 중이지 않습니다.');
        return;
      }

      if (this.cronJob) {
        this.cronJob.stop();
        this.cronJob = null;
      }

      // 브라우저 종료 (Puppeteer 사용 시)
      await this.crawler.closeBrowser();

      this.isRunning = false;
      
      // 중지 알림 전송
      await this.notifier.sendStopAlert(reason);

      logger.info('모니터링 스케줄러가 중지되었습니다.', { reason });

    } catch (error) {
      logger.error('모니터링 중지 중 오류 발생', { error: error.message });
    }
  };

  // 실제 체크 수행
  performCheck = async () => {
    const startTime = Date.now();
    let currentAttempt = 0;
    const maxAttempts = 3;

    try {
      this.lastCheckTime = new Date();
      
      logger.info('예약 가능 여부 확인 시작', {
        attempt: currentAttempt + 1,
        maxAttempts,
        targetZones: config.camping.targetZones,
        searchPeriod: `${config.search.dateFrom} ~ ${config.search.dateTo}`
      });

      let availableSites = [];
      let lastError = null;

      // 재시도 로직으로 안정성 확보
      while (currentAttempt < maxAttempts && availableSites.length === 0) {
        try {
          currentAttempt++;
          logger.info(`크롤링 시도 ${currentAttempt}/${maxAttempts}`);

          // 캠핏 사이트에서 빈자리 정보 조회
          availableSites = await this.crawler.checkAvailability();

          if (availableSites.length > 0) {
            logger.info('빈자리 발견!', { count: availableSites.length });
            break;
          } else {
            logger.info('빈자리 없음');
          }

        } catch (attemptError) {
          lastError = attemptError;
          logger.warn(`크롤링 시도 ${currentAttempt} 실패`, {
            error: attemptError.message,
            remainingAttempts: maxAttempts - currentAttempt
          });

          if (currentAttempt < maxAttempts) {
            // 재시도 전 잠시 대기
            const waitTime = 2000 * currentAttempt;
            logger.info(`${waitTime}ms 후 재시도...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      // 빈자리 발견 시 처리
      if (availableSites.length > 0) {
        // 새로운 빈자리만 필터링 (중복 알림 방지)
        const newSites = this.filterNewSites(availableSites);

        if (newSites.length > 0) {
          logger.info('새로운 빈자리 알림 전송', {
            newSitesCount: newSites.length,
            totalSitesCount: availableSites.length
          });

          // 텔레그램 알림 전송
          await this.notifier.sendAvailabilityAlert(newSites);

          // 이전 결과에 추가 (중복 방지용)
          newSites.forEach(site => {
            const siteKey = `${site.zone}-${site.name}-${site.date}`;
            this.previousResults.add(siteKey);
          });

          logger.info('빈자리 알림 전송 완료');
        } else {
          logger.info('새로운 빈자리 없음 (이미 알림 전송됨)');
        }
      } else {
        // 빈자리 없음
        logger.info('현재 빈자리 없음');

        // 주기적으로 상태 알림 (매 10번째 체크마다)
        if (this.getCheckCount() % 10 === 0) {
          const checkTime = this.lastCheckTime.toLocaleString('ko-KR');
          await this.notifier.sendCheckResult(checkTime, '계속 모니터링 중');
        }
      }

      // 체크 완료 로그
      const duration = Date.now() - startTime;
      logger.info('예약 체크 완료', {
        duration: `${duration}ms`,
        attempts: currentAttempt,
        sitesFound: availableSites.length,
        checkTime: this.lastCheckTime.toLocaleString('ko-KR')
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('예약 체크 중 오류 발생', {
        error: error.message,
        duration: `${duration}ms`,
        attempts: currentAttempt,
        checkTime: this.lastCheckTime?.toLocaleString('ko-KR')
      });

      // 심각한 오류 시 알림 전송
      if (currentAttempt >= maxAttempts) {
        await this.notifier.sendErrorAlert(error);
      }

      // 에러가 연속으로 발생하면 일시적으로 간격을 늘림
      this.handleContinuousErrors(error);
    }
  };

  // 새로운 빈자리 필터링 (중복 알림 방지)
  filterNewSites = (sites) => {
    return sites.filter(site => {
      const siteKey = `${site.zone}-${site.name}-${site.date}`;
      return !this.previousResults.has(siteKey);
    });
  };

  // 체크 횟수 계산
  getCheckCount = () => {
    if (!this.isRunning) return 0;

    // 스케줄 시작 시간부터 현재까지의 체크 횟수 추정
    const now = Date.now();
    const startTime = this.startTime || now;
    const elapsedMinutes = (now - startTime) / (1000 * 60);
    return Math.floor(elapsedMinutes / config.monitoring.interval) + 1;
  };

  // 연속 에러 처리
  handleContinuousErrors = (error) => {
    this.consecutiveErrors = (this.consecutiveErrors || 0) + 1;

    logger.warn('연속 에러 발생', {
      count: this.consecutiveErrors,
      error: error.message
    });

    // 5번 연속 에러 시 간격 2배로 증가
    if (this.consecutiveErrors >= 5) {
      const newInterval = Math.min(config.monitoring.interval * 2, 30);
      logger.warn('연속 에러로 인한 간격 조정', {
        originalInterval: config.monitoring.interval,
        newInterval: newInterval
      });

      // TODO: 크론 작업 재시작 로직 구현 필요
      this.consecutiveErrors = 0;
    }
  };

  // 성공적인 체크 시 에러 카운터 리셋
  resetErrorCount = () => {
    if (this.consecutiveErrors > 0) {
      logger.info('에러 상태 회복', {
        previousErrors: this.consecutiveErrors
      });
      this.consecutiveErrors = 0;
    }
  };

  // 모니터링 상태 정보
  getStatus = () => {
    return {
      isRunning: this.isRunning,
      lastCheckTime: this.lastCheckTime,
      interval: config.monitoring.interval,
      targetZones: config.camping.targetZones,
      searchPeriod: `${config.search.dateFrom} ~ ${config.search.dateTo}`,
      totalChecks: this.getCheckCount(),
      consecutiveErrors: this.consecutiveErrors || 0,
      previousResultsCount: this.previousResults.size
    };
  };
}

module.exports = MonitoringScheduler;
