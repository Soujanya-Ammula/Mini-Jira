from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    key = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(1000), nullable=True)
    category = Column(String(100), default="Software", nullable=False)
    status = Column(String(50), default="active", nullable=False) # active, completed, on_hold, archived
    priority = Column(String(50), default="medium", nullable=False) # low, medium, high, critical
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner = relationship("User", backref="projects")
    workspace = relationship("Workspace", backref="projects")
