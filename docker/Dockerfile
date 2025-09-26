FROM node:18-slim

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4443

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public
COPY lib ./lib
COPY test ./test
COPY manage.sh ./manage.sh
COPY update-ddns.sh ./update-ddns.sh

RUN mkdir -p /data \
    && chown -R node:node /app /data

USER node

EXPOSE 4443

CMD ["node", "src/server.js"]

