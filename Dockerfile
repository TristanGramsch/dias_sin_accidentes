# Use official Node.js LTS image
FROM node:18-alpine

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
CMD ["npm", "start"] 