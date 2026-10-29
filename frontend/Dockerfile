FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN chmod -R a+rX /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

ENV BACKEND_UPSTREAM=http://127.0.0.1:5000
ENV NGINX_ENVSUBST_FILTER=^BACKEND_UPSTREAM$

EXPOSE 10000
CMD ["nginx", "-g", "daemon off;"]
