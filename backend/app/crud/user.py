from sqlalchemy.orm import Session
from app.models import all_models
from app.schemas import user as user_schema
from app.core import security

def create_user(db: Session, user: user_schema.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = all_models.User(
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
