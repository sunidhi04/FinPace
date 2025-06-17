from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    parent_category_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    parent_category_id: Optional[int] = None

class CategoryInDBBase(CategoryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Category(CategoryInDBBase):
    pass

class CategoryWithSubcategories(Category):
    sub_categories: List["CategoryWithSubcategories"] = []

# This is needed for the recursive definition to work
CategoryWithSubcategories.model_rebuild()

class CategoryTree(BaseModel):
    categories: List[CategoryWithSubcategories] = []