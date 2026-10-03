# WeatherOS API Documentation

## Overview
WeatherOS provides a modular, versioned REST API (`/api/v1`) for retrieving weather intelligence, generating AI insights, and personalizing the user experience.

---

### Core Principles
1. **Consistency**: All endpoints return a standard wrapper:
   ```json
   { "success": true, "data": { ... } }
   ```
2. **Standardized Errors**: Failed requests return standard error objects.
   ```json
   { "success": false, "error": { "code": "INVALID_INPUT", "message": "..." } }
   ```
3. **Caching**: Weather and forecast data are heavily cached (default 5 min TTL) to prevent rate limits from external providers.

---

## 1. Weather Data

### `GET /api/v1/weather/current`
- **Description**: Fetches current weather for a city or coordinates.
- **Parameters**: `?city=String` OR `?lat=Number&lon=Number`
- **Response**: `WeatherData` object containing temperatures, conditions, and wind.

### `GET /api/v1/forecast`
- **Description**: Fetches the 5-day / 3-hour forecast.
- **Parameters**: `?city=String` OR `?lat=Number&lon=Number`
- **Response**: Array of future weather periods with precipitation probability (PoP).

---

## 2. Personalization & Risk Engine

### `GET /api/v1/risk/dashboard`
- **Description**: Evaluates current weather against user activity profiles.
- **Parameters**: `?city=String`
- **Response**: 
  - `activityRisks`: Array of evaluated risks (e.g. LOW, MODERATE) with explanations.
  - `optimalWindows`: Recommended time slots for preferred activities.
  - `forecastChange`: Detection of large forecast drifts.

---

## 3. Weather AI Copilot

### `POST /api/v1/ai/chat`
- **Description**: Grounded natural language query engine for weather data.
- **Body**: 
  ```json
  { "locationId": "New York", "message": "Will it rain today?" }
  ```
- **Response**: 
  - `answer`: Deterministic natural language explanation.
  - `intent`: Classified query intent (e.g., `RAIN_FORECAST`).
  - `confidenceLevel`: Confidence based on data freshness.

---

## 4. Health & Observability

### `GET /api/v1/health`
- **Description**: General health check.

### `GET /api/v1/health/ready`
- **Description**: Readiness probe checking database connectivity.
