
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import app.crud as crud
import app.schemas as schemas
from app.database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/movies", response_model=List[schemas.Movie])
def get_movies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get list of all movies"""
    try:
        logger.info(f"Fetching movies with skip={skip}, limit={limit}")
        movies = crud.get_movies(db, skip=skip, limit=limit)
        logger.info(f"Successfully fetched {len(movies)} movies")
        return movies
    except Exception as e:
        logger.error(f"Error fetching movies: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch movies: {str(e)}")

@router.get("/movies/{movie_id}", response_model=schemas.Movie)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    """Get details of a specific movie"""
    try:
        logger.info(f"Fetching movie with id={movie_id}")
        movie = crud.get_movie(db, movie_id=movie_id)
        if movie is None:
            logger.warning(f"Movie with id={movie_id} not found")
            raise HTTPException(status_code=404, detail="Movie not found")
        logger.info(f"Successfully fetched movie: {movie.title}")
        return movie
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching movie {movie_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch movie: {str(e)}")

@router.get("/movies/{movie_id}/shows", response_model=List[schemas.Show])
def get_movie_shows(
    movie_id: int, 
    city: Optional[str] = None, 
    date: Optional[date] = None, 
    db: Session = Depends(get_db)
):
    """Get all shows of a movie in a city on a specific date"""
    try:
        logger.info(f"Fetching shows for movie_id={movie_id}, city={city}, date={date}")
        movie = crud.get_movie(db, movie_id=movie_id)
        if movie is None:
            logger.warning(f"Movie with id={movie_id} not found")
            raise HTTPException(status_code=404, detail="Movie not found")
        
        shows = crud.get_shows_by_movie(db, movie_id=movie_id, city=city, show_date=date)
        logger.info(f"Successfully fetched {len(shows)} shows")
        return shows
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching shows for movie {movie_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch shows: {str(e)}")

@router.post("/movies", response_model=schemas.Movie)
def create_movie(movie: schemas.MovieCreate, db: Session = Depends(get_db)):
    """Create a new movie (for seeding data)"""
    try:
        logger.info(f"Creating new movie: {movie.title}")
        created_movie = crud.create_movie(db=db, movie=movie)
        logger.info(f"Successfully created movie with id={created_movie.id}")
        return created_movie
    except Exception as e:
        logger.error(f"Error creating movie: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create movie: {str(e)}")
