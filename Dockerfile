# ──────────────────────────────────────────────────────────────────────────────
# Westbridge ERP Frontend — Multi-stage Docker build (Next.js standalone)
# ──────────────────────────────────────────────────────────────────────────────

# Stage 1: Install dependencies
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars — NEXT_PUBLIC_* must be baked in at build time.
# Default to empty so the client hits relative paths, which are proxied
# to the backend by the Next.js middleware at /api/[[...path]]. This
# keeps cookies on the same origin and avoids cross-subdomain CORS.
ARG NEXT_PUBLIC_API_URL=
ARG NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
ARG NEXT_PUBLIC_PADDLE_SANDBOX=true
ARG NEXT_PUBLIC_PADDLE_PRICE_SOLO=
ARG NEXT_PUBLIC_PADDLE_PRICE_STARTER=
ARG NEXT_PUBLIC_PADDLE_PRICE_BUSINESS=
ARG NEXT_PUBLIC_PADDLE_PRICE_ENTERPRISE=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=$NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
ENV NEXT_PUBLIC_PADDLE_SANDBOX=$NEXT_PUBLIC_PADDLE_SANDBOX
ENV NEXT_PUBLIC_PADDLE_PRICE_SOLO=$NEXT_PUBLIC_PADDLE_PRICE_SOLO
ENV NEXT_PUBLIC_PADDLE_PRICE_STARTER=$NEXT_PUBLIC_PADDLE_PRICE_STARTER
ENV NEXT_PUBLIC_PADDLE_PRICE_BUSINESS=$NEXT_PUBLIC_PADDLE_PRICE_BUSINESS
ENV NEXT_PUBLIC_PADDLE_PRICE_ENTERPRISE=$NEXT_PUBLIC_PADDLE_PRICE_ENTERPRISE
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ──────────────────────────────────────────────────────────────────────────────
# Stage 3: Production image (minimal)
FROM node:20-alpine AS production

WORKDIR /app

# Non-root user for security
RUN addgroup -g 1001 -S westbridge && \
    adduser -S westbridge -u 1001 -G westbridge

# Copy standalone output (includes server.js + required node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Switch to non-root user
USER westbridge

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
