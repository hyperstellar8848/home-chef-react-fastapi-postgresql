from sqlalchemy.orm import Session
from app.models import all_models
from app.schemas import recipe as recipe_schema

def get_all_recipes(db: Session):
    return db.query(all_models.Recipe).all()

def create_recipe(db: Session, recipe: recipe_schema.RecipeCreate, user_id: int):
    db_recipe = all_models.Recipe(
        title=recipe.title,
        description=recipe.description,
        instructions=recipe.instructions,
        cooking_time=recipe.cooking_time,
        owner_id=user_id
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe
