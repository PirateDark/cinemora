FROM node:20-slim

RUN apt-get update && apt-get install -y \
  openssl \
  chromium \
  chromium-sandbox \
  fonts-noto-color-emoji \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

EXPOSE 5555

CMD ["node", "src/index.js"]
