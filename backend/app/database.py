from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# This loads the variables from .env file
load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# The engine is the bridge to the DB
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# This creates a Session which is what we use to talk to my DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This is the base class that all my models will inherit from
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
