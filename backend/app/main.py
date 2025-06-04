
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import movies, shows, bookings, payments, users, theatres

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Movie Booking API",
    description="A complete movie ticket booking platform API",
    version="1.0.0"
)

# CORS middleware - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(movies.router, prefix="/api", tags=["movies"])
app.include_router(shows.router, prefix="/api", tags=["shows"])
app.include_router(bookings.router, prefix="/api", tags=["bookings"])
app.include_router(payments.router, prefix="/api", tags=["payments"])
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(theatres.router, prefix="/api", tags=["theatres"])

@app.get("/")
def root():
    return {"message": "Movie Booking API - Visit /docs for API documentation"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
