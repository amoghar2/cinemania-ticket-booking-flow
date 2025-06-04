
"""
Setup script for Movie Booking API
Run this after setting up your .env file to initialize the database
"""

import os
import sys
from app.database import engine, Base
from app.models import *  # Import all models
import app.crud as crud
from app.schemas import MovieCreate, TheatreCreate, ShowCreate
from sqlalchemy.orm import sessionmaker
from datetime import date, time

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def seed_sample_data():
    """Add sample movies, theatres, and shows"""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("Adding sample data...")
        
        # Check if data already exists
        existing_movies = crud.get_movies(db, limit=1)
        if existing_movies:
            print("⚠️  Sample data already exists, skipping...")
            return
        
        # Add sample movies
        movies = [
            MovieCreate(
                title="Spider-Man: No Way Home",
                description="Spider-Man's identity is revealed and he must deal with the consequences.",
                duration=148,
                genre="Action, Adventure, Sci-Fi",
                rating="PG-13",
                poster_url="https://example.com/spiderman.jpg",
                release_date=date(2021, 12, 17)
            ),
            MovieCreate(
                title="The Batman",
                description="Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues.",
                duration=176,
                genre="Action, Crime, Drama",
                rating="PG-13",
                poster_url="https://example.com/batman.jpg",
                release_date=date(2022, 3, 4)
            ),
            MovieCreate(
                title="Top Gun: Maverick",
                description="After thirty years, Maverick is still pushing the envelope as a top naval aviator.",
                duration=130,
                genre="Action, Drama",
                rating="PG-13",
                poster_url="https://example.com/topgun.jpg",
                release_date=date(2022, 5, 27)
            )
        ]
        
        created_movies = []
        for movie_data in movies:
            movie = crud.create_movie(db, movie_data)
            created_movies.append(movie)
            print(f"  ✅ Added movie: {movie.title}")
        
        # Add sample theatres
        theatres = [
            TheatreCreate(name="AMC Empire 25", city="New York", address="234 W 42nd St, New York, NY 10036", total_seats=100),
            TheatreCreate(name="Regal Union Square", city="New York", address="850 Broadway, New York, NY 10003", total_seats=120),
            TheatreCreate(name="AMC Century City", city="Los Angeles", address="10250 Santa Monica Blvd, Los Angeles, CA 90067", total_seats=150),
            TheatreCreate(name="ArcLight Hollywood", city="Los Angeles", address="6360 Sunset Blvd, Hollywood, CA 90028", total_seats=80),
        ]
        
        created_theatres = []
        for theatre_data in theatres:
            theatre = crud.create_theatre(db, theatre_data)
            created_theatres.append(theatre)
            print(f"  ✅ Added theatre: {theatre.name} in {theatre.city}")
        
        # Add sample shows
        from datetime import datetime, timedelta
        today = date.today()
        tomorrow = today + timedelta(days=1)
        
        shows = [
            # Spider-Man shows
            ShowCreate(movie_id=created_movies[0].id, theatre_id=created_theatres[0].id, show_date=today, show_time=time(14, 30), price=15.99),
            ShowCreate(movie_id=created_movies[0].id, theatre_id=created_theatres[0].id, show_date=today, show_time=time(18, 0), price=18.99),
            ShowCreate(movie_id=created_movies[0].id, theatre_id=created_theatres[1].id, show_date=tomorrow, show_time=time(20, 30), price=16.99),
            
            # Batman shows
            ShowCreate(movie_id=created_movies[1].id, theatre_id=created_theatres[2].id, show_date=today, show_time=time(19, 0), price=17.99),
            ShowCreate(movie_id=created_movies[1].id, theatre_id=created_theatres[3].id, show_date=tomorrow, show_time=time(21, 0), price=19.99),
            
            # Top Gun shows
            ShowCreate(movie_id=created_movies[2].id, theatre_id=created_theatres[0].id, show_date=today, show_time=time(16, 15), price=14.99),
            ShowCreate(movie_id=created_movies[2].id, theatre_id=created_theatres[2].id, show_date=tomorrow, show_time=time(22, 30), price=20.99),
        ]
        
        for show_data in shows:
            show = crud.create_show(db, show_data)
            print(f"  ✅ Added show: {show.movie.title} at {show.theatre.name}")
        
        print("✅ Sample data added successfully!")
        
    except Exception as e:
        print(f"❌ Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    print("🎬 Movie Booking API Setup")
    print("=" * 40)
    
    # Check if .env exists
    if not os.path.exists('.env'):
        print("❌ .env file not found!")
        print("Please create a .env file with your database configuration.")
        print("Example:")
        print("DATABASE_URL=postgresql://username:password@hostname/database_name")
        sys.exit(1)
    
    try:
        create_tables()
        seed_sample_data()
        print("\n🎉 Setup completed successfully!")
        print("You can now run the server with: python run.py")
        print("API documentation will be available at: http://localhost:8000/docs")
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
