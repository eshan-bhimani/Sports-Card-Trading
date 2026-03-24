from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from db.database import get_db
from middleware.auth import get_current_user
from models.card import Card
from models.user import User
from schemas.card import CardCreate, CardResponse, CardUpdate

router = APIRouter()


@router.get("/collections", response_model=List[CardResponse])
def list_cards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    player_name: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    brand: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    q = db.query(Card).filter(Card.owner_id == current_user.id)
    if player_name:
        q = q.filter(Card.player_name.ilike(f"%{player_name}%"))
    if year:
        q = q.filter(Card.year == year)
    if brand:
        q = q.filter(Card.brand.ilike(f"%{brand}%"))
    return q.order_by(Card.created_at.desc()).offset(offset).limit(limit).all()


@router.post("/collections", response_model=CardResponse, status_code=201)
def add_card(
    body: CardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card = Card(owner_id=current_user.id, **body.model_dump())
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.get("/collections/{card_id}", response_model=CardResponse)
def get_card(
    card_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card = db.query(Card).filter(Card.id == card_id, Card.owner_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@router.put("/collections/{card_id}", response_model=CardResponse)
def update_card(
    card_id: str,
    body: CardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card = db.query(Card).filter(Card.id == card_id, Card.owner_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(card, field, value)
    db.commit()
    db.refresh(card)
    return card


@router.delete("/collections/{card_id}", status_code=204)
def delete_card(
    card_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card = db.query(Card).filter(Card.id == card_id, Card.owner_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    db.delete(card)
    db.commit()
