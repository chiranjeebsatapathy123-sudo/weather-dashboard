# Weather Intelligence (WeatherOS) 🌦️⚡

[![Tests](https://img.shields.io/badge/tests-31%20passing-brightgreen.svg)](tests/api.test.js)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org/)
[![PWA](https://img.shields.io/badge/PWA-ready-orange.svg)](frontend/manifest.json)
[![Service Worker](https://img.shields.io/badge/service%20worker-v17-blueviolet.svg)](frontend/sw.js)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

An enterprise-grade, high-performance Weather Intelligence Platform and Progressive Web Application (PWA) built for real-time atmospheric monitoring, hyper-local forecasting, client-side neural network predictions, and intelligent decision automation.

---

## 🌟 Key Features

### 🖥️ Frontend & PWA Experience
- **Glassmorphic Responsive Interface**: Sleek, modern dark and light theme interface with custom thin glassmorphic scrollbars, active tab indicator bars, and a pinned live system status bar.
- **Dynamic Metric & Imperial Units**: Seamless live switching between Metric (°C, km/h, mm) and Imperial (°F, mph, in) units across all dashboards, forecast cards, metrics, saved locations, and historical charts.
- **PWA & Offline Resilience**: Service Worker (`weatheros-v17`) caching all static assets and API responses. When offline, an offline banner alerts the user, and an automatic 7-day atmospheric baseline keeps charts and neural predictors fully functional without network access.
- **Edge AI Neural Predictor**: In-browser deep learning powered by TensorFlow.js (with an automated offline adaptive polynomial regression fallback) predicting tomorrow's high temperature with live loss tracking, epoch progress, and confidence metrics.
- **WeatherOS Pro & Stripe Checkout**: Instant in-app Stripe payment simulation with a reactive toast engine (`showAppToast`). Unlocks neural prediction and advanced telemetry immediately with zero full-page reloads and includes a Pro Membership management card in the Personalization Center.
- **Modern Notification System**: Replaced all synchronous, thread-blocking browser `alert()` popups with non-blocking, glassmorphic toast notifications.
- **Interactive Geospatial Map**: Leaflet.js interactive radar and atmospheric map with live precipitation, satellite clouds, and temperature layers.
- **Trip Planner & Multi-City Compare Studio**: Dual-route weather comparison with en-route estimations and side-by-side metric evaluations.
- **Pro Tools Suite**:
  - **Smart Home Webhooks**: Automatic event triggers based on live rain or temperature thresholds.
  - **Climate Time Machine**: 50-year atmospheric historical variance and delta analysis.
  - **Aviation Mode**: Real-time METAR format decoding and terminal condition reporting.
  - **Agriculture Weather**: Growing Degree Days (GDD), soil moisture estimation, and evapotranspiration calculations.
- **Command Palette (`Ctrl + K`)**: Fast command search and keyboard navigation.
- **Internationalization (i18n)**: Instant multilingual interface supporting English (`en`), Spanish (`es`), and French (`fr`).

---

### 🛡️ Backend & API Capabilities
- **Express 2.0 Architecture**: Modular RESTful micro-routes with centralized error handling and security middleware (Helmet, CORS, rate limiting).
- **Standardized API Envelopes**: All responses adhere to a consistent `{ success: true, data, meta }` or `{ success: false, error: { code, message } }` schema across all endpoints, including rate limits.
- **Resilient Dual Data Store**: Primary PostgreSQL database with automated zero-config fallback to local resilient JSON offline storage (`api/db/local_db.json`).
- **Grounded AI Copilot**: Strict grounding pipeline preventing hallucinations by validating against live OpenWeather observations and forecasts before generating responses.
- **Multi-Tier Caching**: Dynamic in-memory TTL caching with cache-busting headers to prevent external API rate exhaustion.
- **Real-Time Push Alerts**: Server-Sent Events (SSE) streaming live weather emergency events over `/api/v1/stream/alerts`.
- **IoT & Edge Gateway Telemetry**: Ingestion endpoints for atmospheric sensor fleets and edge device gateways (`/api/v1/devices`).

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    Client["PWA Client (Browser / Mobile)"] --> |HTTP / SSE| Gateway["Express API Gateway (/api/v1)"]
    Gateway --> Security["Security & Rate Limiting Middleware"]
    Security --> Cache["Multi-Tier Cache Service"]
    Cache --> Routes["REST Routes (/weather, /forecast, /ai, /operations, /devices)"]
    Routes --> Services["Domain Services (Weather, AI Copilot, Risk, Telemetry)"]
    Services --> DB["Dual Data Store (PostgreSQL / Local JSON Fallback)"]
    Services --> External["External APIs (OpenWeather / Open-Meteo)"]
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x tested)
- **npm**: v9.0.0 or higher
- *(Optional)* **PostgreSQL** or Docker for database persistence

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chiranjeebsatapathy123-sudo/weather-dashboard.git
   cd weather-dashboard/weather-dashboard-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure the following variables:
   ```env
   PORT=3000
   NODE_ENV=development
   OPENWEATHER_API_KEY=your_openweather_api_key
   DATABASE_URL=postgres://postgres:password@localhost:5432/weather_db
   ```

4. **Start the Development Server:**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

The platform includes a cross-platform test suite (`tests/api.test.js`) executed natively on Windows (via Named Pipes) and Linux/macOS runners (via `supertest`):

```bash
npm test
```

All 31 automated tests validate:
- **System Health & Uptime Metadata**: Status codes, service identification, and version strings.
- **Input Validation & Length Bounds**: Handling missing params, query limits, and oversized AI chat payloads.
- **Grounded AI Assistant**: Grounding guards and chat endpoints.
- **Composite Dashboard**: Payload aggregation across weather, forecast, insights, alerts, and risk.
- **Historical Weather & Fallback**: Valid city resolution and offline coordinate degradation.
- **User State Lifecycle**: Adding, listing, deduplicating, and deleting favorites and search history.
- **Enterprise Operations & Platform Auth Guards**: Role-based access control on logistics, intelligence, and IoT device telemetry ingestion.

---

## 📦 API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/v1/health` | Service health status, uptime, version metadata | No |
| `GET` | `/api/v1/weather/current` | Current weather observations | No |
| `GET` | `/api/v1/forecast` | 5-day / 3-hour detailed forecast | No |
| `GET` | `/api/v1/composite/dashboard`| Consolidated dashboard weather & risk payload | No |
| `POST`| `/api/v1/ai/chat` | Grounded Weather AI Copilot conversation | No |
| `GET` | `/api/v1/history/weather` | Historical weather archive (up to 30 days) | No |
| `GET` | `/api/v1/favorites` | Saved user favorite locations | Yes (`x-user-id`) |
| `POST`| `/api/v1/favorites` | Add favorite location | Yes (`x-user-id`) |
| `DELETE`| `/api/v1/favorites/:city` | Remove favorite location | Yes (`x-user-id`) |
| `GET` | `/api/v1/locations` | Default & user saved locations | No |
| `POST`| `/api/v1/locations/compare` | Compare 2 to 5 locations simultaneously | No |
| `GET` | `/api/v1/stream/alerts` | Server-Sent Events (SSE) live alert stream | No |
| `POST`| `/api/v1/devices/:id/telemetry` | Ingest IoT sensor telemetry data | Yes (`x-user-id`) |
| `GET` | `/api/v1/operations/overview`| Enterprise logistics & resource operations | Yes (`x-user-id`) |
| `GET` | `/api/v1/intelligence/overview`| Decision intelligence & scenario evaluation | Yes (`x-user-id`) |

For full request and response schemas, see [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

---

## 🐳 Docker Deployment

Run the complete containerized stack using Docker Compose:

```bash
docker compose up -d --build
```

---

## 📄 License
MIT License. Built with passion for atmospheric science and robust software architecture.
