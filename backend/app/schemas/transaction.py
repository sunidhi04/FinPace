from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TransactionBase(BaseModel):
    amount: float
    description: Optional[str] = None
    date: datetime
    is_income: bool = False
    is_recurring: bool = False
    recurrence_period: Optional[str] = None
    category_id: int

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    is_income: Optional[bool] = None
    is_recurring: Optional[bool] = None
    recurrence_period: Optional[str] = None
    category_id: Optional[int] = None

class TransactionInDBBase(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Transaction(TransactionInDBBase):
    pass

class TransactionWithCategory(Transaction):
    category_name: str