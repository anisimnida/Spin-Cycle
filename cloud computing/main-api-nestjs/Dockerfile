FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

COPY . .

RUN npm run prisma:generate

RUN npm run build

FROM node:18-alpine

# Set environment variables (non-sensitive)
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/src/config/key.json

# Copy built files and node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy the service account key
COPY src/config/key.json ./src/config/key.json

# Expose the port the app runs on
EXPOSE 8080

# Set the default command to run the app
CMD [ "npm", "run", "start:prod" ]