"""
ML Service for Risk Analysis using XGBoost

This service handles training and inference of the risk prediction model.
"""
import xgboost as xgb
import shap
import numpy as np
import pandas as pd
import pickle
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class RiskMLService:
    def __init__(self):
        self.model = None
        self.explainer = None
        self.feature_names = [
            'days_to_nearest_expiry',
            'total_certificates',
            'expired_count',
            'expiring_soon_count',
            'valid_count',
            'audit_pass_rate',
            'avg_certificate_validity_days',
            'financial_health_score',
            'geographic_risk_score',
            'years_in_business'
        ]
        self.model_path = Path(__file__).parent.parent / 'models' / 'xgboost_risk_model.pkl'
        self._ensure_model_exists()

    def _ensure_model_exists(self):
        """Ensure model file exists, create a dummy one if not"""
        if not self.model_path.exists():
            logger.warning("No trained model found. Creating a dummy model...")
            self._create_dummy_model()
        self.load_model()

    def _create_dummy_model(self):
        """Create a dummy model for initial setup"""
        X_dummy = pd.DataFrame(np.zeros((10, len(self.feature_names))), columns=self.feature_names)
        y_dummy = np.random.uniform(0, 100, 10)
        
        self.model = xgb.XGBRegressor(
            objective='reg:squarederror',
            n_estimators=10,  # Small number for dummy model
            max_depth=3,
            learning_rate=0.1,
            random_state=42
        )
        self.model.fit(X_dummy, y_dummy)
        self.save_model()

    def train_model(self, training_data: pd.DataFrame, target_column: str = 'risk_score'):
        """
        Train XGBoost model on historical supplier data
        
        Args:
            training_data: DataFrame containing features and target
            target_column: Name of the target column
        """
        X = training_data[self.feature_names]
        y = training_data[target_column]
        
        self.model = xgb.XGBRegressor(
            objective='reg:squarederror',
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        
        self.model.fit(X, y)
        self.explainer = shap.TreeExplainer(self.model)
        self.save_model()
        
        logger.info("Model trained and saved successfully")
        return self.model

    def save_model(self):
        """Save the trained model to disk"""
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)
        logger.debug(f"Model saved to {self.model_path}")

    def load_model(self) -> bool:
        """Load pre-trained model from disk"""
        try:
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            self.explainer = shap.TreeExplainer(self.model)
            logger.debug("Model loaded successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            return False

    def predict_risk(self, features: Dict) -> Tuple[float, List[Dict]]:
        """
        Predict risk score and get top drivers
        
        Args:
            features: Dictionary of feature values
            
        Returns:
            Tuple of (risk_score, top_drivers) where top_drivers is a list of 
            dictionaries containing feature name, value, impact, and weight
        """
        if not self.model:
            if not self.load_model():
                raise RuntimeError("No model available for prediction")
        
        # Create feature vector with all required features
        X = pd.DataFrame([{
            feature: features.get(feature, 0) 
            for feature in self.feature_names
        }])
        
        # Predict
        risk_score = float(self.model.predict(X)[0])
        risk_score = max(0, min(100, risk_score))  # Clamp between 0-100
        
        # Get SHAP values for explanation
        shap_values = self.explainer.shap_values(X)
        
        # Calculate feature importance
        feature_importance = []
        for i, feature_name in enumerate(self.feature_names):
            feature_importance.append({
                'feature': feature_name,
                'value': float(X[feature_name].iloc[0]),
                'impact': float(abs(shap_values[0][i])),
                'contribution': float(shap_values[0][i])
            })
        
        # Sort by impact and get top 3
        feature_importance.sort(key=lambda x: x['impact'], reverse=True)
        top_drivers = feature_importance[:3]
        
        # Calculate weights (normalize to 100%)
        total_impact = sum(d['impact'] for d in top_drivers)
        for driver in top_drivers:
            driver['weight'] = driver['impact'] / total_impact if total_impact > 0 else 0
        
        return risk_score, top_drivers

# Global instance
ml_service = RiskMLService()
