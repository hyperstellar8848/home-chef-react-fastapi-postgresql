from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from app.database import Base
import datetime

# Many-to-Many  Recipe <-> Ingredient
recipe_ingredients = Table(
    "recipe_ingredients",
    Base.metadata,
    Column("recipe_id", ForeignKey("recipes.id"), primary_key=True),
    Column("ingredient_id", ForeignKey("ingredients.id"), primary_key=True),
    Column("amount", String) 
)

# User Model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    
    # This is the "One" side: One user can have MANY recipes.
    recipes = relationship("Recipe", back_populates="owner")
    meal_plans = relationship("MealPlan", back_populates="user")

# Recipe Model
class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    category = Column(String)
    # FK. This is the physical link in the DB
    owner_id = Column(Integer, ForeignKey("users.id"))
    # THE RELATIONSHIP: This is the Python helper to access data easier
    owner = relationship("User", back_populates="recipes")
    ingredients = relationship("Ingredient", secondary=recipe_ingredients)

    '''The Foreign Key (owner_id): This is the "Real" link in PostgreSQL.
       but The Relationship (recipes / owner): This is for FastAPI;
       It allows you to write code like current_user.recipes to get a list of everything that user cooked, without writing a manual SQL query.
    '''

# Ingredient Model
class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String)

# MealPlan Model
class MealPlan(Base):
    __tablename__ = "meal_plans"
    id = Column(Integer, primary_key=True, index=True)
    # One-to-Many (User & MealPlan): One user has many planned meals. (Linked via user_id).
    user_id = Column(Integer, ForeignKey("users.id"))
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    planned_date = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="meal_plans")
