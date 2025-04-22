# Use the official Node.js image as the base image
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json first to optimize Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the bot's files
COPY . .

# Command to run the bot
CMD ["npm", "run", "start"]