from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

class BookingStatus(str, Enum):
    booked = "booked"
    pending = "pending"
    none = "none"

class TripStatus(str, Enum):
    active = "active"
    past = "past"
    draft = "draft"

# --- Users & Auth ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    display_name: str = ""

class UserLogin(UserBase):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserPreferencesUpdate(BaseModel):
    currency: Optional[str] = None
    language: Optional[str] = None
    display_name: Optional[str] = None

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

# --- Activities ---
class ActivityBase(BaseModel):
    name: str
    time: Optional[datetime] = None
    cost: float = 0.0
    type: str
    booking_status: BookingStatus = BookingStatus.none

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    name: Optional[str] = None
    time: Optional[datetime] = None
    cost: Optional[float] = None
    type: Optional[str] = None
    booking_status: Optional[BookingStatus] = None

class Activity(ActivityBase):
    id: int
    stop_id: int
    class Config:
        from_attributes = True

# --- Trip Stops ---
class TripStopBase(BaseModel):
    city: str
    country: str
    order_index: int

class TripStopCreate(TripStopBase):
    pass

class TripStopUpdate(BaseModel):
    city: Optional[str] = None
    country: Optional[str] = None
    order_index: Optional[int] = None

class TripStop(TripStopBase):
    id: int
    trip_id: int
    activities: List[Activity] = []
    class Config:
        from_attributes = True

# --- Expenses ---
class ExpenseBase(BaseModel):
    category: str
    amount: float
    currency: str
    date: datetime
    label: str

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    date: Optional[datetime] = None
    label: Optional[str] = None

class Expense(ExpenseBase):
    id: int
    trip_id: int
    class Config:
        from_attributes = True

# --- Checklist ---
class ChecklistItemBase(BaseModel):
    text: str
    checked: bool = False
    category: str
    order_index: int

class ChecklistItemCreate(ChecklistItemBase):
    pass

class ChecklistItemUpdate(BaseModel):
    text: Optional[str] = None
    checked: Optional[bool] = None
    category: Optional[str] = None
    order_index: Optional[int] = None

class ChecklistItem(ChecklistItemBase):
    id: int
    trip_id: int
    class Config:
        from_attributes = True

# --- Journal ---
class JournalMediaBase(BaseModel):
    url: str
    type: str

class JournalMediaCreate(JournalMediaBase):
    pass

class JournalMedia(JournalMediaBase):
    id: int
    entry_id: int
    class Config:
        from_attributes = True

class JournalEntryBase(BaseModel):
    stop_id: Optional[int] = None
    title: str
    body: str
    date: datetime = datetime.utcnow()
    tags: str = ""

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryUpdate(BaseModel):
    stop_id: Optional[int] = None
    title: Optional[str] = None
    body: Optional[str] = None
    date: Optional[datetime] = None
    tags: Optional[str] = None

class JournalEntry(JournalEntryBase):
    id: int
    trip_id: int
    media: List[JournalMedia] = []
    class Config:
        from_attributes = True

# --- Trips ---
class TripBase(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime
    budget: float
    currency: str = "USD"
    cover_image_url: Optional[str] = None

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[TripStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_public: Optional[bool] = None

class TripGenerateRequest(BaseModel):
    name: str
    start_point: str
    destination_city: str
    destination_country: str
    start_date: datetime
    end_date: datetime
    budget: float
    currency: str = "USD"

class Trip(TripBase):
    id: int
    owner_id: int
    status: TripStatus
    is_public: bool
    share_token: Optional[str] = None
    stops: List[TripStop] = []
    expenses: List[Expense] = []
    checklist_items: List[ChecklistItem] = []
    journal_entries: List[JournalEntry] = []
    class Config:
        from_attributes = True

class TripSummary(BaseModel):
    id: int
    name: str
    start_date: datetime
    end_date: datetime
    status: TripStatus
    budget: float
    currency: str
    cover_image_url: Optional[str] = None
    class Config:
        from_attributes = True
