from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List, Optional

from app.db.database import get_db
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, Goal as GoalSchema, GoalUpdate, GoalWithProgress
from app.routers.users import get_current_user
from app.models.user import User

router = APIRouter(prefix="/goals", tags=["goals"])

@router.post("/", response_model=GoalSchema, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_in: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    db_goal = Goal(
        **goal_in.dict(),
        user_id=current_user.id
    )
    
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    return db_goal

@router.get("/", response_model=List[GoalWithProgress])
def read_goals(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    query = db.query(Goal).filter(
        Goal.user_id == current_user.id
    )
    
    if status:
        query = query.filter(Goal.status == status)
    
    goals = query.order_by(Goal.deadline).offset(skip).limit(limit).all()
    
    # Calculate progress percentage for each goal
    result = []
    for goal in goals:
        progress_percentage = (goal.current_amount / goal.target_amount) * 100 if goal.target_amount > 0 else 0
        goal_dict = {
            **goal.__dict__,
            "progress_percentage": progress_percentage
        }
        result.append(goal_dict)
    
    return result

@router.get("/{goal_id}", response_model=GoalWithProgress)
def read_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    progress_percentage = (goal.current_amount / goal.target_amount) * 100 if goal.target_amount > 0 else 0
    
    result = {
        **goal.__dict__,
        "progress_percentage": progress_percentage
    }
    
    return result

@router.put("/{goal_id}", response_model=GoalSchema)
def update_goal(
    goal_id: int,
    goal_in: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Update goal
    for field, value in goal_in.dict(exclude_unset=True).items():
        setattr(goal, field, value)
    
    # Check if the goal is completed based on the updated current_amount
    if goal.current_amount >= goal.target_amount and goal.status != "completed":
        goal.status = "completed"
    
    db.commit()
    db.refresh(goal)
    
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    db.delete(goal)
    db.commit()
    
    return None