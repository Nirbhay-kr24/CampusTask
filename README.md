# CampusTask — Student Assignment & Project Tracker

Beginner-friendly DevOps capstone using React + Vite, FastAPI, PostgreSQL, SQLAlchemy, Alembic, Pytest and Docker Compose.

## Run it
Install Docker Desktop and start Docker. From this directory run:

```bash
docker compose up --build
```

Open http://localhost:8080 (app), http://localhost:8000/docs (API), http://localhost:8000/health, http://localhost:8000/ready and http://localhost:8000/metrics.

Stop with `docker compose down`. To also delete local database data, run `docker compose down -v` (destructive).

## Tests
With Python 3.11+ installed:
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\Activate.ps1
# WSL/Linux: source .venv/bin/activate
pip install -r requirements.txt
pytest -v
```
Tests use an isolated in-memory SQLite database; they do not need PostgreSQL.

## API
- `GET /api/tasks` (optional `status` and `search`)
- `POST /api/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `GET /api/tasks/stats`
- `GET /health`, `GET /ready`, `GET /metrics`

Statuses are `todo`, `in_progress`, and `completed`.

## Course learning path
1. DevOps and microservices: frontend, API, database boundaries.
2. Linux: navigate files, inspect processes/logs, use `curl`, `grep`, `tail`.
3. Shell scripting: automate tests and health checks.
4. Networking: ports, HTTP, DNS and service-to-service traffic.
5. Git/GitHub: branches, pull requests, meaningful commits, `.gitignore`.
6. Docker fundamentals: build/run/log/inspect containers.
7. Dockerfiles: layers, caching, multi-stage build and non-root users.
8. Docker networking, volumes and Compose: inspect network and persistent DB volume.
9. Kubernetes fundamentals: Minikube, nodes and namespaces.
10. Pods, ReplicaSets and Deployments: run frontend/backend with 2+ replicas.
11. Kubernetes Services: ClusterIP service discovery.
12. Ingress, ConfigMaps, Secrets: route `/` and `/api`, separate config from secrets.
13. Storage, HPA and probes: persistent storage, readiness/liveness and autoscaling.
14. Kubernetes sessions 6–8: rollout, scaling and troubleshooting exercises (match exact activities to course notes).
15. Helm: package Kubernetes manifests into a chart.
16. GitHub Actions: test and build on push/pull request.
17. CI/CD and DevSecOps: publish SHA-tagged images to GHCR and scan both with Trivy.
18. Terraform: fmt, validate, plan, apply, destroy.
19. Cloud/Terraform: AWS VPC with at least two public subnets and EKS worker nodes for the capstone.
20. Monitoring/observability/GitOps: Prometheus metrics, Grafana panels, GitOps reconciliation concepts.
21. Final capstone: documentation, evidence and commit → pipeline → deployment demo.

## Rubric checklist
- [ ] M1 Application: frontend, backend, PostgreSQL, CRUD
- [ ] M2 Testing: 5+ tests and isolated test DB
- [ ] M3 GitHub: public repository, 10 meaningful commits, `.gitignore`
- [ ] M4 Docker: backend Dockerfile, multi-stage frontend Dockerfile, non-root users, Compose
- [ ] M5 CI/CD: GitHub Actions, tests, image builds, GHCR, SHA tags
- [ ] M6 Trivy: scan both images and fail on high/critical findings
- [ ] M7 Terraform: VPC, 2 public subnets, EKS node group, example tfvars without credentials
- [ ] M8 Kubernetes/Helm: namespace, chart, 2+ replicas per app tier, ClusterIP services, Ingress
- [ ] M9 Observability: application metrics, Prometheus and Grafana panel
- [ ] M10 Docs/demo: README, evidence and live deployment update

This starter is the app foundation. We'll add Kubernetes, Helm, CI/CD, AWS, and monitoring assets in separate learning milestones so each part is understandable. AWS EKS and networking can cost money; create them only when ready and destroy them after evaluation. Never commit real credentials.

## Kubernetes + Helm Deployment

Deploy with Helm:

```bash
helm upgrade --install campustask ./helm/campustask \
  --namespace campustask \
  --create-namespace
```

Verify pods are running:

```bash
kubectl get pods -n campustask
kubectl get svc -n campustask
helm list -n campustask
```

The Helm chart deploys backend (2 replicas), frontend (2 replicas), and
postgres (1 replica with PVC). An Ingress resource routes `/api` to the
backend service and `/` to the frontend service.

## Terraform AWS Infrastructure

Provision AWS VPC and EKS with Terraform:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your settings
terraform init
terraform plan
terraform apply
```

This creates a VPC with two public subnets, an EKS cluster, and a managed
worker node group. After apply, configure kubectl:

```bash
aws eks update-kubeconfig --region ap-south-1 --name campustask
```

Destroy when finished:

```bash
terraform destroy
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push to `main`:

1. **Backend Tests** — runs pytest in the backend directory
2. **Docker Build and Trivy Scan** — builds backend and frontend images,
   scans both with Trivy (fails on HIGH/CRITICAL CVEs)
3. **Publish Images to GHCR** — builds and pushes images to GitHub Container
   Registry tagged with `:latest` and the git commit SHA

## Observability

Prometheus scrapes the backend `/metrics` endpoint. Grafana is configured
with Prometheus as a datasource. Deploy with:

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

## Architecture

```text
Developer → Git/GitHub → GitHub Actions (pytest → Trivy → GHCR)
                                              ↓
                                        Terraform
                                              ↓
                                         AWS VPC + EKS
                                              ↓
                                           Helm
                                              ↓
                    +-----------------------+-----------------------+
                    |                                                   |
               Frontend (2 replicas)                            Backend (2 replicas)
                  React + Nginx                                  FastAPI + Uvicorn
                    |                                                   |
                    +-----------------------+-----------------------+
                                            |
                                       PostgreSQL (PVC)
                                            |
                                    Prometheus → Grafana
```
