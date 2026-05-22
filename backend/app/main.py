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

# --- INGREDIENTS ---

@app.get("/ingredients")
def search_ingredients(q: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(all_models.Ingredient)
    if q:
        query = query.filter(all_models.Ingredient.name.contains(q))
    return query.all()

# --- RECIPES (اصلاح شده) ---

@app.get("/recipes")
def get_approved_recipes(db: Session = Depends(get_db)):
    return db.query(all_models.Recipe).filter(all_models.Recipe.is_approved == True).all()

@app.post("/recipes")
async def create_recipe(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    
    # 1. پیدا کردن آیدی کاربر (برای جلوگیری از خطای ForeignKey)
    user = db.query(all_models.User).first()
    if not user:
        raise HTTPException(status_code=400, detail="هیچ کاربری در سیستم نیست. ابتدا ثبت‌نام کنید.")

    # 2. ساخت دستور پخت
    try:
        new_recipe = all_models.Recipe(
            title=data.get("title"),
            description=data.get("description"),
            instructions=data.get("instructions"),
            cooking_time=int(data.get("cooking_time", 0)) if data.get("cooking_time") else 0,
            category=data.get("category", "دسته‌بندی نشده"),
            is_approved=False,
            owner_id=user.id # استفاده از آیدی واقعی موجود در دیتابیس
        )

        db.add(new_recipe)
        db.commit()
        db.refresh(new_recipe)
        return {"message": "ثبت شد و منتظر تایید ادمین است.", "id": new_recipe.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"خطا در دیتابیس: {str(e)}")

# --- ADMIN ACTIONS ---

@app.get("/admin/pending-recipes")
def get_pending_recipes(db: Session = Depends(get_db)):
    return db.query(all_models.Recipe).filter(all_models.Recipe.is_approved == False).all()

@app.patch("/admin/approve-recipe/{recipe_id}")
def approve_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(all_models.Recipe).filter(all_models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="دستور پیدا نشد")
    
    recipe.is_approved = True
    db.commit()
    return {"message": f"دستور '{recipe.title}' تایید شد."}

# --- ADMIN: USER MANAGEMENT (مدیریت کاربران) ---

# ۱. دریافت لیست تمام کاربران
@app.get("/admin/users")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(all_models.User).all()

# ۲. غیرفعال‌سازی یا حذف کاربر
@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(all_models.User).filter(all_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="کاربر پیدا نشد")
    
    # هم می‌توانی کلاً حذف کنی، هم اگر ستون is_active داری غیرفعال کنی. اینجا کلاً حذف می‌کنیم:
    db.delete(user)
    db.commit()
    return {"message": "کاربر با موفقیت حذف شد"}


# --- ADMIN: CONTENT MANAGEMENT (مدیریت محتوای همه کاربران) ---

# ۳. دریافت تمام دستورهای پخت (بدون فیلتر برای مدیریت ادمین)
@app.get("/admin/all-recipes")
def get_all_recipes_for_admin(db: Session = Depends(get_db)):
    return db.query(all_models.Recipe).all()

# ۴. حذف دستور پخت هر کاربری توسط ادمین
@app.delete("/admin/recipes/{recipe_id}")
def delete_recipe_by_admin(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(all_models.Recipe).filter(all_models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="دستور پخت پیدا نشد")
    
    db.delete(recipe)
    db.commit()
    return {"message": f"دستور پخت '{recipe.title}' توسط ادمین حذف شد"}

# --- ADMIN: DASHBOARD SUMMARY (نمای خلاصه ادمین) ---

@app.get("/admin/summary-stats")
def get_admin_summary_stats(db: Session = Depends(get_db)):
    # شمارش تعداد کل آیتم‌ها
    total_users = db.query(all_models.User).count()
    total_recipes = db.query(all_models.Recipe).count()
    total_ingredients = db.query(all_models.Ingredient).count()
    
    # دریافت آخرین دستورهای پخت ایجاد شده (۵ مورد آخر)
    latest_recipes = (
        db.query(all_models.Recipe)
        .order_by(all_models.Recipe.id.desc())
        .limit(5)
        .all()
    )
    
    # تبدیل به فرمت مناسب فرانت‌اِند
    latest_items = [
        {
            "id": r.id,
            "title": r.title,
            "category": r.category,
            "status": "منتشر شده" if r.is_approved else "در انتظار تایید"
        }
        for r in latest_recipes
    ]
    
    return {
        "total_users": total_users,
        "total_recipes": total_recipes,
        "total_ingredients": total_ingredients,
        "latest_items": latest_items
    }

# --- SUPPORT ---

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
