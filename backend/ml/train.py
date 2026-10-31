"""
Model Training & Benchmarking Pipeline
======================================
Trains and benchmarks 4 algorithms:
1. Logistic Regression
2. Decision Tree
3. Random Forest
4. XGBoost

Evaluates Precision, Recall, F1, ROC-AUC, PR-AUC, Confusion Matrix,
and exports production model artifacts and SHAP explanations.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    average_precision_score, confusion_matrix, roc_curve, precision_recall_curve,
    accuracy_score
)
import shap

from backend.ml.preprocessing import prepare_train_test_data, SAVED_MODELS_DIR, DEFAULT_DATA_PATH


def get_models(y_train: pd.Series) -> Dict[str, Any]:
    """Instantiate algorithms with class balancing."""
    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()
    scale_pos = neg_count / max(1, pos_count)

    return {
        'Logistic Regression': LogisticRegression(
            max_iter=1000,
            C=0.1,
            class_weight='balanced',
            random_state=42
        ),
        'Decision Tree': DecisionTreeClassifier(
            max_depth=5,
            min_samples_leaf=10,
            class_weight='balanced',
            random_state=42
        ),
        'Random Forest': RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            min_samples_leaf=5,
            class_weight='balanced_subsample',
            random_state=42,
            n_jobs=2
        ),
        'XGBoost': XGBClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.08,
            scale_pos_weight=scale_pos,
            eval_metric='logloss',
            random_state=42,
            n_jobs=2
        )
    }


def evaluate_model(model: Any, X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, Any]:
    """Evaluate candidate model on unseen test set."""
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else y_pred

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    fpr, tpr, _ = roc_curve(y_test, y_proba)
    prec_pts, rec_pts, _ = precision_recall_curve(y_test, y_proba)

    metrics = {
        'accuracy': round(float(accuracy_score(y_test, y_pred)), 4),
        'precision': round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        'recall': round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        'f1_score': round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        'roc_auc': round(float(roc_auc_score(y_test, y_proba)), 4),
        'pr_auc': round(float(average_precision_score(y_test, y_proba)), 4),
        'confusion_matrix': {
            'true_negatives': int(tn),
            'false_positives': int(fp),
            'false_negatives': int(fn),
            'true_positives': int(tp)
        },
        'roc_curve': {
            'fpr': [round(x, 4) for x in fpr[::max(1, len(fpr)//50)].tolist()],
            'tpr': [round(x, 4) for x in tpr[::max(1, len(tpr)//50)].tolist()]
        },
        'pr_curve': {
            'precision': [round(x, 4) for x in prec_pts[::max(1, len(prec_pts)//50)].tolist()],
            'recall': [round(x, 4) for x in rec_pts[::max(1, len(rec_pts)//50)].tolist()]
        }
    }
    # Weighted composite score balancing PR-AUC, Recall, and F1
    metrics['selection_score'] = round(
        0.40 * metrics['pr_auc'] + 0.35 * metrics['recall'] + 0.20 * metrics['f1_score'] + 0.05 * metrics['precision'],
        4
    )
    return metrics


def train_and_benchmark(
    data_path: str = DEFAULT_DATA_PATH,
    saved_models_dir: str = SAVED_MODELS_DIR,
    sample_size: int = 100000
) -> Dict[str, Any]:
    """
    Train 4 models, evaluate, export artifacts and SHAP summary.
    """
    os.makedirs(saved_models_dir, exist_ok=True)

    X_train, X_test, y_train, y_test, preprocessor = prepare_train_test_data(
        data_path=data_path,
        sample_size=sample_size
    )

    # Save fitted preprocessor
    joblib.dump(preprocessor, os.path.join(saved_models_dir, 'preprocessor.joblib'))

    models = get_models(y_train)
    benchmark_results = {}
    fitted_models = {}

    print("\n" + "=" * 70)
    print("      TRAINING FRAUD DETECTION ALGORITHMS & BENCHMARKING      ")
    print("=" * 70)

    for name, model in models.items():
        print(f"\n[Training] {name}...")
        model.fit(X_train, y_train)
        fitted_models[name] = model

        eval_res = evaluate_model(model, X_test, y_test)
        benchmark_results[name] = eval_res

        # Save individual model
        clean_name = name.lower().replace(' ', '_') + '.joblib'
        joblib.dump(model, os.path.join(saved_models_dir, clean_name))

        print(f"  -> Precision: {eval_res['precision']:.2%}")
        print(f"  -> Recall:    {eval_res['recall']:.2%} (Fraud Detection Rate)")
        print(f"  -> F1-Score:  {eval_res['f1_score']:.4f}")
        print(f"  -> ROC-AUC:   {eval_res['roc_auc']:.4f}")
        print(f"  -> PR-AUC:    {eval_res['pr_auc']:.4f} (Average Precision)")

    # Champion selection based on highest selection score (combining PR-AUC & Recall)
    champion_name = max(benchmark_results, key=lambda k: benchmark_results[k]['selection_score'])
    champion_model = fitted_models[champion_name]
    champion_path = os.path.join(saved_models_dir, 'best_model.joblib')
    joblib.dump(champion_model, champion_path)

    print("\n" + "=" * 70)
    print(f"[CHAMPION] PRODUCTION CHAMPION MODEL: {champion_name}")
    print(f"   Saved to: {champion_path}")
    print("=" * 70)

    # Extract Feature Importances from Champion
    feature_names = list(X_train.columns)
    if hasattr(champion_model, 'feature_importances_'):
        importances = champion_model.feature_importances_.tolist()
    elif hasattr(champion_model, 'coef_'):
        importances = np.abs(champion_model.coef_[0]).tolist()
    else:
        importances = [1.0 / len(feature_names)] * len(feature_names)

    feat_importance_list = sorted([
        {'feature': f, 'importance': round(float(imp), 4)}
        for f, imp in zip(feature_names, importances)
    ], key=lambda x: x['importance'], reverse=True)

    # Compute SHAP Values on a representative sample of test transactions
    print("[SHAP] Computing TreeExplainer attributions...")
    try:
        sample_background = X_test.iloc[:150]
        explainer = shap.TreeExplainer(champion_model)
        sv = explainer.shap_values(sample_background)
        if isinstance(sv, list):
            sv = sv[1]
        
        mean_abs_shap = np.mean(np.abs(sv), axis=0).tolist()
        shap_features = sorted([
            {'feature': f, 'mean_abs_shap': round(float(v), 4)}
            for f, v in zip(feature_names, mean_abs_shap)
        ], key=lambda x: x['mean_abs_shap'], reverse=True)
    except Exception as e:
        print(f"[SHAP] Fallback: {e}")
        shap_features = feat_importance_list[:15]

    # Save metrics JSON
    summary_data = {
        'best_model': champion_name,
        'feature_names': feature_names,
        'feature_importances': feat_importance_list,
        'shap_importances': shap_features,
        'models': benchmark_results,
        'sample_test_size': len(X_test),
        'fraud_test_cases': int((y_test == 1).sum())
    }

    metrics_path = os.path.join(saved_models_dir, 'model_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(summary_data, f, indent=4)

    print(f"[Metrics] Exported model metrics to: {metrics_path}")
    return summary_data


if __name__ == '__main__':
    train_and_benchmark()
