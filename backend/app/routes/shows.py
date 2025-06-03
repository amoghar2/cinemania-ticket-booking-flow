
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import app.crud as crud
import app.schemas as schemas
from app.database import get_db

router = APIRouter()

@router.get("/shows/{show_id}", response_model=schemas.Show)
def get_show(show_id: int, db: Session = Depends(get_db)):
    """Get show details"""
    show = crud.get_show(db, show_id=show_id)
    if show is None:
        raise HTTPException(status_code=404, detail="Show not found")
    return show

@router.get("/shows/{show_id}/seats", response_model=List[schemas.Seat])
def get_show_seats(show_id: int, db: Session = Depends(get_db)):
    """Get seat layout and availability for a show"""
    show = crud.get_show(db, show_id=show_id)
    if show is None:
        raise HTTPException(status_code=404, detail="Show not found")
    
    # Release expired locks before returning seats
    crud.release_expired_locks(db)
    
    seats = crud.get_seats_by_show(db, show_id=show_id)
    return seats

@router.post("/shows", response_model=schemas.Show)
def create_show(show: schemas.ShowCreate, db: Session = Depends(get_db)):
    """Create a new show (for seeding data)"""
    return crud.create_show(db=db, show=show)

@router.post("/seats/lock", response_model=schemas.SeatLockResponse)
def lock_seats(lock_request: schemas.SeatLockRequest, db: Session = Depends(get_db)):
    """Lock selected seats for a short time"""
    return crud.lock_seats(
        db=db, 
        show_id=lock_request.show_id, 
        seat_ids=lock_request.seat_ids, 
        user_session=lock_request.user_session
    )
