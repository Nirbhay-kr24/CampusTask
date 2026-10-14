from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field
from .models import TaskStatus

class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    course: str = Field(default="General", min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=2000)
    due_date: date | None = None
    status: TaskStatus = TaskStatus.todo

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    pass

class TaskRead(TaskBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime

class TaskStats(BaseModel):
    total: int
    todo: int
    in_progress: int
    completed: int
    overdue: int
