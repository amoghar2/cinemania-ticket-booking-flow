
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import app.crud as crud
import app.schemas as schemas
from app.database import get_db

router = APIRouter()
security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

@router.post("/users/register", response_model=schemas.Token)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    created_user = crud.create_user(db=db, user=user)
    access_token = create_access_token(data={"sub": created_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": created_user
    }

@router.post("/users/login", response_model=schemas.Token)
def login_user(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    user = crud.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/users/{user_id}/bookings", response_model=List[schemas.Booking])
def get_user_bookings(user_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all bookings for a user"""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these bookings")
    
    bookings = crud.get_user_bookings(db, user_id=user_id)
    return bookings

@router.get("/users/me", response_model=schemas.User)
def get_current_user_info(current_user: schemas.User = Depends(get_current_user)):
    """Get current user information"""
    return current_user
