
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import movies, shows, bookings, payments, users, theatres
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")

app = FastAPI(
    title="Movie Booking API",
    description="A complete movie ticket booking platform API",
    version="1.0.0"
)

# CORS middleware - Allow all origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
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
    logger.info("Health check endpoint called")
    return {"status": "healthy", "message": "API is running"}

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Movie Booking API...")
    logger.info("Database connection initialized")
