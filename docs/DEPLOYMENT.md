# WeatherOS Deployment Runbook 🚀

This document outlines the deployment process for Weather Intelligence (WeatherOS) across various hosting environments.

---

## 1. Local & Bare-Metal Linux VPS

### Requirements
- Node.js v18+ (tested on Node.js v24.x)
- PM2 (Process Manager)
- Reverse proxy (Nginx or Caddy)

### Steps
1. Clone and install:
   ```bash
   git clone https://github.com/your-org/weather-dashboard.git
   cd weather-dashboard/weather-dashboard-main
   npm ci --omit=dev
   ```

2. Setup `.env`:
   ```bash
   PORT=3000
   NODE_ENV=production
   OPENWEATHER_API_KEY=your_key_here
   DATABASE_URL=postgres://user:pass@localhost:5432/weather_db
   ```

3. Start with PM2:
   ```bash
   pm2 start server.js --name "weatheros" -i max
   pm2 save
   pm2 startup
   ```

4. Nginx Reverse Proxy Configuration:
   ```nginx
   server {
       listen 80;
       server_name weather.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_cache_bypass $http_upgrade;
       }

       # Support Server-Sent Events (SSE)
       location /api/v1/stream/ {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Connection '';
           proxy_http_version 1.1;
           chunked_transfer_encoding off;
           proxy_buffering off;
           proxy_cache off;
       }
   }
   ```

---

## 2. Docker & Container Deployment

### Running with Docker Compose
The repository includes a ready-to-use `docker-compose.yml` and `Dockerfile`:

```bash
docker compose up -d --build
```

### Checking Status & Logs
```bash
docker compose ps
docker compose logs -f app
```

---

## 3. Vercel Serverless Deployment

The project contains a pre-configured `vercel.json` routing all API calls to `api/index.js` while serving frontend assets statically:

```bash
vercel --prod
```
Ensure you configure environment variables (`OPENWEATHER_API_KEY`, etc.) in the Vercel project settings dashboard.
