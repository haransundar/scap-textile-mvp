"""
Risk Analysis Service

This service handles the calculation of risk scores for suppliers based on various factors
including certificate status, audit history, and financial health.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import numpy as np
from motor.motor_asyncio import AsyncIOMotorDatabase
from .ml_service import ml_service
import logging

logger = logging.getLogger(__name__)

class RiskService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.ml = ml_service

    async def calculate_supplier_features(self, supplier_id: str) -> Dict[str, float]:
        """
        Calculate all features needed for risk assessment for a supplier
        
        Args:
            supplier_id: The ID of the supplier to calculate features for
            
        Returns:
            Dictionary of feature names and their values
        """
        try:
            # Fetch all certificates for the supplier
            certificates = await self.db.certificates.find(
                {'user_id': supplier_id}
            ).to_list(None)
            
            if not certificates:
                raise ValueError(f"No certificates found for supplier {supplier_id}")
            
            today = datetime.utcnow()
            
            # Calculate basic certificate metrics
            total_certs = len(certificates)
            expired = sum(1 for c in certificates if c.get('expiry_date', today) < today)
            expiring_soon = sum(1 for c in certificates 
                             if today < c.get('expiry_date', today) < today + timedelta(days=30))
            valid = total_certs - expired - expiring_soon
            
            # Calculate days to nearest expiry
            active_certs = [c for c in certificates 
                          if c.get('expiry_date', today) > today]
            
            days_to_expiry = 0
            if active_certs:
                nearest_expiry = min(c.get('expiry_date', today) for c in active_certs)
                days_to_expiry = (nearest_expiry - today).days
            
            # Calculate average validity period
            validity_periods = []
            for cert in certificates:
                if 'expiry_date' in cert and 'issued_date' in cert:
                    try:
                        period = (cert['expiry_date'] - cert['issued_date']).days
                        if period > 0:  # Only include valid periods
                            validity_periods.append(period)
                    except (TypeError, AttributeError):
                        continue
            
            avg_validity = float(np.mean(validity_periods)) if validity_periods else 0.0
            
            # Fetch supplier info for additional features
            supplier = await self.db.users.find_one({'_id': supplier_id})
            
            # Calculate financial health score (placeholder - integrate with financial data)
            financial_health = self._calculate_financial_health(supplier)
            
            # Calculate geographic risk (placeholder - integrate with geo data)
            geo_risk = self._calculate_geographic_risk(supplier)
            
            # Calculate years in business
            years_in_business = self._calculate_years_in_business(supplier)
            
            # Calculate audit pass rate (placeholder - integrate with audit data)
            audit_pass_rate = await self._calculate_audit_pass_rate(supplier_id)
            
            # Compile all features
            features = {
                'days_to_nearest_expiry': float(max(0, days_to_expiry)),
                'total_certificates': float(total_certs),
                'expired_count': float(expired),
                'expiring_soon_count': float(expiring_soon),
                'valid_count': float(valid),
                'audit_pass_rate': float(audit_pass_rate),
                'avg_certificate_validity_days': float(avg_validity),
                'financial_health_score': float(financial_health),
                'geographic_risk_score': float(geo_risk),
                'years_in_business': float(years_in_business)
            }
            
            return features
            
        except Exception as e:
            logger.error(f"Error calculating supplier features: {str(e)}")
            raise

    async def calculate_risk(self, supplier_id: str) -> Dict[str, Any]:
        """
        Calculate comprehensive risk assessment for a supplier
        
        Args:
            supplier_id: The ID of the supplier to calculate risk for
            
        Returns:
            Dictionary containing risk score, level, drivers, and recommendations
        """
        try:
            # Calculate all features
            features = await self.calculate_supplier_features(supplier_id)
            
            # Get ML-based risk score and top drivers
            risk_score, top_drivers = self.ml.predict_risk(features)
            
            # Map features to user-friendly descriptions
            driver_descriptions = {
                'days_to_nearest_expiry': 
                    f"Certificate expires in {int(features['days_to_nearest_expiry'])} days",
                'expired_count': 
                    f"{int(features['expired_count'])} expired certificates",
                'expiring_soon_count': 
                    f"{int(features['expiring_soon_count'])} certificates expiring soon",
                'audit_pass_rate': 
                    f"Audit pass rate: {features['audit_pass_rate']*100:.0f}%",
                'financial_health_score': 
                    f"Financial health score: {features['financial_health_score']:.0f}",
                'geographic_risk_score':
                    f"Geographic risk score: {features['geographic_risk_score']:.0f}",
                'years_in_business':
                    f"Years in business: {int(features['years_in_business'])}"
            }
            
            # Format top drivers with additional context
            formatted_drivers = []
            for i, driver in enumerate(top_drivers):
                formatted_drivers.append({
                    'rank': i + 1,
                    'factor': self._format_feature_name(driver['feature']),
                    'weight': float(driver['weight']),
                    'description': driver_descriptions.get(driver['feature'], driver['feature']),
                    'impact': 'high' if driver['weight'] > 0.4 else 'medium' if driver['weight'] > 0.2 else 'low',
                    'action': self._get_action_for_driver(driver['feature']),
                    'action_url': self._get_action_url(driver['feature'])
                })
            
            # Calculate risk level
            risk_level = self._calculate_risk_level(risk_score)
            
            # Get historical trend
            history = await self.get_risk_history(supplier_id, days=30)
            trend, change = self._calculate_trend(history, risk_score)
            
            # Calculate sub-scores
            sub_scores = {
                'certificate_health': self._calculate_cert_health(features),
                'audit_performance': int(features['audit_pass_rate'] * 100),
                'financial_stability': features['financial_health_score'],
                'regulatory_compliance': self._calculate_regulatory_compliance(supplier_id)
            }
            
            # Compile result
            result = {
                'risk_score': round(risk_score, 1),
                'risk_level': risk_level,
                'last_updated': datetime.utcnow().isoformat(),
                'drivers': formatted_drivers,
                'sub_scores': sub_scores,
                'trend': trend,
                'change_from_last_month': round(change, 1) if change is not None else 0.0,
                'industry_benchmark': 52.0,  # Placeholder - should come from industry data
                'features': features  # Include raw features for debugging
            }
            
            # Save the result
            await self._save_risk_assessment(supplier_id, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error calculating risk for supplier {supplier_id}: {str(e)}")
            raise

    async def get_risk_history(self, supplier_id: str, days: int = 180) -> List[Dict]:
        """
        Get historical risk scores for a supplier
        
        Args:
            supplier_id: The ID of the supplier
            days: Number of days of history to retrieve
            
        Returns:
            List of historical risk scores with timestamps
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            history = await self.db.risk_scores.find({
                'supplier_id': supplier_id,
                'last_updated': {'$gte': cutoff_date}
            }).sort('last_updated', 1).to_list(None)
            
            return [{
                'date': h['last_updated'],
                'risk_score': h['risk_score']
            } for h in history]
            
        except Exception as e:
            logger.error(f"Error fetching risk history for supplier {supplier_id}: {str(e)}")
            return []

    async def _save_risk_assessment(self, supplier_id: str, assessment: Dict) -> None:
        """Save risk assessment to the database"""
        try:
            await self.db.risk_scores.insert_one({
                'supplier_id': supplier_id,
                **assessment,
                'created_at': datetime.utcnow()
            })
        except Exception as e:
            logger.error(f"Error saving risk assessment: {str(e)}")

    def _calculate_risk_level(self, score: float) -> str:
        """Convert numeric risk score to level"""
        if score < 30:
            return 'low'
        elif score < 60:
            return 'medium'
        else:
            return 'high'

    def _calculate_trend(self, history: List[Dict], current_score: float) -> Tuple[str, Optional[float]]:
        """Calculate trend based on historical data"""
        if len(history) < 2:
            return 'stable', 0.0
        
        # Get the score from 30 days ago (or closest available)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        past_scores = [h for h in history if h['date'] <= thirty_days_ago]
        
        if not past_scores:
            return 'stable', 0.0
            
        past_score = past_scores[-1]['risk_score']
        change = current_score - past_score
        
        if abs(change) < 5:
            return 'stable', change
        elif change > 0:
            return 'increasing', change
        else:
            return 'decreasing', abs(change)

    def _calculate_cert_health(self, features: Dict) -> int:
        """Calculate certificate health sub-score"""
        if features['total_certificates'] == 0:
            return 0
        valid_ratio = features['valid_count'] / features['total_certificates']
        return int(valid_ratio * 100)

    async def _calculate_audit_pass_rate(self, supplier_id: str) -> float:
        """Calculate audit pass rate (placeholder - implement actual audit data integration)"""
        return 0.85  # Default value, replace with actual calculation

    def _calculate_financial_health(self, supplier: Dict) -> float:
        """Calculate financial health score (placeholder - integrate with financial data)"""
        return 70.0  # Default value, replace with actual calculation

    def _calculate_geographic_risk(self, supplier: Dict) -> float:
        """Calculate geographic risk score (placeholder - integrate with geo data)"""
        high_risk_locations = ['mumbai', 'delhi', 'shanghai']
        city = supplier.get('city', '').lower()
        return 75.0 if city in high_risk_locations else 40.0

    def _calculate_years_in_business(self, supplier: Dict) -> int:
        """Calculate years in business"""
        if 'created_at' in supplier and isinstance(supplier['created_at'], datetime):
            return (datetime.utcnow() - supplier['created_at']).days // 365
        return 5  # Default value

    async def _calculate_regulatory_compliance(self, supplier_id: str) -> int:
        """Calculate regulatory compliance score (placeholder)"""
        return 88  # Default value, replace with actual calculation

    def _format_feature_name(self, feature: str) -> str:
        """Convert feature name to human-readable format"""
        return feature.replace('_', ' ').title()

    def _get_action_for_driver(self, feature: str) -> str:
        """Get recommended action for a risk driver"""
        actions = {
            'days_to_nearest_expiry': 'Renew certificate immediately',
            'expired_count': 'Replace expired certificates',
            'expiring_soon_count': 'Renew expiring certificates',
            'audit_pass_rate': 'Schedule audit preparation',
            'financial_health_score': 'Update financial information',
            'geographic_risk_score': 'Review geographic risk factors',
            'years_in_business': 'Provide business history documentation'
        }
        return actions.get(feature, 'Review and improve')

    def _get_action_url(self, feature: str) -> str:
        """Get URL for taking action on a risk driver"""
        urls = {
            'days_to_nearest_expiry': '/dashboard/certificates/upload',
            'expired_count': '/dashboard/certificates',
            'expiring_soon_count': '/dashboard/certificates',
            'audit_pass_rate': '/dashboard/compliance',
            'financial_health_score': '/dashboard/profile',
            'geographic_risk_score': '/dashboard/settings',
            'years_in_business': '/dashboard/profile'
        }
        return urls.get(feature, '/dashboard')
