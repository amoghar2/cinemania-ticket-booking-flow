
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta, date
from typing import List, Optional
import app.models as models
import app.schemas as schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Movie CRUD
def get_movies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Movie).offset(skip).limit(limit).all()

def get_movie(db: Session, movie_id: int):
    return db.query(models.Movie).filter(models.Movie.id == movie_id).first()

def create_movie(db: Session, movie: schemas.MovieCreate):
    db_movie = models.Movie(**movie.dict())
    db.add(db_movie)
    db.commit()
    db.refresh(db_movie)
    return db_movie

# Theatre CRUD
def get_theatres_by_city(db: Session, city: str):
    return db.query(models.Theatre).filter(models.Theatre.city == city).all()

def create_theatre(db: Session, theatre: schemas.TheatreCreate):
    db_theatre = models.Theatre(**theatre.dict())
    db.add(db_theatre)
    db.commit()
    db.refresh(db_theatre)
    return db_theatre

# Show CRUD
def get_shows_by_movie(db: Session, movie_id: int, city: Optional[str] = None, show_date: Optional[date] = None):
    query = db.query(models.Show).filter(models.Show.movie_id == movie_id)
    
    if city:
        query = query.join(models.Theatre).filter(models.Theatre.city == city)
    
    if show_date:
        query = query.filter(models.Show.show_date == show_date)
    
    return query.all()

def get_show(db: Session, show_id: int):
    return db.query(models.Show).filter(models.Show.id == show_id).first()

def create_show(db: Session, show: schemas.ShowCreate):
    db_show = models.Show(**show.dict())
    db.add(db_show)
    db.commit()
    db.refresh(db_show)
    
    # Create seats for the show
    theatre = db.query(models.Theatre).filter(models.Theatre.id == show.theatre_id).first()
    if theatre:
        for row in ['A', 'B', 'C', 'D', 'E']:
            for seat_num in range(1, 21):  # 20 seats per row
                seat = models.Seat(
                    show_id=db_show.id,
                    seat_number=str(seat_num),
                    row=row
                )
                db.add(seat)
        db.commit()
    
    return db_show

# Seat CRUD
def get_seats_by_show(db: Session, show_id: int):
    return db.query(models.Seat).filter(models.Seat.show_id == show_id).all()

def lock_seats(db: Session, show_id: int, seat_ids: List[int], user_session: str) -> schemas.SeatLockResponse:
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    # Check if seats are available
    seats = db.query(models.Seat).filter(
        and_(
            models.Seat.show_id == show_id,
            models.Seat.id.in_(seat_ids),
            models.Seat.is_booked == False,
            or_(
                models.Seat.is_locked == False,
                models.Seat.locked_until < datetime.utcnow()
            )
        )
    ).all()
    
    if len(seats) != len(seat_ids):
        return schemas.SeatLockResponse(
            success=False,
            locked_seats=[],
            expires_at=expires_at,
            message="Some seats are not available"
        )
    
    # Lock the seats
    for seat in seats:
        seat.is_locked = True
        seat.locked_until = expires_at
        seat.locked_by = user_session
    
    db.commit()
    
    return schemas.SeatLockResponse(
        success=True,
        locked_seats=[seat.id for seat in seats],
        expires_at=expires_at,
        message="Seats locked successfully"
    )

def release_expired_locks(db: Session):
    """Release seats that have expired locks"""
    expired_seats = db.query(models.Seat).filter(
        and_(
            models.Seat.is_locked == True,
            models.Seat.locked_until < datetime.utcnow()
        )
    ).all()
    
    for seat in expired_seats:
        seat.is_locked = False
        seat.locked_until = None
        seat.locked_by = None
    
    db.commit()

# User CRUD
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = hash_password(user.password)
    db_user = models.User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

# Booking CRUD
def create_booking(db: Session, booking_data: schemas.BookingCreate):
    # First release expired locks
    release_expired_locks(db)
    
    # Get user
    user = get_user_by_email(db, booking_data.user_email)
    if not user:
        return None
    
    # Check if seats are still locked by this session or available
    seats = db.query(models.Seat).filter(
        and_(
            models.Seat.show_id == booking_data.show_id,
            models.Seat.id.in_(booking_data.seat_ids),
            models.Seat.is_booked == False
        )
    ).all()
    
    if len(seats) != len(booking_data.seat_ids):
        return None
    
    # Calculate total amount
    show = get_show(db, booking_data.show_id)
    total_amount = len(seats) * show.price
    
    # Create booking
    db_booking = models.Booking(
        user_id=user.id,
        show_id=booking_data.show_id,
        total_amount=total_amount,
        status="pending"
    )
    db.add(db_booking)
    db.flush()
    
    # Mark seats as booked and create booking_seats
    for seat in seats:
        seat.is_booked = True
        seat.is_locked = False
        seat.locked_until = None
        seat.locked_by = None
        
        booking_seat = models.BookingSeat(
            booking_id=db_booking.id,
            seat_id=seat.id
        )
        db.add(booking_seat)
    
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_booking(db: Session, booking_id: int):
    return db.query(models.Booking).filter(models.Booking.id == booking_id).first()

def get_user_bookings(db: Session, user_id: int):
    return db.query(models.Booking).filter(models.Booking.user_id == user_id).all()

# Payment CRUD
def create_payment(db: Session, payment_data: schemas.PaymentInitiate):
    import uuid
    transaction_id = str(uuid.uuid4())
    
    db_payment = models.Payment(
        booking_id=payment_data.booking_id,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        transaction_id=transaction_id,
        status="pending"
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def confirm_payment(db: Session, transaction_id: str, status: str):
    payment = db.query(models.Payment).filter(models.Payment.transaction_id == transaction_id).first()
    if payment:
        payment.status = status
        
        # Update booking status
        booking = db.query(models.Booking).filter(models.Booking.id == payment.booking_id).first()
        if booking:
            booking.status = "confirmed" if status == "success" else "cancelled"
            booking.payment_id = transaction_id
        
        db.commit()
        db.refresh(payment)
    
    return payment
