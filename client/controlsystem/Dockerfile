FROM node:24-alpine3.21 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:1.29.1-alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
