import time
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

# پچ پایتون 3.13
if not hasattr(time, 'clock'):
    time.clock = time.perf_counter

from app.database import SessionLocal, engine
from app.models import all_models
from app.schemas import user as user_schema
from app.crud import user as user_crud

# ایجاد جداول
all_models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# تنظیمات دقیق CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# نمایش خطای واقعی به جای خطای CORS الکی
@app.exception_handler(Exception)
async def debug_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "Server Error", "detail": str(exc)},
    )

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register", response_model=user_schema.User)
def register(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(all_models.User).filter(all_models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="این ایمیل قبلاً ثبت شده است")
    return user_crud.create_user(db=db, user=user)
