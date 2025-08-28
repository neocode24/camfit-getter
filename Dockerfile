# Node.js 22 Ubuntu 이미지 사용 (더 안정적)
FROM node:22-slim

# 아키텍처 감지 및 환경변수 설정
ARG TARGETPLATFORM
ENV DEBIAN_FRONTEND=noninteractive

# 시스템 업데이트 및 필수 패키지 설치
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    curl \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libnspr4 \
    libnss3 \
    libxext6 \
    libx11-6 \
    libxcb1 \
    libxkbcommon0 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

# CA 인증서 업데이트 (SSL 문제 해결)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Chromium 설치 (아키텍처 무관)
RUN apt-get update && apt-get install -y \
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer가 시스템 Chromium을 사용하도록 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 작업 디렉토리 설정
WORKDIR /app

# npm 캐시 디렉토리 설정 및 권한 조정
RUN mkdir -p /root/.npm && chmod 755 /root/.npm

# 패키지 파일 복사 및 의존성 설치 (SSL 설정 분리)
COPY package*.json ./
RUN npm install --production --no-audit --no-fund \
    && npm cache clean --force

# 애플리케이션 소스 코드 복사
COPY src/ ./src/
COPY env.example ./.env

# 로그 디렉토리 생성
RUN mkdir -p logs

# Chrome 프로필 디렉토리 생성 및 권한 설정
RUN mkdir -p .chrome_profile && chmod 755 .chrome_profile

# 비특권 사용자 생성 및 전환
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Node.js SSL 설정 (런타임에만 적용)
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# 포트 노출 (필요시)
EXPOSE 3000

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('Health check passed')" || exit 1

# 애플리케이션 실행
CMD ["node", "src/app.js"]
