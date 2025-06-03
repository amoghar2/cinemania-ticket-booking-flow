
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import app.crud as crud
import app.schemas as schemas
from app.database import get_db

router = APIRouter()

@router.get("/theatres", response_model=List[schemas.Theatre])
def get_theatres(city: str, db: Session = Depends(get_db)):
    """List all theatres in a given city"""
    theatres = crud.get_theatres_by_city(db, city=city)
    return theatres

@router.post("/theatres", response_model=schemas.Theatre)
def create_theatre(theatre: schemas.TheatreCreate, db: Session = Depends(get_db)):
    """Create a new theatre (for seeding data)"""
    return crud.create_theatre(db=db, theatre=theatre)
