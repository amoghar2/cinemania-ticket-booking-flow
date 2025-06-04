
# Movie Booking API Backend

A complete FastAPI backend for a movie ticket booking platform with PostgreSQL support.

## Quick Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Database Configuration

Create a `.env` file in the backend directory with your Neon.tech PostgreSQL connection:

```env
# Replace with your actual Neon.tech PostgreSQL URL
DATABASE_URL=postgresql://username:password@ep-xyz.us-east-1.aws.neon.tech/neondb

# JWT Configuration (change the secret key!)
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Initialize Database

```bash
python setup.py
```

### 4. Generate Sample Data (Optional)

For testing and development, you can generate realistic sample data:

```bash
python generate_sample_data.py
```

This will create:
- 80 movies with realistic titles and details
- 40 theatres across multiple cities
- 300 shows over the next 30 days
- 150 test users (password: `password123`)
- 200 bookings with payments

### 5. Run the Server

```bash
python run.py
```

The API will be available at:
- API: http://localhost:8000
- Swagger Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## Frontend Integration

The frontend is configured to connect to the backend automatically. Make sure both are running:

1. Backend: `python run.py` (port 8000)
2. Frontend: `npm run dev` (port 5173)

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user info

### Movies & Shows
- `GET /api/movies` - List all movies
- `GET /api/movies/{id}` - Get movie details
- `GET /api/movies/{id}/shows` - Get movie shows
- `GET /api/shows/{id}/seats` - Get seat availability

### Booking & Payments
- `POST /api/seats/lock` - Lock seats temporarily
- `POST /api/bookings` - Create booking
- `GET /api/users/{id}/bookings` - Get user bookings
- `POST /api/payments/initiate` - Start payment
- `POST /api/payments/confirm` - Confirm payment

## Sample Data Details

The sample data generator creates realistic test data:

### Movies
- 80 popular movies with realistic titles
- Random genres, ratings, and release dates
- Poster URLs using picsum.photos

### Theatres  
- 40 theatres across major US and Indian cities
- Popular theatre chains (AMC, Regal, PVR, etc.)
- Realistic addresses and seating capacities

### Shows
- 300 shows distributed over next 30 days
- Multiple show times per day
- Dynamic pricing (evening shows cost more)

### Users & Bookings
- 150 test users with realistic names
- 200 bookings with 1-4 seats each
- 85% payment success rate for realistic data

## Test User Access

All generated users have the password: `password123`

You can find user emails in the console output when running the sample data generator, or check the database directly.

## Troubleshooting

### Database Connection Issues
1. Verify your Neon.tech URL is correct in `.env`
2. Make sure your Neon.tech database is active
3. Check if you can connect directly to the database

### CORS Errors
- The backend is configured to allow requests from `localhost:5173`
- If using a different port, update `FRONTEND_URL` in `.env`

### Authentication Issues
- JWT tokens are stored in localStorage
- Tokens expire after 30 minutes by default
- Change `SECRET_KEY` in production

## Production Deployment

1. Use a strong `SECRET_KEY`
2. Set proper CORS origins
3. Use connection pooling for PostgreSQL
4. Add proper logging and monitoring
5. Implement rate limiting
