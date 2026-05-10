from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter(prefix="/public", tags=["public"])

@router.get("/trips/{share_token}", response_model=schemas.Trip)
def get_public_trip(share_token: str, db: Session = Depends(get_db)):
    db_trip = db.query(models.Trip).filter(models.Trip.share_token == share_token, models.Trip.is_public == True).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Public trip not found")
    return db_trip

@router.post("/trips/{share_token}/clone", response_model=schemas.TripSummary)
def clone_public_trip(share_token: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    source_trip = db.query(models.Trip).filter(models.Trip.share_token == share_token, models.Trip.is_public == True).first()
    if not source_trip:
        raise HTTPException(status_code=404, detail="Public trip not found")
    
    # Deep copy the trip
    new_trip = models.Trip(
        owner_id=current_user.id,
        name=f"Copy of {source_trip.name}",
        status=models.TripStatus.draft,
        start_date=source_trip.start_date,
        end_date=source_trip.end_date,
        budget=source_trip.budget,
        currency=source_trip.currency,
        cover_image_url=source_trip.cover_image_url,
        is_public=False
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    
    # Copy stops and activities
    for stop in source_trip.stops:
        new_stop = models.TripStop(
            trip_id=new_trip.id,
            city=stop.city,
            country=stop.country,
            order_index=stop.order_index
        )
        db.add(new_stop)
        db.commit()
        db.refresh(new_stop)
        
        for activity in stop.activities:
            new_activity = models.Activity(
                stop_id=new_stop.id,
                name=activity.name,
                time=activity.time,
                cost=activity.cost,
                type=activity.type,
                booking_status=models.BookingStatus.none
            )
            db.add(new_activity)
    
    db.commit()
    db.refresh(new_trip)
    return new_trip
