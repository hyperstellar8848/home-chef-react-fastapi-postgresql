from sqlalchemy.orm import Session
from app.models import all_models
from app.schemas import recipe as recipe_schema

# CREATE
def create_recipe(db: Session, recipe: recipe_schema.RecipeCreate, user_id: int):
    db_recipe = all_models.Recipe(**recipe.model_dump(), owner_id=user_id)
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

# READ 
def get_all_recipes(db: Session, skip: int = 0, limit: int = 100):
    # getting the list of all recepies + being able to limit them (Pagination)
    return db.query(all_models.Recipe).offset(skip).limit(limit).all()

def get_recipe_by_id(db: Session, recipe_id: int):
    return db.query(all_models.Recipe).filter(all_models.Recipe.id == recipe_id).first()

# UPDATE 
def update_recipe(db: Session, recipe_id: int, recipe_update: recipe_schema.RecipeCreate, user_id: int):
    # finding the desired recepie, only if it belongs to this user
    db_recipe = db.query(all_models.Recipe).filter(
        all_models.Recipe.id == recipe_id, 
        all_models.Recipe.owner_id == user_id
    ).first()
    
    if db_recipe:
        # updating fields with new values
        update_data = recipe_update.model_dump()
        for key, value in update_data.items():
            setattr(db_recipe, key, value)
        
        db.commit()
        db.refresh(db_recipe)
    return db_recipe

# DELETE 
def delete_recipe(db: Session, recipe_id: int, user_id: int):
    db_recipe = db.query(all_models.Recipe).filter(
        all_models.Recipe.id == recipe_id, 
        all_models.Recipe.owner_id == user_id
    ).first()
    
    if db_recipe:
        db.delete(db_recipe)
        db.commit()
        return True
    return False
