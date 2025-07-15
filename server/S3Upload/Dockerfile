# Use an official Node.js runtime as the base image
FROM node:20-alpine
# Set the working directory in the container
WORKDIR /usr/src/app
# Copy package.json and package-lock.json to the container
COPY ./package*.json ./
# Install application dependencies

# Specify the command to run your application
RUN npm install typescript -g
COPY . .


RUN npm install
RUN tsc

CMD ["sh", "-c", "npm run db:deploy && npm run dev"]