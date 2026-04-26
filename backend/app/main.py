from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app.models import all_models
from app.schemas import user as user_schema
from app.crud import user as user_crud

# This command creates all the tables in the Postgres database automatically
all_models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HomeChef API")

@app.get("/")
def read_root():
    return {"status": "success", "message": "Connected to PostgreSQL!"}

# USER REGISTRATION 
@app.post("/register", response_model=user_schema.User)
def register_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    # First, check if the email already exists to prevent duplicates
    db_user = db.query(all_models.User).filter(all_models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Use the CRUD function to hash the password and save to Postgres
    return user_crud.create_user(db=db, user=user)
