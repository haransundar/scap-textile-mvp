"""
Authentication routes for user registration and login
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from typing import Optional

from utils.config import settings
from database.mongodb import get_database

# Create router
router = APIRouter()

# Security
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Models
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    company_name: Optional[str] = None
    role: str = "supplier"  # Default role

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    email: str
    role: str

# Helper functions
def truncate_password_bytes(password: str) -> bytes:
    """Truncate password to 72 bytes for bcrypt compatibility"""
    if not password:
        return b""
    
    password_bytes = password.encode('utf-8')
    if len(password_bytes) <= 72:
        return password_bytes
    
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

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    try:
        # Truncate password to 72 bytes for bcrypt
        password_bytes = truncate_password_bytes(plain_password)
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hash password using bcrypt"""
    try:
        # Truncate password to 72 bytes for bcrypt
        password_bytes = truncate_password_bytes(password)
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    except Exception as e:
        print(f"Password hashing error: {e}")
        raise HTTPException(status_code=500, detail=f"Password hashing failed: {str(e)}")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

# Routes
@router.post("/register", response_model=Token)
async def register_user(user: UserCreate):
    """Register a new user"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=500, detail="Database not connected")
        
        users_collection = db.users
        
        # Check if email already exists
        existing_email = await users_collection.find_one({"email": user.email})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        hashed_password = get_password_hash(user.password)
        user_data = user.dict()
        user_data["password"] = hashed_password
        user_data["created_at"] = datetime.utcnow()
        
        result = await users_collection.insert_one(user_data)
        user_id = str(result.inserted_id)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.email, "id": user_id, "role": user.role}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user_id,
            "email": user.email,
            "role": user.role
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=Token)
async def login_for_access_token(login_data: UserLogin):
    """Login and get access token"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=500, detail="Database not connected")
        
        users_collection = db.users
        
        # Find user by email
        user = await users_collection.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not verify_password(login_data.password, user["password"]):
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user["email"], "id": str(user["_id"]), "role": user["role"]}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": str(user["_id"]),
            "email": user["email"],
            "role": user["role"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/me")
async def read_users_me(token: str = Depends(oauth2_scheme)):
    """Get current user info"""
    print(f"[AUTH] /me endpoint called with token: {token[:20]}...")
    
    try:
        # Decode the token
        print("[AUTH] Decoding token...")
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        print(f"[AUTH] Token payload: {payload}")
        
        email = payload.get("sub")
        if not email:
            print("[AUTH] No email in token payload")
            raise HTTPException(
                status_code=401, 
                detail="Invalid authentication credentials: No email in token"
            )
            
    except JWTError as e:
        print(f"[AUTH] JWT Error: {str(e)}")
        raise HTTPException(
            status_code=401, 
            detail=f"Invalid authentication token: {str(e)}"
        )
    
    try:
        print(f"[AUTH] Getting database connection...")
        db = get_database()
        if not db:
            print("[AUTH] Database connection failed")
            raise HTTPException(
                status_code=500, 
                detail="Database connection failed"
            )
        
        print(f"[AUTH] Querying user with email: {email}")
        users_collection = db.users
        user = await users_collection.find_one({"email": email})
        
        if not user:
            print(f"[AUTH] User not found with email: {email}")
            raise HTTPException(
                status_code=404, 
                detail=f"User with email {email} not found"
            )
        
        # Convert ObjectId to string for JSON serialization
        user["_id"] = str(user["_id"])
        
        # Remove sensitive data
        user.pop("password", None)
        
        print(f"[AUTH] Successfully retrieved user: {user.get('email')}")
        return user
        
    except Exception as e:
        print(f"[AUTH] Error in /me endpoint: {str(e)}")
        if not isinstance(e, HTTPException):
            raise HTTPException(
                status_code=500, 
                detail=f"An error occurred while fetching user data: {str(e)}"
            )
        raise