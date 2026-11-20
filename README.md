# Weather Intelligence (WeatherOS) 🌦️⚡

An enterprise-grade, high-performance Weather Intelligence Platform and Progressive Web Application (PWA) built for real-time atmospheric monitoring, hyper-local forecasting, client-side neural network predictions, and intelligent decision automation.

---

## 🌟 Key Features

### 🖥️ Frontend & PWA Experience
- **Glassmorphic Responsive Interface**: Sleek, modern dark and light theme interface with custom thin scrollbars, active tab indicators, and a pinned system status bottom bar.
- **Dynamic Metric & Imperial Units**: Seamless live switching between Metric (°C, km/h, mm) and Imperial (°F, mph, in) units across all dashboards, forecast cards, metrics, and historical charts.
- **PWA & Offline Resilience**: Service Worker (`weatheros-v14`) caching all static assets and API responses. When offline, an offline banner alerts the user, and cached data remains fully interactive.
- **Edge AI Weather Predictor**: In-browser machine learning powered by TensorFlow.js (with an automated offline adaptive polynomial regression fallback) predicting tomorrow's high temperature with live loss tracking and confidence metrics.
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
- **Resilient Dual Data Store**: Primary PostgreSQL database with automated zero-config fallback to local resilient JSON offline storage (`api/db/local_db.json`).
- **Grounded AI Copilot**: Strict grounding pipeline preventing hallucinations by validating against live OpenWeather observations and forecasts before generating responses.
- **Multi-Tier Caching**: Dynamic in-memory TTL caching with cache-busting headers to prevent external API rate exhaustion.
- **Real-Time Push Alerts**: Server-Sent Events (SSE) streaming live weather emergency events over `/api/v1/stream/alerts`.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    Client["PWA Client (Browser / Mobile)"] --> |HTTP / SSE| Gateway["Express API Gateway (/api/v1)"]
    Gateway --> Security["Security & Rate Limiting Middleware"]
    Security --> Cache["Multi-Tier Cache Service"]
    Cache --> Routes["REST Routes (/weather, /forecast, /ai, /operations)"]
    Routes --> Services["Domain Services (Weather, AI Copilot, Risk, GIS)"]
    Services --> DB["Dual Data Store (PostgreSQL / Local JSON Fallback)"]
    Services --> OpenWeather["External APIs (OpenWeather / Open-Meteo)"]
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
   git clone https://github.com/your-org/weather-dashboard.git
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

The platform includes a comprehensive native Node.js test suite (`tests/api.test.js`) executed via Windows Named Pipes and cross-platform clients:

```bash
npm test
```

All 29 automated test suites validate:
- System Health & Uptime Metadata
- Input Validation & Length Bounds
- Grounded AI Assistant
- Composite Dashboard Payload Formats
- Risk & Insights Endpoints
- User State, Favorites, and Search History Lifecycles
- Enterprise Operations & Platform Auth Guards

---

## 📦 API Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/v1/health` | Service health status, uptime, version | No |
| `GET` | `/api/v1/weather/current` | Current weather observations | No |
| `GET` | `/api/v1/forecast` | 5-day / 3-hour detailed forecast | No |
| `GET` | `/api/v1/composite/dashboard`| Consolidated dashboard weather & risk payload | No |
| `POST`| `/api/v1/ai/chat` | Grounded Weather AI Copilot conversation | No |
| `GET` | `/api/v1/history/weather` | Open-Meteo historical archive (up to 30 days) | No |
| `GET` | `/api/v1/favorites` | Saved user favorite locations | Yes (`x-user-id`) |
| `POST`| `/api/v1/favorites` | Add favorite location | Yes (`x-user-id`) |
| `DELETE`| `/api/v1/favorites/:city` | Remove favorite location | Yes (`x-user-id`) |
| `GET` | `/api/v1/locations` | Default & user saved locations | No |
| `POST`| `/api/v1/locations/compare` | Compare 2 to 5 locations simultaneously | No |
| `GET` | `/api/v1/stream/alerts` | Server-Sent Events (SSE) live alert stream | No |
| `GET` | `/api/v1/operations/overview`| Enterprise logistics & resource operations | Yes (`x-user-id`) |
| `GET` | `/api/v1/intelligence/overview`| Decision intelligence & scenario evaluation | Yes (`x-user-id`) |

For full request and response schemas, see [docs/API_DOCUMENTATION.md](file:///c:/Users/chira/Downloads/weather-dashboard/weather-dashboard-main/docs/API_DOCUMENTATION.md).

---

## 🐳 Docker Deployment

Run the complete containerized stack using Docker Compose:

```bash
docker compose up -d --build
```

---

## 📄 License
MIT License. Built with passion for atmospheric science and robust software architecture.
