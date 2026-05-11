import time
from fastapi import FastAPI, Depends, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import List

# پچ پایتون 3.13
if not hasattr(time, 'clock'):
    time.clock = time.perf_counter

from app.database import SessionLocal, engine
from app.models import all_models
from app.schemas import user as user_schema
from app.crud import user as user_crud
from app.core import security 

# ایجاد جداول
all_models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# --- AUTHENTICATION ---

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(all_models.User).filter(all_models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="ایمیل یا رمز عبور اشتباه است",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register", response_model=user_schema.User)
def register(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(all_models.User).filter(all_models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="این ایمیل قبلاً ثبت شده است")
    return user_crud.create_user(db=db, user=user)

# --- INGREDIENTS (جستجو و مدیریت مواد اولیه) ---

@app.get("/ingredients")
def search_ingredients(q: str = Query(None), db: Session = Depends(get_db)):
    # اگر q پر باشد، بر اساس نام جستجو می‌کند، در غیر این صورت همه را برمی‌گرداند
    query = db.query(all_models.Ingredient)
    if q:
        query = query.filter(all_models.Ingredient.name.contains(q))
    return query.all()

@app.post("/admin/ingredients")
def add_ingredient(name: str, category: str = None, db: Session = Depends(get_db)):
    # مخصوص ادمین برای اضافه کردن مواد اولیه جدید
    new_ing = all_models.Ingredient(name=name, category=category)
    db.add(new_ing)
    db.commit()
    db.refresh(new_ing)
    return new_ing

# --- RECIPES (مدیریت دستور پخت) ---

# ۱. دریافت دستورهای پخت (فقط آن‌هایی که ادمین تایید کرده است)
@app.get("/recipes")
def get_approved_recipes(db: Session = Depends(get_db)):
    # فقط دستورهایی را برمی‌گرداند که is_approved آن‌ها True باشد
    return db.query(all_models.Recipe).filter(all_models.Recipe.is_approved == True).all()

# ۲. ایجاد دستور پخت جدید (توسط کاربر)
@app.post("/recipes")
async def create_recipe(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    
    # ساخت آبجکت جدید - دقت کن که is_approved به صورت پیش‌فرض در دیتابیس False است
    new_recipe = all_models.Recipe(
        title=data.get("title"),
        description=data.get("description"),  # لیست مواد اولیه
        instructions=data.get("instructions"),
        cooking_time=int(data.get("cooking_time", 0)) if data.get("cooking_time") else 0,
        category=data.get("category", "دسته‌بندی نشده"),
        is_approved=False,  # اجبار می‌کنیم که در ابتدا تایید نشده باشد
        owner_id=1  # فعلاً دستی تا سیستم لاگین کامل ست شود
    )

    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)
    
    # اینجا پیامی برمی‌گردانیم که کاربر بداند دستور ثبت شده ولی منتظر تایید است
    return {"message": "دستور پخت با موفقیت ثبت شد و پس از تایید ادمین نمایش داده می‌شود.", "id": new_recipe.id}

# ۳. مسیر مخصوص ادمین برای دیدن همه دستورهای منتظر تایید
@app.get("/admin/pending-recipes")
def get_pending_recipes(db: Session = Depends(get_db)):
    return db.query(all_models.Recipe).filter(all_models.Recipe.is_approved == False).all()

# ۴. تایید دستور پخت توسط ادمین
@app.patch("/admin/approve-recipe/{recipe_id}")
def approve_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(all_models.Recipe).filter(all_models.Recipe.id == recipe_id).first()
    if not recipe:
        return {"error": "Recipe not found"}
    
    recipe.is_approved = True
    db.commit()
    return {"message": f"دستور پخت '{recipe.title}' تایید شد."}

# --- SUPPORT (پیام به ادمین) ---

@app.post("/support")
async def send_support_message(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    new_msg = all_models.SupportMessage(
        user_email=data.get("email"),
        content=data.get("content")
    )
    db.add(new_msg)
    db.commit()
    return {"message": "پیام شما برای ادمین ارسال شد"}
