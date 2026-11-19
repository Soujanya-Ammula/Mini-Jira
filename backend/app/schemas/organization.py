from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Workspace Member schemas
class WorkspaceMemberBase(BaseModel):
    user_id: int
    role: str = "developer"

class WorkspaceMemberCreate(WorkspaceMemberBase):
    pass

class WorkspaceMemberOut(BaseModel):
    id: int
    workspace_id: int
    user_id: int
    role: str
    is_active: bool
    joined_at: datetime
    user_email: Optional[str] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

# Workspace schemas
class WorkspaceBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    slug: Optional[str] = None
    description: Optional[str] = None

class WorkspaceCreate(WorkspaceBase):
    organization_id: int

class WorkspaceOut(WorkspaceBase):
    id: int
    organization_id: int
    created_at: datetime
    member_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Organization schemas
class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    slug: Optional[str] = None
    description: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationOut(OrganizationBase):
    id: int
    created_at: datetime
    workspaces: List[WorkspaceOut] = []

    class Config:
        from_attributes = True

