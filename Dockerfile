# Use official Node.js LTS image
FROM node:18-alpine

# Install curl for DDNS updates
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose ports: 8080 for HTTP fallback, 443 for HTTPS
EXPOSE 8080 443

# Start the app
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
# ENTRYPOINT replaces CMD
ENTRYPOINT ["/entrypoint.sh"] 