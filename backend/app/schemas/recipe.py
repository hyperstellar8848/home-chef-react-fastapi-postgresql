from pydantic import BaseModel
from typing import Optional

class RecipeBase(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: str
    cooking_time: int  # in minutes

class RecipeCreate(RecipeBase):
    pass  # This is what we send when creating

class Recipe(RecipeBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True
