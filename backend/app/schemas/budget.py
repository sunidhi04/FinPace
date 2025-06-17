from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class BudgetBase(BaseModel):
    category_id: int
    amount: float
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[float] = None
    month: Optional[int] = Field(None, ge=1, le=12)
    year: Optional[int] = Field(None, ge=2000, le=2100)

class BudgetInDBBase(BudgetBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Budget(BudgetInDBBase):
    pass

class BudgetWithCategory(Budget):
    category_name: str

class BudgetWithProgress(BudgetWithCategory):
    spent_amount: float
    remaining_amount: float
    percentage_used: float