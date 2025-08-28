# Camfit Getter 🏕️

캠핏(Camfit) 예약 빈자리 모니터링 및 텔레그램 알림 시스템

## 기능

- 캠핏 웹사이트에서 실시간 예약 현황 모니터링
- 지정된 존(Zone)에서 빈자리 발생 시 즉시 텔레그램 알림
- 중복 알림 방지 시스템
- 자동 스케줄링 (설정 가능한 주기)
- 상세한 로깅 및 에러 처리

## 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`env.example` 파일을 참고하여 `.env` 파일을 생성하고 설정합니다.

```bash
cp env.example .env
```

필수 환경변수:
- `TELEGRAM_BOT_TOKEN`: 텔레그램 봇 토큰
- `TELEGRAM_CHAT_ID`: 알림을 받을 텔레그램 채팅 ID

### 3. 텔레그램 봇 설정

#### 봇 생성
1. [@BotFather](https://t.me/botfather)에게 `/newbot` 명령어 전송
2. 봇 이름과 사용자명 설정
3. 받은 토큰을 `TELEGRAM_BOT_TOKEN`에 설정

#### 채팅 ID 확인
1. 봇과 대화 시작 (아무 메시지나 전송)
2. 다음 URL에서 채팅 ID 확인: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
3. `chat.id` 값을 `TELEGRAM_CHAT_ID`에 설정

## 사용법

### 기본 실행
```bash
npm start
```

### 개발 모드 (nodemon)
```bash
npm run dev
```

### 연결 테스트
```bash
node src/app.js --test
```

### 단일 체크
```bash
node src/app.js --check
```

### 도움말
```bash
node src/app.js --help
```

## 설정 항목

### 모니터링 설정
- `MONITORING_INTERVAL`: 모니터링 주기 (분 단위, 기본값: 5)

### 검색 조건
- `CHECK_DATE_FROM`: 체크인 날짜 (YYYY-MM-DD)
- `CHECK_DATE_TO`: 체크아웃 날짜 (YYYY-MM-DD)  
- `ADULTS_COUNT`: 성인 인원수
- `YOUTH_COUNT`: 청소년 인원수

### 대상 캠핑장
- `CAMP_ID`: 캠핑장 ID (URL에서 추출)
- `TARGET_ZONES`: 모니터링할 존 (쉼표로 구분, 예: "D ZONE,C ZONE")

## 프로젝트 구조

```
camfit-getter/
├── src/
│   ├── app.js              # 메인 애플리케이션
│   ├── config/
│   │   └── settings.js     # 환경설정 관리
│   ├── crawler/
│   │   └── camfit.js       # 캠핏 웹사이트 크롤러
│   ├── telegram/
│   │   └── bot.js          # 텔레그램 봇 및 알림
│   ├── scheduler/
│   │   └── monitor.js      # 스케줄링 및 모니터링
│   └── utils/
│       └── logger.js       # 로깅 유틸리티
├── logs/                   # 로그 파일 디렉토리
├── package.json
├── .env                    # 환경변수 (생성 필요)
├── env.example             # 환경변수 예시
└── README.md
```

## 코드 스타일

- 모든 함수는 화살표 함수로 작성
- 세미콜론 항상 사용
- 들여쓰기는 2칸

## 로깅

- 로그는 `logs/` 디렉토리에 저장
- `error.log`: 에러 로그만
- `combined.log`: 모든 로그
- 콘솔 출력: 개발환경에서만

## 주의사항

1. **법적 고지**: 웹 스크래핑 시 해당 웹사이트의 이용약관을 준수해야 합니다.
2. **요청 제한**: 과도한 요청으로 서버에 부하를 주지 않도록 적절한 간격을 설정하세요.
3. **개인정보**: 텔레그램 토큰과 채팅 ID는 절대 공개하지 마세요.

## 문제 해결

### 일반적인 문제

1. **"필수 환경변수가 설정되지 않았습니다"**
   - `.env` 파일에 필수 환경변수가 모두 설정되어 있는지 확인

2. **"텔레그램 봇 연결 실패"**
   - 봇 토큰이 올바른지 확인
   - 봇이 활성화되어 있는지 확인

3. **"캠핏 예약 정보 조회 중 오류"**
   - 캠핏 웹사이트 구조가 변경되었을 수 있음
   - 네트워크 연결 상태 확인

## 라이선스

MIT License

## 기여

버그 리포트나 기능 제안은 이슈를 통해 제출해주세요.
