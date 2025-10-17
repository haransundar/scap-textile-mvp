"""
Input validation utilities
"""
import re
from datetime import datetime
from typing import Optional


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """Validate Indian phone number format"""
    pattern = r'^[6-9]\d{9}$'
    return bool(re.match(pattern, phone.replace('+91', '').replace('-', '').replace(' ', '')))


def validate_certificate_number(cert_number: str) -> bool:
    """Validate certificate number format (alphanumeric with hyphens)"""
    pattern = r'^[A-Z0-9\-]{5,30}$'
    return bool(re.match(pattern, cert_number.upper()))


def validate_date_format(date_str: str) -> Optional[datetime]:
    """Parse and validate date string"""
    formats = ['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%Y/%m/%d']
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None


def validate_file_extension(filename: str, allowed_extensions: list) -> bool:
    """Check if file has allowed extension"""
    return any(filename.lower().endswith(ext) for ext in allowed_extensions)


def sanitize_filename(filename: str) -> str:
    """Remove unsafe characters from filename"""
    return re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
