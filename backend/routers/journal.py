from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import shutil

from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter(prefix="/trips", tags=["journal"])

@router.get("/journal/all", response_model=List[schemas.JournalEntry])
def get_all_user_journal_entries(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Fetch all journal entries across all trips belonging to the current user."""
    return db.query(models.JournalEntry).join(models.Trip).filter(models.Trip.owner_id == current_user.id).order_by(models.JournalEntry.date.desc()).all()

@router.post("/{trip_id}/journal", response_model=schemas.JournalEntry)
def create_journal_entry(trip_id: int, entry: schemas.JournalEntryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if entry.stop_id:
        db_stop = db.query(models.TripStop).filter(models.TripStop.id == entry.stop_id, models.TripStop.trip_id == trip_id).first()
        if not db_stop:
            raise HTTPException(status_code=400, detail="Invalid stop_id for this trip")

    db_entry = models.JournalEntry(**entry.model_dump(), trip_id=trip_id)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/{trip_id}/journal", response_model=List[schemas.JournalEntry])
def get_journal_entries(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    return db.query(models.JournalEntry).filter(models.JournalEntry.trip_id == trip_id).order_by(models.JournalEntry.date.desc()).all()

@router.get("/{trip_id}/journal/{entry_id}", response_model=schemas.JournalEntry)
def get_journal_entry(trip_id: int, entry_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_entry = db.query(models.JournalEntry).join(models.Trip).filter(models.JournalEntry.id == entry_id, models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return db_entry

@router.put("/{trip_id}/journal/{entry_id}", response_model=schemas.JournalEntry)
def update_journal_entry(trip_id: int, entry_id: int, entry_update: schemas.JournalEntryUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_entry = db.query(models.JournalEntry).join(models.Trip).filter(models.JournalEntry.id == entry_id, models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    update_data = entry_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_entry, key, value)
    
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.delete("/{trip_id}/journal/{entry_id}")
def delete_journal_entry(trip_id: int, entry_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_entry = db.query(models.JournalEntry).join(models.Trip).filter(models.JournalEntry.id == entry_id, models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    db.delete(db_entry)
    db.commit()
    return {"ok": True}

@router.post("/{trip_id}/journal/{entry_id}/media", response_model=schemas.JournalMedia)
def upload_journal_media(
    trip_id: int,
    entry_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Upload photos or media to attach to a journal entry."""
    db_entry = db.query(models.JournalEntry).join(models.Trip).filter(
        models.JournalEntry.id == entry_id,
        models.Trip.id == trip_id,
        models.Trip.owner_id == current_user.id
    ).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    filename = f"journal_{uuid.uuid4().hex}{ext}"
    
    # Path to uploads/journal in project root
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    uploads_dir = os.path.join(base_dir, "uploads", "journal")
    os.makedirs(uploads_dir, exist_ok=True)
    
    file_path = os.path.join(uploads_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    media_url = f"/uploads/journal/{filename}"
    media_type = "video" if ext in [".mp4", ".mov", ".webm"] else "photo"

    db_media = models.JournalMedia(
        entry_id=entry_id,
        url=media_url,
        type=media_type
    )
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media
