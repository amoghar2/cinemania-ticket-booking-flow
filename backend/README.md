
# Movie Booking API Backend

A complete FastAPI backend for a movie ticket booking platform with PostgreSQL support.

## Quick Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Database Configuration

Create a `.env` file in the backend directory with your database configuration:

**Option A: PostgreSQL (Recommended for production)**
```env
# Replace with your actual Neon.tech PostgreSQL URL
DATABASE_URL=postgresql://username:password@ep-xyz.us-east-1.aws.neon.tech/neondb

# JWT Configuration (change the secret key!)
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Option B: SQLite (For development/testing)**
```env
# Will automatically use SQLite if no DATABASE_URL is set
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Initialize Database

```bash
python setup.py
```

### 4. Generate Sample Data

For testing and development, generate realistic sample data:

```bash
python generate_sample_data.py
```

This creates:
- 200 movies with realistic titles and poster images
- 50 theatres across 30+ cities (US & India)
- 500+ shows over the next 30 days
- 200 test users (password: `password123`)
- 300 bookings with payments

### 5. Run the Server

```bash
python run.py
```

The API will be available at:
- API: http://localhost:8000
- Swagger Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 6. Test Database Connection

Visit http://localhost:8000/health to verify the API is running.
Check http://localhost:8000/api/movies to verify movie data is loaded.

## Frontend Integration

The frontend is configured to connect to the backend automatically. Ensure both are running:

1. Backend: `python run.py` (port 8000)
2. Frontend: `npm run dev` (port 5173)

## API Endpoints

### Health & Status
- `GET /` - API info
- `GET /health` - Health check

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

### Movies (200 total)
- Popular movies with realistic titles
- High-quality poster images from various sources
- Multiple genres, ratings, and release dates
- Movies distributed across different years

### Theatres (50 total)
- Major US cities: New York, Los Angeles, Chicago, Houston, etc.
- Major Indian cities: Mumbai, Delhi, Bangalore, Chennai, etc.
- Popular theatre chains (AMC, Regal, PVR, INOX, etc.)
- Realistic addresses and seating capacities (80-200 seats)

### Shows (500+ total)
- Multiple shows per movie across different theatres
- 4-6 show times per day (morning, afternoon, evening, night)
- Dynamic pricing (evening/weekend shows cost more)
- Shows distributed over next 30 days

### Users & Bookings (200 users, 300 bookings)
- Test users with realistic names and emails
- Password for all users: `password123`
- 1-4 seats per booking
- 90% payment success rate for realistic data

## Test User Access

All generated users have the password: `password123`

Sample user emails:
- user1@example.com
- user2@example.com
- ... (check console output for full list)

## Troubleshooting

### Database Connection Issues
1. **PostgreSQL**: Verify your Neon.tech URL is correct in `.env`
2. **SQLite**: Will be created automatically in the backend directory
3. Check if you can access http://localhost:8000/health

### CORS Errors
- Backend is configured to allow all origins during development
- If issues persist, check browser developer console for specific errors

### Authentication Issues
- JWT tokens are stored in localStorage
- Tokens expire after 30 minutes by default
- Clear localStorage if experiencing login issues

### No Movies Showing
1. Ensure you ran `python generate_sample_data.py`
2. Check http://localhost:8000/api/movies directly
3. Verify database connection with health check

### API Not Responding
1. Ensure backend is running on port 8000
2. Check for missing dependencies: `pip install -r requirements.txt`
3. Verify no other service is using port 8000

## Development Tips

### Viewing Logs
- Backend logs show detailed information about requests and errors
- Check console output for database connection status
- API documentation available at http://localhost:8000/docs

### Adding New Movies
- Use the `/api/movies` POST endpoint
- Or modify `generate_sample_data.py` and re-run

### Database Reset
```bash
# For SQLite (deletes the database file)
rm movie_booking.db

# For PostgreSQL (drops all tables)
python -c "from app.database import engine, Base; Base.metadata.drop_all(bind=engine)"

# Then re-run setup
python setup.py
python generate_sample_data.py
```

## Production Deployment

1. Use a strong `SECRET_KEY` in production
2. Set specific CORS origins (not `"*"`)
3. Use PostgreSQL for production database
4. Add proper logging and monitoring
5. Implement rate limiting
6. Use environment variables for all secrets
