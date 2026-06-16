# ── Stage 1: install dependencies ─────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: dev server (used by docker-compose.dev.yml) ──────────────────
FROM base AS dev
COPY . .
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 4200
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]

# ── Stage 3: production build ──────────────────────────────────────────────
FROM base AS builder
COPY . .
# Build with the production configuration (outputHashing, optimizations, etc.)
RUN npm run build -- --configuration production

# ── Stage 4: production nginx image ───────────────────────────────────────
FROM nginx:1.27-alpine AS prod

# Copy the Angular build output
COPY --from=builder /app/dist/openstep/browser/ /usr/share/nginx/html/

# Replace default nginx site config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Runtime entrypoint: injects API_ENDPOINT and APP_NAME into config.json
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
