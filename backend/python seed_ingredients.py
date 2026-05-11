import sys
import os

# اضافه کردن مسیر فعلی به پایتون برای اینکه app را بشناسد
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.all_models import Ingredient

def seed_data():
    db = SessionLocal()
    
    # لیست مواد اولیه (می‌توانی هر چقدر خواستی اینجا اضافه کنی)
    ingredients_list = [
        {"name": "پیاز", "category": "سبزیجات"},
        {"name": "سیر", "category": "سبزیجات"},
        {"name": "سیب زمینی", "category": "سبزیجات"},
        {"name": "گوجه فرنگی", "category": "سبزیجات"},
        {"name": "گوشت گوسفندی", "category": "پروتئین"},
        {"name": "مرغ", "category": "پروتئین"},
        {"name": "برنج", "category": "غلات"},
        {"name": "زعفران", "category": "ادویه"},
        {"name": "نمک", "category": "ادویه"},
        {"name": "فلفل", "category": "ادویه"},
        {"name": "روغن", "category": "روغن"},
        {"name": "رب گوجه", "category": "چاشنی"},
    ]

    print("Checking database for ingredients...")
    
    for item in ingredients_list:
        exists = db.query(Ingredient).filter(Ingredient.name == item["name"]).first()
        if not exists:
            new_ing = Ingredient(name=item["name"], category=item["category"])
            db.add(new_ing)
            print(f"Added: {item['name']}")
    
    db.commit()
    db.close()
    print("--- Finished! ---")

if __name__ == "__main__":
    seed_data()
