from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database.session import Base, engine
from app.auth.router import router as auth_router
from app.routers.users import router as users_router
from app.routers.projects import router as projects_router
from app.routers.tasks import router as tasks_router
from app.routers.dashboard import router as dashboard_router
from app.routers.reviews import router as reviews_router
from app.routers.organizations import router as organizations_router

# Import models to ensure they are created on startup
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.models.review import ProjectReview
from app.models.organization import Organization, Workspace, WorkspaceMember

# Create database tables (mainly useful for development with SQLite)
Base.metadata.create_all(bind=engine)

# Auto-migrate schema changes (ensure deadline column exists on tasks & project_reviews table exists)
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN deadline DATETIME NULL"))
        conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS project_reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                feedback VARCHAR(1000) NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                deadline DATETIME NOT NULL,
                reviewer_id INT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
            )
        """))
        conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE projects ADD COLUMN workspace_id INT NULL"))
        conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE projects ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'Software'"))
        conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE projects ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active'"))
        conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE projects ADD COLUMN priority VARCHAR(50) NOT NULL DEFAULT 'medium'"))
        conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE projects ADD COLUMN start_date DATETIME NULL"))
        conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE projects ADD COLUMN end_date DATETIME NULL"))
        conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE projects ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
        conn.commit()
except Exception:
    pass

app = FastAPI(
    title="Mini Jira API",
    description="Enterprise Project Management System API",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(projects_router)
app.include_router(tasks_router)
app.include_router(dashboard_router)
app.include_router(reviews_router)
app.include_router(organizations_router)





# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
)

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the Mini Jira API! Visit /docs for the API documentation."}

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Mini Jira API",
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
