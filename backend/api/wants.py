from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from middleware.auth import get_current_user
from models.user import User
from models.wants import WantItem
from schemas.wants import WantCreate, WantResponse

router = APIRouter()


@router.get("/wants", response_model=List[WantResponse])
def list_wants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(WantItem)
        .filter(WantItem.owner_id == current_user.id)
        .order_by(WantItem.created_at.desc())
        .all()
    )


@router.post("/wants", response_model=WantResponse, status_code=201)
def add_want(
    body: WantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = WantItem(owner_id=current_user.id, **body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/wants/{want_id}", status_code=204)
def remove_want(
    want_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(WantItem).filter(
        WantItem.id == want_id, WantItem.owner_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Want item not found")
    db.delete(item)
    db.commit()
