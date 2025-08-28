require('dotenv').config();

const config = {
  // 텔레그램 설정
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },

  // 캠핑장 정보
  camping: {
    baseUrl: 'https://camfit.co.kr',
    campId: process.env.CAMP_ID || '66992898908bb2001e4a650e',
    targetZones: (process.env.TARGET_ZONES || 'D ZONE,C ZONE').split(',').map(zone => zone.trim()),
  },

  // 검색 조건
  search: {
    dateFrom: process.env.CHECK_DATE_FROM || '2024-09-13',
    dateTo: process.env.CHECK_DATE_TO || '2024-09-14',
    adultsCount: parseInt(process.env.ADULTS_COUNT) || 2,
    youthCount: parseInt(process.env.YOUTH_COUNT) || 2,
  },

  // 모니터링 설정
  monitoring: {
    interval: parseInt(process.env.MONITORING_INTERVAL) || 5, // 분 단위
  },

  // 로그 설정
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // 카카오 소셜 로그인 설정
  kakao: {
    email: process.env.KAKAO_EMAIL,
    password: process.env.KAKAO_PASSWORD,
    useLogin: process.env.USE_KAKAO_LOGIN === 'true',
  },
};

// 필수 설정 검증
const validateConfig = () => {
  const required = [
    { key: 'telegram.botToken', value: config.telegram.botToken },
    { key: 'telegram.chatId', value: config.telegram.chatId },
  ];

  const missing = required.filter(item => !item.value);
  
  if (missing.length > 0) {
    const missingKeys = missing.map(item => item.key).join(', ');
    throw new Error(`필수 환경변수가 설정되지 않았습니다: ${missingKeys}`);
  }

  // 날짜 유효성 검증
  const dateFrom = new Date(config.search.dateFrom);
  const dateTo = new Date(config.search.dateTo);

  if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
    throw new Error('날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식을 사용하세요.');
  }

  if (dateFrom > dateTo) {
    throw new Error('시작 날짜는 종료 날짜보다 이전이어야 합니다.');
  }

  // 모니터링 간격 검증
  if (config.monitoring.interval < 1 || config.monitoring.interval > 60) {
    throw new Error('모니터링 간격은 1-60분 사이여야 합니다.');
  }

  console.log('✅ 환경설정 검증 완료');
};

module.exports = {
  config,
  validateConfig,
};
