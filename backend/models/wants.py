from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from db.database import Base


class WantItem(Base):
    __tablename__ = "wants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    player_name = Column(String(120), nullable=False, index=True)
    year = Column(Integer)
    brand = Column(String(80))
    set_name = Column(String(120))
    card_number = Column(String(30))
    variation = Column(String(120))

    # ── Search criteria ────────────────────────────────────────────────────────
    max_price = Column(Float)
    min_grade = Column(Float)
    grading_company = Column(String(20))
    priority = Column(String(10), default="medium")   # low | medium | high

    notes = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    owner = relationship("User", back_populates="wants")
