from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date

class GoalBase(BaseModel):
    name: str
    description: Optional[str] = None
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(0.0, ge=0)
    deadline: Optional[date] = None
    status: str = "active"  # active, completed, abandoned

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_amount: Optional[float] = Field(None, gt=0)
    current_amount: Optional[float] = Field(None, ge=0)
    deadline: Optional[date] = None
    status: Optional[str] = None

class GoalInDBBase(GoalBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Goal(GoalInDBBase):
    pass

class GoalWithProgress(Goal):
    progress_percentage: float