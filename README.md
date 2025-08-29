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

## 배포

### Docker를 사용한 로컬 배포

```bash
# Docker 이미지 빌드
docker build -t camfit-getter .

# 컨테이너 실행
docker run -d --name camfit-getter \
  --env-file .env \
  -p 3000:3000 \
  camfit-getter
```

### Cloudtype.io를 사용한 클라우드 배포

#### 1. 준비사항
- [Cloudtype.io](https://cloudtype.io) 계정 생성
- GitHub 계정 연동
- 이 저장소를 GitHub에 푸시

#### 2. 배포 방법

##### 방법 1: 대시보드 사용
1. [Cloudtype.io 대시보드](https://app.cloudtype.io)에 로그인
2. "새 프로젝트" → "GitHub에서 가져오기" 선택
3. `camfit-getter` 저장소 선택
4. 빌드 설정:
   - **Runtime**: Node.js 22
   - **Build Command**: `npm ci --only=production`
   - **Start Command**: `npm start`
   - **Port**: `3000`
5. 환경변수 설정:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   CHECK_DATE_FROM=2024-09-13
   CHECK_DATE_TO=2024-09-14
   CAMP_ID=66992898908bb2001e4a650e
   TARGET_ZONES=D ZONE,C ZONE
   NODE_ENV=production
   PORT=3000
   HEADLESS=true
   ```
6. "배포하기" 클릭

##### 방법 2: CLI 사용 (권장)
1. Cloudtype CLI 설치:
   ```bash
   npm install -g @cloudtype/cli
   ```

2. 로그인:
   ```bash
   ctype login
   ```

3. 배포:
   ```bash
   ctype deploy
   ```
   
   또는
   
   ```bash
   ctype apply
   ```

#### 3. 환경변수 설정
Cloudtype.io 대시보드에서 다음 환경변수들을 설정해야 합니다:

**필수 환경변수:**
```bash
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
CHECK_DATE_FROM=2024-09-13
CHECK_DATE_TO=2024-09-14
CAMP_ID=66992898908bb2001e4a650e
TARGET_ZONES=D ZONE,C ZONE
```

**선택적 환경변수:**
```bash
MONITORING_INTERVAL=5
ADULTS_COUNT=2
YOUTH_COUNT=2
LOG_LEVEL=info
NODE_ENV=production
PORT=3000
HEADLESS=true
NODE_TLS_REJECT_UNAUTHORIZED=0
```

#### 4. 배포 확인
- 배포 후 `https://your-app-name.run.cloudtype.app/health` 접속하여 헬스체크 확인
- `https://your-app-name.run.cloudtype.app/` 접속하여 서비스 상태 확인

#### 5. 프리티어 제한사항
Cloudtype.io 프리티어에서는 다음과 같은 제한이 있습니다:
- **CPU**: 0.25 코어
- **메모리**: 512MB
- **스토리지**: 1GB
- **트래픽**: 1GB/월
- **슬립 모드**: 30분 비활성 시 자동 슬립

이 제한사항을 고려하여 `MONITORING_INTERVAL`을 5분 이상으로 설정하는 것을 권장합니다.

## 라이선스

MIT License

## 기여

버그 리포트나 기능 제안은 이슈를 통해 제출해주세요.
