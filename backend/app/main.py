from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app.models import all_models
from app.schemas import user as user_schema
from fastapi.security import OAuth2PasswordRequestForm
from app.crud import user as user_crud
from jose import JWTError, jwt
from app.core.security import SECRET_KEY, ALGORITHM
from app.crud import recipe as recipe_crud
from app.schemas import recipe as recipe_schema

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

# CREATE RECIPE
@app.post("/recipes/", response_model=recipe_schema.Recipe)
def create_recipe(recipe: recipe_schema.RecipeCreate, db: Session = Depends(get_db), current_user: all_models.User = Depends(get_current_user)):
    return recipe_crud.create_recipe(db=db, recipe=recipe, user_id=current_user.id)

# GET ALL RECIPES
@app.get("/recipes/", response_model=list[recipe_schema.Recipe])
def read_recipes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return recipe_crud.get_all_recipes(db, skip=skip, limit=limit)

# DELETE RECIPE
@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db), current_user: all_models.User = Depends(get_current_user)):
    success = recipe_crud.delete_recipe(db, recipe_id=recipe_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Recipe not found or unauthorized")
    return {"message": "Recipe deleted successfully"}

@app.put("/recipes/{recipe_id}", response_model=recipe_schema.Recipe)
def update_recipe(recipe_id: int, recipe: recipe_schema.RecipeCreate, db: Session = Depends(get_db), current_user: all_models.User = Depends(get_current_user)):
    updated_recipe = recipe_crud.update_recipe(db, recipe_id=recipe_id, recipe_update=recipe, user_id=current_user.id)
    if not updated_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found or unauthorized")
    return updated_recipe
