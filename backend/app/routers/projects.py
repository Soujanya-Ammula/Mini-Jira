from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import re

from app.database.session import get_db
from app.models.project import Project
from app.models.organization import Workspace
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.auth.security import RoleChecker, get_current_user

router = APIRouter(prefix="/api/projects", tags=["Projects Management"])

def generate_project_key(name: str, db: Session) -> str:
    # Generate clean acronym or 3-4 letters
    words = re.findall(r"[A-Za-z0-9]+", name)
    if len(words) >= 3:
        base_key = "".join(w[0] for w in words[:4]).upper()
    elif len(words) == 2:
        base_key = (words[0][:2] + words[1][:2]).upper()
    elif words:
        base_key = words[0][:3].upper() if len(words[0]) >= 3 else words[0].upper().ljust(3, "X")
    else:
        base_key = "PRJ"

    candidate = base_key
    counter = 1
    while db.query(Project).filter(Project.key == candidate).first():
        candidate = f"{base_key}{counter}"
        counter += 1
    return candidate

@router.get("", response_model=List[ProjectResponse])
def get_projects(
    workspace_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Project)
    if workspace_id:
        query = query.filter((Project.workspace_id == workspace_id) | (Project.workspace_id.is_(None)))
    if status_filter:
        query = query.filter(Project.status == status_filter)
    return query.order_by(Project.created_at.desc()).all()

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found."
        )
    return project

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"]))
):
    owner = db.query(User).filter(User.id == project_in.owner_id).first()
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project owner user not found."
        )

    # Key generation or validation
    if project_in.key:
        final_key = project_in.key.strip().upper()
        existing = db.query(Project).filter(Project.key == final_key).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A project with key '{final_key}' already exists."
            )
    else:
        final_key = generate_project_key(project_in.name, db)

    # Attach to first workspace if not provided
    ws_id = project_in.workspace_id
    if not ws_id:
        first_ws = db.query(Workspace).first()
        ws_id = first_ws.id if first_ws else None

    project = Project(
        name=project_in.name,
        key=final_key,
        description=project_in.description,
        category=project_in.category or "Software",
        status=project_in.status or "active",
        priority=project_in.priority or "medium",
        workspace_id=ws_id,
        start_date=project_in.start_date,
        end_date=project_in.end_date,
        owner_id=project_in.owner_id
    )

    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"]))
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found."
        )

    update_data = project_in.dict(exclude_unset=True)
    if "key" in update_data and update_data["key"]:
        new_key = update_data["key"].strip().upper()
        if new_key != project.key:
            existing = db.query(Project).filter(Project.key == new_key).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Key '{new_key}' is already in use by another project."
                )
            update_data["key"] = new_key

    for key, value in update_data.items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"]))
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found."
        )
    db.delete(project)
    db.commit()
    return None
