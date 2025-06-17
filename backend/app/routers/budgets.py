from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import extract, func, and_
from typing import Any, List, Optional
from datetime import datetime

from app.db.database import get_db
from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.budget import (
    BudgetCreate, Budget as BudgetSchema,
    BudgetUpdate, BudgetWithCategory, BudgetWithProgress
)
from app.routers.users import get_current_user
from app.models.user import User

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.post("/", response_model=BudgetSchema, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Verify category belongs to user
    category = db.query(Category).filter(
        Category.id == budget_in.category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if budget already exists for this category, month, and year
    existing_budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category_id == budget_in.category_id,
        Budget.month == budget_in.month,
        Budget.year == budget_in.year
    ).first()
    
    if existing_budget:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Budget already exists for this category in the specified month and year"
        )
    
    # Create budget
    db_budget = Budget(
        **budget_in.dict(),
        user_id=current_user.id
    )
    
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    
    return db_budget

@router.get("/", response_model=List[BudgetWithCategory])
def read_budgets(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000, le=2100),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    query = db.query(
        Budget,
        Category.name.label("category_name")
    ).join(
        Category,
        Budget.category_id == Category.id
    ).filter(
        Budget.user_id == current_user.id
    )
    
    if month:
        query = query.filter(Budget.month == month)
    
    if year:
        query = query.filter(Budget.year == year)
    
    results = query.offset(skip).limit(limit).all()
    
    # Convert SQLAlchemy objects to Pydantic models
    budgets = []
    for budget, category_name in results:
        budget_dict = {
            **budget.__dict__,
            "category_name": category_name
        }
        budgets.append(budget_dict)
    
    return budgets

@router.get("/progress", response_model=List[BudgetWithProgress])
def read_budgets_with_progress(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Get budgets with their category names
    budgets_query = db.query(
        Budget,
        Category.name.label("category_name")
    ).join(
        Category,
        Budget.category_id == Category.id
    ).filter(
        Budget.user_id == current_user.id,
        Budget.month == month,
        Budget.year == year
    ).all()
    
    # Calculate spent amount for each budget
    result = []
    for budget, category_name in budgets_query:
        # Get sum of transactions for this category in the specified month and year
        spent_amount_query = db.query(
            func.sum(Transaction.amount).label("spent_amount")
        ).filter(
            Transaction.user_id == current_user.id,
            Transaction.category_id == budget.category_id,
            Transaction.is_income == False,
            extract('month', Transaction.date) == month,
            extract('year', Transaction.date) == year
        ).scalar() or 0.0
        
        spent_amount = float(spent_amount_query)
        remaining_amount = budget.amount - spent_amount
        percentage_used = (spent_amount / budget.amount) * 100 if budget.amount > 0 else 0
        
        budget_dict = {
            **budget.__dict__,
            "category_name": category_name,
            "spent_amount": spent_amount,
            "remaining_amount": remaining_amount,
            "percentage_used": percentage_used
        }
        
        result.append(budget_dict)
    
    return result

@router.get("/{budget_id}", response_model=BudgetWithCategory)
def read_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    budget_query = db.query(
        Budget,
        Category.name.label("category_name")
    ).join(
        Category,
        Budget.category_id == Category.id
    ).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget_query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    budget, category_name = budget_query
    budget_dict = {
        **budget.__dict__,
        "category_name": category_name
    }
    
    return budget_dict

@router.put("/{budget_id}", response_model=BudgetSchema)
def update_budget(
    budget_id: int,
    budget_in: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Check if category exists and belongs to user if category_id is being updated
    if budget_in.category_id is not None:
        category = db.query(Category).filter(
            Category.id == budget_in.category_id,
            Category.user_id == current_user.id
        ).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        # Check if another budget already exists for this category, month, and year
        if budget_in.month is None:
            budget_in.month = budget.month
        
        if budget_in.year is None:
            budget_in.year = budget.year
        
        existing_budget = db.query(Budget).filter(
            Budget.user_id == current_user.id,
            Budget.category_id == budget_in.category_id,
            Budget.month == budget_in.month,
            Budget.year == budget_in.year,
            Budget.id != budget_id
        ).first()
        
        if existing_budget:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Budget already exists for this category in the specified month and year"
            )
    
    # Update budget
    for field, value in budget_in.dict(exclude_unset=True).items():
        setattr(budget, field, value)
    
    db.commit()
    db.refresh(budget)
    
    return budget

@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    db.delete(budget)
    db.commit()
    
    return None