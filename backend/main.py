from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine

from .routers import auth, trips, stops, expenses, checklist, journal, public

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Traveloop API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set this to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(auth.users_router)
app.include_router(trips.router)
app.include_router(stops.router)
app.include_router(expenses.router)
app.include_router(checklist.router)
app.include_router(journal.router)
app.include_router(public.router)

@app.get("/")
def root():
    return {"message": "Welcome to Traveloop API"}
