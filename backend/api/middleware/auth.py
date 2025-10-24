"""
JWT authentication middleware
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
import bcrypt
from utils.config import settings
import logging

logger = logging.getLogger(__name__)

# JWT bearer scheme
security = HTTPBearer()


def truncate_password(password: str) -> bytes:
    """Truncate password to 72 bytes for bcrypt compatibility"""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Truncate to 72 bytes, ensuring we don't cut in the middle of a multi-byte character
        truncated = password_bytes[:72]
        # Try to decode, if it fails, keep removing bytes until it works
        while len(truncated) > 0:
            try:
                truncated.decode('utf-8')
                return truncated
            except UnicodeDecodeError:
                truncated = truncated[:-1]
        return b""
    return password_bytes


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    # Truncate password to 72 bytes for bcrypt
    password_bytes = truncate_password(password)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    # Truncate password to 72 bytes for bcrypt
    password_bytes = truncate_password(plain_password)
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """Decode and verify JWT token"""
    try:
        if not token:
            raise JWTError("Empty token provided")
            
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={
                "require": ["exp", "sub"],  # Require expiration and subject
                "verify_exp": True,          # Verify expiration
                "verify_aud": False,         # Disable audience verification
                "verify_iss": False,         # Disable issuer verification
            }
        )
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTClaimsError as e:
        logger.warning(f"Token claims error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims"
        )
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        logger.error(f"Unexpected error decoding token: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing authentication"
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated user from JWT token"""
    try:
        if not credentials or not credentials.credentials:
            logger.warning("No credentials provided")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No authentication token provided"
            )
            
        token = credentials.credentials
        if not token:
            logger.warning("Empty token provided")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No authentication token provided"
            )
            
        payload = decode_access_token(token)
        user_id = payload.get("id")  # Use 'id' field which contains the MongoDB ObjectId
        email = payload.get("sub")   # 'sub' contains the email
        
        if not user_id:
            logger.warning("No user ID in token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
            
        # Check if token is about to expire soon (in 5 minutes)
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > (exp - 300):  # 5 minutes buffer
            logger.info(f"Token for user {user_id} is about to expire")
            # You might want to implement token refresh logic here
            
        return {
            "user_id": user_id,  # MongoDB ObjectId
            "email": email,      # User email
            "token": token       # Return the token for potential reuse
        }
        
    except HTTPException as http_exc:
        # Re-raise HTTP exceptions
        raise http_exc
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during authentication"
        )
