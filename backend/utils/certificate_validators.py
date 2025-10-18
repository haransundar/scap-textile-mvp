"""
Certificate validation utilities for the SCAP platform
"""
import re
from datetime import datetime, date
from typing import Dict, Any, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class CertificateValidator:
    """Utility class for validating certificate data"""
    
    # Common certificate number patterns
    CERTIFICATE_PATTERNS = {
        'ISO 9001': r'^(ISO[\s-]?)?9001[\s-]?\d{4,8}$',
        'ISO 14001': r'^(ISO[\s-]?)?14001[\s-]?\d{4,8}$',
        'GOTS': r'^GOTS-\d{2}-[A-Z0-9]{6,10}$',
        'OEKO-TEX': r'^OEKO-TEX-\d{2}-[A-Z0-9]{8,12}$',
        'SA8000': r'^SA8000-\d{4}-[A-Z]{2}-\d{4,6}$',
        'BSCI': r'^BSCI-\d{2}-[A-Z0-9]{8}$',
        'Fair Trade': r'^FT-\d{4}-[A-Z0-9]{6}$',
    }
    
    @classmethod
    def validate_certificate_number(cls, cert_type: str, cert_number: str) -> bool:
        """Validate a certificate number against known patterns
        
        Args:
            cert_type: Type of certificate (e.g., 'ISO 9001', 'GOTS')
            cert_number: Certificate number to validate
            
        Returns:
            bool: True if the certificate number is valid, False otherwise
        """
        if not cert_number or not cert_type:
            return False
            
        pattern = cls.CERTIFICATE_PATTERNS.get(cert_type.upper())
        if not pattern:
            # If no specific pattern is defined, do a basic check
            return len(cert_number.strip()) >= 5
            
        return bool(re.match(pattern, cert_number.strip(), re.IGNORECASE))
    
    @classmethod
    def validate_dates(
        cls, 
        issued_date: Optional[date], 
        expiry_date: Optional[date]
    ) -> Tuple[bool, str]:
        """Validate certificate dates
        
        Args:
            issued_date: Date when the certificate was issued
            expiry_date: Date when the certificate expires
            
        Returns:
            Tuple[bool, str]: (is_valid, error_message)
        """
        today = date.today()
        
        if not issued_date and not expiry_date:
            return True, ""
            
        if issued_date and not isinstance(issued_date, date):
            return False, "Issued date must be a valid date"
            
        if expiry_date and not isinstance(expiry_date, date):
            return False, "Expiry date must be a valid date"
            
        if issued_date and expiry_date and issued_date > expiry_date:
            return False, "Issued date cannot be after expiry date"
            
        if expiry_date and expiry_date < today:
            return True, "Certificate has expired"
            
        return True, ""
    
    @classmethod
    def validate_certificate_data(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate certificate data
        
        Args:
            data: Dictionary containing certificate data
            
        Returns:
            Dict with validation results and error messages
        """
        errors = {}
        warnings = []
        
        # Validate required fields
        required_fields = [
            'certificate_type', 'certificate_number', 
            'issued_by', 'issued_to', 'expiry_date'
        ]
        
        for field in required_fields:
            if not data.get(field):
                errors[field] = f"{field.replace('_', ' ').title()} is required"
        
        # Validate certificate number format if type is known
        cert_type = data.get('certificate_type')
        cert_number = data.get('certificate_number')
        
        if cert_type and cert_number and cert_type in cls.CERTIFICATE_PATTERNS:
            if not cls.validate_certificate_number(cert_type, cert_number):
                warnings.append(
                    f"Certificate number format doesn't match expected pattern for {cert_type}"
                )
        
        # Validate dates
        issued_date = data.get('issued_date')
        expiry_date = data.get('expiry_date')
        
        if issued_date or expiry_date:
            try:
                if isinstance(issued_date, str):
                    issued_date = date.fromisoformat(issued_date)
                if isinstance(expiry_date, str):
                    expiry_date = date.fromisoformat(expiry_date)
                    
                is_valid, date_error = cls.validate_dates(issued_date, expiry_date)
                if not is_valid and date_error:
                    errors['dates'] = date_error
                elif date_error:  # Warning about expired certificate
                    warnings.append(date_error)
                    
            except (ValueError, TypeError) as e:
                errors['dates'] = f"Invalid date format: {str(e)}"
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }


def validate_file_extension(filename: str, allowed_extensions: list) -> bool:
    """Check if the file has an allowed extension
    
    Args:
        filename: Name of the file to check
        allowed_extensions: List of allowed file extensions (e.g., ['.jpg', '.pdf'])
        
    Returns:
        bool: True if the file extension is allowed, False otherwise
    """
    if not filename:
        return False
    return any(filename.lower().endswith(ext.lower()) for ext in allowed_extensions)


def sanitize_filename(filename: str) -> str:
    """Sanitize a filename to remove potentially dangerous characters
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename with only alphanumeric, dots, underscores, and hyphens
    """
    if not filename:
        return ""
    
    # Keep only valid characters
    filename = re.sub(r'[^\w\-_. ]', '', filename)
    
    # Replace spaces with underscores
    filename = filename.replace(' ', '_')
    
    # Ensure the filename isn't empty after sanitization
    if not filename:
        filename = f"file_{int(datetime.utcnow().timestamp())}"
    
    return filename


def validate_date_format(date_str: str, format: str = "%Y-%m-%d") -> bool:
    """Validate if a date string matches the expected format
    
    Args:
        date_str: Date string to validate
        format: Expected date format (default: YYYY-MM-DD)
        
    Returns:
        bool: True if the date string matches the format, False otherwise
    """
    if not date_str:
        return False
        
    try:
        datetime.strptime(date_str, format)
        return True
    except (ValueError, TypeError):
        return False
