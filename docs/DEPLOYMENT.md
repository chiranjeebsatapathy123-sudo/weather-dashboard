# WeatherOS Deployment Guide

WeatherOS is designed to be deployed in standard containerized or PaaS environments.

## Environment Requirements
- Node.js >= 18.x
- PostgreSQL >= 14.x
- OpenWeatherMap API Key

## Configuration (.env)
```env
OPENWEATHER_API_KEY=your_key
DATABASE_URL=postgres://user:pass@host/db
ALLOWED_ORIGINS=https://your-domain.com
NODE_ENV=production
CACHE_TTL=300000
```

## Build & Run
1. Install dependencies: `npm ci`
2. Run database migrations: `npm run migrate` (Requires implementing a migration script wrapping schema.sql)
3. Start the application: `npm run start`

## Production Resilience
- **Process Management**: Recommended to run behind PM2 or inside a Docker container with restart policies.
- **Database Resilience**: Configured to handle serverless database sleeps (e.g., Neon Postgres).
- **Static Assets**: The `frontend/` directory is served via Express `express.static` but can be decoupled and served directly via Cloudflare, Vercel, or AWS S3/CloudFront.

## Rollback Plan
- Ensure backwards compatibility for all database additions.
- To rollback, redeploy the previous container tag. The database migrations for Phase 7 are purely additive, so reverting to Phase 6 API containers will not break application state.
