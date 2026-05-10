from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import random
import os
import json
from datetime import timedelta
from google import genai

from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter(prefix="/trips", tags=["trips"])

@router.post("/generate", response_model=schemas.Trip)
def generate_trip(req: schemas.TripGenerateRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. Base Setup
    db_trip = models.Trip(
        owner_id=current_user.id,
        name=req.name,
        start_date=req.start_date,
        end_date=req.end_date,
        budget=req.budget,
        currency=req.currency,
        status=models.TripStatus.draft
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    
    db_stop = models.TripStop(
        trip_id=db_trip.id,
        city=req.destination_city,
        country=req.destination_country,
        order_index=0
    )
    db.add(db_stop)
    db.commit()
    db.refresh(db_stop)
    
    delta = req.end_date.replace(tzinfo=None) - req.start_date.replace(tzinfo=None)
    days = max(1, delta.days)
    
    flight_cost = req.budget * 0.30
    hotel_cost = req.budget * 0.40
    daily_activity_budget = (req.budget * 0.20) / days
    
    db.add(models.Expense(
        trip_id=db_trip.id,
        category="flights",
        amount=flight_cost,
        currency=req.currency,
        date=req.start_date,
        label=f"Roundtrip Flight from {req.start_point} to {req.destination_city}"
    ))
    db.add(models.Expense(
        trip_id=db_trip.id,
        category="hotels",
        amount=hotel_cost,
        currency=req.currency,
        date=req.start_date,
        label=f"{days} Nights Hotel in {req.destination_city}"
    ))
    db.commit()

    # 2. Use Gemini AI to generate activities
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")
            
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an expert travel planner. I am taking a {days}-day trip to {req.destination_city}, {req.destination_country}.
        I need a realistic itinerary with 2 activities per day. 
        My total daily activity budget is {daily_activity_budget} {req.currency}.
        
        Please return a strictly formatted JSON array of objects. Do not include markdown formatting like ```json.
        Each object should represent one activity and have the following exact keys:
        - "day": integer (1 to {days})
        - "name": string (a specific realistic place or activity in {req.destination_city})
        - "time_of_day": string (either "Morning" or "Afternoon")
        - "cost": float (estimated realistic cost in {req.currency}, make sure it roughly fits the budget)
        - "type": string (must be one of: "Sightseeing", "Food", "Adventure", "Culture", "Shopping")
        
        Example:
        [
          {{"day": 1, "name": "Visit the Eiffel Tower", "time_of_day": "Morning", "cost": 30.0, "type": "Sightseeing"}}
        ]
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        # Parse the JSON response
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"):
            response_text = response_text[3:-3].strip()
            
        ai_activities = json.loads(response_text)
        
        for act in ai_activities:
            day_offset = int(act.get("day", 1)) - 1
            current_date = req.start_date + timedelta(days=day_offset)
            time_of_day = act.get("time_of_day", "Morning")
            hours = 10 if time_of_day.lower() == "morning" else 14
            
            act_cost = float(act.get("cost", 0.0))
            act_name = act.get("name", "Unknown Activity")
            
            db.add(models.Activity(
                stop_id=db_stop.id,
                name=act_name,
                time=current_date + timedelta(hours=hours),
                cost=act_cost,
                type=act.get("type", "Sightseeing"),
                booking_status=models.BookingStatus.pending
            ))
            
            db.add(models.Expense(
                trip_id=db_trip.id,
                category="activities",
                amount=act_cost,
                currency=req.currency,
                date=current_date,
                label=act_name
            ))
            
    except Exception as e:
        # Fallback if Gemini fails or no API key is provided
        print(f"Gemini AI failed: {e}. Using fallback generator.")
        activity_types = ["Sightseeing", "Food", "Adventure", "Culture", "Shopping"]
        activity_names = [f"City Tour of {req.destination_city}", "Local Cuisine Tasting", "Museum Visit", "Shopping District", "Guided Walking Tour"]
        
        for i in range(days):
            current_date = req.start_date + timedelta(days=i)
            for j in range(2):
                act_cost = daily_activity_budget / 2
                act_name = random.choice(activity_names)
                
                db.add(models.Activity(
                    stop_id=db_stop.id,
                    name=f"Day {i+1}: {act_name}",
                    time=current_date + timedelta(hours=10 + (j*4)),
                    cost=act_cost,
                    type=random.choice(activity_types),
                    booking_status=models.BookingStatus.pending
                ))
                
                db.add(models.Expense(
                    trip_id=db_trip.id,
                    category="activities",
                    amount=act_cost,
                    currency=req.currency,
                    date=current_date,
                    label=act_name
                ))

    db.commit()
    db.refresh(db_trip)
    
    return db_trip

@router.post("/", response_model=schemas.TripSummary)
def create_trip(trip: schemas.TripCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = models.Trip(**trip.model_dump(), owner_id=current_user.id)
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@router.get("/", response_model=List[schemas.TripSummary])
def get_trips(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Trip).filter(models.Trip.owner_id == current_user.id).all()

@router.get("/{trip_id}", response_model=schemas.Trip)
def get_trip(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.put("/{trip_id}", response_model=schemas.TripSummary)
def update_trip(trip_id: int, trip_update: schemas.TripUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    update_data = trip_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_trip, key, value)
    
    db.commit()
    db.refresh(db_trip)
    return db_trip

@router.delete("/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    db.delete(db_trip)
    db.commit()
    return {"ok": True}

@router.post("/{trip_id}/share")
def share_trip(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if not db_trip.share_token:
        db_trip.share_token = uuid.uuid4().hex
        db_trip.is_public = True
        db.commit()
        db.refresh(db_trip)
    
    return {"share_token": db_trip.share_token}

@router.delete("/{trip_id}/share")
def revoke_share_trip(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    db_trip.share_token = None
    db_trip.is_public = False
    db.commit()
    return {"ok": True}
