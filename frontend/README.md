# ApexRate — Frontend Dashboard

Currency & Crypto Price Aggregator and Alert System built with Vue 3, Vite, TypeScript, Tailwind CSS, Pinia, and Chart.js.

## Tech Stack
- **Framework**: Vue 3 (Composition API, `<script setup lang="ts">`)
- **Build Tool**: Vite
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (clean dark/light financial dashboard aesthetic)
- **State Management**: Pinia
- **HTTP Client**: Axios (Centralized instance with `.env` support)
- **Charts**: Chart.js & `vue-chartjs`
- **Icons**: `lucide-vue-next`

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
# or: npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
VITE_API_URL=http://localhost:3000/api
```

### 3. Run Development Server
```bash
pnpm dev
# or: npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features
- **Mock Mode Toggle**: Switch between local mock data (realistic simulated data stored in `localStorage`) and live NestJS API directly from the top navigation bar.
- **Tracked Assets Grid**: View live prices and 24h changes for BTC, ETH, SOL, USD/EUR, USD/UYU, or add custom assets.
- **Interactive Price Chart**: Smooth gradient line chart with 1H, 24H, and 7D timeframe toggles, high/low stats, and responsive tooltips.
- **Price Alerts Manager**: Set triggers (`ABOVE` / `BELOW`) with Telegram Chat ID to receive instant alerts.
- **Toast Notifications**: Feedback for all user operations and backend connection statuses.
- **Dark / Light Mode**: Professional financial trading aesthetic with instantaneous switching.
