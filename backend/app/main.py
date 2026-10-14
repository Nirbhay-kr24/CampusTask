import os
from datetime import date
from fastapi import Depends, FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session
from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST
from .database import get_db
from .models import Task, TaskStatus
from .schemas import TaskCreate, TaskRead, TaskStats, TaskUpdate

app = FastAPI(title="CampusTask API", version="0.1.0")
origins = [v.strip() for v in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:8080").split(",") if v.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False, allow_methods=["*"], allow_headers=["*"])
OPERATIONS = Counter("campustask_operations_total", "Number of successful task operations", ["operation"])

@app.get("/")
def root():
    return {"service": "CampusTask API", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready(db: Session = Depends(get_db)):
    try:
        db.execute(select(1))
        return {"status": "ready", "database": "connected"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database is not ready") from exc

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/api/tasks", response_model=list[TaskRead])
def list_tasks(status: TaskStatus | None = None, search: str | None = Query(default=None, max_length=160), db: Session = Depends(get_db)):
    stmt = select(Task).order_by(Task.due_date.is_(None), Task.due_date, Task.id.desc())
    if status:
        stmt = stmt.where(Task.status == status)
    if search:
        pattern = f"%{search.strip()}%"
        stmt = stmt.where(Task.title.ilike(pattern) | Task.course.ilike(pattern))
    return list(db.scalars(stmt).all())

@app.post("/api/tasks", response_model=TaskRead, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(**payload.model_dump())
    db.add(task); db.commit(); db.refresh(task)
    OPERATIONS.labels(operation="create").inc()
    return task

@app.get("/api/tasks/stats", response_model=TaskStats)
def task_stats(db: Session = Depends(get_db)):
    tasks = list(db.scalars(select(Task)).all())
    today = date.today()
    return {"total": len(tasks), "todo": sum(t.status == TaskStatus.todo for t in tasks),
            "in_progress": sum(t.status == TaskStatus.in_progress for t in tasks),
            "completed": sum(t.status == TaskStatus.completed for t in tasks),
            "overdue": sum(t.due_date is not None and t.due_date < today and t.status != TaskStatus.completed for t in tasks)}

@app.get("/api/tasks/{task_id}", response_model=TaskRead)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if task is None: raise HTTPException(status_code=404, detail="Assignment not found")
    return task

@app.put("/api/tasks/{task_id}", response_model=TaskRead)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if task is None: raise HTTPException(status_code=404, detail="Assignment not found")
    for key, value in payload.model_dump().items(): setattr(task, key, value)
    db.commit(); db.refresh(task)
    OPERATIONS.labels(operation="update").inc()
    return task

@app.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if task is None: raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(task); db.commit()
    OPERATIONS.labels(operation="delete").inc()
    return Response(status_code=204)
