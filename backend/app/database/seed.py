"""
Database Seeder Script
======================
File: backend/app/database/seed.py
Seeds transactions, default users, settings, and initial model predictions.
"""

import os
import sys
import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.database.database import engine, SessionLocal, Base
from backend.app.models.models import Transaction, ModelPrediction, User, SystemSetting
from backend.ml.predict import FraudPredictor, FEATURE_COLS

MERCHANTS = [
    "Amazon Web Services", "Apple Store Online", "Best Buy Electronics",
    "Delta Air Lines", "Target Superstore", "Uber Rides & Eats",
    "Walmart Global", "Steam Games", "Coinbase Digital", "Rolex Boutique NYC",
    "Shell Fuel Station", "Hilton Hotels Worldwide", "Starbucks Coffee",
    "Nordstrom Luxury", "Binance Global Express"
]

CATEGORIES = [
    "Online Retail", "Electronics", "Travel & Airlines", "Gaming & Digital",
    "Crypto Exchange", "Luxury Goods", "Transportation", "Hospitality", "Fuel & Gas"
]

CARD_TYPES = [
    "Visa Platinum", "Visa Signature", "Mastercard World Elite",
    "American Express Gold", "Discover Cash Back"
]


def seed_database():
    print("[Seed] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Users
        if db.query(User).count() == 0:
            print("[Seed] Seeding platform users...")
            users = [
                User(user_id="USR-101", username="sarah.chen", email="sarah.chen@finbank.com", role="Lead Fraud Analyst"),
                User(user_id="USR-102", username="marcus.vance", email="marcus.vance@finbank.com", role="Risk Manager"),
                User(user_id="USR-103", username="alex.mercer", email="alex.mercer@finbank.com", role="System Administrator")
            ]
            db.add_all(users)
            db.commit()

        # 2. Seed System Settings
        if db.query(SystemSetting).count() == 0:
            print("[Seed] Seeding default system settings...")
            settings = [
                SystemSetting(key="threshold_low", value="30", description="Upper bound for Low Risk category"),
                SystemSetting(key="threshold_medium", value="60", description="Upper bound for Medium Risk category"),
                SystemSetting(key="threshold_high", value="80", description="Upper bound for High Risk category"),
                SystemSetting(key="active_model", value="Random Forest", description="Current production inference model"),
                SystemSetting(key="auto_block_threshold", value="85", description="Risk score to trigger automatic card freeze")
            ]
            db.add_all(settings)
            db.commit()

        # 3. Seed Transactions
        existing_txns = db.query(Transaction).count()
        if existing_txns > 0:
            print(f"[Seed] Database already contains {existing_txns} transactions. Skipping raw seed.")
            return

        csv_path = os.path.join(PROJECT_ROOT, 'dataset', 'creditcard.csv')
        if not os.path.exists(csv_path):
            print(f"[Seed] Dataset not found at {csv_path}. Skipping transaction seed.")
            return

        print(f"[Seed] Reading dataset from {csv_path}...")
        df = pd.read_csv(csv_path)

        # Include ALL frauds + 3,000 sampled genuine transactions
        frauds_df = df[df['Class'] == 1].copy()
        genuines_df = df[df['Class'] == 0].sample(n=3000, random_state=42).copy()
        combined = pd.concat([frauds_df, genuines_df]).sample(frac=1.0, random_state=42).reset_index(drop=True)

        print(f"[Seed] Scoring and preparing {len(combined)} transactions (including {len(frauds_df)} actual frauds)...")
        predictor = FraudPredictor()

        # Vectorized batch transformation and scoring
        X_trans = predictor.preprocessor.transform(combined[FEATURE_COLS])
        probs = predictor.model.predict_proba(X_trans)[:, 1]

        txns_to_add = []
        preds_to_add = []
        base_time = datetime.utcnow() - timedelta(days=14)

        for i, row in combined.iterrows():
            txn_id = f"TXN-{100000 + i}"
            is_real_fraud = int(row['Class'])
            amount = round(float(row['Amount']), 2)
            time_val = float(row['Time'])

            prob = round(float(probs[i]), 4)
            risk_score = int(round(prob * 100))
            risk_score = max(0, min(100, risk_score))
            pred_class = 1 if risk_score >= 50 else 0

            if risk_score <= 30:
                risk_level = "Low"
            elif risk_score <= 60:
                risk_level = "Medium"
            elif risk_score <= 80:
                risk_level = "High"
            else:
                risk_level = "Critical"

            # Set realistic operational status
            if risk_score >= 80:
                status = "Blocked"
            elif risk_score >= 60:
                status = "Flagged"
            elif risk_score >= 35:
                status = "Under Review"
            else:
                status = "Approved"

            # Synthetic enrichment
            cat = random.choice(CATEGORIES)
            card = random.choice(CARD_TYPES)
            created_at = base_time + timedelta(seconds=time_val % (14 * 86400))

            txn = Transaction(
                transaction_id=txn_id,
                transaction_time=time_val,
                transaction_amount=amount,
                class_label=is_real_fraud,
                prediction=pred_class,
                fraud_probability=prob,
                risk_score=risk_score,
                risk_level=risk_level,
                merchant_category=cat,
                card_type=card,
                status=status,
                timestamp=created_at,
                **{f"v{j}": float(row[f"V{j}"]) for j in range(1, 29)}
            )
            txns_to_add.append(txn)

            pred_log = ModelPrediction(
                prediction_id=f"PRED-{100000 + i}",
                transaction_id=txn_id,
                model_name="Random Forest",
                prediction_result=pred_class,
                prediction_probability=prob,
                risk_score=risk_score,
                created_at=created_at
            )
            preds_to_add.append(pred_log)

            # Batch flush every 500 records
            if len(txns_to_add) >= 500:
                db.add_all(txns_to_add)
                db.add_all(preds_to_add)
                db.commit()
                txns_to_add = []
                preds_to_add = []

        if txns_to_add:
            db.add_all(txns_to_add)
            db.add_all(preds_to_add)
            db.commit()

        total = db.query(Transaction).count()
        fraud_c = db.query(Transaction).filter(Transaction.class_label == 1).count()
        print(f"[Seed] Successfully seeded {total} transactions ({fraud_c} actual fraud records) into database!")

    except Exception as e:
        db.rollback()
        print(f"[Seed Error] {e}")
        raise
    finally:
        db.close()


if __name__ == '__main__':
    seed_database()
