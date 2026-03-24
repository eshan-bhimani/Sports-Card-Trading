from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CardCreate(BaseModel):
    player_name: str
    year: Optional[int] = None
    brand: Optional[str] = None
    set_name: Optional[str] = None
    card_number: Optional[str] = None
    variation: Optional[str] = None
    condition: Optional[str] = None
    grade: Optional[float] = None
    grading_company: Optional[str] = None
    cert_number: Optional[str] = None
    purchase_price: Optional[float] = None
    current_value: Optional[float] = None
    front_image_url: Optional[str] = None
    back_image_url: Optional[str] = None
    notes: Optional[str] = None
    is_for_sale: bool = False
    asking_price: Optional[float] = None


class CardUpdate(BaseModel):
    """All fields optional — supports partial updates."""
    player_name: Optional[str] = None
    year: Optional[int] = None
    brand: Optional[str] = None
    set_name: Optional[str] = None
    card_number: Optional[str] = None
    variation: Optional[str] = None
    condition: Optional[str] = None
    grade: Optional[float] = None
    grading_company: Optional[str] = None
    cert_number: Optional[str] = None
    purchase_price: Optional[float] = None
    current_value: Optional[float] = None
    front_image_url: Optional[str] = None
    back_image_url: Optional[str] = None
    notes: Optional[str] = None
    is_for_sale: Optional[bool] = None
    asking_price: Optional[float] = None


class CardResponse(BaseModel):
    id: str
    owner_id: str
    player_name: str
    year: Optional[int]
    brand: Optional[str]
    set_name: Optional[str]
    card_number: Optional[str]
    variation: Optional[str]
    condition: Optional[str]
    grade: Optional[float]
    grading_company: Optional[str]
    cert_number: Optional[str]
    purchase_price: Optional[float]
    current_value: Optional[float]
    front_image_url: Optional[str]
    back_image_url: Optional[str]
    notes: Optional[str]
    is_for_sale: bool
    asking_price: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}
