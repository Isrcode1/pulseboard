# ⚡ PulseBoard

> A developer profile & portfolio platform — sign in with GitHub, build your profile, and share a public page that shows what you're building right now.

PulseBoard is a microservices application built end-to-end with a full DevOps workflow: Docker, CI/CD, Terraform, Ansible, and Kubernetes.

---

## 📌 What It Does

- **Sign in with GitHub** — OAuth login, no passwords
- **Build your profile** — display name, headline, bio, location, "currently building", open-to-work flag
- **Add your stack** — skills, social links, and pinned projects
- **Share it** — every profile gets a public page at `/p/<username>`
- **Guided onboarding** — a 6-step wizard walks new users through profile setup

---

## 🏗️ Architecture

```
                        ┌──────────────────────────────────────────┐
                        │            Nginx (port 80)               │
                        │  /            → React frontend           │
                        │  /api/auth/   → auth-service             │
                        │  /api/profile/→ profile-service          │
                        └───────┬──────────────┬───────────────────┘
                                │              │
                  ┌─────────────▼───┐  ┌───────▼──────────┐
                  │  auth-service   │  │ profile-service  │
                  │  FastAPI :8001  │  │  FastAPI :8002   │
                  │  GitHub OAuth   │  │  profiles, skills│
                  │  JWT sessions   │  │  links, projects │
                  └───────┬─────────┘  └───────┬──────────┘
                          │                    │
                    ┌─────▼────────────────────▼─────┐
                    │     PostgreSQL 16  ·  Redis 7  │
                    └────────────────────────────────┘
```

### Services

| Service | Status | Purpose |
|---------|--------|---------|
| `auth-service` | ✅ Working | GitHub OAuth, JWT issue/verify, sessions |
| `profile-service` | ✅ Working | Profiles, skills, social links, pinned projects, public pages |
| `frontend` | ✅ Working | React SPA — landing page, onboarding wizard, dashboard, public profile |
| `aggregator-service` | 🚧 Scaffold | Planned: pull activity from GitHub, dev.to, Hashnode |
| `analytics-service` | 🚧 Scaffold | Planned: profile views and engagement stats |
| `notification-service` | 🚧 Scaffold | Planned: email / in-app notifications |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python · FastAPI · SQLAlchemy (async) · Pydantic |
| Frontend | React 19 · Vite · Tailwind CSS 4 · TanStack Query |
| Data | PostgreSQL 16 · Redis 7 |
| Containers | Docker · Docker Compose |
| CI/CD | GitHub Actions (ruff lint, pytest, Docker build, deploy on merge to `main`) |
| Infrastructure | Terraform (VPC, EC2, S3 remote state) · Ansible (server provisioning) |
| Orchestration | Kubernetes (kind) — Deployment, HPA, Postgres StatefulSet |
| Observability | Prometheus metrics via `prometheus-fastapi-instrumentator` |

---

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for frontend dev)
- A GitHub OAuth App ([create one here](https://github.com/settings/developers))

### 1 — Clone and configure

```bash
git clone https://github.com/Isrcode1/pulseboard.git
cd pulseboard
cp .env.example .env
```

Fill in `.env`:

```env
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
GITHUB_REDIRECT_URI=http://localhost/api/auth/auth/github/callback
JWT_SECRET_KEY=change-me-to-something-random
```

### 2 — Start the backend stack

```bash
docker compose up --build
```

This starts PostgreSQL, Redis, auth-service, and Nginx on port 80.

### 3 — Run the frontend (dev mode)

```bash
cd frontend
npm install
npm run dev
```

The app is available at http://localhost:5173.

### 4 — Run backend tests

```bash
cd services/auth-service
pip install -r requirements.txt
pytest tests/ -v
```

---

## 🔌 API Overview

### auth-service (`:8001`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/github/login` | Redirect to GitHub OAuth |
| GET | `/auth/github/callback` | OAuth callback → issues JWT, redirects to frontend |
| POST | `/auth/verify` | Verify a JWT |
| GET | `/health` | Health check |

### profile-service (`:8002`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/profile` | Create profile (onboarding) |
| GET | `/profile/me` | Get own profile |
| PUT | `/profile/me` | Update own profile |
| POST | `/profile/me/skills` | Add a skill |
| DELETE | `/profile/me/skills/{id}` | Remove a skill |
| POST | `/profile/me/social-links` | Add a social link |
| POST | `/profile/me/projects` | Pin a project |
| GET | `/p/{username}` | Public profile page (no auth) |
| GET | `/health` | Health check |

Interactive docs are available at `/docs` on each service when `DEBUG=true`.

---

## ⚙️ CI/CD

**CI** (`.github/workflows/ci.yml`) runs on every push:
1. **Lint** — `ruff check` on auth-service
2. **Test** — `pytest` against the test suite
3. **Build** — Docker image build via Buildx

**CD** (`.github/workflows/cd.yml`) runs on merge to `main`: builds and pushes the image, then deploys to the server over SSH.

---

## ☸️ Infrastructure

```
infrastructure/
├── terraform/        # VPC, subnet, security group, EC2, S3 remote state
├── ansible/          # Roles: common, docker, app — full server provisioning
└── scripts/          # Server setup helpers

k8s/
├── namespace.yaml
├── auth-service/     # Deployment, Service, ConfigMap, Secret, HPA
├── postgres/         # StatefulSet + Service (persistent storage)
└── kind-config.yaml  # Local cluster config
```

Local cluster: `kind create cluster --config k8s/kind-config.yaml`, then apply the manifests in `k8s/`.

---

## 🗺️ Roadmap

- [ ] Wire profile-service and the frontend into the Docker Compose stack and Nginx routing
- [ ] Extend CI to lint/test profile-service and build the frontend
- [ ] Database migrations with Alembic (replace `create_all` on startup)
- [ ] aggregator-service — sync GitHub / dev.to / Hashnode activity into the profile "pulse"
- [ ] analytics-service — profile view counts and engagement stats
- [ ] notification-service — email and in-app notifications
- [ ] K8s manifests for profile-service and the frontend

---

*Built by Folarin Israel as a full-stack DevOps project.*
