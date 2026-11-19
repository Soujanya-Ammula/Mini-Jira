from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import re

from app.database.session import get_db
from app.models.organization import Organization, Workspace, WorkspaceMember
from app.models.user import User
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationOut,
    WorkspaceBase,
    WorkspaceCreate,
    WorkspaceOut,
    WorkspaceMemberCreate,
    WorkspaceMemberOut,
)
from app.auth.security import get_current_user

router = APIRouter(prefix="/api/organizations", tags=["Organizations & Workspaces"])

def slugify(text: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", slug)

@router.get("", response_model=List[OrganizationOut])
def list_organizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all organizations with their workspaces."""
    orgs = db.query(Organization).all()
    # If no organizations exist yet, create a default FlowTrack organization
    if not orgs:
        default_org = Organization(
            name="FlowTrack Enterprise",
            slug="flowtrack-enterprise",
            description="Default enterprise organization"
        )
        db.add(default_org)
        db.commit()
        db.refresh(default_org)

        default_workspace = Workspace(
            organization_id=default_org.id,
            name="Engineering & Product",
            slug="engineering-product",
            description="Core engineering workspace"
        )
        db.add(default_workspace)
        db.commit()
        db.refresh(default_workspace)

        membership = WorkspaceMember(
            workspace_id=default_workspace.id,
            user_id=current_user.id,
            role="super_admin" if current_user.role == "admin" else current_user.role
        )
        db.add(membership)
        db.commit()
        orgs = [default_org]

    return orgs

@router.post("", response_model=OrganizationOut, status_code=status.HTTP_201_CREATED)
def create_organization(
    org_in: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new organization and default workspace."""
    slug = org_in.slug or slugify(org_in.name)
    existing = db.query(Organization).filter(Organization.slug == slug).first()
    if existing:
        slug = f"{slug}-{db.query(Organization).count() + 1}"

    org = Organization(name=org_in.name, slug=slug, description=org_in.description)
    db.add(org)
    db.commit()
    db.refresh(org)

    # Automatically create a default General workspace
    workspace = Workspace(
        organization_id=org.id,
        name="General Workspace",
        slug=f"{slug}-general",
        description=f"Primary workspace for {org.name}"
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    # Add creator as workspace admin
    membership = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=current_user.id,
        role="org_admin"
    )
    db.add(membership)
    db.commit()

    return org

@router.get("/{org_id}/workspaces", response_model=List[WorkspaceOut])
def list_workspaces(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspaces = db.query(Workspace).filter(Workspace.organization_id == org_id).all()
    for ws in workspaces:
        ws.member_count = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == ws.id).count()
    return workspaces

@router.post("/{org_id}/workspaces", response_model=WorkspaceOut, status_code=status.HTTP_201_CREATED)
def create_workspace(
    org_id: int,
    ws_in: WorkspaceBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    slug = ws_in.slug or slugify(ws_in.name)
    ws = Workspace(
        organization_id=org_id,
        name=ws_in.name,
        slug=slug,
        description=ws_in.description
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    # Add creator as workspace admin
    membership = WorkspaceMember(
        workspace_id=ws.id,
        user_id=current_user.id,
        role="workspace_admin"
    )
    db.add(membership)
    db.commit()
    ws.member_count = 1
    return ws

@router.get("/workspaces/{ws_id}/members", response_model=List[WorkspaceMemberOut])
def list_workspace_members(
    ws_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    members = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == ws_id).all()
    out = []
    for m in members:
        user = db.query(User).filter(User.id == m.user_id).first()
        out.append(WorkspaceMemberOut(
            id=m.id,
            workspace_id=m.workspace_id,
            user_id=m.user_id,
            role=m.role,
            is_active=m.is_active,
            joined_at=m.joined_at,
            user_email=user.email if user else None,
            user_name=user.full_name if user else None
        ))
    return out

