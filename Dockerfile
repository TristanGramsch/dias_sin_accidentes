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

# Expose port
EXPOSE 3000

# TODO 
# Use non-root user for security, for now unnecesary
# USER node

# Start the app
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
# ENTRYPOINT replaces CMD
ENTRYPOINT ["/entrypoint.sh"] 