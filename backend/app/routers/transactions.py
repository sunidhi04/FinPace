from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import Any, List, Optional
from datetime import datetime, date

from app.db.database import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.transaction import TransactionCreate, Transaction as TransactionSchema
from app.schemas.transaction import TransactionUpdate, TransactionWithCategory
from app.routers.users import get_current_user
from app.models.user import User

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("/", response_model=TransactionSchema, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Verify category belongs to user
    category = db.query(Category).filter(
        Category.id == transaction_in.category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Create transaction
    db_transaction = Transaction(
        **transaction_in.dict(),
        user_id=current_user.id
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return db_transaction

@router.get("/", response_model=List[TransactionWithCategory])
def read_transactions(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    is_income: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Start with base query
    query = db.query(
        Transaction,
        Category.name.label("category_name")
    ).join(
        Category,
        Transaction.category_id == Category.id
    ).filter(
        Transaction.user_id == current_user.id
    )
    
    # Apply filters if provided
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    
    if is_income is not None:
        query = query.filter(Transaction.is_income == is_income)
    
    # Order by date, newest first
    query = query.order_by(Transaction.date.desc())
    
    # Apply pagination
    results = query.offset(skip).limit(limit).all()
    
    # Convert SQLAlchemy objects to Pydantic models
    transactions = []
    for transaction, category_name in results:
        transaction_dict = {
            **transaction.__dict__,
            "category_name": category_name
        }
        transactions.append(transaction_dict)
    
    return transactions

@router.get("/{transaction_id}", response_model=TransactionSchema)
def read_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction

@router.put("/{transaction_id}", response_model=TransactionSchema)
def update_transaction(
    transaction_id: int,
    transaction_in: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check if category exists and belongs to user if category_id is being updated
    if transaction_in.category_id is not None:
        category = db.query(Category).filter(
            Category.id == transaction_in.category_id,
            Category.user_id == current_user.id
        ).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
    
    # Update transaction
    for field, value in transaction_in.dict(exclude_unset=True).items():
        setattr(transaction, field, value)
    
    db.commit()
    db.refresh(transaction)
    
    return transaction

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    db.delete(transaction)
    db.commit()
    
    return None

@router.get("/summary/monthly", response_model=List[dict])
def get_monthly_summary(
    year: int = Query(..., description="Year to get summary for"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Query monthly income and expenses
    query = db.query(
        extract('month', Transaction.date).label('month'),
        Transaction.is_income,
        db.func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == current_user.id,
        extract('year', Transaction.date) == year
    ).group_by(
        extract('month', Transaction.date),
        Transaction.is_income
    ).order_by(
        extract('month', Transaction.date)
    )
    
    results = query.all()
    
    # Process results into a monthly summary
    monthly_summary = []
    for month in range(1, 13):
        month_data = {
            "month": month,
            "income": 0,
            "expenses": 0,
            "savings": 0
        }
        
        for result_month, is_income, total in results:
            if result_month == month:
                if is_income:
                    month_data["income"] = float(total)
                else:
                    month_data["expenses"] = float(total)
        
        month_data["savings"] = month_data["income"] - month_data["expenses"]
        monthly_summary.append(month_data)
    
    return monthly_summary