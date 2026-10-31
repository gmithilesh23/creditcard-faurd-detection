"""
Machine Learning Preprocessing Pipeline
=======================================
Handles data loading, scaling, feature engineering, and stratified train-test splitting
without data leakage for the European Credit Card Fraud Detection dataset.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import RobustScaler, StandardScaler

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DEFAULT_DATA_PATH = os.path.join(PROJECT_ROOT, 'dataset', 'creditcard.csv')
SAVED_MODELS_DIR = os.path.join(PROJECT_ROOT, 'backend', 'saved_models')

FEATURE_COLUMNS = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount']
TARGET_COLUMN = 'Class'


def load_raw_dataset(path: str = DEFAULT_DATA_PATH) -> pd.DataFrame:
    """Load credit card fraud dataset from CSV."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Credit card fraud dataset not found at: {path}")
    return pd.read_csv(path)


def clean_and_prepare_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """Clean dataset and split into features X and target y."""
    df = df.copy()
    # Drop duplicates if any
    df = df.drop_duplicates()
    
    X = df[FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMN].astype(int)
    return X, y


class CreditCardPreprocessor:
    """
    Production Preprocessor for Credit Card Fraud Detection.
    Uses RobustScaler for Amount and Time to resist extreme transaction outliers.
    V1-V28 are PCA features already scaled and centered.
    """

    def __init__(self):
        self.amount_scaler = RobustScaler()
        self.time_scaler = RobustScaler()
        self.feature_names = FEATURE_COLUMNS

    def fit(self, X: pd.DataFrame):
        self.amount_scaler.fit(X[['Amount']])
        self.time_scaler.fit(X[['Time']])
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        X_out = X.copy()
        X_out['Scaled_Amount'] = self.amount_scaler.transform(X[['Amount']])
        X_out['Scaled_Time'] = self.time_scaler.transform(X[['Time']])
        
        # Feature ordering: Scaled_Time, Scaled_Amount, V1..V28
        ordered_cols = ['Scaled_Time', 'Scaled_Amount'] + [f'V{i}' for i in range(1, 29)]
        return X_out[ordered_cols]

    def fit_transform(self, X: pd.DataFrame) -> pd.DataFrame:
        return self.fit(X).transform(X)


def prepare_train_test_data(
    data_path: str = DEFAULT_DATA_PATH,
    test_size: float = 0.2,
    random_state: int = 42,
    sample_size: int = None
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, CreditCardPreprocessor]:
    """
    Split dataset with stratification and fit preprocessor on training data ONLY.
    """
    print(f"[Preprocessing] Loading dataset from: {data_path}")
    df = load_raw_dataset(data_path)
    
    if sample_size and len(df) > sample_size:
        # Preserve all frauds and sample genuine to accelerate training if requested
        frauds = df[df['Class'] == 1]
        genuines = df[df['Class'] == 0].sample(n=sample_size - len(frauds), random_state=random_state)
        df = pd.concat([frauds, genuines]).sample(frac=1.0, random_state=random_state).reset_index(drop=True)

    X_raw, y = clean_and_prepare_features(df)
    print(f"[Preprocessing] Cleaned dataset shape: {X_raw.shape}, Fraud cases: {(y == 1).sum()}")

    # Stratified Split (80% Train, 20% Test)
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_raw, y, test_size=test_size, random_state=random_state, stratify=y
    )

    # Fit preprocessor on train only
    preprocessor = CreditCardPreprocessor()
    X_train = preprocessor.fit_transform(X_train_raw)
    X_test = preprocessor.transform(X_test_raw)

    return X_train, X_test, y_train, y_test, preprocessor

