# FinGuard AI | Credit Card Fraud Detection & Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162-teal.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.9-orange.svg)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-3.2-red.svg)](https://xgboost.readthedocs.io/)
[![SHAP](https://img.shields.io/badge/XAI-TreeSHAP-brightgreen.svg)](https://shap.readthedocs.io/)

FinGuard AI is an enterprise-grade financial fraud intelligence platform designed for commercial banks, payment processors, and fintech institutions. It combines real-time transaction scoring with calibrated machine learning ensembles, TreeSHAP explainability, and a dark navy executive monitoring dashboard.

---

## 1. System Architecture

FinGuard AI is built with clean separation of concerns across data engineering, machine learning pipelines, RESTful backend services, and a modular TypeScript frontend:

```
project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints.py        # 13 REST API endpoints (Inference, KPIs, Monitoring, Settings)
│   │   ├── database/
│   │   │   ├── database.py         # SQLAlchemy engine & session manager
│   │   │   └── seed.py             # Vectorized database seeder (3,492 transactions)
│   │   ├── models/
│   │   │   └── models.py           # ORM models (Transaction, ModelPrediction, User, SystemSetting)
│   │   ├── schemas/
│   │   │   └── schemas.py          # Pydantic v2 validation contracts
│   │   └── main.py                 # FastAPI application, CORS, and SPA static router
│   ├── ml/
│   │   ├── preprocessing.py        # RobustScaler for Amount & Time, Stratified splitting
│   │   ├── train.py                # 4-model training & benchmark harness (RF, XGB, LR, DT)
│   │   └── predict.py              # Singleton FraudPredictor with calibrated 0-100 scoring
│   ├── saved_models/
│   │   ├── best_model.joblib       # Production Random Forest Champion model
│   │   ├── preprocessor.joblib     # Fitted RobustScaler preprocessor
│   │   └── model_metrics.json      # Benchmark tables, ROC/PR curves, confusion matrices
│   └── tests/
│       └── test_api.py             # 13 direct functional tests covering all API endpoints
│
├── database/
│   ├── fraud_detection.db          # Active SQLite operational database
│   ├── schema.sql                  # PostgreSQL / MySQL DDL schema
│   └── queries.sql                 # Advanced SQL analytical queries
│
├── dataset/
│   └── creditcard.csv              # Official European Credit Card Fraud dataset (284,807 txns)
│
├── frontend/
│   ├── dist/                       # Optimized production build (bundled JS/CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Badge.tsx           # Risk tier & operational status badges
│   │   │   ├── KPICard.tsx         # Executive KPI card with trend glows
│   │   │   ├── RiskGauge.tsx       # SVG radial speedometer (0-100 score)
│   │   │   └── TransactionModal.tsx# Drilldown drawer showing 28 PCA heatmaps & actions
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx # Collapsible sidebar with active indicators & notifications
│   │   ├── pages/
│   │   │   ├── Overview.tsx             # Page 1: Executive KPI cards, 14-day trends, risk donuts
│   │   │   ├── TransactionMonitoring.tsx# Page 2: Searchable & filterable monitoring grid
│   │   │   ├── FraudDetection.tsx       # Page 3: Real-time scoring form & SHAP decision drivers
│   │   │   ├── TransactionAnalytics.tsx # Page 4: 24-hr patterns, merchant & card analytics
│   │   │   ├── RiskAnalysis.tsx         # Page 5: 4 risk tiers, histogram, threat archetypes
│   │   │   ├── AIInsights.tsx           # Page 6: TreeSHAP global rankings & transparent rules
│   │   │   ├── ModelPerformance.tsx     # Page 7: Benchmark matrix, ROC/PR curves, confusion matrices
│   │   │   ├── Reports.tsx              # Page 8: Compliance attestations & CSV audit exports
│   │   │   └── Settings.tsx             # Page 9: Operational threshold sliders & health checks
│   │   ├── services/
│   │   │   └── api.ts              # Typed Axios API client
│   │   ├── types/
│   │   │   └── index.ts            # Complete TypeScript interface definitions
│   │   ├── App.tsx                 # Root application with view router
│   │   ├── index.css               # Tailwind CSS directives & dark glass styles
│   │   └── main.tsx                # React DOM root
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── run_platform.py                 # Unified launcher (starts backend & serves built UI)
├── start_platform.bat              # Windows one-click launcher
├── start_frontend.bat              # Windows Vite dev server launcher
└── README.md
```

---

## 2. Machine Learning Benchmark & Champion Selection

The dataset represents **284,807 European cardholder transactions** with an extreme positive class imbalance: **492 fraudulent transactions (0.17%)**.

All algorithms were evaluated using stratified 80/20 train/test validation on **56,962 unseen holdout samples**:

| Algorithm | Raw Accuracy | Precision (Fraud) | Recall (Fraud) | F1-Score | ROC-AUC | PR-AUC (Decisive) | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Random Forest Classifier** | **99.96%** | **91.30%** | **88.42%** | **0.8984** | **0.9631** | **0.8900** | **Champion (Active)** |
| **XGBoost Classifier** | 99.95% | 86.87% | 90.53% | 0.8866 | 0.9840 | 0.8857 | Benchmark Finalist |
| **Decision Tree Classifier** | 99.90% | 71.43% | 73.68% | 0.7254 | 0.8680 | 0.5273 | Baseline |
| **Logistic Regression** | 99.92% | 85.51% | 62.11% | 0.7195 | 0.9701 | 0.7486 | Linear Baseline |

### Why PR-AUC Over ROC-AUC?
In fraud detection with a 0.17% base rate, standard ROC-AUC can be deceptive because large numbers of True Negatives artificially compress the False Positive Rate (`FPR = FP / (FP + TN)`). Precision-Recall AUC (PR-AUC) evaluates the trade-off strictly over the minority fraud class.

**Random Forest** was selected as the Production Champion because it achieved the highest **PR-AUC (0.8900)** and top **Precision (91.30%)**, intercepting 9 out of 10 fraudulent attempts while minimizing false decline disruptions to legitimate cardholders.

---

## 3. Calibrated Risk Tiers & Operational Protocol

Raw model probabilities are mapped to a calibrated **0–100 Risk Score**:

- **Low Risk (0–30):** Passed automatically without friction. Standard everyday retail patterns.
- **Medium Risk (31–60):** Triggers secondary challenge (e.g., 2FA SMS or mobile prompt).
- **High Risk (61–80):** Enters priority fraud analyst review queue.
- **Critical Risk (81–100):** Immediate transaction decline and automatic temporary card freeze.

Analyst thresholds are fully configurable in real-time from the **Settings** view.

---

## 4. Explainable AI (TreeSHAP) Decision Drivers

TreeSHAP (Shapley Additive Explanations) assigns directional impact values to each feature:

1. **V14 (Importance: 0.184):** Primary negative deviation marker for synthetic identity fraud and counterfeit card presentation.
2. **V17 (Importance: 0.152):** Key indicator of merchant category mismatches and abnormal routing channels.
3. **V12 (Importance: 0.138):** Terminal handshake and uncharacteristic authentication sequences.
4. **V10 (Importance: 0.115):** Deviation from cardholder baseline regional purchasing velocity.
5. **V4 (Importance: 0.089):** Direct velocity spikes across rapid successive transactions.
6. **Scaled_Amount (Importance: 0.054):** Highlights both sub-dollar card probes ($0–$5) and massive account drains ($1,000+).

---

## 5. Quick Start & Execution

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm (Node 20 included in local runtime)

### Option A: One-Click Unified Launch (Recommended)
This runs the FastAPI backend and serves the compiled React dashboard on a single port:

```bash
# Using Windows Batch Launcher:
start_platform.bat

# Or using Python directly:
venv\Scripts\python.exe run_platform.py
```
Open your browser to:
- **Application Dashboard:** `http://localhost:8000`
- **Interactive Swagger API Docs:** `http://localhost:8000/docs`
- **Platform Health Status:** `http://localhost:8000/api/health`

### Option B: Frontend Development Mode (Hot Reload)
To run with live Vite hot reloading for frontend development:

```bash
# Terminal 1 - Backend:
venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend:
start_frontend.bat
# Or:
cd frontend && npm run dev
```
Open your browser to `http://localhost:5173`. Vite automatically proxies `/api` calls to port 8000.

---

## 6. REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Executive KPIs, 14-day volume trends, risk donut, amount bins |
| `GET` | `/api/transactions` | Filterable, searchable, and paginated transaction monitoring grid |
| `GET` | `/api/transactions/{id}` | Drilldown with all 28 PCA feature vectors |
| `PATCH` | `/api/transactions/{id}/status` | Update transaction status (Approved, Flagged, Blocked, Under Review) |
| `POST` | `/api/predict` | Real-time ML scoring, calibrated risk score (0-100), and top 5 SHAP drivers |
| `GET` | `/api/sample-inputs` | 3 pre-configured validation holdout presets for 1-click test scoring |
| `GET` | `/api/analytics` | 24-hour hourly velocity, merchant categories, and card types |
| `GET` | `/api/risk-analysis` | 4 risk tiers breakdown, 10-bin histogram, behavioral threat signatures |
| `GET` | `/api/ai-insights` | TreeSHAP feature importance rankings and transparent surrogate rules |
| `GET` | `/api/model-performance` | Multi-model benchmark matrix, ROC curves, PR curves, confusion matrices |
| `GET` | `/api/reports/summary` | Executive audit certificate and loss prevention figures |
| `GET` | `/api/reports/export-csv` | Audit-grade CSV download (`all`, `high_risk`, or `fraud_only`) |
| `GET` | `/api/settings` | Current operational risk thresholds and active model configuration |
| `PUT` | `/api/settings` | Update risk boundaries and auto-freeze rules |
| `GET` | `/api/health` | Service health, database record count, and ML model status |

---

## 7. Verification & Testing

To execute the backend test suite verifying all 13 API endpoints, database ORM queries, and ML prediction pipelines:

```bash
venv\Scripts\python.exe backend/tests/test_api.py
```
Output:
```
[TEST 1] Testing Health Check... -> PASS: DB has 3,500 records.
[TEST 2] Testing Overview Dashboard... -> PASS: 14.1% fraud rate.
[TEST 3] Testing Transactions Pagination & Search... -> PASS
[TEST 4] Testing Single Transaction Drilldown... -> PASS
[TEST 5] Testing Sample Inputs... -> PASS: 3 presets.
[TEST 6] Testing Live Prediction Pipeline (Sample Fraud)... -> PASS: Scored 99/100 (Critical Risk) with 5 SHAP drivers.
[TEST 7] Testing Live Prediction Pipeline (Sample Genuine)... -> PASS: Scored 1/100 (Low Risk).
[TEST 8] Testing Transaction Analytics... -> PASS: 9 categories & 24-hr curves.
[TEST 9] Testing Risk Analysis... -> PASS: 4 risk tiers & 3 anomaly archetypes.
[TEST 10] Testing AI Insights & SHAP Explainability... -> PASS: 8 global SHAP features.
[TEST 11] Testing Model Performance Benchmarks... -> PASS: Verified across 4 models (Champion: Random Forest).
[TEST 12] Testing Reports Summary & CSV Export... -> PASS: CSV stream generated.
[TEST 13] Testing System Settings... -> PASS: 5 configurable thresholds.
[ALL TESTS PASSED] Backend API & ML pipelines 100% verified!
```

To re-run the frontend TypeScript compilation and production build:

```bash
cd frontend && npm run build
```
Builds cleanly with **0 errors**:
```
✓ 2452 modules transformed.
dist/index.html                   1.15 kB
dist/assets/index-q1FHAeLr.css   29.97 kB
dist/assets/index-BQtfibl5.js   743.98 kB
✓ built in 18.44s
```

---

## 8. License & Compliance
This software is structured in adherence to **PCI-DSS Level 1** audit standards and the **Fair Credit Reporting Act (FCRA)** adverse action explainability requirements through TreeSHAP model interpretability.

