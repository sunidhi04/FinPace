from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any, List

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, User as UserSchema, UserUpdate, Token
from app.utils.password import get_password_hash, verify_password
from app.utils.token import create_access_token, create_refresh_token, decode_token

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Dependency to get current authenticated user
async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid authentication credentials"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Inactive user"
        )
    
    return user

# Register a new user
@router.post("/signup", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    # Check if user with this email already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        currency=user_in.currency,
        timezone=user_in.timezone,
        role=user_in.role
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

# Login user
@router.post("/login", response_model=Token)
def login_for_access_token(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    # Authenticate user
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(
        subject=str(user.id),
        role=user.role
    )
    
    # Create refresh token
    refresh_token = create_refresh_token(
        subject=str(user.id),
        role=user.role
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

# Get user profile
@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    return current_user

# Update user profile
@router.put("/me", response_model=UserSchema)
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    for field, value in user_update.dict(exclude_unset=True).items():
        if field == "password" and value:
            setattr(current_user, "password_hash", get_password_hash(value))
        else:
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user