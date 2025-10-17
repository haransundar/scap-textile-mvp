"""
Supplier management endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel

from models.supplier import SupplierCreate, SupplierResponse, SupplierUpdate
from database.mongodb import get_database
from api.middleware.auth import hash_password, create_access_token, get_current_user, verify_password
import logging

# Login model
class SupplierLogin(BaseModel):
    email: str
    password: str

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/login", response_model=dict)
async def login_supplier(login_data: SupplierLogin):
    """Login supplier and return access token"""
    db = get_database()
    
    # Find supplier by email
    supplier = await db.suppliers.find_one({"email": login_data.email})
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, supplier["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    token = create_access_token({
        "sub": str(supplier["_id"]),
        "email": supplier["email"]
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "supplier_id": str(supplier["_id"])
    }


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_supplier(supplier: SupplierCreate):
    """Register new supplier"""
    db = get_database()
    
    # Check if email already exists
    existing = await db.suppliers.find_one({"email": supplier.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = hash_password(supplier.password)
    
    # Create supplier document
    supplier_dict = supplier.model_dump(exclude={"password"})
    supplier_dict.update({
        "password_hash": hashed_password,
        "risk_score": 50.0,
        "risk_drivers": [],
        "connected_brands": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    result = await db.suppliers.insert_one(supplier_dict)
    
    # Create JWT token
    token = create_access_token({
        "sub": str(result.inserted_id),
        "email": supplier.email
    })
    
    logger.info(f"✅ Registered supplier: {supplier.email}")
    
    return {
        "message": "Supplier registered successfully",
        "supplier_id": str(result.inserted_id),
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/login")
async def login_supplier(email: str, password: str):
    """Login supplier"""
    from api.middleware.auth import verify_password
    
    db = get_database()
    supplier = await db.suppliers.find_one({"email": email})
    
    if not supplier or not verify_password(password, supplier.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token({
        "sub": str(supplier["_id"]),
        "email": supplier["email"]
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "supplier_id": str(supplier["_id"])
    }


@router.get("/me", response_model=SupplierResponse)
async def get_current_supplier(current_user: dict = Depends(get_current_user)):
    """Get current supplier profile"""
    db = get_database()
    supplier = await db.suppliers.find_one({"_id": ObjectId(current_user["user_id"])})
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    supplier["_id"] = str(supplier["_id"])
    return supplier


@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(supplier_id: str):
    """Get supplier by ID"""
    db = get_database()
    
    try:
        supplier = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid supplier ID")
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    supplier["_id"] = str(supplier["_id"])
    return supplier


@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: str,
    update_data: SupplierUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update supplier profile"""
    db = get_database()
    
    # Verify ownership
    if current_user["user_id"] != supplier_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.suppliers.update_one(
        {"_id": ObjectId(supplier_id)},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    supplier = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
    supplier["_id"] = str(supplier["_id"])
    
    logger.info(f"✅ Updated supplier: {supplier_id}")
    return supplier


@router.get("/", response_model=List[SupplierResponse])
async def list_suppliers(skip: int = 0, limit: int = 50):
    """List all suppliers (for brands)"""
    db = get_database()
    
    cursor = db.suppliers.find().skip(skip).limit(limit)
    suppliers = await cursor.to_list(length=limit)
    
    for supplier in suppliers:
        supplier["_id"] = str(supplier["_id"])
    
    return suppliers
