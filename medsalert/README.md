# 💊 MedsAlert

> Find your medication nearby. A real-time pharmacy stock locator for chronic-condition
> medicines — starting with hypertension and diabetes, in one city.

**The MVP hypothesis:** if patients can see which nearby pharmacies stock their medication,
they'll use it — and pharmacies will keep stock data updated to get that foot traffic.
Everything in this repo exists to test that, cheaply.

---

## How it works

**Patients** (public, no account):
- Search a drug → see nearby pharmacies with it in stock, with distance, price, and a
  freshness badge ("Confirmed 2h ago" vs "Unconfirmed")
- Call or get directions in one tap
- If nobody has it: leave a phone number → SMS when it's back in stock

**Pharmacies** (phone + OTP login, mobile-web dashboard):
- One screen: every tracked drug with **In stock / Low / Out** toggles and a price field
- One-tap "Confirm today's stock unchanged" keeps data fresh
- Weekly demand stats ("23 people searched for drugs you stock") — the retention hook

**Staleness is first-class:** stock entries older than 48h are demoted in search results
and flagged unconfirmed. Trustworthy data without manual policing.

Every search is logged (`search_logs`) — regional demand data is the future revenue line.

## Stack

FastAPI (async SQLAlchemy) · PostgreSQL 16 (PostGIS-ready image) · Redis (OTP, rate limits)
· React 19 + Vite + Tailwind 4 · SMS via Termii (console provider for dev).

Deliberately a **monolith** — the MVP's risk is market, not scale.

```
backend/app/
├── main.py          # app wiring, CORS, health
├── config.py        # env-driven settings
├── models.py        # Drug, Pharmacy, PharmacyUser, StockEntry, StockAlert, SearchLog
├── routers/
│   ├── auth.py      # phone + OTP → JWT
│   ├── catalog.py   # drug autocomplete
│   ├── search.py    # geo search w/ freshness ranking + demand logging
│   ├── pharmacy.py  # stock CRUD, one-tap confirm, stats, restock notifications
│   └── alerts.py    # patient "text me when available" waitlist
├── services/        # sms (console/termii), otp (redis-backed)
└── seed.py          # 16-drug catalog + demo pharmacy
```

## Quickstart

```bash
cp .env.example .env
docker compose up --build          # Postgres, Redis, API on :8000
docker compose exec backend python -m app.seed

cd frontend
npm install
npm run dev                        # http://localhost:5173 (proxies /api → :8000)
```

**Try it:** search "amlodipine" on the home page. Pharmacy portal → sign in with
`+2348000000001` — the OTP code prints in the backend logs (`docker compose logs backend`).

API docs: http://localhost:8000/docs

### Migrations

Dev uses `create_all` on startup. For production:

```bash
cd backend
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

## Extracting to a standalone repo

This project currently lives inside `pulseboard` on a feature branch. To give it its own
repository:

```bash
# from the pulseboard checkout, on this branch
git subtree split --prefix=medsalert -b medsalert-standalone
cd .. && git clone pulseboard medsalert-repo --branch medsalert-standalone --single-branch
cd medsalert-repo
git remote set-url origin git@github.com:Isrcode1/medsalert.git   # create the repo first
git push -u origin medsalert-standalone:main
```

(Or simply copy the `medsalert/` directory into a fresh `git init` if history doesn't matter.)

## MVP success criteria (decided up front)

- ≥60% of pharmacies confirm stock ≥3×/week by week 8
- ≥300 organic searches/week by week 8
- ≥20% of out-of-stock searches leave a phone number

If pharmacies won't update even with nudges, pivot to demand-data (patients report
found / not-found) rather than live inventory.

## Out of MVP scope (on purpose)

Patient accounts · adherence reminders · drug authenticity verification · delivery and
payments · multi-city · native apps · inventory integrations · self-serve pharmacy
onboarding (walk in, sign them up, train the attendant).
