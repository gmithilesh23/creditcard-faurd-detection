-- =====================================================================
-- Credit Card Fraud Detection & Intelligence Platform Database Schema
-- Database: fraud_detection_db
-- Compatible with MySQL 8.0+ and PostgreSQL
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL DEFAULT 'Fraud Analyst',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,
    transaction_time DOUBLE PRECISION NOT NULL,
    transaction_amount DOUBLE PRECISION NOT NULL,
    class INT NOT NULL,                  -- Ground Truth: 0 = Genuine, 1 = Fraud
    prediction INT NOT NULL,             -- Model Prediction: 0 = Genuine, 1 = Fraud
    fraud_probability DOUBLE PRECISION NOT NULL,
    risk_score INT NOT NULL,             -- 0 to 100
    risk_level VARCHAR(20) NOT NULL,     -- Low, Medium, High, Critical
    merchant_category VARCHAR(50) DEFAULT 'Online Retail',
    card_type VARCHAR(20) DEFAULT 'Visa Platinum',
    currency VARCHAR(5) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'Approved', -- Approved, Flagged, Blocked, Under Review
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    v1 DOUBLE PRECISION, v2 DOUBLE PRECISION, v3 DOUBLE PRECISION, v4 DOUBLE PRECISION,
    v5 DOUBLE PRECISION, v6 DOUBLE PRECISION, v7 DOUBLE PRECISION, v8 DOUBLE PRECISION,
    v9 DOUBLE PRECISION, v10 DOUBLE PRECISION, v11 DOUBLE PRECISION, v12 DOUBLE PRECISION,
    v13 DOUBLE PRECISION, v14 DOUBLE PRECISION, v15 DOUBLE PRECISION, v16 DOUBLE PRECISION,
    v17 DOUBLE PRECISION, v18 DOUBLE PRECISION, v19 DOUBLE PRECISION, v20 DOUBLE PRECISION,
    v21 DOUBLE PRECISION, v22 DOUBLE PRECISION, v23 DOUBLE PRECISION, v24 DOUBLE PRECISION,
    v25 DOUBLE PRECISION, v26 DOUBLE PRECISION, v27 DOUBLE PRECISION, v28 DOUBLE PRECISION
);

CREATE INDEX IF NOT EXISTS idx_txn_time ON transactions(transaction_time);
CREATE INDEX IF NOT EXISTS idx_txn_amount ON transactions(transaction_amount);
CREATE INDEX IF NOT EXISTS idx_txn_class ON transactions(class);
CREATE INDEX IF NOT EXISTS idx_txn_prediction ON transactions(prediction);
CREATE INDEX IF NOT EXISTS idx_txn_risk ON transactions(risk_score);
CREATE INDEX IF NOT EXISTS idx_txn_status ON transactions(status);

CREATE TABLE IF NOT EXISTS model_predictions (
    prediction_id VARCHAR(50) PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL,
    model_name VARCHAR(50) NOT NULL,
    prediction_result INT NOT NULL,
    prediction_probability DOUBLE PRECISION NOT NULL,
    risk_score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pred_txnid ON model_predictions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_pred_created ON model_predictions(created_at);

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value VARCHAR(200) NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial seed settings
INSERT OR IGNORE INTO system_settings (key, value, description) VALUES
('threshold_low', '30', 'Upper bound for Low Risk category'),
('threshold_medium', '60', 'Upper bound for Medium Risk category'),
('threshold_high', '80', 'Upper bound for High Risk category'),
('active_model', 'Random Forest', 'Current production inference algorithm');

