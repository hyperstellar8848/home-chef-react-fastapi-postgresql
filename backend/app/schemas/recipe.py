from pydantic import BaseModel

class RecipeBase(BaseModel):
    title: str
    description: str
    instructions: str
    cooking_time: int

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True
