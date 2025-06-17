from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class InvestmentBase(BaseModel):
    ticker: str
    quantity: float = Field(..., gt=0)
    avg_buy_price: float = Field(..., gt=0)
    asset_type: str = "stock"  # stock, etf, crypto, etc.
    purchase_date: Optional[datetime] = None
    notes: Optional[str] = None

class InvestmentCreate(InvestmentBase):
    pass

class InvestmentUpdate(BaseModel):
    ticker: Optional[str] = None
    quantity: Optional[float] = Field(None, gt=0)
    avg_buy_price: Optional[float] = Field(None, gt=0)
    asset_type: Optional[str] = None
    purchase_date: Optional[datetime] = None
    notes: Optional[str] = None

class InvestmentInDBBase(InvestmentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Investment(InvestmentInDBBase):
    pass

class InvestmentWithMarketData(Investment):
    current_price: float
    market_value: float
    profit_loss: float
    profit_loss_percentage: float
    last_updated: datetime