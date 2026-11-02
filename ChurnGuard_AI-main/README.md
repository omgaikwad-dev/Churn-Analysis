# ChurnGuard AI — Enterprise Customer Churn Analysis & Prediction Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-blue.svg?logo=python&logoColor=white)](https://python.org)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Alembic](https://img.shields.io/badge/DB_Migrations-Alembic-red.svg)](https://alembic.sqlalchemy.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**ChurnGuard AI** is a production-grade, full-stack customer retention and churn intelligence platform. Built with a **React 18 / Vite** frontend, a **FastAPI** backend, **SQLAlchemy 2.0 / Alembic** database architecture, and a **scikit-learn** machine learning pipeline, it provides actionable insights to identify, evaluate, and mitigate customer churn risk.

---

## 1. Architectural Overview

```
                                  +------------------------------------+
                                  |    Browser / Single Page App      |
                                  |   (React 18 + Vite + Recharts)    |
                                  +-----------------+------------------+
                                                    |  HTTPS / REST / JWT
                                                    v
                                  +------------------------------------+
                                  |          FastAPI Gateway           |
                                  |     /api/v1 (CORS, Rate Limits)   |
                                  +--------+-----------------+---------+
                                           |                 |
                    +----------------------+                 +----------------------+
                    v                                                               v
      +----------------------------+                                  +----------------------------+
      |    Application Core        |                                  |   Machine Learning Engine  |
      | - Argon2id Password Hash   |                                  | - StandardScaler Pipeline  |
      | - JWT Authentication       |                                  | - Multi-Model Registry     |
      | - Customer & Prediction DB |                                  | - Feature Drift Detection  |
      | - CSV Dataset Validation   |                                  | - Telco Reference Dataset  |
      +--------------+-------------+                                  +--------------+-------------+
                     |                                                               |
                     v                                                               v
      +----------------------------+                                  +----------------------------+
      |   Relational Database      |                                  |   Trusted Model Storage    |
      | (SQLite Dev / Postgres PR) |                                  |  (Joblib + SHA256 Hash)    |
      +----------------------------+                                  +----------------------------+
```

---

## 2. Key Features

- **Multi-Page Public Portal**: Informative, transparent public pages (`/`, `/about`, `/features`, `/methodology`, `/faq`) explaining churn prediction without inflated marketing claims.
- **Enterprise Authentication & Authorization**:
  - Argon2id password hashing.
  - Signed JWT access tokens with configurable expiration.
  - Server-side ownership validation: users can only view, edit, or predict on their own records.
  - Safe account profile management and password change.
- **Relational Data Architecture**:
  - Normalized schema (`User`, `Customer`, `Dataset`, `ModelRun`, `Prediction`).
  - Production-ready migrations managed with **Alembic**.
  - Default SQLite for development, drop-in compatibility with PostgreSQL.
- **Dataset Upload & Validation Pipeline**:
  - Safe CSV parsing with size and row-count limits.
  - Automatic column profiling, missing-value counts, duplicate detection, and schema verification.
  - Intelligent Telco column name mapping (`customerID`, `tenure`, `MonthlyCharges`, `Contract`, `Churn`).
- **Reproducible Machine Learning Pipeline**:
  - Support for **Logistic Regression**, **Random Forest**, and **Gradient Boosting**.
  - Scaled features using `StandardScaler` to ensure numerical balance.
  - Stratified train/test splitting to handle imbalanced datasets cleanly.
  - Comprehensive evaluation metrics: **Accuracy, Precision, Recall, F1-Score, ROC-AUC, and Confusion Matrix**.
  - Standardized feature importance calculations.
  - **Zero Target Leakage Safeguard**: Supervised retraining is strictly isolated to labeled datasets. Retraining *never* treats model predictions as ground-truth labels.
- **Inference & Risk Categorization**:
  - Single-customer real-time inference with instant factor importance breakdown.
  - Batch predictions processed from uploaded CSV datasets.
  - Operational risk tiers:
    - **Low Risk**: Churn probability `< 30%`
    - **Medium Risk**: Churn probability `30% – 69.9%`
    - **High Risk**: Churn probability `≥ 70%`
- **Statistical Feature Drift Monitoring**:
  - Monitors incoming inference feature distributions vs. verified baseline.
  - Computes z-score distance metrics across continuous and categorical inputs.
  - Alerts users when incoming data distributions drift significantly from the training reference.
- **Analytics & Export Suite**:
  - Interactive Recharts visualizations for risk breakdowns and timeline trends.
  - CSV export for predictions and customer risk scores.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS / Custom CSS, Recharts, Lucide React, Axios |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn |
| **Database & ORM** | SQLAlchemy 2.0, Alembic, SQLite (Dev) / PostgreSQL (Prod) |
| **Machine Learning** | scikit-learn, NumPy, Pandas, Joblib |
| **Security** | Argon2id (`passlib[argon2]`), PyJWT, HTTP-only cookie support, CORS Middleware |
| **Testing** | Pytest, HTTPX, Vitest |

---

## 4. Repository Structure

```text
ChurnGuard_AI-main/
├── backend/
│   ├── alembic/                 # Alembic migration scripts and environment
│   ├── alembic.ini              # Alembic configuration
│   ├── app/
│   │   ├── api/                 # Versioned API routes & dependencies
│   │   │   ├── dependencies.py  # User auth dependencies
│   │   │   └── v1/              # Endpoint routers: auth, customers, datasets, models, etc.
│   │   ├── core/                # Config, security (Argon2id, JWT), logging
│   │   ├── db/                  # Session, Base declarations
│   │   ├── ml/                  # ML Pipeline, reference dataset, Joblib registry
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic v2 validation schemas
│   │   └── main.py              # Application factory and lifespan handler
│   ├── storage/                 # Storage for uploaded datasets and models
│   │   ├── models/              # Trained models with SHA256 checksums
│   │   └── uploads/             # User-uploaded CSV datasets
│   ├── tests/                   # Pytest test suite (Auth, ML, API, E2E Journey)
│   ├── requirements.txt         # Pinned backend dependencies
│   └── Dockerfile               # Backend containerization
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI, layout, navigation
│   │   ├── context/             # AuthContext (JWT session state)
│   │   ├── pages/
│   │   │   ├── public/          # Landing, About, Features, Methodology, FAQ
│   │   │   ├── auth/            # Login, Register
│   │   │   └── dashboard/       # Overview, Customers, Predictions, Datasets, Models, etc.
│   │   ├── services/            # Axios API client with interceptors
│   │   ├── App.jsx              # Main routing configuration
│   │   └── App.css              # Dark enterprise design system
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.js           # Vite build configuration
│   └── Dockerfile               # Multi-stage SPA containerization
├── docker-compose.yml           # Local multi-service development setup
├── README.md                    # Project documentation
└── .gitignore                   # Safe version control ignores
```

---

## 5. Getting Started (Local Development)

### Prerequisites

- **Python 3.11** or **Python 3.12**
- **Node.js 18+** & **npm 9+**
- Git (optional)

---

### Step 1: Backend Setup (Windows PowerShell)

Open a PowerShell terminal and navigate to the backend directory:

```powershell
cd "d:\Churn Analysis\ChurnGuard_AI-main\backend"

# 1. Create a Python virtual environment (if not already present)
python -m venv .venv

# 2. Activate the virtual environment
.venv\Scripts\Activate.ps1

# 3. Upgrade pip and install required dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Copy environment template
cp .env.example .env

# 5. Run database migrations to initialize tables
python -m alembic upgrade head

# 6. Start the FastAPI development server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

*The backend API will be available at `http://localhost:8000`.*
*Interactive Swagger documentation: `http://localhost:8000/docs`.*

---

### Step 2: Frontend Setup (Windows PowerShell)

In a separate PowerShell terminal window, navigate to the frontend directory:

```powershell
cd "d:\Churn Analysis\ChurnGuard_AI-main\frontend"

# 1. Copy environment template
cp .env.example .env

# 2. Install Node dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

*The web application will open at `http://localhost:5173`.*

---

## 6. How to Run the Automated Test Suite

### Running Backend Tests (Pytest)

Run all backend unit, pipeline, security, and end-to-end acceptance tests:

```powershell
cd "d:\Churn Analysis\ChurnGuard_AI-main\backend"
.venv\Scripts\python.exe -m pytest tests/ -v
```

This verifies:
1. `tests/test_auth.py`: Registration, duplicate rejection, Argon2id hashing, login, `/me` profile.
2. `tests/test_api_endpoints.py`: Public health endpoints, protected customer CRUD, dataset endpoints.
3. `tests/test_ml_pipeline.py`: StandardScaler preprocessing, stratified test splitting, metrics calculation, and prevention of predictions-as-labels retraining.
4. `tests/test_e2e_journey.py`: Complete 14-step user journey from user sign-up through batch prediction, model retraining, and password change.

### Running Frontend Production Build

Verify that the React application compiles cleanly without warnings:

```powershell
cd "d:\Churn Analysis\ChurnGuard_AI-main\frontend"
npm run build
```

---

## 7. How to Test the Complete User Journey

1. **Visit Public Pages**:
   - Open `http://localhost:5173` in your browser.
   - Explore **Home**, **About**, **Features**, **Methodology**, and **FAQ**.
2. **Register an Account**:
   - Click **Sign Up** (or go to `http://localhost:5173/register`).
   - Enter Full Name, Email, and a password (min. 8 characters).
   - Upon registration, you are automatically logged in and redirected to `/dashboard`.
3. **Inspect the Dashboard**:
   - View the operational stats, risk breakdown card, and baseline model status.
4. **Run a Single Prediction**:
   - Navigate to **Predictions** (`/predictions`).
   - Fill in customer features (Tenure, Monthly Charges, Contract Type, Support Calls).
   - Click **Run Churn Assessment**.
   - Review the calculated Churn Probability (%), Risk Category badge, and factor breakdown.
5. **Upload a Dataset & Batch Predict**:
   - Navigate to **Datasets** (`/datasets`).
   - Upload any customer CSV (e.g. standard IBM Telco churn format).
   - Inspect the automatic column inference, missing value checks, and validation status.
   - Return to **Predictions** -> **Batch Prediction** tab, select the dataset, and process batch predictions.
6. **Train and Compare Models**:
   - Navigate to **Models** (`/models`).
   - Select algorithm (Logistic Regression, Random Forest, or Gradient Boosting).
   - Click **Train New Model**.
   - Review test-split evaluation metrics (Accuracy, ROC-AUC, F1-Score).
7. **Monitor Data Drift**:
   - Navigate to **Analytics** (`/analytics`) to review churn distribution charts and feature drift indicators.
8. **Export Results**:
   - In **History** (`/history`), click **Export CSV** to download predictions.
9. **Account Settings & Logout**:
   - Navigate to **Settings** (`/settings`), update your password, or click **Sign Out**.

---

## 8. Docker Deployment

To spin up the entire application using Docker Compose:

```bash
docker compose up --build
```

- Backend API: `http://localhost:8000`
- Frontend Web App: `http://localhost` or `http://localhost:5173`

---

## 9. API Reference Summary

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/health` | `GET` | Health check returning service operational state | No |
| `/api/v1/auth/register` | `POST` | User registration with Argon2id password hashing | No |
| `/api/v1/auth/login` | `POST` | User login returning signed JWT access token | No |
| `/api/v1/auth/me` | `GET` | Get authenticated user profile | Yes |
| `/api/v1/auth/change-password` | `POST` | Change account password | Yes |
| `/api/v1/customers` | `GET`, `POST` | List and create customer records | Yes |
| `/api/v1/datasets/upload` | `POST` | Upload and validate CSV customer dataset | Yes |
| `/api/v1/datasets` | `GET` | List user uploaded datasets | Yes |
| `/api/v1/predictions/single` | `POST` | Run real-time churn prediction for 1 customer | Yes |
| `/api/v1/predictions/batch` | `POST` | Run batch inference against uploaded dataset | Yes |
| `/api/v1/predictions` | `GET` | List prediction history with pagination | Yes |
| `/api/v1/models/train` | `POST` | Train a new model run on verified data | Yes |
| `/api/v1/models` | `GET` | List all trained model runs and evaluation metrics | Yes |
| `/api/v1/analytics/overview` | `GET` | Aggregated analytics, distributions, and trends | Yes |
| `/api/v1/monitoring/drift` | `GET` | Feature drift detection report vs baseline | Yes |
| `/api/v1/exports/predictions` | `GET` | Export user predictions as CSV | Yes |

---

## 10. Security & Data Privacy Guidelines

- **Argon2id Hashing**: Industry-standard memory-hard password hashing. Passwords are never stored in plaintext.
- **Data Isolation**: All queries filter by `owner_id == current_user.id` to guarantee tenant privacy.
- **Model Provencance & Integrity**: Trained models are serialized with Joblib and checked with SHA256 checksums before loading. Arbitrary user-uploaded model files are rejected.
- **No Retraining on Predictions**: Predictions are strictly treated as inferences. Retraining only occurs on verified labeled datasets.

---

## 11. License

MIT License. See [LICENSE](LICENSE) for details.
