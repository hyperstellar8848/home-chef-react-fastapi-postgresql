from sqlalchemy.orm import Session
from app.models import all_models
from app.schemas import user as user_schema
from app.core import security

def create_user(db: Session, user: user_schema.UserCreate):
    # 1. Hash the password
    hashed_password = security.get_password_hash(user.password)
    
    # 2. Create the Database object
    db_user = all_models.User(
        email=user.email,
        hashed_password=hashed_password,
        is_admin=False # Default to regular user
    )
    
    # 3. Save to Postgres
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
