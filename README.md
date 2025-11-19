# TinyLink

TinyLink is a tiny URL shortener with a REST API and a simple UI.

## Features
- Create short links (custom code supported)
- 302 redirect on visit
- Track clicks & last clicked timestamp
- Delete links (soft delete)
- Health check

## Local setup
1. Clone repo
2. Install deps: `npm i`
3. Create Postgres DB and run `migrations/init.sql`
4. Create `.env` from `.env.example`
5. Start: `node server.js` or with nodemon
6. Frontend: `cd frontend && npm run dev` (Next.js)

## Endpoints
- `POST /api/links` — create
- `GET /api/links` — list
- `GET /api/links/:code` — stats
- `DELETE /api/links/:code` — delete
- `GET /:code` — redirect
