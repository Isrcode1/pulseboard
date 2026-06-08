# 🍲 Nigerian Food Battle — Multi-Container Voting App

> A fully Dockerised, cloud-deployed voting application built as a capstone project.
> Vote between **Amala + Gbegiri** and **Afang + Native Fufu** — and let the people decide!

**Live App:** http://98.91.216.50:5000

---

## 📌 Project Overview

This is a multi-container web application that allows users to vote between two Nigerian food options. Votes are processed by a Node.js worker, stored in PostgreSQL, and displayed in real time on the results page. The entire application is containerised with Docker and deployed to AWS EC2 via a GitHub Actions CI/CD pipeline.

**Application Type:** Interactive voting platform with real-time results dashboard

---

## 🎯 Project Objectives

- Build a production-grade multi-container application using microservices architecture
- Containerise all services using Docker and Docker Compose
- Automate deployment using a CI/CD pipeline with GitHub Actions
- Deploy the application to a cloud server (AWS EC2)
- Demonstrate team collaboration using Git branching strategy

---

## 👥 Team Members

| Name | Role |
|------|------|
| Folarin Israel | Team Lead / DevOps |
| Team Member 1 | Frontend Developer |
| Team Member 2 | Backend / Worker Developer |
| Team Member 3 | Database Engineer / QA |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              AWS EC2 (Ubuntu)               │
│  ┌──────────────────────────────────────┐   │
│  │        Docker Compose Network        │   │
│  │                                      │   │
│  │  ┌─────────────┐  ┌──────────────┐  │   │
│  │  │   Flask     │  │   Node.js    │  │   │
│  │  │  Frontend   │→ │   Worker     │  │   │
│  │  │  :5000      │  │              │  │   │
│  │  └─────────────┘  └──────┬───────┘  │   │
│  │                          │ writes   │   │
│  │  ┌───────────────────────▼──────┐   │   │
│  │  │         PostgreSQL           │   │   │
│  │  │         foodvotes DB         │   │   │
│  │  └──────────────────────────────┘   │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
         ↑
   GitHub Actions CI/CD (SSH deploy on push to main)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Python Flask | Serves the voting UI and results page |
| Worker | Node.js | Processes votes in the background |
| Database | PostgreSQL | Stores and persists all vote data |
| Containerisation | Docker + Docker Compose | Packages all services into containers |
| CI/CD | GitHub Actions | Automates build and deployment |
| Cloud | AWS EC2 | Hosts the live application |

---

## 📁 Project Structure

```
multi-container-voting-app/
├── flask-frontend/
│   ├── app.py                  # Flask application
│   ├── requirements.txt        # Python dependencies
│   ├── static/
│   │   └── css/style.css       # Styles
│   └── templates/
│       ├── index.html          # Voting page
│       └── results.html        # Results page
├── node-worker/
│   ├── worker.js               # Vote processing worker
│   └── package.json            # Node dependencies
├── postgres/
│   └── init.sql                # Database schema
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD
├── Dockerfile.vote             # Flask container
├── Dockerfile.worker           # Node.js container
├── docker-compose.yml          # Multi-container config
├── .env.example                # Environment variable template
└── README.md
```

---

## 🚀 How to Run the Project

### Prerequisites

- Docker Desktop installed and running
- Git installed
- A terminal / command prompt

### Step 1 — Clone the repository

```bash
git clone https://github.com/Isrcode1/multi-container-voting-app.git
cd multi-container-voting-app
```

### Step 2 — Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=foodvotes
FLASK_ENV=development
```

### Step 3 — Build and start all containers

```bash
docker-compose up --build
```

### Step 4 — Access the application

| Page | URL |
|------|-----|
| Voting page | http://localhost:5000 |
| Results page | http://localhost:5000/results |

### Step 5 — Stop the application

```bash
docker-compose down
```

---

## ⚙️ CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically deploys the app to AWS EC2 on every push to the `main` branch:

1. **Checkout** — pulls the latest code
2. **SSH into EC2** — connects using stored SSH key secret
3. **Pull latest** — `git pull origin main`
4. **Rebuild** — `docker-compose down && docker-compose up -d --build`

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `EC2_HOST` | Public IP of the EC2 instance |
| `EC2_USER` | SSH username (ubuntu) |
| `EC2_SSH_KEY` | Contents of the `.pem` private key file |

---

## 🌐 Live Deployment

- **Live URL:** http://98.91.216.50:5000
- **Server:** AWS EC2 t2.micro — Ubuntu 22.04 LTS
- **Region:** us-east-1

---

## 🗃️ Database Schema

```sql
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    food_option VARCHAR(100)
);
```

---

## 🤝 Git Branching Strategy

```
main        ← production (protected, CI/CD deploys from here)
  └── develop ← integration branch
        └── feature/<name>/<feature> ← individual work branches
```

**Rule:** Always `git pull origin develop` before starting work. Open a PR to merge into `develop`. Team lead merges `develop` into `main`.

---

## 📸 Screenshots

The app features:
- A **Nigerian Food Battle** voting UI with food photos and animated vote bars
- A **Live Results page** showing real vote counts and percentages
- A dynamic **winner banner** that updates based on current votes

---

*Built with ❤️ by the team as a DevOps capstone project*
