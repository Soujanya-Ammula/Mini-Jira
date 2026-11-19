from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.review import ProjectReview
from app.models.project import Project
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse
from app.auth.security import RoleChecker, get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Project Reviews"])

@router.get("", response_model=List[ReviewResponse])
def get_reviews(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ProjectReview)
    if project_id is not None:
        query = query.filter(ProjectReview.project_id == project_id)
    return query.order_by(ProjectReview.deadline.asc()).all()

@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(ProjectReview).filter(ProjectReview.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found."
        )
    return review

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only managers and admins can create/schedule a project review
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and administrators are authorized to schedule project reviews."
        )

    # Verify project exists
    project = db.query(Project).filter(Project.id == review_in.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Linked project not found."
        )

    # Verify reviewer exists if assigned
    if review_in.reviewer_id is not None:
        reviewer = db.query(User).filter(User.id == review_in.reviewer_id).first()
        if not reviewer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned reviewer not found."
            )

    review = ProjectReview(
        project_id=review_in.project_id,
        title=review_in.title,
        feedback=review_in.feedback,
        status=review_in.status.lower(),
        deadline=review_in.deadline,
        reviewer_id=review_in.reviewer_id
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    review_in: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(ProjectReview).filter(ProjectReview.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found."
        )

    # If updating deadline or title, restrict to managers/admins
    if ("deadline" in review_in.model_fields_set or "title" in review_in.model_fields_set):
        if current_user.role not in ["admin", "manager"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only managers and administrators are authorized to modify review titles or deadlines."
            )

    if review_in.title is not None:
        review.title = review_in.title
    if review_in.feedback is not None:
        review.feedback = review_in.feedback
    if review_in.status is not None:
        review.status = review_in.status.lower()
    if "deadline" in review_in.model_fields_set and review_in.deadline is not None:
        review.deadline = review_in.deadline
    if "reviewer_id" in review_in.model_fields_set:
        review.reviewer_id = review_in.reviewer_id

    db.commit()
    db.refresh(review)
    return review

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"]))
):
    review = db.query(ProjectReview).filter(ProjectReview.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found."
        )
    db.delete(review)
    db.commit()
    return None

