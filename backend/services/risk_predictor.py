"""
XGBoost-based risk prediction service
"""
import xgboost as xgb
import numpy as np
from typing import Dict, List
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class RiskPredictor:
    def __init__(self):
        """Initialize risk predictor with simple rule-based model for MVP"""
        # For MVP, use rule-based scoring
        # In production, train XGBoost on historical data
        self.model = None
        logger.info("✅ Risk Predictor initialized (rule-based for MVP)")
    
    def calculate_risk_score(self, features: Dict) -> Dict:
        """
        Calculate risk score based on supplier features
        
        Args:
            features: {
                'days_to_cert_expiry': int,
                'past_audit_failures': int,
                'financial_health_score': float (0-100),
                'news_sentiment_score': float (-1 to 1),
                'geographic_risk_score': float (0-1)
            }
        
        Returns:
            {
                'score': float (0-100),
                'risk_drivers': [{'factor': str, 'weight': float, 'description': str}]
            }
        """
        try:
            score = 0.0
            risk_drivers = []
            
            # Certificate expiry risk (40% weight)
            days_to_expiry = features.get('days_to_cert_expiry', 365)
            if days_to_expiry < 0:
                cert_risk = 40.0
                risk_drivers.append({
                    'factor': 'Certificate Expired',
                    'weight': 0.4,
                    'description': f'Certificate expired {abs(days_to_expiry)} days ago'
                })
            elif days_to_expiry < 30:
                cert_risk = 30.0
                risk_drivers.append({
                    'factor': 'Certificate Expiring Soon',
                    'weight': 0.4,
                    'description': f'Certificate expires in {days_to_expiry} days'
                })
            elif days_to_expiry < 90:
                cert_risk = 15.0
                risk_drivers.append({
                    'factor': 'Certificate Renewal Due',
                    'weight': 0.4,
                    'description': f'Certificate expires in {days_to_expiry} days'
                })
            else:
                cert_risk = 0.0
            
            score += cert_risk
            
            # Audit failure risk (30% weight)
            audit_failures = features.get('past_audit_failures', 0)
            if audit_failures > 0:
                audit_risk = min(30.0, audit_failures * 10)
                risk_drivers.append({
                    'factor': 'Past Audit Failures',
                    'weight': 0.3,
                    'description': f'{audit_failures} audit failure(s) in past 12 months'
                })
                score += audit_risk
            
            # Financial health risk (20% weight)
            financial_score = features.get('financial_health_score', 50.0)
            if financial_score < 40:
                financial_risk = 20.0
                risk_drivers.append({
                    'factor': 'Financial Health',
                    'weight': 0.2,
                    'description': f'Low financial health score: {financial_score:.0f}/100'
                })
                score += financial_risk
            elif financial_score < 60:
                financial_risk = 10.0
                score += financial_risk
            
            # Geographic risk (10% weight)
            geo_risk_score = features.get('geographic_risk_score', 0.0)
            if geo_risk_score > 0.5:
                geo_risk = 10.0
                risk_drivers.append({
                    'factor': 'Geographic Risk',
                    'weight': 0.1,
                    'description': 'Located in high-risk region'
                })
                score += geo_risk
            
            # Cap at 100
            score = min(100.0, score)
            
            logger.info(f"✅ Calculated risk score: {score:.1f}/100")
            
            return {
                'score': round(score, 1),
                'risk_drivers': risk_drivers
            }
            
        except Exception as e:
            logger.error(f"❌ Risk calculation failed: {e}")
            raise
    
    def get_risk_level(self, score: float) -> str:
        """Get risk level label"""
        if score < 30:
            return "low"
        elif score < 60:
            return "medium"
        else:
            return "high"


# Global instance
risk_predictor = RiskPredictor()
