import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables
load_dotenv()

# Check for DATABASE_URL in environment (Render PostgreSQL / Cloud DB / Local)
DATABASE_URL = os.getenv("DATABASE_URL")

# On Render or any Linux host, if DATABASE_URL contains localhost, avoid connection refused
is_render = os.getenv("RENDER") is not None
if is_render and (not DATABASE_URL or "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL):
    DATABASE_URL = "sqlite:///./minijira.db"

# Handle Render's postgres:// prefix which needs to be postgresql:// for SQLAlchemy
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Fallback for development if not provided
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./minijira.db"

# SQLite requires check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()