FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4443

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src
COPY public ./public

# Data and logs directories are created and can be mounted from host
RUN mkdir -p /app/data /app/logs

EXPOSE 4443

CMD ["node", "src/server.js"]

