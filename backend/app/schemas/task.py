from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse

class TaskBase(BaseModel):
    title: str = Field(..., min_length=2)
    description: Optional[str] = None
    status: str = "todo"  # todo, in_progress, done
    priority: str = "medium"  # low, medium, high
    project_id: int
    assignee_id: Optional[int] = None
    deadline: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[int] = None
    deadline: Optional[datetime] = None

class TaskProjectInfo(BaseModel):
    id: int
    name: str
    key: str

    class Config:
        from_attributes = True

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    deadline: Optional[datetime] = None
    assignee: Optional[UserResponse] = None
    project: TaskProjectInfo

    class Config:
        from_attributes = True
