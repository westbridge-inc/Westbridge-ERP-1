# Westbridge ERP Frontend -- Deployment Guide

## Option A: Vercel (Recommended)

1. Connect the `Westbridge-ERP-1` repo to Vercel.
2. Vercel auto-detects Next.js -- no build config changes needed.
3. Set environment variables in the Vercel dashboard:

| Variable                   | Value                       |
| -------------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL`      | `https://api.westbridge.gy` |
| `BACKEND_URL`              | `https://api.westbridge.gy` |
| `NEXT_PUBLIC_SENTRY_DSN`   | Your Sentry DSN             |
| `NEXT_PUBLIC_POSTHOG_KEY`  | Your PostHog project key    |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://app.posthog.com`   |
| `SENTRY_ORG`               | `westbridge`                |
| `SENTRY_PROJECT`           | `westbridge-frontend`       |
| `SENTRY_AUTH_TOKEN`        | Your Sentry auth token      |

4. Deploy. Vercel handles builds, CDN, and SSL automatically.

## Option B: Docker

The repo includes a multi-stage `Dockerfile` that builds a standalone Next.js image.

```bash
# Build the image
docker build -t westbridge-frontend .

# Run
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.westbridge.gy \
  -e BACKEND_URL=https://api.westbridge.gy \
  --name westbridge-frontend \
  westbridge-frontend
```

The Dockerfile uses `output: "standalone"` mode, producing a minimal image (~150MB) that runs with `node server.js`.

## Option C: Fly.io

See `../Westbridge-ERP-2/scripts/deploy.sh --frontend-only` for the Fly.io deploy script.

## Required Environment Variables

| Variable                   | Required | Description                               |
| -------------------------- | -------- | ----------------------------------------- |
| `NEXT_PUBLIC_API_URL`      | Yes      | Public backend API URL (browser requests) |
| `BACKEND_URL`              | Yes      | Backend URL for server-side requests      |
| `NEXT_PUBLIC_SENTRY_DSN`   | No       | Sentry error tracking DSN                 |
| `NEXT_PUBLIC_POSTHOG_KEY`  | No       | PostHog analytics key                     |
| `NEXT_PUBLIC_POSTHOG_HOST` | No       | PostHog host URL                          |
| `SENTRY_ORG`               | No       | Sentry org (build-time, for source maps)  |
| `SENTRY_PROJECT`           | No       | Sentry project (build-time)               |
| `SENTRY_AUTH_TOKEN`        | No       | Sentry auth token (build-time)            |
