
from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Text, Time, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Movie(Base):
    __tablename__ = "movies"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    duration = Column(Integer)  # in minutes
    genre = Column(String)
    rating = Column(String)
    poster_url = Column(String, nullable=True)
    release_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    shows = relationship("Show", back_populates="movie")

class Theatre(Base):
    __tablename__ = "theatres"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    city = Column(String, index=True)
    address = Column(String)
    total_seats = Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    shows = relationship("Show", back_populates="theatre")

class Show(Base):
    __tablename__ = "shows"
    
    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"))
    theatre_id = Column(Integer, ForeignKey("theatres.id"))
    show_date = Column(Date)
    show_time = Column(Time)
    price = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    movie = relationship("Movie", back_populates="shows")
    theatre = relationship("Theatre", back_populates="shows")
    seats = relationship("Seat", back_populates="show")
    bookings = relationship("Booking", back_populates="show")

class Seat(Base):
    __tablename__ = "seats"
    
    id = Column(Integer, primary_key=True, index=True)
    show_id = Column(Integer, ForeignKey("shows.id"))
    seat_number = Column(String)
    row = Column(String)
    is_booked = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    locked_by = Column(String, nullable=True)  # session or user identifier
    
    show = relationship("Show", back_populates="seats")
    booking_seats = relationship("BookingSeat", back_populates="seat")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    bookings = relationship("Booking", back_populates="user")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    show_id = Column(Integer, ForeignKey("shows.id"))
    total_amount = Column(Float)
    status = Column(String, default="pending")  # pending, confirmed, cancelled
    payment_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="bookings")
    show = relationship("Show", back_populates="bookings")
    booking_seats = relationship("BookingSeat", back_populates="booking")

class BookingSeat(Base):
    __tablename__ = "booking_seats"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    seat_id = Column(Integer, ForeignKey("seats.id"))
    
    booking = relationship("Booking", back_populates="booking_seats")
    seat = relationship("Seat", back_populates="booking_seats")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    amount = Column(Float)
    status = Column(String, default="pending")  # pending, success, failed
    payment_method = Column(String, default="card")
    transaction_id = Column(String, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
