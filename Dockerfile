FROM node:25-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm link
ENTRYPOINT ["br"]
