# CampusTask — Student Assignment & Project Tracker

CampusTask is a DevOps capstone project: a full-stack task management application with a React + Vite frontend, FastAPI backend, PostgreSQL database, SQLAlchemy ORM, Alembic migrations, and Pytest tests. It is containerized with Docker, deployed to Kubernetes via Helm, and provisioned on AWS with Terraform. GitHub Actions runs CI/CD (pytest → Trivy scan → GHCR publish), and Prometheus/Grafana provide observability.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Local Setup (Docker Compose)](#local-setup-docker-compose)
- [Testing](#testing)
- [CI/CD Pipeline](#ci-cd-pipeline)
- [Kubernetes + Helm Deployment](#kubernetes--helm-deployment)
- [Terraform AWS Infrastructure](#terraform-aws-infrastructure)
- [Observability (Prometheus + Grafana)](#observability-prometheus--grafana)
- [API Reference](#api-reference)
- [Known Issues & Limitations](#known-issues--limitations)
---

## Project Overview

CampusTask lets students track assignments and projects:

- Create, read, update, and delete tasks
- Filter tasks by status (`todo`, `in_progress`, `completed`)
- Search tasks by title or course
- View task statistics (total, todo, in progress, completed, overdue)
- Responsive UI with KPI cards and a task table

The application exposes a REST API consumed by the frontend, backed by PostgreSQL and managed through Alembic migrations.

---

## Architecture

```text
Developer
   |
   v
Git / GitHub
   |
   v
GitHub Actions
   |-- pytest (backend tests)
   |-- frontend build
   |-- Docker build (backend + frontend)
   |-- Trivy scan (fails on HIGH/CRITICAL)
   `-- push images to GHCR (:latest + git SHA)
              |
              v
        Terraform
              |
       AWS VPC + EKS
       (2 public subnets, managed worker nodes)
              |
              v
            Helm
              |
      +-------+--------+
      |                |
   Frontend          Backend
    React            FastAPI
   (2 replicas)      (2 replicas)
      |                |
      +-------> PostgreSQL
              |
       Prometheus  (scrapes /metrics)
              |
           Grafana  (live dashboard)
```

- **Frontend** → Nginx → React SPA, served on port 8080 (NodePort 30080)
- **Backend** → FastAPI + Uvicorn on port 8000 (ClusterIP)
- **Database** → PostgreSQL 16 with PersistentVolumeClaim
- **Ingress** → routes `/api` to backend, `/` to frontend
- **Monitoring** → Prometheus scrapes `/metrics`; Grafana visualizes

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Nginx |
| Backend | FastAPI, Uvicorn, Python 3.12 |
| Database | PostgreSQL 16 |
| ORM / Migrations | SQLAlchemy 2.0, Alembic |
| Testing | Pytest 8, HTTPX |
| Containerization | Docker, Docker Compose |
| Registry | GitHub Container Registry (GHCR) |
| CI/CD | GitHub Actions |
| Security | Trivy (container scanning) |
| Infrastructure | Terraform (AWS VPC + EKS) |
| Orchestration | Kubernetes (Minikube / EKS) |
| Packaging | Helm |
| Networking | Ingress (nginx), ClusterIP Services |
| Observability | Prometheus, Grafana |

---

## Repository Structure

```text
CampusTask/
├── backend/                 # FastAPI application
│   ├── app/                 # API routes, models, schemas, DB config
│   ├── migrations/          # Alembic migration versions
│   ├── tests/               # Pytest test suite
│   ├── Dockerfile           # Backend image (non-root user)
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .dockerignore
├── frontend/                # React + Vite application
│   ├── src/
│   ├── Dockerfile           # Multi-stage: Node build + Nginx runtime
│   ├── nginx.conf
│   └── .dockerignore
├── k8s/                     # Kubernetes bootstrap manifests
│   ├── namespace.yaml
│   ├── backend.yaml
│   ├── frontend.yaml
│   ├── postgres.yaml
│   └── configmap.yaml
├── helm/campustask/         # Helm chart
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── backend.yaml
│       ├── frontend.yaml
│       ├── postgres.yaml
│       └── ingress.yaml
├── monitoring/              # Prometheus + Grafana values
│   ├── prometheus-values.yaml
│   └── grafana-values.yaml
├── terraform/               # AWS VPC + EKS infrastructure
│   ├── main.tf
│   └── terraform.tfvars.example
├── docker-compose.yml       # Local full stack
├── .github/workflows/ci.yml # GitHub Actions CI/CD
├── .gitignore
└── README.md
```

---

## Local Setup (Docker Compose)

Requirements: Docker Desktop / Docker Engine with Docker Compose.

```bash
# From the project root
docker compose up --build
```

Open:

```text
http://localhost:8080        # Frontend application
http://localhost:8000/docs   # FastAPI Swagger UI
http://localhost:8000/health # Backend health check
http://localhost:8000/ready  # Readiness (database check)
http://localhost:8000/metrics # Prometheus metrics
```

Stop:

```bash
docker compose down
```

Delete database volume too (destructive):

```bash
docker compose down -v
```

The compose file starts PostgreSQL, backend, and frontend on a shared Docker network. The backend connects to `db:5432` via `DATABASE_URL`.

---

## Testing

Requirements: Python 3.11+.

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\Activate.ps1
# WSL/Linux: source .venv/bin/activate
pip install -r requirements.txt
pytest -v
```

Tests use an isolated in-memory SQLite database (not the production database). The suite covers `/health`, `GET/POST/PUT/DELETE /api/tasks`, `/api/tasks/stats`, search, and validation — 9 test cases across 4+ endpoints.

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `main` and on pull requests:

1. **Backend Tests** — installs Python dependencies and runs `pytest`; fails the build on test failure
2. **Docker Build and Trivy Scan** — builds backend and frontend images; scans both with Trivy and fails on HIGH or CRITICAL CVEs
3. **Publish Images to GHCR** — on push to `main`, builds and pushes backend and frontend images to GitHub Container Registry, tagged with `:latest` and the git commit SHA (`${{ github.sha }}`) for traceability

Images are pushed to `ghcr.io/<owner>/campustask-backend` and `ghcr.io/<owner>/campustask-frontend`.

No secrets are committed to the repository; the workflow uses `secrets.GITHUB_TOKEN` for GHCR authentication.

---

## Kubernetes + Helm Deployment

Deploy the application to a Kubernetes cluster:

```bash
helm upgrade --install campustask ./helm/campustask \
  --namespace campustask \
  --create-namespace
```

Verify the release and pods:

```bash
helm list -n campustask
kubectl get pods -n campustask
kubectl get svc -n campustask
kubectl get ingress -n campustask
```

Expected result: all pods `Running`, backend and frontend each with 2 replicas, ClusterIP services for backend/frontend/postgres, and an Ingress routing `/api` → backend and `/` → frontend.

The Helm chart is configurable via `helm/campustask/values.yaml` (replica counts, image tags, CORS origins, ingress toggle).

---

## Terraform AWS Infrastructure

Provision the cloud infrastructure with Terraform:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your settings (no real credentials)
terraform init
terraform plan
terraform apply
```

This creates:

- VPC with DNS support/hostnames enabled
- Internet Gateway
- Two public subnets across different availability zones
- Public route table with routes to the Internet Gateway
- EKS cluster (public endpoint) with IAM cluster role
- EKS managed worker node group (2 desired, 3 max nodes) with IAM node role

After apply, configure kubectl:

```bash
aws eks update-kubeconfig --region ap-south-1 --name campustask
```

Destroy when finished (to avoid runaway AWS costs):

```bash
terraform destroy
```

`terraform.tfvars.example` is provided without real credentials. Never commit AWS access keys or secrets to GitHub.

---

## Observability (Prometheus + Grafana)

The backend exposes `/metrics` in Prometheus format (including `campustask_operations_total` and process metrics).

Deploy Prometheus and Grafana:

```bash
helm upgrade --install prometheus prometheus \
  --repo https://prometheus-community.github.io/helm-charts \
  -f monitoring/prometheus-values.yaml \
  --namespace monitoring \
  --create-namespace

helm upgrade --install grafana grafana \
  --repo https://grafana.github.io/helm-charts \
  -f monitoring/grafana-values.yaml \
  --namespace monitoring \
  --create-namespace
```

- Prometheus scrapes `backend.campustask.svc.cluster.local:8000/metrics` every 15s
- Grafana is exposed via NodePort 30300 with Prometheus configured as the default datasource

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service info |
| GET | `/health` | Liveness check |
| GET | `/ready` | Readiness check (verifies DB) |
| GET | `/metrics` | Prometheus metrics |
| GET | `/api/tasks` | List tasks (optional `status`, `search`) |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/{id}` | Get a task by ID |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |
| GET | `/api/tasks/stats` | Task statistics |

Task statuses: `todo`, `in_progress`, `completed`.

Swagger UI: `http://localhost:8000/docs` (local) or `/docs` on the deployed backend.

---

## Known Issues & Limitations

- **Migrations run at container startup** via `alembic upgrade head && uvicorn ...`; if the database is not yet reachable, the backend container crashes and restarts (CrashLoopBackOff) until PostgreSQL is ready. This is expected during initial cluster bring-up.
- **Local Docker Compose** uses a default password (`local_only_change_me`) — change it for any non-local environment.
- **Terraform EKS** provisions real AWS resources that incur cost; run `terraform destroy` after evaluation.
- **Ingress** requires the nginx ingress controller to be installed in the cluster (enabled by default on Minikube via `minikube addons enable ingress`).

---

## Capstone Submission

See [SUBMISSION.md](SUBMISSION.md) for rubric-wise screenshots
and evidence for modules M1–M10.
