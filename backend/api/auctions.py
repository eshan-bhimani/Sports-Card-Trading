from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from middleware.auth import get_current_user
from models.auction import AuctionWatch
from models.user import User
from schemas.auction import AuctionCreate, AuctionResponse, AuctionUpdate

router = APIRouter()


@router.get("/auctions", response_model=List[AuctionResponse])
def list_auctions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(AuctionWatch)
        .filter(AuctionWatch.owner_id == current_user.id)
        .order_by(AuctionWatch.created_at.desc())
        .all()
    )


@router.post("/auctions", response_model=AuctionResponse, status_code=201)
def add_auction(
    body: AuctionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    watch = AuctionWatch(owner_id=current_user.id, **body.model_dump())
    db.add(watch)
    db.commit()
    db.refresh(watch)
    return watch


@router.put("/auctions/{auction_id}", response_model=AuctionResponse)
def update_auction(
    auction_id: str,
    body: AuctionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    watch = db.query(AuctionWatch).filter(
        AuctionWatch.id == auction_id, AuctionWatch.owner_id == current_user.id
    ).first()
    if not watch:
        raise HTTPException(status_code=404, detail="Auction watch not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(watch, field, value)
    db.commit()
    db.refresh(watch)
    return watch


@router.delete("/auctions/{auction_id}", status_code=204)
def delete_auction(
    auction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    watch = db.query(AuctionWatch).filter(
        AuctionWatch.id == auction_id, AuctionWatch.owner_id == current_user.id
    ).first()
    if not watch:
        raise HTTPException(status_code=404, detail="Auction watch not found")
    db.delete(watch)
    db.commit()
