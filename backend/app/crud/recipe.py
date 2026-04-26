from sqlalchemy.orm import Session
from app.models import all_models
from app.schemas import recipe as recipe_schema

def create_user_recipe(db: Session, recipe: recipe_schema.RecipeCreate, user_id: int):
    db_recipe = all_models.Recipe(**recipe.model_dump(), owner_id=user_id)
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

def get_recipes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(all_models.Recipe).offset(skip).limit(limit).all()
