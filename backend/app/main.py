from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app.models import all_models
from app.schemas import user as user_schema
from fastapi.security import OAuth2PasswordRequestForm
from app.crud import user as user_crud
from jose import JWTError, jwt
from app.core.security import SECRET_KEY, ALGORITHM

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

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Find user by email (OAuth2 sends email as 'username')
    user = db.query(all_models.User).filter(all_models.User.email == form_data.username).first()
    
    # 2. Check if user exists and password is correct
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # 3. Create and return the token
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user = db.query(all_models.User).filter(all_models.User.email == email).first()
    return user
