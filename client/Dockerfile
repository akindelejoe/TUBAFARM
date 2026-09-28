FROM node:20-alpine AS build
WORKDIR /app
# Vite inlines env vars at build time, so the API URL must be passed as a build arg.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 5173
# Hosts like Railway assign the port via $PORT.
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT:-5173}"]
