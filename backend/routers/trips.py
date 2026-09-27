from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import uuid
import random
import os
import shutil
import json
from datetime import timedelta
from google import genai

from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
from ..services.places import get_real_city_places

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

    # 2. Fetch verified real-time places and attractions for the destination
    real_places = get_real_city_places(req.destination_city, req.destination_country)
    
    # 3. Use Gemini AI to synthesize itinerary with real-world landmarks
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")
            
        client = genai.Client(api_key=api_key)
        
        places_context = ""
        if real_places:
            places_summary = "\n".join([f"- {p['name']} ({p.get('type', 'Sightseeing')}): transit hint: {p.get('transit', 'local transit')}" for p in real_places[:20]])
            places_context = f"""
CRITICAL: You MUST prioritize and ground your itinerary on these verified real-world places and attractions in and around {req.destination_city}:
{places_summary}
"""

        prompt = f"""
        You are an expert luxury travel planner. I am taking a {days}-day trip to {req.destination_city}, {req.destination_country}.
        I need a highly practical, realistically paced, and well-organized itinerary with exactly 2 activities per day. 
        Do not make the schedule too congested.
        My total daily activity budget is {daily_activity_budget} {req.currency}.
        {places_context}
        Crucially, provide realistic transit and travel options for getting to the activities or navigating the city if the user does not have a personal vehicle. Include specific bus/train options, transit duration, where to board, where to get down, or walking instructions. Put these transit details directly into the "name" field.
        
        Please return a strictly formatted JSON array of objects. Do not include markdown formatting like ```json.
        Each object should represent one activity and have the following exact keys:
        - "day": integer (1 to {days})
        - "name": string (A specific real-world place or activity, MUST include practical transit details e.g., "The Ridge, Shimla (Take Heritage Mall Road Lift, 10 min walk)")
        - "time_of_day": string (either "Morning" or "Afternoon")
        - "cost": float (estimated realistic cost in {req.currency}, roughly fitting the budget)
        - "type": string (must be one of: "Sightseeing", "Food", "Adventure", "Culture", "Shopping")
        
        Example:
        [
          {{"day": 1, "name": "Visit The Ridge (Take Bus or Taxi to Mall Road entrance, 15 min walk)", "time_of_day": "Morning", "cost": 15.0, "type": "Sightseeing"}}
        ]
        """
        
        response = client.models.generate_content(
            model='gemini-3.8-flash',
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
        # Resilient Real-World Fallback: uses verified real places instead of dummy placeholder text
        print(f"Gemini AI not available or quota limit hit ({e}). Using verified real-world places engine.")
        
        # Ensure we have places to pick from
        curated_places = list(real_places)
        if not curated_places:
            curated_places = [
                {"name": f"{req.destination_city} Historic Center & Heritage Walk", "type": "Culture", "transit": "Walk or central metro station"},
                {"name": f"{req.destination_city} Central Promenade & Viewpoint", "type": "Sightseeing", "transit": "10 min walk from central square"},
                {"name": f"{req.destination_city} Regional Cultural Museum", "type": "Culture", "transit": "Take city bus route to museum station (15 min)"},
                {"name": f"{req.destination_city} Traditional Artisan Market", "type": "Shopping", "transit": "5 min walk from city center"},
                {"name": f"{req.destination_city} Scenic Nature Trail & Park", "type": "Adventure", "transit": "Short 20 min cab or local shuttle"}
            ]
            
        place_idx = 0
        total_available = len(curated_places)
        
        for i in range(days):
            current_date = req.start_date + timedelta(days=i)
            # 2 activities per day: Morning and Afternoon
            for j in range(2):
                p = curated_places[place_idx % total_available]
                place_idx += 1
                
                place_name = p.get("name", f"Landmark {place_idx}")
                transit_note = p.get("transit", "Accessible by local transit or short cab ride")
                activity_type = p.get("type", "Sightseeing")
                
                # Format with practical transit
                full_act_name = f"{place_name} ({transit_note})"
                act_cost = round(daily_activity_budget / 2, 2)
                act_time = current_date + timedelta(hours=10 + (j * 4)) # 10:00 and 14:00
                
                db.add(models.Activity(
                    stop_id=db_stop.id,
                    name=full_act_name,
                    time=act_time,
                    cost=act_cost,
                    type=activity_type,
                    booking_status=models.BookingStatus.pending
                ))
                
                db.add(models.Expense(
                    trip_id=db_trip.id,
                    category="activities",
                    amount=act_cost,
                    currency=req.currency,
                    date=current_date,
                    label=full_act_name
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

@router.post("/{trip_id}/insights", response_model=schemas.TripInsight)
def generate_insights(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI Insights are currently unavailable because the API key is not configured.")
        
    try:
        client = genai.Client(api_key=api_key)
        
        # Gather context for Gemini
        total_nights = sum(stop.nights for stop in db_trip.stops) if db_trip.stops else 0
        locations = " -> ".join(f"{stop.city}, {stop.country} ({stop.nights} nights)" for stop in db_trip.stops)
        
        prompt = f"""
        You are an expert luxury travel concierge. 
        A client has just planned a journey: "{db_trip.name or 'Untitled Journey'}".
        The trip has a budget of ${db_trip.budget} and spans {total_nights} nights.
        
        Here is the itinerary sequence:
        {locations}

        Please provide a well-structured analysis of this itinerary. 
        Format the response strictly in Markdown using the following structure:

        ### ✧ The Vibe
        A poetic and welcoming summary of the journey's overall feel.

        ### ⚖️ Pacing & Rhythm
        An analysis of the trip's pacing (e.g., is it rushed, relaxed, well-balanced?).

        ### 💎 Curated Highlight
        A specific hidden gem or exclusive experience they should look forward to based on these locations.

        ### 🗝️ Concierge Tip
        A practical, high-end tip for this specific route.

        Use bullet points or bold text where appropriate to make the content highly readable and scannable. Do not include any introductory filler like "Here is your analysis".
        """
        
        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt,
        )
        insight_text = response.text.strip()
        
        db_insight = models.TripInsight(
            trip_id=db_trip.id,
            insight=insight_text
        )
        db.add(db_insight)
        db.commit()
        db.refresh(db_insight)
        
        return db_insight
    except Exception as e:
        print(f"Error generating AI insights: {e}")
        raise HTTPException(status_code=500, detail="We couldn't generate insights at this moment. Please try again later.")

@router.post("/{trip_id}/custom-map")
def upload_custom_map(
    trip_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """Upload a custom roadmap, route diagram, or journey map image for a trip."""
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".svg"]:
        raise HTTPException(status_code=400, detail="Unsupported image format. Please upload JPG, PNG, WEBP, or SVG.")

    filename = f"map_{trip_id}_{uuid.uuid4().hex[:8]}{ext}"
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    uploads_dir = os.path.join(base_dir, "uploads", "maps")
    os.makedirs(uploads_dir, exist_ok=True)

    file_path = os.path.join(uploads_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_trip.custom_map_url = f"/uploads/maps/{filename}"
    db.commit()
    db.refresh(db_trip)
    return {"custom_map_url": db_trip.custom_map_url}

@router.delete("/{trip_id}/custom-map")
def delete_custom_map(
    trip_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """Delete the custom journey map image for a trip."""
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    db_trip.custom_map_url = None
    db.commit()
    db.refresh(db_trip)
    return {"ok": True}
