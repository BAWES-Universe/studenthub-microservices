# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages
#RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose port (optional: change to your app's specific port if necessary)
#EXPOSE 3000

# Command to run the application
CMD ["node", "main.js"]

