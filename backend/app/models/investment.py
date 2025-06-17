from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    ticker = Column(String, nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    avg_buy_price = Column(Float, nullable=False)
    asset_type = Column(String, default="stock")  # stock, etf, crypto, etc.
    purchase_date = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="investments")