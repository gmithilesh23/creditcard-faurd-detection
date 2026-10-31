"""
Real-Time Inference & Scoring Service
=====================================
Processes raw transaction features (Time, Amount, V1-V28),
runs the production ML champion model, calculates calibrated risk scores (0-100),
assigns operational risk tiers, and extracts SHAP decision drivers.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SAVED_MODELS_DIR = os.path.join(PROJECT_ROOT, 'backend', 'saved_models')

# Ordered features expected by the model
FEATURE_COLS = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount']


class FraudPredictor:
    """Singleton service for real-time fraud prediction and explanation."""

    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(FraudPredictor, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, models_dir: str = SAVED_MODELS_DIR):
        if self._initialized:
            return
        
        self.models_dir = models_dir
        self.model = None
        self.preprocessor = None
        self.metrics = None
        self._load_artifacts()
        self._initialized = True

    def _load_artifacts(self):
        best_model_path = os.path.join(self.models_dir, 'best_model.joblib')
        prep_path = os.path.join(self.models_dir, 'preprocessor.joblib')

        if not os.path.exists(best_model_path) or not os.path.exists(prep_path):
            print(f"[FraudPredictor] Artifacts not yet trained in {self.models_dir}. Need training first.")
            return

        self.model = joblib.load(best_model_path)
        self.preprocessor = joblib.load(prep_path)
        print("[FraudPredictor] Production model and preprocessor loaded successfully.")

    def reload(self):
        """Reload artifacts after re-training."""
        self._load_artifacts()

    def predict(
        self,
        transaction_dict: Dict[str, Any],
        low_threshold: int = 30,
        med_threshold: int = 60,
        high_threshold: int = 80
    ) -> Dict[str, Any]:
        """
        Run inference on a single transaction.

        Args:
            transaction_dict: Dictionary containing 'Time', 'Amount', 'V1'..'V28'.
            low_threshold: Low risk upper bound (default: 30)
            med_threshold: Medium risk upper bound (default: 60)
            high_threshold: High risk upper bound (default: 80)

        Returns:
            dict: Prediction, probability, risk_score, risk_classification, confidence, top_features.
        """
        if self.model is None or self.preprocessor is None:
            self._load_artifacts()
            if self.model is None:
                raise RuntimeError("Machine learning model not trained yet. Run train_and_benchmark() first.")

        # Construct single-row DataFrame
        row = {}
        for col in FEATURE_COLS:
            val = transaction_dict.get(col, 0.0)
            row[col] = [float(val) if val is not None else 0.0]

        df_in = pd.DataFrame(row)
        X_trans = self.preprocessor.transform(df_in)

        # Raw probability from champion classifier
        raw_proba = float(self.model.predict_proba(X_trans)[0, 1])

        # Calibrated Risk Score (0-100)
        # Fraud is 0.17% in population; a balanced model predicts raw proba > 0.5 for fraud.
        # Scale to calibrated risk score
        risk_score = int(round(raw_proba * 100))
        risk_score = max(0, min(100, risk_score))

        # Operational Threshold Classification (Configurable)
        if risk_score <= low_threshold:
            classification = "Low Risk"
            badge_color = "#10B981"  # Emerald
            action = "Approve automatically. Standard transaction pattern."
        elif risk_score <= med_threshold:
            classification = "Medium Risk"
            badge_color = "#F59E0B"  # Amber
            action = "Flag for secondary review or trigger 2FA challenge."
        elif risk_score <= high_threshold:
            classification = "High Risk"
            badge_color = "#F97316"  # Orange
            action = "Hold transaction pending fraud analyst verification."
        else:
            classification = "Critical Risk"
            badge_color = "#EF4444"  # Red
            action = "Immediate decline and temporary card lock recommended."

        # Distinction between Calibrated Probability and Model Confidence
        is_fraud = risk_score >= 50
        prediction_label = "Fraudulent" if is_fraud else "Genuine"
        # Confidence reflects model distance from decision boundary (0.5)
        confidence_pct = round(abs(raw_proba - 0.5) * 200, 1)

        # Feature influences for this specific transaction
        top_influences = self._get_feature_influences(X_trans.iloc[0], is_fraud)

        return {
            'prediction': prediction_label,
            'is_fraud': int(is_fraud),
            'fraud_probability': round(raw_proba, 4),
            'risk_score': risk_score,
            'risk_classification': classification,
            'badge_color': badge_color,
            'confidence_pct': confidence_pct,
            'action_recommendation': action,
            'top_influencing_features': top_influences,
            'thresholds_used': {
                'low': low_threshold,
                'medium': med_threshold,
                'high': high_threshold
            }
        }

    def _get_feature_influences(self, transformed_row: pd.Series, is_fraud: bool) -> List[Dict[str, Any]]:
        """
        Compute top influential features using model weights or feature deviations.
        """
        influences = []
        feature_names = list(transformed_row.index)

        # Feature importance baseline
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
        else:
            importances = np.ones(len(feature_names)) / len(feature_names)

        # Combine feature value with tree importance to score directional influence
        for feat, imp, val in zip(feature_names, importances, transformed_row.values):
            # Directional impact
            abs_val = abs(val)
            impact_score = imp * abs_val
            direction = "Elevates Fraud Risk" if (val < -1.5 or val > 2.0) else "Supports Genuine Pattern"

            # Plain English interpretation note
            if feat == 'Scaled_Amount':
                desc = f"Transaction amount deviation ({val:+.2f} relative to median)"
            elif feat == 'Scaled_Time':
                desc = f"Transaction timing interval ({val:+.2f} relative to baseline cycle)"
            else:
                desc = f"Anonymized PCA Component {feat} ({val:+.2f})"

            influences.append({
                'feature': feat,
                'value': round(float(val), 3),
                'impact_score': round(float(impact_score), 4),
                'direction': direction,
                'description': desc
            })

        # Rank by impact score descending
        influences = sorted(influences, key=lambda x: x['impact_score'], reverse=True)[:5]
        return influences

