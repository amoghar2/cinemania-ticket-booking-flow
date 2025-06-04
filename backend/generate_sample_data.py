
"""
Generate large amounts of sample data for the Movie Booking Platform
Run this script to populate your database with realistic test data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models, schemas, crud
from datetime import date, time, datetime, timedelta
import random
from faker import Faker
import uuid

fake = Faker()

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def generate_movies(db: Session, count: int = 50):
    """Generate sample movies"""
    print(f"Generating {count} movies...")
    
    genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Animation", "Adventure", "Crime", "Fantasy", "Mystery", "War", "Western", "Musical"]
    ratings = ["G", "PG", "PG-13", "R", "NC-17"]
    
    # Popular movie titles for realistic data
    movie_titles = [
        "Spider-Man: No Way Home", "Avengers: Endgame", "Avatar", "Titanic", "Star Wars: The Force Awakens",
        "Avengers: Infinity War", "Black Panther", "Harry Potter and the Deathly Hallows", "The Lion King",
        "Jurassic World", "The Avengers", "Frozen", "Beauty and the Beast", "Incredibles 2", "The Fate of the Furious",
        "Iron Man 3", "Minions", "Captain America: Civil War", "Aquaman", "The Lord of the Rings",
        "The Dark Knight", "Harry Potter and the Philosopher's Stone", "Despicable Me 3", "The Jungle Book",
        "Pirates of the Caribbean", "Finding Dory", "Rogue One", "Captain Marvel", "Thor: Ragnarok",
        "Wonder Woman", "Guardians of the Galaxy Vol. 2", "Spider-Man: Homecoming", "It", "Justice League",
        "The Secret Life of Pets", "Deadpool", "Zootopia", "Batman v Superman", "Suicide Squad",
        "The Hunger Games", "Transformers", "Moana", "Doctor Strange", "Fast & Furious 6", "X-Men",
        "Shrek 2", "The Matrix", "Forrest Gump", "The Godfather", "Pulp Fiction", "Fight Club"
    ]
    
    created_movies = []
    for i in range(count):
        title = random.choice(movie_titles) if i < len(movie_titles) else f"{fake.catch_phrase()} {fake.word().title()}"
        
        movie_data = schemas.MovieCreate(
            title=title,
            description=fake.text(max_nb_chars=300),
            duration=random.randint(90, 180),
            genre=random.choice(genres),
            rating=random.choice(ratings),
            poster_url=f"https://picsum.photos/300/450?random={i}",
            release_date=fake.date_between(start_date='-5y', end_date='today')
        )
        
        movie = crud.create_movie(db, movie_data)
        created_movies.append(movie)
        
        if (i + 1) % 10 == 0:
            print(f"  Created {i + 1} movies...")
    
    print(f"✅ Generated {len(created_movies)} movies")
    return created_movies

def generate_theatres(db: Session, count: int = 30):
    """Generate sample theatres"""
    print(f"Generating {count} theatres...")
    
    cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", 
              "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "San Francisco", "Columbus",
              "Charlotte", "Indianapolis", "Seattle", "Denver", "Washington", "Boston", "Nashville",
              "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"]
    
    theatre_chains = ["AMC", "Regal", "Cinemark", "Marcus", "Harkins", "ArcLight", "Landmark", "PVR", "INOX", "Cinepolis"]
    
    created_theatres = []
    for i in range(count):
        city = random.choice(cities)
        chain = random.choice(theatre_chains)
        
        theatre_data = schemas.TheatreCreate(
            name=f"{chain} {fake.word().title()} {random.choice(['Cinema', 'Multiplex', 'Theatre', 'IMAX', 'Plaza'])}",
            city=city,
            address=fake.address().replace('\n', ', '),
            total_seats=random.choice([80, 100, 120, 150, 200, 250])
        )
        
        theatre = crud.create_theatre(db, theatre_data)
        created_theatres.append(theatre)
        
        if (i + 1) % 10 == 0:
            print(f"  Created {i + 1} theatres...")
    
    print(f"✅ Generated {len(created_theatres)} theatres")
    return created_theatres

def generate_shows(db: Session, movies, theatres, count: int = 200):
    """Generate sample shows"""
    print(f"Generating {count} shows...")
    
    show_times = [
        time(10, 0), time(12, 30), time(15, 0), time(17, 30),
        time(20, 0), time(22, 30), time(14, 15), time(16, 45),
        time(19, 15), time(21, 45)
    ]
    
    # Generate shows for the next 30 days
    start_date = date.today()
    end_date = start_date + timedelta(days=30)
    
    created_shows = []
    for i in range(count):
        movie = random.choice(movies)
        theatre = random.choice(theatres)
        show_date = fake.date_between(start_date=start_date, end_date=end_date)
        show_time = random.choice(show_times)
        
        # Price varies by theatre location and time
        base_price = random.uniform(8.0, 25.0)
        if show_time >= time(18, 0):  # Evening shows are more expensive
            base_price *= 1.3
        
        show_data = schemas.ShowCreate(
            movie_id=movie.id,
            theatre_id=theatre.id,
            show_date=show_date,
            show_time=show_time,
            price=round(base_price, 2)
        )
        
        show = crud.create_show(db, show_data)
        created_shows.append(show)
        
        if (i + 1) % 50 == 0:
            print(f"  Created {i + 1} shows...")
    
    print(f"✅ Generated {len(created_shows)} shows")
    return created_shows

def generate_users(db: Session, count: int = 100):
    """Generate sample users"""
    print(f"Generating {count} users...")
    
    created_users = []
    for i in range(count):
        user_data = schemas.UserCreate(
            email=fake.unique.email(),
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            password="password123"  # Same password for all test users
        )
        
        user = crud.create_user(db, user_data)
        created_users.append(user)
        
        if (i + 1) % 25 == 0:
            print(f"  Created {i + 1} users...")
    
    print(f"✅ Generated {len(created_users)} users")
    return created_users

def generate_bookings(db: Session, users, shows, count: int = 150):
    """Generate sample bookings"""
    print(f"Generating {count} bookings...")
    
    created_bookings = []
    for i in range(count):
        user = random.choice(users)
        show = random.choice(shows)
        
        # Get available seats for this show
        available_seats = db.query(models.Seat).filter(
            models.Seat.show_id == show.id,
            models.Seat.is_booked == False
        ).all()
        
        if not available_seats:
            continue
        
        # Book 1-4 seats randomly
        num_seats = random.randint(1, min(4, len(available_seats)))
        selected_seats = random.sample(available_seats, num_seats)
        
        booking_data = schemas.BookingCreate(
            show_id=show.id,
            seat_ids=[seat.id for seat in selected_seats],
            user_email=user.email
        )
        
        booking = crud.create_booking(db, booking_data)
        if booking:
            created_bookings.append(booking)
            
            # Create a payment for this booking
            payment_data = schemas.PaymentInitiate(
                booking_id=booking.id,
                amount=booking.total_amount,
                payment_method=random.choice(["card", "paypal", "applepay", "googlepay"])
            )
            
            payment = crud.create_payment(db, payment_data)
            
            # 85% of payments are successful
            if random.random() < 0.85:
                crud.confirm_payment(db, payment.transaction_id, "success")
            else:
                crud.confirm_payment(db, payment.transaction_id, "failed")
        
        if (i + 1) % 25 == 0:
            print(f"  Created {i + 1} bookings...")
    
    print(f"✅ Generated {len(created_bookings)} bookings")
    return created_bookings

def main():
    print("🎬 Movie Booking Platform - Sample Data Generator")
    print("=" * 60)
    
    # Check if .env exists
    if not os.path.exists('.env'):
        print("❌ .env file not found!")
        print("Please create a .env file with your database configuration.")
        sys.exit(1)
    
    try:
        create_tables()
        
        db = SessionLocal()
        
        try:
            # Check if data already exists
            existing_movies = crud.get_movies(db, limit=1)
            if existing_movies:
                print("⚠️  Database already contains data.")
                response = input("Do you want to add more sample data anyway? (y/N): ")
                if response.lower() != 'y':
                    print("Cancelled.")
                    return
            
            print("\n🚀 Starting data generation...")
            print("This might take a few minutes for large datasets...\n")
            
            # Generate data
            movies = generate_movies(db, count=80)
            theatres = generate_theatres(db, count=40)
            shows = generate_shows(db, movies, theatres, count=300)
            users = generate_users(db, count=150)
            bookings = generate_bookings(db, users, shows, count=200)
            
            print("\n" + "=" * 60)
            print("🎉 Sample data generation completed successfully!")
            print("\n📊 Summary:")
            print(f"  • {len(movies)} movies")
            print(f"  • {len(theatres)} theatres")
            print(f"  • {len(shows)} shows")
            print(f"  • {len(users)} users")
            print(f"  • {len(bookings)} bookings")
            
            # Count total seats
            total_seats = db.query(models.Seat).count()
            booked_seats = db.query(models.Seat).filter(models.Seat.is_booked == True).count()
            print(f"  • {total_seats} total seats created")
            print(f"  • {booked_seats} seats booked")
            
            print("\n💡 Test user credentials:")
            print("  Email: Any generated email (check console output)")
            print("  Password: password123")
            
            print("\n🚀 You can now start the server with: python run.py")
            
        except Exception as e:
            print(f"❌ Error generating sample data: {e}")
            db.rollback()
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
