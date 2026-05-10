from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter(tags=["stops"])

@router.post("/trips/{trip_id}/stops", response_model=schemas.TripStop)
def create_stop(trip_id: int, stop: schemas.TripStopCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    db_stop = models.TripStop(**stop.model_dump(), trip_id=trip_id)
    db.add(db_stop)
    db.commit()
    db.refresh(db_stop)
    return db_stop

@router.get("/trips/{trip_id}/stops", response_model=List[schemas.TripStop])
def get_stops(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.TripStop).filter(models.TripStop.trip_id == trip_id).order_by(models.TripStop.order_index).all()

@router.put("/trips/{trip_id}/stops/{stop_id}", response_model=schemas.TripStop)
def update_stop(trip_id: int, stop_id: int, stop_update: schemas.TripStopUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_stop = db.query(models.TripStop).join(models.Trip).filter(models.TripStop.id == stop_id, models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    
    update_data = stop_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_stop, key, value)
    
    db.commit()
    db.refresh(db_stop)
    return db_stop

@router.delete("/trips/{trip_id}/stops/{stop_id}")
def delete_stop(trip_id: int, stop_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_stop = db.query(models.TripStop).join(models.Trip).filter(models.TripStop.id == stop_id, models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    
    db.delete(db_stop)
    db.commit()
    return {"ok": True}

@router.put("/trips/{trip_id}/stops/reorder")
def reorder_stops(trip_id: int, stop_ids: List[int], db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    for index, stop_id in enumerate(stop_ids):
        db.query(models.TripStop).filter(models.TripStop.id == stop_id, models.TripStop.trip_id == trip_id).update({"order_index": index})
    db.commit()
    return {"ok": True}

# Activities
@router.post("/stops/{stop_id}/activities", response_model=schemas.Activity)
def create_activity(stop_id: int, activity: schemas.ActivityCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_stop = db.query(models.TripStop).join(models.Trip).filter(models.TripStop.id == stop_id, models.Trip.owner_id == current_user.id).first()
    if not db_stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    
    db_activity = models.Activity(**activity.model_dump(), stop_id=stop_id)
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.get("/stops/{stop_id}/activities", response_model=List[schemas.Activity])
def get_activities(stop_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_stop = db.query(models.TripStop).join(models.Trip).filter(models.TripStop.id == stop_id, models.Trip.owner_id == current_user.id).first()
    if not db_stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    return db.query(models.Activity).filter(models.Activity.stop_id == stop_id).all()

@router.put("/stops/{stop_id}/activities/{act_id}", response_model=schemas.Activity)
def update_activity(stop_id: int, act_id: int, act_update: schemas.ActivityUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_activity = db.query(models.Activity).join(models.TripStop).join(models.Trip).filter(models.Activity.id == act_id, models.Activity.stop_id == stop_id, models.Trip.owner_id == current_user.id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    update_data = act_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_activity, key, value)
    
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.delete("/stops/{stop_id}/activities/{act_id}")
def delete_activity(stop_id: int, act_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_activity = db.query(models.Activity).join(models.TripStop).join(models.Trip).filter(models.Activity.id == act_id, models.Activity.stop_id == stop_id, models.Trip.owner_id == current_user.id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    db.delete(db_activity)
    db.commit()
    return {"ok": True}
