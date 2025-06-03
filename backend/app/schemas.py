
from pydantic import BaseModel, EmailStr
from datetime import datetime, date, time
from typing import List, Optional

# Movie schemas
class MovieBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration: int
    genre: str
    rating: str
    poster_url: Optional[str] = None
    release_date: date

class MovieCreate(MovieBase):
    pass

class Movie(MovieBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Theatre schemas
class TheatreBase(BaseModel):
    name: str
    city: str
    address: str
    total_seats: int = 100

class TheatreCreate(TheatreBase):
    pass

class Theatre(TheatreBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Show schemas
class ShowBase(BaseModel):
    movie_id: int
    theatre_id: int
    show_date: date
    show_time: time
    price: float

class ShowCreate(ShowBase):
    pass

class Show(ShowBase):
    id: int
    created_at: datetime
    movie: Optional[Movie] = None
    theatre: Optional[Theatre] = None
    
    class Config:
        from_attributes = True

# Seat schemas
class SeatBase(BaseModel):
    seat_number: str
    row: str

class Seat(SeatBase):
    id: int
    show_id: int
    is_booked: bool
    is_locked: bool
    locked_until: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Booking schemas
class BookingCreate(BaseModel):
    show_id: int
    seat_ids: List[int]
    user_email: str

class BookingSeat(BaseModel):
    seat_id: int
    seat_number: str
    row: str
    
    class Config:
        from_attributes = True

class Booking(BaseModel):
    id: int
    user_id: int
    show_id: int
    total_amount: float
    status: str
    payment_id: Optional[str] = None
    created_at: datetime
    booking_seats: List[BookingSeat] = []
    show: Optional[Show] = None
    
    class Config:
        from_attributes = True

# Seat lock schemas
class SeatLockRequest(BaseModel):
    show_id: int
    seat_ids: List[int]
    user_session: str

class SeatLockResponse(BaseModel):
    success: bool
    locked_seats: List[int]
    expires_at: datetime
    message: str

# Payment schemas
class PaymentInitiate(BaseModel):
    booking_id: int
    amount: float
    payment_method: str = "card"

class PaymentConfirm(BaseModel):
    transaction_id: str
    status: str  # success or failed

class Payment(BaseModel):
    id: int
    booking_id: int
    amount: float
    status: str
    payment_method: str
    transaction_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User
