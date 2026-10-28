# ApexRate — Currency & Crypto Price Aggregator & Alert System

Комплексный пет-проект агрегатора курсов валют и криптовалют с интерактивными графиками, управлением активами и оповещениями через Telegram.

## Структура проекта

```
currency-aggregator/
├── frontend/       # Vue 3 + TypeScript + Tailwind CSS + Pinia + Chart.js
└── backend/        # Nest.js + PostgreSQL + Prisma ORM + Telegram Bot
```

## 1. Фронтенд (`/frontend`)
- **Стек**: Vue 3 (Composition API), Vite, TypeScript, Tailwind CSS, Pinia, Axios, Chart.js, Lucide Icons.
- **Готовые возможности**:
  - Карточки отслеживаемых активов (BTC, ETH, SOL, USD/EUR, USD/UYU).
  - Интерактивный график котировок с таймфреймами 1H, 24H, 7D.
  - Форма и модальное окно добавления нового актива.
  - Менеджер алертов (создание триггеров ABOVE / BELOW, таблица активных алертов, удаление).
  - **Переключатель Mock Mode / Live API**: можно тестировать интерфейс автономно прямо сейчас, либо подключить реальный бэкенд на `http://localhost:3000/api`.
  - Темная и светлая тема оформления.

### Запуск фронтенда:
```bash
cd frontend
pnpm install
pnpm dev
```
Фронтенд будет доступен по адресу: [http://localhost:5173](http://localhost:5173).

---

## 2. Бэкенд (`/backend`)
- **Стек**: Nest.js, PostgreSQL, Prisma ORM, `@nestjs/schedule` (Cron), `@nestjs/axios`, Telegram Bot API.
- **Подробное ТЗ для разработки**:
  👉 См. **[backend/TECHNICAL_SPECIFICATION.md](./backend/TECHNICAL_SPECIFICATION.md)** с детальным описанием всех 10 шагов проектирования.
