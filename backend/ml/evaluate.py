"""
Model Evaluation Utilities
==========================
File: backend/ml/evaluate.py
"""

import os
import json
import joblib
import pandas as pd
from typing import Dict, Any

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SAVED_MODELS_DIR = os.path.join(PROJECT_ROOT, 'backend', 'saved_models')


def get_evaluation_summary() -> Dict[str, Any]:
    """Retrieve saved evaluation metrics JSON."""
    metrics_path = os.path.join(SAVED_MODELS_DIR, 'model_metrics.json')
    if not os.path.exists(metrics_path):
        raise FileNotFoundError(f"Model metrics not found at: {metrics_path}. Please run train.py first.")

    with open(metrics_path, 'r') as f:
        return json.load(f)


if __name__ == '__main__':
    metrics = get_evaluation_summary()
    print("Best Model:", metrics['best_model'])
    for name, res in metrics['models'].items():
        print(f"[{name}] Recall: {res['recall']:.2%}, PR-AUC: {res['pr_auc']:.4f}, F1: {res['f1_score']:.4f}")

