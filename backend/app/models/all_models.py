from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Table, Text
from sqlalchemy.orm import relationship
from app.database import Base
import datetime

# Many-to-Many Recipe <-> Ingredient
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
    
    recipes = relationship("Recipe", back_populates="owner")
    meal_plans = relationship("MealPlan", back_populates="user")

# Recipe Model
class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    instructions = Column(Text)
    cooking_time = Column(Integer)
    is_approved = Column(Boolean, default=False)
    category = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="recipes")
    ingredients = relationship("Ingredient", secondary=recipe_ingredients)

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
    user_id = Column(Integer, ForeignKey("users.id"))
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    planned_date = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="meal_plans")

# Support Message Model (برای ارتباط با ادمین)
class SupportMessage(Base):
    __tablename__ = "support_messages"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False)
    content = Column(Text, nullable=False) # متن پیام کاربر
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
