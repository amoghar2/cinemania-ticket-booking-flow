
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models, schemas, crud
from datetime import date, time, datetime

def seed_database():
    """Seed the database with sample data"""
    
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Create sample movies
        movies_data = [
            {
                "title": "Avengers: Endgame",
                "description": "The Avengers assemble once more to reverse Thanos' actions.",
                "duration": 181,
                "genre": "Action",
                "rating": "PG-13",
                "poster_url": "https://example.com/avengers.jpg",
                "release_date": date(2019, 4, 26)
            },
            {
                "title": "The Lion King",
                "description": "A young lion prince flees his kingdom after the murder of his father.",
                "duration": 118,
                "genre": "Animation",
                "rating": "PG",
                "poster_url": "https://example.com/lionking.jpg",
                "release_date": date(2019, 7, 19)
            },
            {
                "title": "Joker",
                "description": "A failed comedian begins a slow descent into madness.",
                "duration": 122,
                "genre": "Drama",
                "rating": "R",
                "poster_url": "https://example.com/joker.jpg",
                "release_date": date(2019, 10, 4)
            }
        ]
        
        created_movies = []
        for movie_data in movies_data:
            movie = crud.create_movie(db, schemas.MovieCreate(**movie_data))
            created_movies.append(movie)
            print(f"Created movie: {movie.title}")
        
        # Create sample theatres
        theatres_data = [
            {
                "name": "Cineplex Downtown",
                "city": "New York",
                "address": "123 Broadway, New York, NY 10001",
                "total_seats": 100
            },
            {
                "name": "AMC Times Square",
                "city": "New York",
                "address": "234 W 42nd St, New York, NY 10036",
                "total_seats": 150
            },
            {
                "name": "PVR Select",
                "city": "Mumbai",
                "address": "456 Marine Drive, Mumbai, MH 400001",
                "total_seats": 120
            }
        ]
        
        created_theatres = []
        for theatre_data in theatres_data:
            theatre = crud.create_theatre(db, schemas.TheatreCreate(**theatre_data))
            created_theatres.append(theatre)
            print(f"Created theatre: {theatre.name}")
        
        # Create sample shows
        shows_data = [
            {
                "movie_id": created_movies[0].id,
                "theatre_id": created_theatres[0].id,
                "show_date": date(2024, 6, 15),
                "show_time": time(14, 30),
                "price": 12.50
            },
            {
                "movie_id": created_movies[0].id,
                "theatre_id": created_theatres[0].id,
                "show_date": date(2024, 6, 15),
                "show_time": time(18, 00),
                "price": 15.00
            },
            {
                "movie_id": created_movies[1].id,
                "theatre_id": created_theatres[1].id,
                "show_date": date(2024, 6, 15),
                "show_time": time(16, 15),
                "price": 10.00
            },
            {
                "movie_id": created_movies[2].id,
                "theatre_id": created_theatres[2].id,
                "show_date": date(2024, 6, 16),
                "show_time": time(20, 30),
                "price": 13.75
            }
        ]
        
        for show_data in shows_data:
            show = crud.create_show(db, schemas.ShowCreate(**show_data))
            print(f"Created show: {show.movie.title} at {show.theatre.name}")
        
        # Create a sample user
        user_data = {
            "email": "test@example.com",
            "password": "password123",
            "first_name": "John",
            "last_name": "Doe"
        }
        
        user = crud.create_user(db, schemas.UserCreate(**user_data))
        print(f"Created user: {user.email}")
        
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
