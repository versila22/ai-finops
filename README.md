# 💰 AI FinOps — Real-Time AI Spend Tracker

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)](./docker-compose.prod.yml)
[![Tests](https://img.shields.io/badge/Tests-42%20passing-brightgreen)](./backend/tests/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-ai--finops.duckdns.org-orange)](https://ai-finops.duckdns.org)
[![License](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)

> **Stop flying blind on your AI bills.** AI FinOps tracks your OpenAI, Anthropic, Gemini, and ElevenLabs costs in real-time — with smart alerts, historical trends, and a single dashboard.

---

## 🎯 Why AI FinOps?

AI costs explode silently. You check your OpenAI bill at end of month and discover $200+ in charges you didn't plan for. ElevenLabs overage. Google credits expiring unused. Each provider has its own dashboard, its own billing cycle, its own units.

**AI FinOps brings everything into one place:**
- See all your AI costs at a glance
- Get alerted before you exceed budget
- Understand usage trends across providers
- Know which plans are underused vs overloaded

---

## ✨ Features

- 📊 **Unified Dashboard** — All providers, KPIs, alerts and trends in one view
- 🔄 **Real-Time Sync** — Pulls actual costs via OpenAI Admin API (real $, not estimates)
- 🔔 **Smart Alerts** — Configurable thresholds, overage detection, sync failures
- 📈 **Historical Tracking** — Daily cost snapshots per provider
- ➕ **Provider CRUD** — Add/edit/delete any provider with custom plans
- 🔐 **JWT Authentication** — Secure login, protected API
- ⚡ **Parallel Sync** — All providers synced concurrently with asyncio
- 🛡️ **Rate Limiting** — API protection via slowapi
- 🐳 **Docker + Traefik** — One-command production deployment with HTTPS
- 🇫🇷 **i18n** — French and English UI

---

## 📸 Dashboard

> Live demo: **[https://ai-finops.duckdns.org](https://ai-finops.duckdns.org)**

Dashboard features:
- **KPI cards** (clickable → drill down) — monthly budget, total spend, overage, alerts
- **Provider utilization bars** — usage %, trend, days until reset
- **Quota snapshot** — radial progress per provider
- **Alert center** — actionable alerts with direct links to provider billing pages
- **Budget composition** — plan costs vs overage bar

---

## 🏗️ Architecture

```
Browser
  │
  ▼
Traefik (HTTPS, Let's Encrypt)
  │
  ├── ai-finops.duckdns.org → Nginx (React SPA)
  │                              │
  │                              └── /api/v1/* → FastAPI (proxy)
  │
  └── ai-finops-api.duckdns.org → FastAPI
                                      │
                                      ├── SQLite (prod) / PostgreSQL (scale)
                                      │
                                      └── Provider APIs
                                          ├── OpenAI /v1/organization/costs
                                          ├── Anthropic (key validation)
                                          ├── ElevenLabs /v1/user/subscription
                                          └── Manual providers (Gemini, Lovable)
```

---

## 🚀 Quick Start

### With Docker (recommended)

```bash
git clone https://github.com/versila22/ai-finops.git
cd ai-finops

# Configure
cp backend/.env.example backend/.env
# Edit backend/.env: JWT_SECRET, OPENAI_ADMIN_KEY, etc.

# Run
docker compose -f docker-compose.prod.yml up -d --build

# Access
open http://localhost:80
```

### Local Development

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
JWT_SECRET=dev-secret uvicorn app.main:app --reload --port 8001

# Frontend
cd ..
npm install
VITE_API_URL=http://localhost:8001 npm run dev
```

---

## 🔧 Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | Strong random secret for JWT signing |
| `OPENAI_ADMIN_KEY` | Recommended | OpenAI Admin key for real cost data (`sk-admin-...`) |
| `OPENAI_API_KEY` | Optional | Falls back to token estimation |
| `ANTHROPIC_API_KEY` | Optional | API key validation only |
| `GEMINI_API_KEY` | Optional | Google AI API key |
| `ELEVENLABS_API_KEY` | Optional | ElevenLabs API key for real usage sync |
| `DATABASE_URL` | Optional | Defaults to SQLite (`sqlite:///./finops.db`) |

---

## 📡 API Reference

### Auth
```
POST /api/v1/auth/register  — Create account
POST /api/v1/auth/login     — Login → JWT token
GET  /api/v1/health         — Health check (public)
```

### Providers
```
GET    /api/v1/providers           — List all providers
POST   /api/v1/providers           — Add provider
PUT    /api/v1/providers/{id}      — Update provider
DELETE /api/v1/providers/{id}      — Remove provider
POST   /api/v1/sync/all            — Sync all providers
POST   /api/v1/sync/{provider_id}  — Sync one provider
```

### Dashboard & Analytics
```
GET /api/v1/dashboard   — KPIs + providers + alerts
GET /api/v1/alerts      — Alert list (paginated)
GET /api/v1/plans       — Subscription plans
```

Full docs at `/api/v1/docs` (Swagger UI).

---

## 🧪 Tests

```bash
cd backend
JWT_SECRET=test-secret python -m pytest tests/ -v
```

**42 tests** covering auth, CRUD, sync, notifications, rate limiting, and 401/422 handling.

---

## 🗺️ Roadmap

- [ ] **PostgreSQL migration** — for multi-user production scale
- [ ] **Multi-user** — per-user provider data isolation
- [ ] **Gemini API sync** — Google Cloud Billing API connector
- [ ] **Email alerts** — notify when thresholds exceeded
- [ ] **Slack/Telegram alerts** — real-time notifications
- [ ] **Budget forecasting** — ML-based spend prediction
- [ ] **Export** — CSV/PDF monthly reports
- [ ] **Mobile UI** — responsive dashboard

---

## 💡 Bounty / Contributing

PRs welcome! Current bounties (mention in PR):

| Feature | Difficulty | Reward |
|---------|-----------|--------|
| Gemini Cloud Billing API connector | Medium | 🏆 |
| Email alert system (SMTP) | Easy | 🥈 |
| PostgreSQL migration + multi-user | Hard | 🏆🏆 |
| Mobile-responsive dashboard | Medium | 🥈 |
| Lovable.dev API sync | Easy | 🥉 |

Open an issue first to discuss your approach.

---

## 📊 Tech Stack

| Layer | Tool | Version |
|-------|------|---------|
| Frontend | React + TypeScript | 18 / 5 |
| UI | Tailwind + shadcn/ui | latest |
| Charts | Recharts | latest |
| HTTP client | TanStack Query | v5 |
| Backend | FastAPI | latest |
| ORM | SQLAlchemy | 2.0 |
| Auth | python-jose + passlib | latest |
| Rate limiting | slowapi | 0.1.9 |
| Web server | Nginx | alpine |
| Reverse proxy | Traefik | v3 |
| Container | Docker + Compose | latest |

---

## 📄 License

MIT — free to use, fork, and build upon.

---

*Built by [@versila22](https://github.com/versila22) — AI Engineer based in Angers, France.*
*Feedback and stars ⭐ appreciated!*
