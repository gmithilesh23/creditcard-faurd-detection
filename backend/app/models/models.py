"""
SQLAlchemy Database Models
==========================
File: backend/app/models/models.py
Tables: transactions, model_predictions, users, system_settings
"""

from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship

from backend.app.database.database import Base


class Transaction(Base):
    """Transactions table matching specification."""
    __tablename__ = "transactions"

    transaction_id = Column(String(50), primary_key=True, index=True)
    transaction_time = Column(Float, nullable=False, index=True)
    transaction_amount = Column(Float, nullable=False, index=True)
    class_label = Column("class", Integer, nullable=False, index=True)  # 0 = Genuine, 1 = Fraud
    prediction = Column(Integer, nullable=False, index=True)  # Model predicted (0 or 1)
    fraud_probability = Column(Float, nullable=False)  # 0.0 to 1.0
    risk_score = Column(Integer, nullable=False, index=True)  # 0 to 100
    risk_level = Column(String(20), nullable=False, index=True)  # Low, Medium, High, Critical
    
    # Enrichment fields for realistic enterprise experience
    merchant_category = Column(String(50), default="Online Retail")
    card_type = Column(String(20), default="Visa Platinum")
    currency = Column(String(5), default="USD")
    status = Column(String(20), default="Approved", index=True)  # Approved, Flagged, Blocked, Under Review
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # V1 to V28 PCA features stored for individual drill-down
    v1 = Column(Float, nullable=True)
    v2 = Column(Float, nullable=True)
    v3 = Column(Float, nullable=True)
    v4 = Column(Float, nullable=True)
    v5 = Column(Float, nullable=True)
    v6 = Column(Float, nullable=True)
    v7 = Column(Float, nullable=True)
    v8 = Column(Float, nullable=True)
    v9 = Column(Float, nullable=True)
    v10 = Column(Float, nullable=True)
    v11 = Column(Float, nullable=True)
    v12 = Column(Float, nullable=True)
    v13 = Column(Float, nullable=True)
    v14 = Column(Float, nullable=True)
    v15 = Column(Float, nullable=True)
    v16 = Column(Float, nullable=True)
    v17 = Column(Float, nullable=True)
    v18 = Column(Float, nullable=True)
    v19 = Column(Float, nullable=True)
    v20 = Column(Float, nullable=True)
    v21 = Column(Float, nullable=True)
    v22 = Column(Float, nullable=True)
    v23 = Column(Float, nullable=True)
    v24 = Column(Float, nullable=True)
    v25 = Column(Float, nullable=True)
    v26 = Column(Float, nullable=True)
    v27 = Column(Float, nullable=True)
    v28 = Column(Float, nullable=True)

    predictions = relationship("ModelPrediction", back_populates="transaction", cascade="all, delete-orphan")


class ModelPrediction(Base):
    """Separate model predictions log for auditability."""
    __tablename__ = "model_predictions"

    prediction_id = Column(String(50), primary_key=True, index=True)
    transaction_id = Column(String(50), ForeignKey("transactions.transaction_id"), nullable=False, index=True)
    model_name = Column(String(50), nullable=False, default="Random Forest")
    prediction_result = Column(Integer, nullable=False)  # 0 or 1
    prediction_probability = Column(Float, nullable=False)
    risk_score = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    transaction = relationship("Transaction", back_populates="predictions")


class User(Base):
    """Platform users table."""
    __tablename__ = "users"

    user_id = Column(String(50), primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False)
    role = Column(String(30), nullable=False, default="Fraud Analyst")
    created_at = Column(DateTime, default=datetime.utcnow)


class SystemSetting(Base):
    """Configurable business thresholds."""
    __tablename__ = "system_settings"

    key = Column(String(50), primary_key=True)
    value = Column(String(200), nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)

