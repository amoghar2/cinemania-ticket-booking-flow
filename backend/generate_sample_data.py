
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

def generate_movies(db: Session, count: int = 100):
    """Generate sample movies with realistic posters"""
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
        "Shrek 2", "The Matrix", "Forrest Gump", "The Godfather", "Pulp Fiction", "Fight Club",
        "Inception", "The Shawshank Redemption", "Interstellar", "Gladiator", "The Departed", "Casino Royale",
        "Mad Max: Fury Road", "John Wick", "La La Land", "Parasite", "Joker", "1917", "Once Upon a Time in Hollywood",
        "Knives Out", "Ford v Ferrari", "Dune", "No Time to Die", "Top Gun: Maverick", "Elvis", "The Batman",
        "Everything Everywhere All at Once", "Avatar: The Way of Water", "Black Adam", "Wakanda Forever",
        "Glass Onion", "The Menu", "Bullet Train", "Nope", "Minions: The Rise of Gru", "Lightyear",
        "Thor: Love and Thunder", "Doctor Strange in the Multiverse of Madness", "Morbius", "The Northman",
        "X", "Scream", "The King's Man", "House of Gucci", "Eternals", "Venom: Let There Be Carnage",
        "F9: The Fast Saga", "Godzilla vs. Kong", "Zack Snyder's Justice League", "Cruella", "A Quiet Place Part II",
        "In the Heights", "The Suicide Squad", "Space Jam: A New Legacy", "Jungle Cruise", "Free Guy",
        "Shang-Chi and the Legend of the Ten Rings", "Candyman", "Malignant", "The Many Saints of Newark",
        "Halloween Kills", "Last Night in Soho", "Antlers", "Resident Evil: Welcome to Raccoon City"
    ]
    
    # Movie poster URLs from unsplash with movie-related themes
    poster_themes = [
        "https://images.unsplash.com/photo-1489599317671-61b514b9d3e4?w=300&h=450&fit=crop", # Cinema
        "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop", # Action
        "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=300&h=450&fit=crop", # Dark theme
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=450&fit=crop", # Adventure
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop", # Drama
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop", # Romance
        "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=450&fit=crop", # Sci-fi
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop", # Horror
    ]
    
    created_movies = []
    for i in range(count):
        title = movie_titles[i] if i < len(movie_titles) else f"{fake.catch_phrase()} {fake.word().title()}"
        genre = random.choice(genres)
        
        # Pick poster based on genre
        if genre in ["Action", "Adventure"]:
            poster_url = poster_themes[1]
        elif genre == "Horror":
            poster_url = poster_themes[7]
        elif genre == "Romance":
            poster_url = poster_themes[5]
        elif genre == "Sci-Fi":
            poster_url = poster_themes[6]
        elif genre == "Drama":
            poster_url = poster_themes[4]
        else:
            poster_url = random.choice(poster_themes)
        
        # Add random parameter to make each image unique
        poster_url += f"&random={i}"
        
        movie_data = schemas.MovieCreate(
            title=title,
            description=fake.text(max_nb_chars=300),
            duration=random.randint(90, 180),
            genre=genre,
            rating=random.choice(ratings),
            poster_url=poster_url,
            release_date=fake.date_between(start_date='-5y', end_date='today')
        )
        
        movie = crud.create_movie(db, movie_data)
        created_movies.append(movie)
        
        if (i + 1) % 10 == 0:
            print(f"  Created {i + 1} movies...")
    
    print(f"✅ Generated {len(created_movies)} movies")
    return created_movies

def generate_theatres(db: Session, count: int = 60):
    """Generate sample theatres across many cities"""
    print(f"Generating {count} theatres...")
    
    # Expanded city list with both US and international cities
    cities = [
        # Indian cities
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
        "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam",
        "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
        # US cities
        "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio",
        "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "San Francisco", "Columbus",
        "Charlotte", "Indianapolis", "Seattle", "Denver", "Washington", "Boston", "Nashville",
        "Detroit", "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore", "Milwaukee",
        "Albuquerque", "Tucson", "Fresno", "Sacramento", "Kansas City", "Mesa", "Atlanta",
        "Colorado Springs", "Omaha", "Raleigh", "Miami", "Virginia Beach", "Oakland", "Minneapolis",
        "Tulsa", "Arlington", "Tampa", "New Orleans", "Wichita", "Cleveland", "Bakersfield"
    ]
    
    theatre_chains = [
        # Indian chains
        "PVR", "INOX", "Cinepolis", "MovieMax", "SPI Cinemas", "Miraj Cinemas", "Wave Cinemas", "Fun Cinemas",
        # US chains
        "AMC", "Regal", "Cinemark", "Marcus", "Harkins", "ArcLight", "Landmark", "Showcase", "Carmike"
    ]
    
    theatre_types = ["Cinema", "Multiplex", "Theatre", "IMAX", "Plaza", "Mall", "Complex", "Center", "Megaplex"]
    
    created_theatres = []
    for i in range(count):
        city = random.choice(cities)
        chain = random.choice(theatre_chains)
        theatre_type = random.choice(theatre_types)
        
        # Create location-appropriate names
        if city in ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"]:
            location_name = random.choice(["City Center", "Mall Road", "MG Road", "Brigade Road", "Linking Road", "Commercial Street", "Park Street", "SG Highway"])
        else:
            location_name = random.choice(["Downtown", "Mall", "Plaza", "Center", "Square", "Avenue", "Boulevard", "Street"])
        
        theatre_data = schemas.TheatreCreate(
            name=f"{chain} {location_name} {theatre_type}",
            city=city,
            address=fake.address().replace('\n', ', '),
            total_seats=random.choice([80, 100, 120, 150, 200, 250, 300])
        )
        
        theatre = crud.create_theatre(db, theatre_data)
        created_theatres.append(theatre)
        
        if (i + 1) % 10 == 0:
            print(f"  Created {i + 1} theatres...")
    
    print(f"✅ Generated {len(created_theatres)} theatres")
    return created_theatres

def generate_shows(db: Session, movies, theatres, count: int = 500):
    """Generate sample shows with better distribution"""
    print(f"Generating {count} shows...")
    
    show_times = [
        time(9, 0), time(10, 30), time(12, 0), time(13, 30), time(15, 0), time(16, 30),
        time(18, 0), time(19, 30), time(21, 0), time(22, 30), time(14, 15), time(16, 45),
        time(19, 15), time(21, 45), time(11, 30), time(17, 15), time(20, 30)
    ]
    
    # Generate shows for the next 45 days
    start_date = date.today()
    end_date = start_date + timedelta(days=45)
    
    created_shows = []
    for i in range(count):
        movie = random.choice(movies)
        theatre = random.choice(theatres)
        show_date = fake.date_between(start_date=start_date, end_date=end_date)
        show_time = random.choice(show_times)
        
        # Price varies by theatre location, city, and time
        base_price = random.uniform(5.0, 30.0)
        
        # City-based pricing
        if theatre.city in ["Mumbai", "Delhi", "Bangalore", "New York", "Los Angeles", "San Francisco"]:
            base_price *= 1.5  # Premium cities
        elif theatre.city in ["Hyderabad", "Chennai", "Chicago", "Boston", "Seattle"]:
            base_price *= 1.3  # Tier 1 cities
        elif theatre.city in ["Pune", "Kolkata", "Houston", "Phoenix", "Philadelphia"]:
            base_price *= 1.1  # Tier 2 cities
        
        # Time-based pricing
        if show_time >= time(18, 0):  # Evening shows
            base_price *= 1.4
        elif show_time >= time(15, 0):  # Afternoon shows
            base_price *= 1.2
        
        # Weekend pricing
        if show_date.weekday() >= 5:  # Saturday and Sunday
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

def generate_users(db: Session, count: int = 200):
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

def generate_bookings(db: Session, users, shows, count: int = 300):
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
        
        # Book 1-6 seats randomly (more realistic distribution)
        num_seats = random.choices([1, 2, 3, 4, 5, 6], weights=[20, 35, 25, 15, 3, 2])[0]
        num_seats = min(num_seats, len(available_seats))
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
                payment_method=random.choice(["card", "paypal", "applepay", "googlepay", "upi", "netbanking"])
            )
            
            payment = crud.create_payment(db, payment_data)
            
            # 90% of payments are successful
            if random.random() < 0.90:
                crud.confirm_payment(db, payment.transaction_id, "success")
            else:
                crud.confirm_payment(db, payment.transaction_id, "failed")
        
        if (i + 1) % 25 == 0:
            print(f"  Created {i + 1} bookings...")
    
    print(f"✅ Generated {len(created_bookings)} bookings")
    return created_bookings

def main():
    print("🎬 Movie Booking Platform - Enhanced Sample Data Generator")
    print("=" * 70)
    
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
            
            print("\n🚀 Starting enhanced data generation...")
            print("This might take a few minutes for large datasets...\n")
            
            # Generate data with larger counts
            movies = generate_movies(db, count=120)
            theatres = generate_theatres(db, count=80)
            shows = generate_shows(db, movies, theatres, count=600)
            users = generate_users(db, count=250)
            bookings = generate_bookings(db, users, shows, count=400)
            
            print("\n" + "=" * 70)
            print("🎉 Enhanced sample data generation completed successfully!")
            print("\n📊 Summary:")
            print(f"  • {len(movies)} movies with realistic posters")
            print(f"  • {len(theatres)} theatres across {len(set([t.city for t in theatres]))} cities")
            print(f"  • {len(shows)} shows over next 45 days")
            print(f"  • {len(users)} users")
            print(f"  • {len(bookings)} bookings")
            
            # Count total seats
            total_seats = db.query(models.Seat).count()
            booked_seats = db.query(models.Seat).filter(models.Seat.is_booked == True).count()
            print(f"  • {total_seats} total seats created")
            print(f"  • {booked_seats} seats booked ({round(booked_seats/total_seats*100, 1)}% occupancy)")
            
            # Show city distribution
            city_counts = {}
            for theatre in theatres:
                city_counts[theatre.city] = city_counts.get(theatre.city, 0) + 1
            
            print(f"\n🌍 Cities with theatres:")
            for city, count in sorted(city_counts.items()):
                print(f"  • {city}: {count} theatres")
            
            print("\n💡 Test user credentials:")
            print("  Email: Any generated email (check console output)")
            print("  Password: password123")
            
            print("\n🚀 You can now start the server with: python run.py")
            
        except Exception as e:
            print(f"❌ Error generating sample data: {e}")
            db.rollback()
            raise e
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
