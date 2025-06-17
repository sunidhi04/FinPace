from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List, Optional

from app.db.database import get_db
from app.models.category import Category
from app.schemas.category import (
    CategoryCreate, Category as CategorySchema,
    CategoryUpdate, CategoryWithSubcategories, CategoryTree
)
from app.routers.users import get_current_user
from app.models.user import User

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/", response_model=CategorySchema, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # If parent category is provided, check if it exists and belongs to user
    if category_in.parent_category_id:
        parent_category = db.query(Category).filter(
            Category.id == category_in.parent_category_id,
            Category.user_id == current_user.id
        ).first()
        
        if not parent_category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent category not found"
            )
    
    # Create category
    db_category = Category(
        **category_in.dict(),
        user_id=current_user.id
    )
    
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return db_category

@router.get("/", response_model=List[CategorySchema])
def read_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    categories = db.query(Category).filter(
        Category.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return categories

@router.get("/tree", response_model=CategoryTree)
def read_category_tree(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Get all root categories (those with no parent)
    root_categories = db.query(Category).filter(
        Category.user_id == current_user.id,
        Category.parent_category_id.is_(None)
    ).all()
    
    # Function to recursively build category tree
    def build_tree(category):
        tree = CategoryWithSubcategories.from_orm(category)
        sub_categories = db.query(Category).filter(
            Category.parent_category_id == category.id
        ).all()
        
        for sub in sub_categories:
            tree.sub_categories.append(build_tree(sub))
        
        return tree
    
    # Build the tree starting with root categories
    result = CategoryTree(categories=[build_tree(cat) for cat in root_categories])
    
    return result

@router.get("/{category_id}", response_model=CategorySchema)
def read_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return category

@router.put("/{category_id}", response_model=CategorySchema)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check for circular reference if updating parent_category_id
    if category_in.parent_category_id and category_in.parent_category_id != category.parent_category_id:
        # Can't set parent to self
        if category_in.parent_category_id == category_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category cannot be its own parent"
            )
        
        # Check if parent exists and belongs to user
        parent = db.query(Category).filter(
            Category.id == category_in.parent_category_id,
            Category.user_id == current_user.id
        ).first()
        
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent category not found"
            )
        
        # Check for circular reference
        current_parent_id = parent.parent_category_id
        while current_parent_id:
            if current_parent_id == category_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Circular reference detected in category hierarchy"
                )
            
            parent_category = db.query(Category).filter(
                Category.id == current_parent_id
            ).first()
            
            if not parent_category:
                break
                
            current_parent_id = parent_category.parent_category_id
    
    # Update category
    for field, value in category_in.dict(exclude_unset=True).items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if category has transactions or subcategories
    has_transactions = db.query(Category).filter(
        Category.id == category_id
    ).join(Category.transactions).count() > 0
    
    has_subcategories = db.query(Category).filter(
        Category.parent_category_id == category_id
    ).count() > 0
    
    if has_transactions or has_subcategories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category with transactions or subcategories"
        )
    
    db.delete(category)
    db.commit()
    
    return None