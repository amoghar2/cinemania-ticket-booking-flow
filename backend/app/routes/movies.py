
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import app.crud as crud
import app.schemas as schemas
from app.database import get_db

router = APIRouter()

@router.get("/movies", response_model=List[schemas.Movie])
def get_movies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get list of all movies"""
    movies = crud.get_movies(db, skip=skip, limit=limit)
    return movies

@router.get("/movies/{movie_id}", response_model=schemas.Movie)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    """Get details of a specific movie"""
    movie = crud.get_movie(db, movie_id=movie_id)
    if movie is None:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

@router.get("/movies/{movie_id}/shows", response_model=List[schemas.Show])
def get_movie_shows(
    movie_id: int, 
    city: Optional[str] = None, 
    date: Optional[date] = None, 
    db: Session = Depends(get_db)
):
    """Get all shows of a movie in a city on a specific date"""
    movie = crud.get_movie(db, movie_id=movie_id)
    if movie is None:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    shows = crud.get_shows_by_movie(db, movie_id=movie_id, city=city, show_date=date)
    return shows

@router.post("/movies", response_model=schemas.Movie)
def create_movie(movie: schemas.MovieCreate, db: Session = Depends(get_db)):
    """Create a new movie (for seeding data)"""
    return crud.create_movie(db=db, movie=movie)
