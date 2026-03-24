from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from db.database import Base


class AuctionWatch(Base):
    __tablename__ = "auction_watches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    title = Column(String(255), nullable=False)
    platform = Column(String(40))      # ebay | goldin | fanatics | pwcc
    auction_url = Column(String(500))

    # ── Pricing ────────────────────────────────────────────────────────────────
    current_price = Column(Float)
    max_bid = Column(Float)            # user's target / max willing to pay

    # ── Status ─────────────────────────────────────────────────────────────────
    status = Column(String(20), default="active")  # active | won | lost | ended
    ends_at = Column(DateTime(timezone=True))

    notes = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="auction_watches")
