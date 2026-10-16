# CampusTask - Capstone Submission

This document presents evidence for the CampusTask capstone project, organized by module.

## Repository Structure

```text
CampusTask/
├── .github/
│   └── workflows/
│       └── devsecops.yml
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── migrations/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── tests/
│   ├── .dockerignore
│   ├── alembic.ini
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
├── helm/
│   └── campustask/
│       ├── templates/
│       │   ├── backend.yaml
│       │   ├── frontend.yaml
│       │   ├── ingress.yaml
│       │   └── postgres.yaml
│       ├── Chart.yaml
│       └── values.yaml
├── k8s/
│   ├── backend.yaml
│   ├── configmap.yaml
│   ├── frontend.yaml
│   ├── namespace.yaml
│   └── postgres.yaml
├── monitoring/
│   ├── campustask-servicemonitor.yaml
│   ├── grafana-values.yaml
│   └── prometheus-values.yaml
├── terraform/
│   ├── main.tf
│   ├── terraform.tfvars.example
│   ├── terraform.tfstate
│   ├── terraform.tfstate.backup
│   ├── terraform.tfstate.lock.info
│   ├── terraform.lock.hcl
│   └── values.yaml
├── .gitignore
├── .trivyignore
├── compose.yaml
├── README.md
├── CampusTask.md
└── SUBMISSION.md
```

### Key Components

- **Backend:** FastAPI application, database models, schemas, migrations, and automated tests.
- **Frontend:** User interface for managing student assignments and tracking progress.
- **Docker Compose:** Runs the application services locally.
- **Kubernetes:** Deployment and configuration manifests.
- **Helm:** Packages the application resources for Kubernetes deployments.
- **Terraform:** Defines AWS infrastructure as code.
- **Monitoring:** Prometheus metrics collection and Grafana dashboards.
- **GitHub Actions:** Automates testing, security analysis, container builds, image scanning, and publishing.


## M1 - Application and API

### Frontend Dashboard

<img width="1911" height="960" alt="2" src="https://github.com/user-attachments/assets/82f00fca-2bad-4214-9cb8-3df368ca5b9d" />


### API Health Endpoint

<img width="1910" height="983" alt="3" src="https://github.com/user-attachments/assets/d1cd74ac-9e36-41a4-ad49-5d926b64e539" />


### API Readiness and Database Connection
<img width="1911" height="998" alt="5" src="https://github.com/user-attachments/assets/c2625d7f-1e5e-40d8-a93f-78290c886054" />


### Swagger UI Health Endpoint Response

<img width="1910" height="1044" alt="10" src="https://github.com/user-attachments/assets/ded20924-4ab1-4b7c-b300-0087cb5e75c2" />


###  Swagger UI API Endpoint Overview

<img width="1911" height="1046" alt="12" src="https://github.com/user-attachments/assets/8feebda1-c30b-40d4-a39d-8e58b25b3728" />


---

## M2 - Automated Tests

### Pytest Results

<img width="977" height="574" alt="1" src="https://github.com/user-attachments/assets/927ab3bb-2d33-402c-a375-8ee9437e1f15" />


---

## M3 - Source Control and Git History

### Git History and Commit Count

The terminal output shows **31 commits** on `origin/main`.

<img width="1566" height="391" alt="31" src="https://github.com/user-attachments/assets/a87dbb06-e3b0-4522-8809-0650f7310948" />


### GitHub Commit History

<img width="1908" height="925" alt="30" src="https://github.com/user-attachments/assets/47a7707e-8391-4cfa-aae8-f81987be7391" />


---

## M4 - Docker and Dependency Verification

### Starlette Version Check

Shows the Starlette version inside the backend container.

<img width="924" height="103" alt="7" src="https://github.com/user-attachments/assets/c60051fa-c216-465d-9f78-9dff70fb4df1" />


### Kubernetes Service Listing

Supporting evidence of the application's Kubernetes services.

<img width="1552" height="588" alt="13" src="https://github.com/user-attachments/assets/f5dcfb9a-8c4b-46e9-831c-a5e37abf17ba" />


---

## M5 - CI/CD and Container Registry

### GitHub Actions Pipeline

The workflow shows successful Unit Tests, SAST/CodeQL, Docker Build, Trivy image scan, and Docker Hub push jobs.

<img width="1908" height="928" alt="20" src="https://github.com/user-attachments/assets/908333a7-8788-46e6-8de8-2ae010d82208" />


### Docker Hub Repositories

<img width="1915" height="928" alt="24" src="https://github.com/user-attachments/assets/c8a78e70-95f0-4af9-a881-bdcf14b29a8f" />


---

## M6 - Security Scanning

### SAST and Trivy Pipeline Stages

This screenshot demonstrates that the security-related pipeline stages succeeded in the displayed run. It does not show detailed scan findings.

### SAST
<img width="1911" height="924" alt="image" src="https://github.com/user-attachments/assets/721e7847-ae46-41e8-a003-63b03875219a" />

### Trivy
<img width="1904" height="925" alt="image" src="https://github.com/user-attachments/assets/2a309012-1ce3-4dac-a89b-0f99999c2128" />



---

## M7 - Terraform and AWS Infrastructure as Code

### Terraform Init, Validate, and Plan

<img width="1564" height="915" alt="17" src="https://github.com/user-attachments/assets/9bff1a70-19c1-45ba-98f3-e6b9c823663c" />


### Terraform Apply in Progress

This screenshot shows the apply operation in progress.

<img width="1569" height="918" alt="18" src="https://github.com/user-attachments/assets/070bfe26-859c-4bce-bb95-f73e588eca0c" />


###  Terraform Apply Complete

<img width="1568" height="913" alt="19" src="https://github.com/user-attachments/assets/a272c2ec-f305-4274-a344-e62b52b98ebe" />


### Terraform Destroy in Progress

<img width="1566" height="910" alt="22" src="https://github.com/user-attachments/assets/fb5e1026-a9b0-4338-bdb2-2359927e037a" />


### Terraform Destroy Complete

The output reports **15 resources destroyed**.

<img width="1571" height="885" alt="23" src="https://github.com/user-attachments/assets/94efb00c-853e-466e-b1f6-5f72a0fa1a68" />


---

## M8 - Kubernetes, Helm, Services, and Ingress

### Pods, Services, and Helm Release

<img width="1554" height="372" alt="6" src="https://github.com/user-attachments/assets/52d55202-1f69-4b54-a8b4-40b17f425d04" />


### CampusTask Pods Running

<img width="910" height="199" alt="11" src="https://github.com/user-attachments/assets/5c32d06d-dcb9-48de-8d66-406d8d92ea15" />


### Git Status, Deployments, Services, and Helm

<img width="1552" height="588" alt="13" src="https://github.com/user-attachments/assets/658d8eba-817c-4774-a52b-2ed55998d2a5" />


### Ingress Resource

<img width="928" height="199" alt="21" src="https://github.com/user-attachments/assets/5f063f80-deab-4adf-af07-e401815b1db2" />


### Pods Across Kubernetes Namespaces


<img width="1567" height="552" alt="25" src="https://github.com/user-attachments/assets/742cc8b2-0d98-4ec7-ad72-8cb69d9fa746" />


### Helm Releases, Deployments, Services, and Ingress

<img width="1570" height="377" alt="26" src="https://github.com/user-attachments/assets/ad00652f-1fd8-477e-8f52-e091c8c38118" />


### Service Endpoints and Ingress Routing

<img width="1558" height="208" alt="28" src="https://github.com/user-attachments/assets/a8d15c8b-54c5-4737-9857-68b287b025bb" />



---

## M9 - Observability with Prometheus and Grafana

### Application Metrics Endpoint

<img width="1920" height="1043" alt="4" src="https://github.com/user-attachments/assets/77e5c1c5-5d7d-4e2d-9ab6-eb14e4556432" />


### Prometheus Targets

The backend targets are shown as **UP**.

<img width="1202" height="291" alt="14" src="https://github.com/user-attachments/assets/70cb398a-9635-4cf6-96b5-e9cc47b30419" />


### Grafana CampusTask Monitoring Dashboard

<img width="1916" height="962" alt="15" src="https://github.com/user-attachments/assets/173c352a-6c7e-4b68-8597-15e5deb14e1a" />


### Prometheus Metric Queries

<img width="1914" height="958" alt="16" src="https://github.com/user-attachments/assets/4a38b1f5-e7bb-49cd-9dab-f08f7db0816b" />


### Metrics Endpoint Returns HTTP 200

<img width="1551" height="901" alt="29" src="https://github.com/user-attachments/assets/2dfdaf8f-10d9-4399-9574-06025dc74fe2" />

---

## M10 - Final Presentation + Documentation

### Project Presentation

The final project presentation is available in the `demo/` directory.

- `demo/` — Contains the project presentation and demo material.

### Project Documentation

- `evidence.md` — Capstone submission evidence organized by module.

These files provide supporting documentation and presentation material for the CampusTask capstone project.

