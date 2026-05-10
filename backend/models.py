from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Enum, Text
from sqlalchemy.orm import relationship
import enum
import datetime
from .database import Base

class BookingStatus(str, enum.Enum):
    booked = "booked"
    pending = "pending"
    none = "none"

class TripStatus(str, enum.Enum):
    active = "active"
    past = "past"
    draft = "draft"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    preferences = relationship("UserPreference", back_populates="user", uselist=False)
    trips = relationship("Trip", back_populates="owner")

class UserPreference(Base):
    __tablename__ = "user_preferences"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    currency = Column(String, default="USD")
    language = Column(String, default="en")
    display_name = Column(String)

    user = relationship("User", back_populates="preferences")

class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    status = Column(Enum(TripStatus), default=TripStatus.draft)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    budget = Column(Float)
    currency = Column(String, default="USD")
    cover_image_url = Column(String, nullable=True)
    is_public = Column(Boolean, default=False)
    share_token = Column(String, unique=True, index=True, nullable=True)

    owner = relationship("User", back_populates="trips")
    stops = relationship("TripStop", back_populates="trip", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
    checklist_items = relationship("ChecklistItem", back_populates="trip", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="trip", cascade="all, delete-orphan")

class TripStop(Base):
    __tablename__ = "trip_stops"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    city = Column(String)
    country = Column(String)
    order_index = Column(Integer)

    trip = relationship("Trip", back_populates="stops")
    activities = relationship("Activity", back_populates="stop", cascade="all, delete-orphan")

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    stop_id = Column(Integer, ForeignKey("trip_stops.id"))
    name = Column(String)
    time = Column(DateTime, nullable=True)
    cost = Column(Float, default=0.0)
    type = Column(String) # e.g., Sightseeing, Food
    booking_status = Column(Enum(BookingStatus), default=BookingStatus.none)

    stop = relationship("TripStop", back_populates="activities")

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    category = Column(String) # flights, hotels, dining, activities, transport, shopping, other
    amount = Column(Float)
    currency = Column(String)
    date = Column(DateTime)
    label = Column(String)

    trip = relationship("Trip", back_populates="expenses")

class ChecklistItem(Base):
    __tablename__ = "checklist_items"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    text = Column(String)
    checked = Column(Boolean, default=False)
    category = Column(String)
    order_index = Column(Integer)

    trip = relationship("Trip", back_populates="checklist_items")

class ChecklistTemplate(Base):
    __tablename__ = "checklist_templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    items = Column(Text) # JSON serialized list of items

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    stop_id = Column(Integer, ForeignKey("trip_stops.id"), nullable=True)
    title = Column(String)
    body = Column(String)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    tags = Column(String) # Storing as comma separated string

    trip = relationship("Trip", back_populates="journal_entries")
    media = relationship("JournalMedia", back_populates="entry", cascade="all, delete-orphan")

class JournalMedia(Base):
    __tablename__ = "journal_media"
    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entries.id"))
    url = Column(String)
    type = Column(String) # photo, video

    entry = relationship("JournalEntry", back_populates="media")
