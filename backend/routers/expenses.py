from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter(prefix="/trips", tags=["expenses"])

@router.get("/{trip_id}/budget")
def get_budget(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    total_expenses = sum(expense.amount for expense in db_trip.expenses)
    return {
        "budget": db_trip.budget,
        "currency": db_trip.currency,
        "total_expenses": total_expenses,
        "remaining": db_trip.budget - total_expenses
    }

@router.get("/{trip_id}/budget/breakdown")
def get_budget_breakdown(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    breakdown = {}
    total = 0
    for exp in db_trip.expenses:
        breakdown[exp.category] = breakdown.get(exp.category, 0) + exp.amount
        total += exp.amount
    
    percentages = {k: (v / total * 100) if total > 0 else 0 for k, v in breakdown.items()}
    return {
        "breakdown": breakdown,
        "percentages": percentages,
        "total": total
    }

@router.get("/{trip_id}/budget/alerts")
def get_budget_alerts(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    total_expenses = sum(expense.amount for expense in db_trip.expenses)
    alerts = []
    if db_trip.budget > 0:
        if total_expenses >= db_trip.budget:
            alerts.append({"type": "over_budget", "message": "You have exceeded your total budget."})
        elif total_expenses >= db_trip.budget * 0.9:
            alerts.append({"type": "near_budget", "message": "You have used 90% or more of your total budget."})
            
    return alerts

@router.post("/{trip_id}/expenses", response_model=schemas.Expense)
def create_expense(trip_id: int, expense: schemas.ExpenseCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    db_expense = models.Expense(**expense.model_dump(), trip_id=trip_id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get("/{trip_id}/expenses", response_model=List[schemas.Expense])
def get_expenses(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    return db_trip.expenses

@router.put("/{trip_id}/expenses/{exp_id}", response_model=schemas.Expense)
def update_expense(trip_id: int, exp_id: int, expense_update: schemas.ExpenseUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_expense = db.query(models.Expense).join(models.Trip).filter(models.Expense.id == exp_id, models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    update_data = expense_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_expense, key, value)
    
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.delete("/{trip_id}/expenses/{exp_id}")
def delete_expense(trip_id: int, exp_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_expense = db.query(models.Expense).join(models.Trip).filter(models.Expense.id == exp_id, models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(db_expense)
    db.commit()
    return {"ok": True}
