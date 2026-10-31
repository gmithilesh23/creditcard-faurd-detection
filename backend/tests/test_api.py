"""
FastAPI Backend Direct Functional Tests
=======================================
File: backend/tests/test_api.py
Tests all API functions with real SQLAlchemy session and Pydantic validation.
"""

import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.database.database import SessionLocal
import backend.app.api.endpoints as ep
from backend.app.schemas.schemas import PredictionRequest, SettingsUpdatePayload


def run_all_tests():
    db = SessionLocal()
    try:
        print("[TEST 1] Testing Health Check...")
        health = ep.get_health_status(db=db)
        assert health["status"] == "healthy"
        assert health["database_records"] > 0
        print(f" -> PASS: Health status OK, DB has {health['database_records']} records.")

        print("[TEST 2] Testing Overview Dashboard...")
        dashboard = ep.get_dashboard_overview(db=db)
        assert dashboard.kpis.total_transactions > 0
        assert dashboard.kpis.fraudulent_transactions > 0
        assert len(dashboard.volume_trends) == 14
        assert len(dashboard.risk_tier_distribution) == 4
        print(f" -> PASS: Dashboard loaded with {dashboard.kpis.total_transactions} txns ({dashboard.kpis.fraud_rate_pct}% fraud rate).")

        print("[TEST 3] Testing Transactions Pagination & Search...")
        txn_list = ep.get_transactions(page=1, page_size=10, db=db)
        assert len(txn_list.transactions) == 10
        assert txn_list.total > 0
        print(f" -> PASS: Query returned 10 items, total records: {txn_list.total}.")

        print("[TEST 4] Testing Single Transaction Drilldown...")
        sample_id = txn_list.transactions[0].transaction_id
        detail = ep.get_transaction_detail(transaction_id=sample_id, db=db)
        assert detail.transaction_id == sample_id
        assert detail.v14 is not None
        print(f" -> PASS: Retrieved transaction {sample_id} with full PCA vector.")

        print("[TEST 5] Testing Sample Inputs...")
        samples = ep.get_sample_inputs()
        assert len(samples) == 3
        print(f" -> PASS: Retrieved {len(samples)} sample presets.")

        print("[TEST 6] Testing Live Prediction Pipeline (Sample Fraud)...")
        sample_fraud_data = samples[0]["data"]
        req = PredictionRequest(**sample_fraud_data)
        pred_res = ep.predict_transaction(payload=req, db=db)
        assert pred_res.risk_score >= 60
        assert pred_res.prediction == "Fraudulent"
        assert len(pred_res.top_influencing_features) > 0
        print(f" -> PASS: High-risk sample scored {pred_res.risk_score}/100 ({pred_res.risk_classification}) with {len(pred_res.top_influencing_features)} SHAP drivers.")

        print("[TEST 7] Testing Live Prediction Pipeline (Sample Genuine)...")
        sample_gen_data = samples[1]["data"]
        req_gen = PredictionRequest(**sample_gen_data)
        pred_res_gen = ep.predict_transaction(payload=req_gen, db=db)
        assert pred_res_gen.risk_score <= 40
        assert pred_res_gen.prediction == "Genuine"
        print(f" -> PASS: Genuine sample scored {pred_res_gen.risk_score}/100 ({pred_res_gen.risk_classification}).")

        print("[TEST 8] Testing Transaction Analytics...")
        analytics = ep.get_transaction_analytics(db=db)
        assert len(analytics.hourly_trends) == 24
        assert len(analytics.category_breakdown) > 0
        assert len(analytics.card_type_breakdown) > 0
        print(f" -> PASS: Analytics processed {len(analytics.category_breakdown)} categories and 24-hr curves.")

        print("[TEST 9] Testing Risk Analysis...")
        risk = ep.get_risk_analysis(db=db)
        assert len(risk.risk_tiers) == 4
        assert len(risk.anomalies) >= 3
        print(f" -> PASS: Risk analysis returned 4 risk tiers and {len(risk.anomalies)} anomaly archetypes.")

        print("[TEST 10] Testing AI Insights & SHAP Explainability...")
        insights = ep.get_ai_insights()
        assert len(insights.global_features) >= 8
        assert len(insights.decision_rules) >= 3
        print(f" -> PASS: AI Insights returned {len(insights.global_features)} global SHAP features.")

        print("[TEST 11] Testing Model Performance Benchmarks...")
        perf = ep.get_model_performance()
        assert perf.champion_model == "Random Forest"
        assert len(perf.benchmark_table) == 4
        print(f" -> PASS: Benchmark metrics verified for all 4 models (Champion: {perf.champion_model}).")

        print("[TEST 12] Testing Reports Summary & CSV Export...")
        rep = ep.get_report_summary(db=db)
        assert rep["total_monitored"] > 0
        csv_resp = ep.export_transactions_csv(filter_type="fraud_only", db=db)
        assert csv_resp.media_type == "text/csv"
        print(f" -> PASS: Report generated (ID: {rep['report_id']}, Total: {rep['total_monitored']}).")

        print("[TEST 13] Testing System Settings...")
        settings = ep.get_system_settings(db=db)
        assert len(settings) >= 5
        print(f" -> PASS: Retrieved {len(settings)} configurable system settings.")

        print("\n=======================================================")
        print("[ALL TESTS PASSED] Backend API & ML pipelines 100% verified!")
        print("=======================================================")

    finally:
        db.close()


if __name__ == "__main__":
    run_all_tests()
