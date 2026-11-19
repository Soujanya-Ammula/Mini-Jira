from app.database.session import Base, engine, SessionLocal
from app.models.user import User
from app.auth.security import get_password_hash

def seed_db():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        users_to_seed = [
            {
                "email": "admin@mini-jira.com",
                "full_name": "System Admin",
                "role": "admin"
            },
            {
                "email": "dev@mini-jira.com",
                "full_name": "Alice Developer",
                "role": "developer"
            },
            {
                "email": "manager@mini-jira.com",
                "full_name": "Bob Manager",
                "role": "manager"
            }
        ]
        for user_data in users_to_seed:
            user = db.query(User).filter(User.email == user_data["email"]).first()
            if not user:
                print(f"Creating {user_data['role']} user ({user_data['email']})...")
                new_user = User(
                    email=user_data["email"],
                    hashed_password=get_password_hash("password123"),
                    full_name=user_data["full_name"],
                    role=user_data["role"],
                    is_active=True
                )
                db.add(new_user)
        db.commit()
        print("Database successfully seeded.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
