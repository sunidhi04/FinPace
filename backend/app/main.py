from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, transactions, categories, budgets, goals, investments
from app.db.database import create_tables

app = FastAPI(
    title="FinPace API",
    description="Personal Finance Dashboard API",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend location
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(budgets.router, prefix="/api/v1")
app.include_router(goals.router, prefix="/api/v1")
app.include_router(investments.router, prefix="/api/v1")

@app.on_event("startup")
async def startup():
    create_tables()

@app.get("/api/v1/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)