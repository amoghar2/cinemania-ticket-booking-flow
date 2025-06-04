
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import logging
import app.crud as crud
import app.schemas as schemas
from app.database import get_db

logger = logging.getLogger(__name__)
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
    try:
        logger.info(f"Registration attempt for email: {user.email}")
        
        # Check if user already exists
        db_user = crud.get_user_by_email(db, email=user.email)
        if db_user:
            logger.warning(f"User with email {user.email} already exists")
            raise HTTPException(
                status_code=400, 
                detail="Email already registered"
            )
        
        created_user = crud.create_user(db=db, user=user)
        logger.info(f"User created successfully: {created_user.email}")
        
        access_token = create_access_token(data={"sub": created_user.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": created_user
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create user"
        )

@router.post("/users/login", response_model=schemas.Token)
def login_user(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    try:
        logger.info(f"Login attempt for email: {login_data.email}")
        
        user = crud.authenticate_user(db, login_data.email, login_data.password)
        if not user:
            logger.warning(f"Authentication failed for email: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"User authenticated successfully: {user.email}")
        access_token = create_access_token(data={"sub": user.email})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Login failed"
        )

@router.get("/users/{user_id}/bookings", response_model=List[schemas.Booking])
def get_user_bookings(user_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all bookings for a user"""
    try:
        if current_user.id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access these bookings")
        
        bookings = crud.get_user_bookings(db, user_id=user_id)
        logger.info(f"Fetched {len(bookings)} bookings for user {user_id}")
        return bookings
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching bookings for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch bookings")

@router.get("/users/me", response_model=schemas.User)
def get_current_user_info(current_user: schemas.User = Depends(get_current_user)):
    """Get current user information"""
    logger.info(f"Getting current user info for: {current_user.email}")
    return current_user
