from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.auth.security import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_projects = db.query(Project).count()
    active_tasks = db.query(Task).filter(Task.status != "done").count()
    team_size = db.query(User).filter(User.is_active == True).count()
    
    # Task status breakdown
    todo_count = db.query(Task).filter(Task.status == "todo").count()
    in_progress_count = db.query(Task).filter(Task.status == "in_progress").count()
    done_count = db.query(Task).filter(Task.status == "done").count()
    
    return {
        "total_projects": total_projects,
        "active_tasks": active_tasks,
        "team_size": team_size,
        "todo_tasks": todo_count,
        "in_progress_tasks": in_progress_count,
        "done_tasks": done_count
    }
