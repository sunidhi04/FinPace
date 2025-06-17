from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    deadline = Column(Date, nullable=True)
    status = Column(String, default="active")  # active, completed, abandoned
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="goals")