const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');
const { config } = require('../config/settings');

class TelegramNotifier {
  constructor() {
    this.bot = new TelegramBot(config.telegram.botToken);
    this.chatId = config.telegram.chatId;
  }

  // 빈자리 알림 메시지 전송
  sendAvailabilityAlert = async (availableSites) => {
    try {
      if (!availableSites || availableSites.length === 0) {
        logger.debug('전송할 빈자리 정보가 없음');
        return;
      }

      const message = this.formatAvailabilityMessage(availableSites);
      
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });

      logger.info('텔레그램 알림 전송 완료', {
        chatId: this.chatId,
        sitesCount: availableSites.length
      });

    } catch (error) {
      logger.error('텔레그램 메시지 전송 실패', { 
        error: error.message,
        chatId: this.chatId 
      });
      throw error;
    }
  };

  // 빈자리 정보를 메시지 형태로 포맷팅
  formatAvailabilityMessage = (sites) => {
    const header = `🏕️ *캠핏 빈자리 알림*\n`;
    const searchInfo = `📅 ${config.search.dateFrom} ~ ${config.search.dateTo}\n` +
                      `👥 성인 ${config.search.adultsCount}명, 청소년 ${config.search.youthCount}명\n\n`;

    const sitesList = sites.map(site => {
      return `🟢 *${site.name}* (${site.zone})\n` +
             `   상태: ${site.availability}`;
    }).join('\n\n');

    const footer = `\n\n⏰ 확인 시각: ${new Date().toLocaleString('ko-KR')}\n` +
                  `🔗 [예약하러 가기](${config.camping.baseUrl}/camp/${config.camping.campId})`;

    return header + searchInfo + sitesList + footer;
  };

  // 시스템 상태 알림
  sendSystemAlert = async (message, type = 'info') => {
    try {
      const emoji = this.getEmojiByType(type);
      const formattedMessage = `${emoji} *시스템 알림*\n\n${message}\n\n⏰ ${new Date().toLocaleString('ko-KR')}`;

      await this.bot.sendMessage(this.chatId, formattedMessage, {
        parse_mode: 'Markdown'
      });

      logger.info('시스템 알림 전송 완료', { type, message });

    } catch (error) {
      logger.error('시스템 알림 전송 실패', { 
        error: error.message,
        type,
        message 
      });
    }
  };

  // 타입별 이모지 반환
  getEmojiByType = (type) => {
    const emojiMap = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      start: '🚀',
      stop: '⏹️'
    };
    return emojiMap[type] || 'ℹ️';
  };

  // 에러 알림
  sendErrorAlert = async (error) => {
    const message = `오류가 발생했습니다:\n\`${error.message}\``;
    await this.sendSystemAlert(message, 'error');
  };

  // 모니터링 시작 알림
  sendStartAlert = async () => {
    const message = `캠핏 모니터링을 시작합니다.\n\n` +
                   `📍 대상 존: ${config.camping.targetZones.join(', ')}\n` +
                   `📅 검색 기간: ${config.search.dateFrom} ~ ${config.search.dateTo}\n` +
                   `⏰ 체크 간격: ${config.monitoring.interval}분마다`;

    await this.sendSystemAlert(message, 'start');
  };

  // 모니터링 중지 알림
  sendStopAlert = async () => {
    const message = `캠핏 모니터링이 중지되었습니다.`;
    await this.sendSystemAlert(message, 'stop');
  };

  // 봇 연결 테스트
  testConnection = async () => {
    try {
      logger.info('텔레그램 봇 연결 테스트 시작');

      // 봇 정보 가져오기
      const botInfo = await this.bot.getMe();
      logger.info('봇 연결 성공', {
        botName: botInfo.username,
        botId: botInfo.id
      });

      // 테스트 메시지 전송
      await this.bot.sendMessage(this.chatId, '🤖 연결 테스트 성공!');
      logger.info('테스트 메시지 전송 완료', { chatId: this.chatId });

      return true;

    } catch (error) {
      logger.error('텔레그램 봇 연결 실패', {
        error: error.message,
        botToken: config.telegram.botToken ? '설정됨' : '미설정',
        chatId: this.chatId
      });
      throw error;
    }
  };

  // 정기 체크 결과 알림 (빈자리가 없을 때)
  sendCheckResult = async (checkTime, message = '빈자리 없음') => {
    try {
      const quietMessage = `🔍 체크 완료: ${message} (${checkTime})`;

      // 조용한 알림 (알림음 없이)
      await this.bot.sendMessage(this.chatId, quietMessage, {
        disable_notification: true
      });

    } catch (error) {
      logger.error('체크 결과 알림 전송 실패', { error: error.message });
    }
  };
}

module.exports = TelegramNotifier;
