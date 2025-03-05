# Use Node.js LTS (Long Term Support) image as base
FROM node:23-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

COPY .env.production .env 

# Install dependencies
RUN npm install 
#--legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose port (adjust if your app uses a different port)
EXPOSE 3002

# Start the application
CMD ["npm", "start"] 