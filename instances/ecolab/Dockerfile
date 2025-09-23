FROM node:18-slim

WORKDIR /app

# Copy source and package metadata
COPY package*.json ./
COPY . .

# Install dependencies (including dev for running tests), run tests, then prune dev deps
# Run tests and print a clear summary message so build logs show test status.
RUN npm ci && npm test && echo "✅ Tests passed: ran unit tests (time, counter)" || (echo "❌ Tests failed" && exit 1)
RUN npm prune --production

# Expose the default port (allow HTTPS on this port if supplied certs)
EXPOSE 4443

# Default command
CMD ["node", "src/server.js"]