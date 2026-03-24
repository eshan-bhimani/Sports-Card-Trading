from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuctionCreate(BaseModel):
    title: str
    platform: Optional[str] = None
    auction_url: Optional[str] = None
    current_price: Optional[float] = None
    max_bid: Optional[float] = None
    ends_at: Optional[datetime] = None
    notes: Optional[str] = None


class AuctionUpdate(BaseModel):
    title: Optional[str] = None
    platform: Optional[str] = None
    auction_url: Optional[str] = None
    current_price: Optional[float] = None
    max_bid: Optional[float] = None
    status: Optional[str] = None
    ends_at: Optional[datetime] = None
    notes: Optional[str] = None


class AuctionResponse(BaseModel):
    id: str
    owner_id: str
    title: str
    platform: Optional[str]
    auction_url: Optional[str]
    current_price: Optional[float]
    max_bid: Optional[float]
    status: str
    ends_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}
