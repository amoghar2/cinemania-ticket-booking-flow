
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import app.crud as crud
import app.schemas as schemas
from app.database import get_db

router = APIRouter()

@router.post("/bookings", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    """Book selected seats (must be locked)"""
    db_booking = crud.create_booking(db=db, booking_data=booking)
    if db_booking is None:
        raise HTTPException(status_code=400, detail="Unable to create booking. Seats may not be available.")
    return db_booking

@router.get("/bookings/{booking_id}", response_model=schemas.Booking)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    """Get booking details"""
    booking = crud.get_booking(db, booking_id=booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
