"""
Pydantic Schemas for Financial Fraud Intelligence Platform
==========================================================
File: backend/app/schemas/schemas.py
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# ==========================================
# 1. TRANSACTION SCHEMAS
# ==========================================

class TransactionBase(BaseModel):
    transaction_time: float = Field(..., description="Seconds elapsed since initial record")
    transaction_amount: float = Field(..., description="Transaction amount in currency units")
    merchant_category: Optional[str] = "Online Retail"
    card_type: Optional[str] = "Visa Platinum"


class TransactionCreate(TransactionBase):
    v1: float = 0.0
    v2: float = 0.0
    v3: float = 0.0
    v4: float = 0.0
    v5: float = 0.0
    v6: float = 0.0
    v7: float = 0.0
    v8: float = 0.0
    v9: float = 0.0
    v10: float = 0.0
    v11: float = 0.0
    v12: float = 0.0
    v13: float = 0.0
    v14: float = 0.0
    v15: float = 0.0
    v16: float = 0.0
    v17: float = 0.0
    v18: float = 0.0
    v19: float = 0.0
    v20: float = 0.0
    v21: float = 0.0
    v22: float = 0.0
    v23: float = 0.0
    v24: float = 0.0
    v25: float = 0.0
    v26: float = 0.0
    v27: float = 0.0
    v28: float = 0.0


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    transaction_id: str
    transaction_time: float
    transaction_amount: float
    class_label: Optional[int] = None
    prediction: Optional[int] = None
    fraud_probability: Optional[float] = None
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None
    merchant_category: Optional[str] = None
    card_type: Optional[str] = None
    status: Optional[str] = None
    timestamp: Optional[datetime] = None
    v1: Optional[float] = None
    v2: Optional[float] = None
    v3: Optional[float] = None
    v4: Optional[float] = None
    v5: Optional[float] = None
    v6: Optional[float] = None
    v7: Optional[float] = None
    v8: Optional[float] = None
    v9: Optional[float] = None
    v10: Optional[float] = None
    v11: Optional[float] = None
    v12: Optional[float] = None
    v13: Optional[float] = None
    v14: Optional[float] = None
    v15: Optional[float] = None
    v16: Optional[float] = None
    v17: Optional[float] = None
    v18: Optional[float] = None
    v19: Optional[float] = None
    v20: Optional[float] = None
    v21: Optional[float] = None
    v22: Optional[float] = None
    v23: Optional[float] = None
    v24: Optional[float] = None
    v25: Optional[float] = None
    v26: Optional[float] = None
    v27: Optional[float] = None
    v28: Optional[float] = None


class TransactionListResponse(BaseModel):
    transactions: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class TransactionStatusUpdate(BaseModel):
    status: str = Field(..., description="Approved, Flagged, Under Review, Blocked, Dismissed")
    notes: Optional[str] = None


# ==========================================
# 2. INFERENCE & SCORING SCHEMAS
# ==========================================

class PredictionRequest(BaseModel):
    Time: float = Field(default=0.0, description="Time delta in seconds")
    Amount: float = Field(default=100.0, description="Transaction monetary amount")
    V1: float = 0.0
    V2: float = 0.0
    V3: float = 0.0
    V4: float = 0.0
    V5: float = 0.0
    V6: float = 0.0
    V7: float = 0.0
    V8: float = 0.0
    V9: float = 0.0
    V10: float = 0.0
    V11: float = 0.0
    V12: float = 0.0
    V13: float = 0.0
    V14: float = 0.0
    V15: float = 0.0
    V16: float = 0.0
    V17: float = 0.0
    V18: float = 0.0
    V19: float = 0.0
    V20: float = 0.0
    V21: float = 0.0
    V22: float = 0.0
    V23: float = 0.0
    V24: float = 0.0
    V25: float = 0.0
    V26: float = 0.0
    V27: float = 0.0
    V28: float = 0.0
    # Optional metadata
    merchant_category: Optional[str] = "Online Retail"
    card_type: Optional[str] = "Visa Platinum"


class FeatureInfluenceItem(BaseModel):
    feature: str
    value: float
    impact_score: float
    direction: str
    description: str


class PredictionResponse(BaseModel):
    transaction_id: str
    prediction: str  # "Fraudulent" or "Genuine"
    is_fraud: int    # 1 or 0
    fraud_probability: float
    risk_score: int  # 0 to 100
    risk_classification: str # "Low Risk", "Medium Risk", "High Risk", "Critical Risk"
    badge_color: str
    confidence_pct: float
    action_recommendation: str
    top_influencing_features: List[FeatureInfluenceItem]
    thresholds_used: Dict[str, int]
    timestamp: datetime


# ==========================================
# 3. DASHBOARD & OVERVIEW SCHEMAS
# ==========================================

class KPICardData(BaseModel):
    total_transactions: int
    fraudulent_transactions: int
    genuine_transactions: int
    fraud_rate_pct: float
    total_fraud_amount: float
    total_volume_amount: float
    avg_transaction_amount: float
    high_risk_alerts_count: int
    model_accuracy_pct: float
    model_pr_auc_pct: float


class VolumeTrendPoint(BaseModel):
    date: str
    total_count: int
    fraud_count: int
    genuine_count: int
    total_amount: float
    fraud_amount: float


class DistributionItem(BaseModel):
    tier: str
    count: int
    pct: float
    color: str


class AmountBinItem(BaseModel):
    range_label: str
    count: int
    fraud_count: int
    fraud_rate: float


class HourlyPatternItem(BaseModel):
    hour: int
    total_count: int
    fraud_count: int
    fraud_rate: float


class DashboardOverviewResponse(BaseModel):
    kpis: KPICardData
    volume_trends: List[VolumeTrendPoint]
    fraud_vs_genuine: Dict[str, Any]
    amount_distribution: List[AmountBinItem]
    hourly_patterns: List[HourlyPatternItem]
    risk_tier_distribution: List[DistributionItem]
    recent_suspicious: List[TransactionResponse]


# ==========================================
# 4. ANALYTICS & RISK SCHEMAS
# ==========================================

class CategoryBreakdownItem(BaseModel):
    category: str
    total_count: int
    fraud_count: int
    fraud_rate: float
    total_amount: float
    avg_amount: float


class CardTypeBreakdownItem(BaseModel):
    card_type: str
    total_count: int
    fraud_count: int
    fraud_rate: float
    total_amount: float


class AnalyticsResponse(BaseModel):
    hourly_trends: List[HourlyPatternItem]
    category_breakdown: List[CategoryBreakdownItem]
    card_type_breakdown: List[CardTypeBreakdownItem]
    amount_brackets: List[AmountBinItem]
    summary_insights: List[str]


class RiskTierSummaryItem(BaseModel):
    tier: str
    score_range: str
    count: int
    pct: float
    fraud_count: int
    total_amount: float
    color: str
    action: str


class AnomalyPatternItem(BaseModel):
    id: str
    title: str
    description: str
    affected_count: int
    severity: str  # "Critical", "High", "Medium", "Low"
    indicator: str


class RiskAnalysisResponse(BaseModel):
    risk_tiers: List[RiskTierSummaryItem]
    risk_histogram: List[Dict[str, Any]]
    anomalies: List[AnomalyPatternItem]
    high_risk_txns: List[TransactionResponse]


# ==========================================
# 5. AI INSIGHTS & EXPLAINABILITY SCHEMAS
# ==========================================

class GlobalSHAPItem(BaseModel):
    feature: str
    importance: float
    rank: int
    correlation: str
    description: str
    sample_positive_val: float
    sample_negative_val: float


class DecisionRuleItem(BaseModel):
    rule_id: str
    condition: str
    fraud_likelihood: str
    confidence: float
    support_count: int
    explanation: str


class AIInsightsResponse(BaseModel):
    model_name: str
    methodology: str
    global_features: List[GlobalSHAPItem]
    decision_rules: List[DecisionRuleItem]
    fraud_behavior_archetypes: List[Dict[str, Any]]


# ==========================================
# 6. MODEL PERFORMANCE & BENCHMARKS
# ==========================================

class ModelBenchmarkRow(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    pr_auc: float
    is_champion: bool


class CurvePoint(BaseModel):
    x: float  # FPR for ROC, Recall for PR
    y: float  # TPR for ROC, Precision for PR


class ConfusionMatrixData(BaseModel):
    true_negative: int
    false_positive: int
    false_negative: int
    true_positive: int


class ModelPerformanceResponse(BaseModel):
    champion_model: str
    benchmark_table: List[ModelBenchmarkRow]
    confusion_matrices: Dict[str, ConfusionMatrixData]
    roc_curves: Dict[str, List[CurvePoint]]
    pr_curves: Dict[str, List[CurvePoint]]
    feature_importances: List[Dict[str, Any]]
    selection_rationale: str


# ==========================================
# 7. SYSTEM SETTINGS & AUDIT
# ==========================================

class SettingItem(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    updated_at: Optional[datetime] = None


class SettingsUpdatePayload(BaseModel):
    threshold_low: int = Field(..., ge=1, le=50)
    threshold_medium: int = Field(..., ge=20, le=80)
    threshold_high: int = Field(..., ge=50, le=99)
    auto_block_threshold: int = Field(..., ge=50, le=100)
    active_model: Optional[str] = "Random Forest"
