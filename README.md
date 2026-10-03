# Weather Intelligence 2.0

Weather Intelligence is a production-ready, modern weather dashboard that provides environmental insights, predictive AI assistance, and high-quality UX.

## 🚀 Features
- **Premium Glassmorphism UI**: High-end responsive design with dark/light themes.
- **Weather Insights Engine**: Analyzes weather data to provide contextual warnings (e.g., UV, rain, wind).
- **Weather AI Assistant**: Ask questions directly about the current weather.
- **24h & 5-Day Forecasts**: Interactive charts (Chart.js) and daily timelines.
- **PWA Ready**: Installable on mobile and desktop, offline caching of static assets.
- **Security Hardened**: Rate limiting, strict CORS, input validation, and XSS prevention.

## 📁 Architecture
- **Frontend**: Modular Vanilla HTML/CSS/JS, served statically.
- **Backend**: Express.js REST API with modular routes (`weather`, `forecast`, `insights`, `ai`, `history`, `favorites`).
- **Database**: Serverless PostgreSQL via Neon.

## 🛠️ Setup & Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Environment Variables:
   Create a `.env` file in the root:
   ```env
   OPENWEATHER_API_KEY=your_api_key
   DATABASE_URL=postgres://user:pass@host/db
   ALLOWED_ORIGINS=http://localhost:3000
   ```

3. Database Setup:
   Execute the `database/schema.sql` file against your PostgreSQL instance to create the necessary tables.

4. Run locally:
   ```bash
   npm start
   ```
   Open `http://localhost:3000`.

## 🧪 Testing
We use Node.js native test runner along with `supertest`.
Run tests via:
```bash
npm run test
```
*(Remember to add `"test": "node --test tests/api.test.js"` to `package.json` scripts)*

## ☁️ Deployment
Designed for Serverless deployment on platforms like Vercel. 
- `vercel.json` maps `/api/(.*)` to `api/index.js`
- Set the environment variables in your deployment dashboard.
