# Weather Intelligence API Specification (V1) 📡

Base URL: `/api/v1`

All responses follow the standard JSON envelop structure:
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```
Error responses follow:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error description."
  }
}
```

---

## 1. System & Health

### `GET /api/v1/health`
Returns system status, service name, version, uptime in seconds, and timestamp.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "weather-intelligence-api",
    "version": "2.0.0",
    "uptime": 1284.52,
    "timestamp": "2026-11-20T06:15:00.000Z"
  }
}
```

---

## 2. Weather & Forecast

### `GET /api/v1/weather/current`
Fetches current weather observations for a city or coordinates.

**Parameters:**
- `city` (string, optional): City name (e.g. `New York`).
- `lat` (number, optional): Latitude coordinate.
- `lon` (number, optional): Longitude coordinate.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "location": { "name": "New York", "country": "US" },
    "coordinates": { "lat": 40.7128, "lon": -74.006 },
    "temperature": 18.4,
    "feelsLike": 17.8,
    "tempHigh": 20.1,
    "tempLow": 15.2,
    "condition": {
      "main": "Clouds",
      "description": "scattered clouds",
      "icon": "03d",
      "code": 802
    },
    "humidity": 62,
    "pressure": 1014,
    "wind": { "speed": 4.1, "deg": 190 },
    "visibility": 10000,
    "uvIndex": 4.2,
    "airQuality": { "aqi": 2, "pollutants": { "pm2_5": 12.4, "pm10": 18.2 } }
  }
}
```

---

### `GET /api/v1/forecast`
Fetches 5-day / 3-hour forecast intervals.

**Parameters:**
- `city` (string): Target city name.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "dt": 1700000000,
        "dt_txt": "2026-11-20 12:00:00",
        "temp": 18.4,
        "feels_like": 17.8,
        "humidity": 62,
        "pop": 0.15,
        "weather": { "main": "Clouds", "description": "few clouds", "icon": "02d" }
      }
    ]
  }
}
```

---

## 3. Grounded AI Copilot

### `POST /api/v1/ai/chat`
Answers weather and environmental questions strictly grounded in observed and forecasted data.

**Request Body:**
```json
{
  "locationId": "London",
  "message": "Is it going to rain this afternoon?"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "answer": "No significant rain is expected soon. Precipitation probability remains low (15%).",
    "intent": "RAIN_FORECAST",
    "confidenceLevel": "HIGH",
    "confidenceReason": "Verified against recent hourly forecast records.",
    "sources": ["hourly_forecast"],
    "dataFreshness": "live",
    "retrievedAt": "2026-11-20T06:15:00.000Z"
  },
  "meta": { "ai": true }
}
```

---

## 4. Historical Archive

### `GET /api/v1/history/weather`
Fetches historical high/low temperatures and precipitation from Open-Meteo.

**Parameters:**
- `city` (string): Location name.
- `days` (number, optional, default: 7, max: 30): Days of history to retrieve.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-11-19",
      "tempHigh": 19.2,
      "tempLow": 13.5,
      "precipitation": 0.0
    }
  ],
  "meta": { "source": "open-meteo", "days": 7 }
}
```

---

## 5. User Favorites & Saved State

### `GET /api/v1/favorites`
Headers: `x-user-id: <uuid>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    { "city": "Tokyo", "addedAt": "2026-11-19T20:00:00.000Z" }
  ]
}
```

### `POST /api/v1/favorites`
Headers: `x-user-id: <uuid>`

**Request Body:**
```json
{ "city": "Sydney" }
```

---

## 6. Real-Time Alert Stream (SSE)

### `GET /api/v1/stream/alerts`
Establishes a persistent Server-Sent Events stream for live weather warnings.

**Response Headers:**
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

**Event Stream Format:**
```
data: {"message": "Connected to WeatherOS Real-time Alerts"}

data: {"event": "Lightning Strike Detected", "desc": "A lightning strike was detected 5km from your location."}
```
