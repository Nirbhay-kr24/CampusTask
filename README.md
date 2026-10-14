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
