FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

COPY app.js ./

ENV PORT=3000
ENV APP_VERSION=v2

EXPOSE 3000

CMD ["node", "app.js"]
