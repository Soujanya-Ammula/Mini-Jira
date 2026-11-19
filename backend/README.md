# Mini Jira Backend API

This is the backend API for the Mini Jira project management system, built using FastAPI, SQLAlchemy, and MySQL.

## Tech Stack
- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Database Driver:** PyMySQL
- **Database:** MySQL
- **Environment Management:** python-dotenv

---

## Project Structure
```text
backend/
├── app/
│   ├── auth/          # Authentication routes & logic
│   ├── database/      # Database session & dotenv setup
│   ├── models/        # SQLAlchemy Models (User, Project, Task, etc.)
│   ├── routers/       # API routers (Dashboard, Projects, Tasks, Users)
│   ├── schemas/       # Pydantic validation schemas
│   └── main.py        # Application entrypoint
├── requirements.txt   # Python package dependencies
└── seed.py            # Script to seed the database with initial data
```

---

## Installation & Setup

### 1. Configure the Environment
Create a `.env` file in either the project root or the `backend/app/database/` directory.

Add your database connection URL (replacing credentials with your own):
```env
DATABASE_URL=mysql+pymysql://root:MySQL@123@localhost:3306/mini_jira_db
```

### 2. Set Up Virtual Environment & Install Dependencies
Initialize and activate the python virtual environment inside the `backend` directory, then install the dependencies:

**On Windows (PowerShell):**
```powershell
# Create venv (if not already created)
python -m venv .venv

# Activate venv
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt email-validator
```

**On Windows (Command Prompt):**
```cmd
# Create venv (if not already created)
python -m venv .venv

# Activate venv
.venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt email-validator
```

**On macOS/Linux:**
```bash
# Create venv (if not already created)
python -m venv .venv

# Activate venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt email-validator
```

### 3. Run the Database Seed (Optional)
If you want to populate your database with initial sample data:
```bash
python seed.py
```

### 4. Start the Server
With the virtual environment activated, run the FastAPI application:
```bash
python -m uvicorn app.main:app --reload
```

---

## API Documentation
Once the server is running, you can access the interactive API docs at:
- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
