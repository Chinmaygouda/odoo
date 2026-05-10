from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import bcrypt
import jwt
from typing import Optional
import os
from google.oauth2 import id_token
from google.auth.transport import requests

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.environ.get("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    prefs = models.UserPreference(user_id=new_user.id, display_name=user.display_name)
    db.add(prefs)
    db.commit()
    
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/guest-session", response_model=schemas.Token)
def guest_session(db: Session = Depends(get_db)):
    import uuid
    guest_email = f"guest_{uuid.uuid4().hex[:8]}@guest.local"
    guest_password = "guest"
    
    new_user = models.User(email=guest_email, hashed_password=get_password_hash(guest_password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    prefs = models.UserPreference(user_id=new_user.id, display_name="Guest User")
    db.add(prefs)
    db.commit()
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=schemas.Token)
def google_auth(req: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        client_id = os.environ.get("GOOGLE_CLIENT_ID")
        idinfo = id_token.verify_oauth2_token(req.token, requests.Request(), client_id)

        email = idinfo['email']
        name = idinfo.get('name', '')
        
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            random_pass = get_password_hash(os.urandom(16).hex())
            user = models.User(email=email, hashed_password=random_pass)
            db.add(user)
            db.commit()
            db.refresh(user)
            
            prefs = models.UserPreference(user_id=user.id, display_name=name)
            db.add(prefs)
            db.commit()

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
            headers={"WWW-Authenticate": "Bearer"},
        )

users_router = APIRouter(prefix="/users", tags=["users"])

@users_router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@users_router.put("/me", response_model=schemas.User)
def update_user_preferences(prefs: schemas.UserPreferencesUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_pref = db.query(models.UserPreference).filter(models.UserPreference.user_id == current_user.id).first()
    if prefs.currency:
        user_pref.currency = prefs.currency
    if prefs.language:
        user_pref.language = prefs.language
    if prefs.display_name:
        user_pref.display_name = prefs.display_name
    db.commit()
    db.refresh(current_user)
    return current_user
