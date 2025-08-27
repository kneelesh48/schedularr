FROM node:18-alpine AS frontend-build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci && npm cache clean --force

COPY frontend ./
RUN npm run build

FROM nginx:alpine

COPY --from=frontend-build /app/dist /usr/share/nginx/html

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]