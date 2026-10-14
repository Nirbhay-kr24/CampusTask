FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine

RUN addgroup -S web && adduser -S web -G web \
    && mkdir -p /var/cache/nginx /var/run /var/log/nginx /tmp/nginx \
    && chown -R web:web /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html /tmp/nginx

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=web:web /app/dist /usr/share/nginx/html

RUN sed -i 's#pid .*nginx.pid;#pid /tmp/nginx.pid;#' /etc/nginx/nginx.conf

USER web
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]