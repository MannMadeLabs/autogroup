# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS build
WORKDIR /app
COPY apps/admin-dashboard/package.json ./
RUN npm install --no-audit --no-fund
COPY apps/admin-dashboard/ ./
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY infra/docker/nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
