from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WantCreate(BaseModel):
    player_name: str
    year: Optional[int] = None
    brand: Optional[str] = None
    set_name: Optional[str] = None
    card_number: Optional[str] = None
    variation: Optional[str] = None
    max_price: Optional[float] = None
    min_grade: Optional[float] = None
    grading_company: Optional[str] = None
    notes: Optional[str] = None
    priority: str = "medium"


class WantResponse(BaseModel):
    id: str
    owner_id: str
    player_name: str
    year: Optional[int]
    brand: Optional[str]
    set_name: Optional[str]
    card_number: Optional[str]
    variation: Optional[str]
    max_price: Optional[float]
    min_grade: Optional[float]
    grading_company: Optional[str]
    notes: Optional[str]
    priority: str
    created_at: datetime

    model_config = {"from_attributes": True}
