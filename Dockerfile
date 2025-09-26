FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public
COPY lib ./lib

ENV NODE_ENV=production \
    PORT=4443

EXPOSE 4443

CMD ["node", "src/server.js"]
