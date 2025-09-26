FROM node:18-slim

WORKDIR /app

# Copy source and package metadata
COPY package*.json ./
COPY . .

# Install only production dependencies
RUN npm ci --omit=dev

# Expose HTTPS port
EXPOSE 443

# Default command
CMD ["node", "server.js"]
