# 1Build Stage (Next.js 빌드)
FROM node:20-alpine AS builder
WORKDIR /app
 # npm install 보다 안정성/속도 좋음
COPY package*.json ./
RUN npm ci

# .next/ 폴더 생김 (SSR 빌드 완성)
COPY . .
RUN npm run build

# 2️Run Stage (실행 단계: 서버 모드)
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
# ← 운영용 SSR 실행
CMD ["npm", "run", "start"]
