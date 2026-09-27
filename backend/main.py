import os
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from . import models
from .database import engine

from .routers import auth, trips, stops, expenses, checklist, journal, public
import traceback
import sys
from fastapi.responses import JSONResponse
from fastapi import Request

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Traveloop API")

# Ensure uploads directories exist and mount static files
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(os.path.join(uploads_dir, "journal"), exist_ok=True)
os.makedirs(os.path.join(uploads_dir, "maps"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], # Added 127.0.0.1 for dev CORS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    with open("error_log.txt", "a") as f:
        f.write(f"Exception on {request.url}:\n")
        traceback.print_exc(file=f)
    return JSONResponse(status_code=500, content={"detail": str(exc)})


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
