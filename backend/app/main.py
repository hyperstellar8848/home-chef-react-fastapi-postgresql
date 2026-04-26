from fastapi import FastAPI
from app.database import engine, Base
from app.models import all_models  # This tells SQLAlchemy to find models

# This command creates all the tables in Postgres database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HomeChef API")

@app.get("/")
def read_root():
    return {"status": "success", "message": "Connected to PostgreSQL!"
