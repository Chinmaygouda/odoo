from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter(prefix="/trips", tags=["checklist"])

@router.post("/{trip_id}/checklist", response_model=schemas.ChecklistItem)
def create_checklist_item(trip_id: int, item: schemas.ChecklistItemCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    db_item = models.ChecklistItem(**item.model_dump(), trip_id=trip_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/{trip_id}/checklist", response_model=List[schemas.ChecklistItem])
def get_checklist_items(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    return db.query(models.ChecklistItem).filter(models.ChecklistItem.trip_id == trip_id).order_by(models.ChecklistItem.order_index).all()

@router.put("/{trip_id}/checklist/{item_id}", response_model=schemas.ChecklistItem)
def update_checklist_item(trip_id: int, item_id: int, item_update: schemas.ChecklistItemUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_item = db.query(models.ChecklistItem).join(models.Trip).filter(models.ChecklistItem.id == item_id, models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{trip_id}/checklist/{item_id}")
def delete_checklist_item(trip_id: int, item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_item = db.query(models.ChecklistItem).join(models.Trip).filter(models.ChecklistItem.id == item_id, models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    db.delete(db_item)
    db.commit()
    return {"ok": True}

@router.post("/{trip_id}/checklist/templates")
def apply_checklist_template(trip_id: int, template_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    db_template = db.query(models.ChecklistTemplate).filter(models.ChecklistTemplate.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    import json
    items = json.loads(db_template.items)
    for i, item in enumerate(items):
        db_item = models.ChecklistItem(
            trip_id=trip_id,
            text=item.get("text", ""),
            checked=False,
            category=item.get("category", "other"),
            order_index=i
        )
        db.add(db_item)
        
    db.commit()
    return {"ok": True}
