-- =============================================================================
-- FinGuard AI | Credit Card Fraud Analytics & Intelligence SQL Queries
-- Database: PostgreSQL / MySQL / SQLite compatible
-- =============================================================================

-- 1. Executive Summary KPIs: Total, Fraud Volume, Fraud Amount, Detection Rate
SELECT 
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN class = 1 THEN 1 ELSE 0 END) AS fraud_transactions,
    SUM(CASE WHEN class = 0 THEN 1 ELSE 0 END) AS genuine_transactions,
    ROUND(SUM(CASE WHEN class = 1 THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 2) AS fraud_rate_percentage,
    ROUND(SUM(CASE WHEN class = 1 THEN transaction_amount ELSE 0 END), 2) AS total_fraud_loss_usd,
    ROUND(SUM(transaction_amount), 2) AS total_processed_volume_usd,
    ROUND(AVG(transaction_amount), 2) AS average_ticket_size_usd
FROM transactions;

-- 2. Operational Risk Tier Breakdown (Low, Medium, High, Critical)
SELECT 
    risk_level,
    COUNT(*) AS transaction_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM transactions), 2) AS portfolio_share_pct,
    SUM(CASE WHEN class = 1 THEN 1 ELSE 0 END) AS confirmed_fraud_cases,
    ROUND(AVG(risk_score), 1) AS avg_risk_score,
    ROUND(SUM(transaction_amount), 2) AS total_exposure_usd
FROM transactions
GROUP BY risk_level
ORDER BY avg_risk_score DESC;

-- 3. High-Exposure Merchant Categories Ranked by Fraud Incident Rate
SELECT 
    merchant_category,
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN class = 1 THEN 1 ELSE 0 END) AS fraud_events,
    ROUND(SUM(CASE WHEN class = 1 THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 2) AS category_fraud_rate_pct,
    ROUND(SUM(CASE WHEN class = 1 THEN transaction_amount ELSE 0 END), 2) AS fraud_financial_loss_usd,
    ROUND(AVG(transaction_amount), 2) AS average_charge_usd
FROM transactions
GROUP BY merchant_category
HAVING total_transactions > 50
ORDER BY category_fraud_rate_pct DESC;

-- 4. Hourly Velocity Analysis (Off-Peak vs Business Hours)
SELECT 
    CAST(strftime('%H', timestamp) AS INTEGER) AS transaction_hour_utc,
    COUNT(*) AS hourly_volume,
    SUM(CASE WHEN class = 1 THEN 1 ELSE 0 END) AS hourly_fraud_count,
    ROUND(SUM(CASE WHEN class = 1 THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 2) AS hourly_fraud_rate_pct
FROM transactions
GROUP BY transaction_hour_utc
ORDER BY transaction_hour_utc ASC;

-- 5. Card Product Type Risk Exposure
SELECT 
    card_type,
    COUNT(*) AS total_issuances,
    SUM(CASE WHEN class = 1 THEN 1 ELSE 0 END) AS fraud_breaches,
    ROUND(SUM(CASE WHEN class = 1 THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 2) AS product_fraud_rate_pct,
    ROUND(SUM(transaction_amount), 2) AS total_volume_usd
FROM transactions
GROUP BY card_type
ORDER BY fraud_breaches DESC;

-- 6. Model Precision & Alert Triage Accuracy (Confusion Breakdown)
SELECT 
    CASE 
        WHEN prediction = 1 AND class = 1 THEN 'True Positive (Correct Interception)'
        WHEN prediction = 0 AND class = 0 THEN 'True Negative (Clean Approval)'
        WHEN prediction = 1 AND class = 0 THEN 'False Positive (False Decline Friction)'
        WHEN prediction = 0 AND class = 1 THEN 'False Negative (Uncaught Fraud)'
    END AS triage_disposition,
    COUNT(*) AS count_cases,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM transactions), 2) AS percentage_of_total,
    ROUND(SUM(transaction_amount), 2) AS financial_impact_usd
FROM transactions
GROUP BY triage_disposition
ORDER BY count_cases DESC;

-- 7. Top 15 Critical Flagged Transactions Pending Fraud Analyst Review
SELECT 
    transaction_id,
    timestamp,
    transaction_amount,
    merchant_category,
    card_type,
    risk_score,
    fraud_probability,
    status,
    v14,
    v17,
    v12
FROM transactions
WHERE status IN ('Flagged', 'Under Review', 'Blocked')
ORDER BY risk_score DESC, transaction_amount DESC
LIMIT 15;

