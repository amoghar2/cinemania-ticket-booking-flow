
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import app.crud as crud
import app.schemas as schemas
from app.database import get_db
import random

router = APIRouter()

@router.post("/payments/initiate", response_model=schemas.Payment)
def initiate_payment(payment_data: schemas.PaymentInitiate, db: Session = Depends(get_db)):
    """Start a mock payment flow"""
    # Check if booking exists
    booking = crud.get_booking(db, booking_id=payment_data.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status != "pending":
        raise HTTPException(status_code=400, detail="Booking is not in pending status")
    
    payment = crud.create_payment(db=db, payment_data=payment_data)
    return payment

@router.post("/payments/confirm", response_model=schemas.Payment)
def confirm_payment(payment_confirm: schemas.PaymentConfirm, db: Session = Depends(get_db)):
    """Confirm or fail payment (mock callback logic)"""
    payment = crud.confirm_payment(
        db=db, 
        transaction_id=payment_confirm.transaction_id, 
        status=payment_confirm.status
    )
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return payment

@router.post("/payments/mock-callback")
def mock_payment_callback(transaction_id: str, db: Session = Depends(get_db)):
    """Mock payment gateway callback - randomly succeeds or fails"""
    # Simulate 80% success rate
    status = "success" if random.random() > 0.2 else "failed"
    
    payment = crud.confirm_payment(db=db, transaction_id=transaction_id, status=status)
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return {"status": status, "transaction_id": transaction_id}
