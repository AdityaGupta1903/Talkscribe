# Use an official Node.js runtime as the base image
FROM node:20-alpine
# Set the working directory in the container
WORKDIR /usr/src/app
# Copy package.json and package-lock.json to the container
COPY ./package*.json ./
# Install application dependencies
COPY . .
# Specify the command to run your application
RUN npm install

CMD ["sh", "-c", "npm run db:deploy && npm run dev"]