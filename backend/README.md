
# Movie Booking API Backend

A complete FastAPI backend for a movie ticket booking platform.

## Features

- Movie listings and details
- Theatre management by city
- Show scheduling and seat management
- Seat locking mechanism (5-minute expiry)
- User authentication (JWT-based)
- Booking system with payment integration
- Mock payment gateway
- Complete CRUD operations
- SQLAlchemy ORM with PostgreSQL/SQLite support

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite:///./movies.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

For PostgreSQL, use:
```env
DATABASE_URL=postgresql://username:password@localhost/movie_booking
```

### 3. Seed the Database

```bash
python seed_data.py
```

### 4. Run the Server

```bash
python run.py
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Swagger Documentation: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Movies
- `GET /api/movies` - List all movies
- `GET /api/movies/{movie_id}` - Get movie details
- `GET /api/movies/{movie_id}/shows?city=XYZ&date=YYYY-MM-DD` - Get movie shows
- `POST /api/movies` - Create movie (admin)

### Theatres
- `GET /api/theatres?city=XYZ` - List theatres in city
- `POST /api/theatres` - Create theatre (admin)

### Shows & Seats
- `GET /api/shows/{show_id}` - Get show details
- `GET /api/shows/{show_id}/seats` - Get seat availability
- `POST /api/shows` - Create show (admin)
- `POST /api/seats/lock` - Lock seats temporarily

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/{booking_id}` - Get booking details

### Users & Auth
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user
- `GET /api/users/{user_id}/bookings` - Get user bookings

### Payments
- `POST /api/payments/initiate` - Start payment
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/mock-callback` - Mock payment callback

## Database Schema

The system includes these main entities:
- **Movies**: Basic movie information
- **Theatres**: Theatre locations and details
- **Shows**: Movie screenings at specific times
- **Seats**: Individual seats for each show
- **Users**: User accounts with authentication
- **Bookings**: Ticket reservations
- **Payments**: Payment transactions

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Seat Locking System

Seats are locked for 5 minutes when selected to prevent double booking. The system automatically releases expired locks.

## Testing the API

1. **Register a user**:
```bash
curl -X POST "http://localhost:8000/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

2. **Get movies**:
```bash
curl "http://localhost:8000/api/movies"
```

3. **Lock seats**:
```bash
curl -X POST "http://localhost:8000/api/seats/lock" \
  -H "Content-Type: application/json" \
  -d '{
    "show_id": 1,
    "seat_ids": [1, 2, 3],
    "user_session": "unique_session_id"
  }'
```

4. **Create booking**:
```bash
curl -X POST "http://localhost:8000/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "show_id": 1,
    "seat_ids": [1, 2, 3],
    "user_email": "user@example.com"
  }'
```

## Production Considerations

- Replace SQLite with PostgreSQL for production
- Implement Redis for seat locking in distributed environments
- Add proper error handling and logging
- Implement rate limiting
- Add input validation and sanitization
- Use environment variables for all configuration
- Implement proper database migrations with Alembic
- Add monitoring and health checks
