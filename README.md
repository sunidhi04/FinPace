# FinPace

FinPace is a comprehensive personal finance management application that helps users track expenses, set budgets, manage investment portfolios, and achieve financial goals through intelligent analytics and machine learning insights.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Machine Learning Features](#machine-learning-features)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

FinPace is designed to be a one-stop solution for personal finance management. The application provides tools for tracking transactions, creating and monitoring budgets, setting financial goals, analyzing spending patterns, and managing investments. It leverages machine learning to provide personalized insights and recommendations.

## Architecture

FinPace follows a three-tier architecture:

1. **Frontend**: A responsive single-page application built with React and TypeScript
2. **Backend API**: RESTful API service built with FastAPI that handles business logic and database operations
3. **ML Service**: A separate service that provides machine learning capabilities for financial analysis and predictions

![Architecture Diagram](architecture_diagram_placeholder.png)

## Tech Stack

### Backend
- **Framework**: FastAPI 0.100.0
- **ASGI Server**: Uvicorn 0.23.0
- **Database ORM**: SQLAlchemy 2.0.19
- **Database Migrations**: Alembic 1.11.1
- **Data Validation**: Pydantic 2.1.1
- **Authentication**: JWT (python-jose 3.3.0), PassLib 1.7.4, bcrypt 4.0.1
- **Database**: PostgreSQL (psycopg2-binary 2.9.6)
- **Testing**: pytest 7.4.0, httpx 0.24.1

### Frontend
- **Framework**: React 18.2.0 with TypeScript
- **State Management**: Redux Toolkit 2.2.0, React Redux 9.1.0
- **Routing**: React Router 6.22.0
- **HTTP Client**: Axios 1.6.7
- **Form Handling**: React Hook Form 7.50.1
- **UI**: Tailwind CSS 3.4.1, Heroicons 2.1.1
- **Data Visualization**: Chart.js 4.4.1, react-chartjs-2 5.2.0
- **Build Tool**: Vite 5.1.0
- **Testing**: Vitest 1.2.2, React Testing Library 14.2.1

### ML Service
- **Python Data Analysis**: Pandas 2.0.3
- **Machine Learning Libraries**: TensorFlow/PyTorch (TBD based on specific implementation)

## Features

### User Management
- User registration and authentication
- Profile management
- Secure password handling

### Transaction Management
- Record and categorize financial transactions
- Import transactions from bank statements
- Recurring transaction setup

### Budget Management
- Create monthly or custom period budgets
- Set spending limits by category
- Track budget progress in real-time

### Goal Tracking
- Set short and long-term financial goals
- Track progress toward goals
- Receive recommendations to help achieve goals faster

### Investment Portfolio
- Track investment performance
- Asset allocation visualization
- Investment opportunity analysis

### Analytics Dashboard
- Spending patterns analysis
- Income vs. expense visualization
- Financial health indicators

### Machine Learning Features
- Expense categorization
- Spending pattern analysis
- Anomaly detection for unusual transactions
- Predictive analysis for future expenses
- Investment recommendations

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 16 or higher
- npm or yarn
- PostgreSQL database

### Installation

#### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/finpace.git
cd finpace
```

2. Create and activate a virtual environment
```bash
cd backend
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Set up environment variables (see Configuration section)

5. Run database migrations
```bash
alembic upgrade head
```

6. Start the backend server
```bash
python main.py
# Or alternatively
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup

1. Install dependencies
```bash
cd ../frontend
npm install  # or yarn
```

2. Start the development server
```bash
npm run dev  # or yarn dev
```

### Configuration

Create a `.env` file in the `backend` directory with the following variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/finpace
SECRET_KEY=your_secret_key_for_jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Project Structure

```
FinPace/
├── README.md
├── backend/
│   ├── main.py              # Entry point for the backend service
│   ├── requirements.txt     # Python dependencies
│   ├── app/
│   │   ├── main.py          # FastAPI application setup
│   │   ├── core/            # Core settings and configurations
│   │   ├── db/              # Database setup and connection
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── routers/         # API endpoints
│   │   ├── schemas/         # Pydantic models for request/response
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   └── tests/               # Backend tests
├── frontend/
│   ├── index.html           # HTML entry point
│   ├── package.json         # Frontend dependencies
│   ├── src/
│   │   ├── App.tsx          # Root React component
│   │   ├── main.tsx         # Entry point for React app
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   └── store/           # Redux store and slices
│   └── public/              # Static assets
└── ml_service/              # Machine learning service
```

## API Documentation

When the backend server is running, API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints

- `/api/v1/users`: User management endpoints
- `/api/v1/transactions`: Transaction CRUD operations
- `/api/v1/categories`: Transaction categories management
- `/api/v1/budgets`: Budget creation and tracking
- `/api/v1/goals`: Financial goals management
- `/api/v1/investments`: Investment portfolio tracking
- `/api/v1/health`: API health check endpoint

## Testing

### Backend Testing

```bash
cd backend
pytest
```

### Frontend Testing

```bash
cd frontend
npm run test
```

## Machine Learning Features

The ML service provides the following capabilities:

1. **Automated Transaction Categorization**: Classifies transactions based on description, amount, and historical data
2. **Spending Pattern Analysis**: Identifies patterns in user spending habits
3. **Anomaly Detection**: Flags unusual transactions that may represent fraud
4. **Financial Forecasting**: Predicts future expenses based on historical data
5. **Investment Recommendations**: Suggests investment opportunities based on user risk profile and goals

## Deployment

### Backend Deployment

The FastAPI application can be deployed using Docker:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY ./backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY ./backend ./
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Deployment

The React application can be built for production:

```bash
cd frontend
npm run build
```

The resulting build can be served using nginx or other static file servers.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.