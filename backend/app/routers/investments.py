import os
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Any, List, Optional
import httpx
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models.investment import Investment
from app.schemas.investment import (
    InvestmentCreate, Investment as InvestmentSchema,
    InvestmentUpdate, InvestmentWithMarketData
)
from app.routers.users import get_current_user
from app.models.user import User
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
API_KEY = os.getenv("MARKET_DATA_API_KEY")

router = APIRouter(prefix="/investments", tags=["investments"])

@router.post("/", response_model=InvestmentSchema, status_code=status.HTTP_201_CREATED)
def create_investment(
    investment_in: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Create investment
    db_investment = Investment(
        **investment_in.dict(),
        user_id=current_user.id
    )
    
    db.add(db_investment)
    db.commit()
    db.refresh(db_investment)
    
    return db_investment

@router.get("/", response_model=List[InvestmentSchema])
def read_investments(
    asset_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    query = db.query(Investment).filter(
        Investment.user_id == current_user.id
    )
    
    if asset_type:
        query = query.filter(Investment.asset_type == asset_type)
    
    investments = query.offset(skip).limit(limit).all()
    
    return investments

@router.get("/portfolio", response_model=List[InvestmentWithMarketData])
async def get_portfolio_with_market_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()
    
    result = []
    for investment in investments:
        # Get market data for the investment
        try:
            current_price = await fetch_market_price(investment.ticker, investment.asset_type)
            market_value = current_price * investment.quantity
            profit_loss = market_value - (investment.avg_buy_price * investment.quantity)
            profit_loss_percentage = (profit_loss / (investment.avg_buy_price * investment.quantity)) * 100
            
            investment_dict = {
                **investment.__dict__,
                "current_price": current_price,
                "market_value": market_value,
                "profit_loss": profit_loss,
                "profit_loss_percentage": profit_loss_percentage,
                "last_updated": datetime.utcnow()
            }
            result.append(investment_dict)
        except Exception as e:
            # If we can't fetch market data, include the investment with a warning
            investment_dict = {
                **investment.__dict__,
                "current_price": 0.0,
                "market_value": 0.0,
                "profit_loss": 0.0,
                "profit_loss_percentage": 0.0,
                "last_updated": None,
                "error": f"Failed to fetch market data: {str(e)}"
            }
            result.append(investment_dict)
    
    return result

@router.get("/{investment_id}", response_model=InvestmentSchema)
def read_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == current_user.id
    ).first()
    
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    return investment

@router.put("/{investment_id}", response_model=InvestmentSchema)
def update_investment(
    investment_id: int,
    investment_in: InvestmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == current_user.id
    ).first()
    
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    # Update investment
    for field, value in investment_in.dict(exclude_unset=True).items():
        setattr(investment, field, value)
    
    db.commit()
    db.refresh(investment)
    
    return investment

@router.delete("/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == current_user.id
    ).first()
    
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    db.delete(investment)
    db.commit()
    
    return None

async def fetch_market_price(ticker: str, asset_type: str) -> float:
    """
    Fetch current market price for a ticker symbol using Alpha Vantage API
    You would normally implement this with real API calls to market data providers
    """
    # This is a placeholder - in a real application, you would call a financial API
    if asset_type.lower() == "crypto":
        # Example API call for crypto
        # url = f"https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency={ticker}&to_currency=USD&apikey={API_KEY}"
        # For demo purposes, returning dummy data
        return 100.0  # Simulated price
    else:
        # Example API call for stocks/ETFs
        # url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={API_KEY}"
        # For demo purposes, returning dummy data
        return 50.0  # Simulated price
    
    # In production, you would:
    # 1. Make async request to market data API
    # 2. Parse the response
    # 3. Return the current price
    # 4. Implement caching to avoid hitting API rate limits
    
    # Example implementation (commented out):
    # async with httpx.AsyncClient() as client:
    #     response = await client.get(url)
    #     data = response.json()
    #     # Parse response based on the API structure
    #     return float(data["price"])