FROM node:18-slim

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose the default port (allow HTTPS on this port if supplied certs)
EXPOSE 8080

# Default command
CMD ["node", "src/server.js"]