from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class ProjectReview(Base):
    __tablename__ = "project_reviews"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    feedback = Column(String(1000), nullable=True)
    status = Column(String(50), default="pending", nullable=False)  # pending, in_progress, approved, changes_requested
    deadline = Column(DateTime, nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    project = relationship("Project", backref="reviews")
    reviewer = relationship("User", backref="reviews")

