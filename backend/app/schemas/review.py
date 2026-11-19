from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse

class ReviewBase(BaseModel):
    title: str = Field(..., min_length=2)
    feedback: Optional[str] = None
    status: str = "pending"  # pending, in_progress, approved, changes_requested
    deadline: datetime
    project_id: int
    reviewer_id: Optional[int] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    title: Optional[str] = None
    feedback: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None
    reviewer_id: Optional[int] = None

class ReviewResponse(ReviewBase):
    id: int
    created_at: datetime
    reviewer: Optional[UserResponse] = None

    class Config:
        from_attributes = True

