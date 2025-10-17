"""
Seed database with sample test data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.utils.config import settings
from backend.api.middleware.auth import hash_password


async def seed_data():
    """Create sample suppliers, certificates, and regulations"""
    print("🌱 Seeding database with sample data...")
    
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB_NAME]
    
    # Sample suppliers
    suppliers = [
        {
            "name": "Priya Textiles",
            "tier": 2,
            "contact_person": "Priya Kumar",
            "email": "priya@priyatextiles.com",
            "phone": "9876543210",
            "password_hash": hash_password("password123"),
            "address": {
                "street": "123 Textile Street",
                "city": "Tirupur",
                "state": "Tamil Nadu",
                "country": "India",
                "pincode": "641601"
            },
            "language_preference": "ta",
            "industry_type": "dyeing",
            "employee_count": 150,
            "annual_turnover": 5000000,
            "risk_score": 35.0,
            "risk_drivers": [],
            "connected_brands": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Ramesh Spinners",
            "tier": 3,
            "contact_person": "Ramesh Singh",
            "email": "ramesh@rameshspinners.com",
            "phone": "9876543211",
            "password_hash": hash_password("password123"),
            "address": {
                "street": "456 Cotton Road",
                "city": "Ludhiana",
                "state": "Punjab",
                "country": "India",
                "pincode": "141001"
            },
            "language_preference": "hi",
            "industry_type": "spinning",
            "employee_count": 200,
            "annual_turnover": 8000000,
            "risk_score": 45.0,
            "risk_drivers": [],
            "connected_brands": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Aisha Fabrics",
            "tier": 2,
            "contact_person": "Aisha Patel",
            "email": "aisha@aishafabrics.com",
            "phone": "9876543212",
            "password_hash": hash_password("password123"),
            "address": {
                "street": "789 Weaving Lane",
                "city": "Surat",
                "state": "Gujarat",
                "country": "India",
                "pincode": "395001"
            },
            "language_preference": "en",
            "industry_type": "weaving",
            "employee_count": 120,
            "annual_turnover": 6000000,
            "risk_score": 25.0,
            "risk_drivers": [],
            "connected_brands": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    # Clear existing data
    await db.suppliers.delete_many({})
    await db.certificates.delete_many({})
    await db.regulatory_updates.delete_many({})
    
    # Insert suppliers
    result = await db.suppliers.insert_many(suppliers)
    supplier_ids = [str(id) for id in result.inserted_ids]
    print(f"✅ Created {len(supplier_ids)} suppliers")
    
    # Sample certificates
    certificates = [
        {
            "supplier_id": supplier_ids[0],
            "type": "GOTS",
            "number": "GOTS-2024-001",
            "issued_by": "Control Union",
            "issued_to": "Priya Textiles",
            "issued_date": datetime.utcnow() - timedelta(days=180),
            "expiry_date": datetime.utcnow() + timedelta(days=185),
            "scope": "Organic cotton dyeing and processing",
            "file_path": "../data/uploads/sample_gots.jpg",
            "verification_status": "verified",
            "ocr_confidence": 0.96,
            "created_at": datetime.utcnow()
        },
        {
            "supplier_id": supplier_ids[1],
            "type": "ISO14001",
            "number": "ISO-14001-2023-456",
            "issued_by": "Bureau Veritas",
            "issued_to": "Ramesh Spinners",
            "issued_date": datetime.utcnow() - timedelta(days=90),
            "expiry_date": datetime.utcnow() + timedelta(days=275),
            "scope": "Environmental management system",
            "file_path": "../data/uploads/sample_iso.jpg",
            "verification_status": "verified",
            "ocr_confidence": 0.94,
            "created_at": datetime.utcnow()
        },
        {
            "supplier_id": supplier_ids[2],
            "type": "OEKO-TEX",
            "number": "OEKO-2024-789",
            "issued_by": "OEKO-TEX Association",
            "issued_to": "Aisha Fabrics",
            "issued_date": datetime.utcnow() - timedelta(days=60),
            "expiry_date": datetime.utcnow() + timedelta(days=305),
            "scope": "Textile safety certification",
            "file_path": "../data/uploads/sample_oeko.jpg",
            "verification_status": "pending",
            "ocr_confidence": 0.98,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.certificates.insert_many(certificates)
    print(f"✅ Created {len(certificates)} certificates")
    
    # Sample regulations
    regulations = [
        {
            "regulation_title": "EU Corporate Sustainability Due Diligence Directive (CSDDD)",
            "jurisdiction": "EU",
            "source_url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52022PC0071",
            "article_reference": "Article 5",
            "summary": "Requires companies to identify and address adverse human rights and environmental impacts in their supply chains.",
            "effective_date": datetime(2027, 1, 1),
            "penalty": "Up to 5% of global turnover",
            "affected_sectors": ["dyeing", "spinning", "weaving", "knitting"],
            "banned_chemicals": [],
            "labor_requirements": ["Living wages", "Safe working conditions", "No child labor"],
            "version": "1.0",
            "affected_suppliers": supplier_ids,
            "alert_sent": False,
            "created_at": datetime.utcnow()
        },
        {
            "regulation_title": "BIS Textile Quality Standard Update",
            "jurisdiction": "India",
            "source_url": "https://bis.gov.in/standards/textile",
            "article_reference": "IS 15797:2024",
            "summary": "Updated quality standards for textile products including azo dye restrictions.",
            "effective_date": datetime.utcnow() + timedelta(days=60),
            "penalty": "Product recall and fines",
            "affected_sectors": ["dyeing"],
            "banned_chemicals": [
                {"name": "Azo dyes", "cas_number": "Various"}
            ],
            "labor_requirements": [],
            "version": "1.0",
            "affected_suppliers": [supplier_ids[0]],
            "alert_sent": False,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.regulatory_updates.insert_many(regulations)
    print(f"✅ Created {len(regulations)} regulations")
    
    client.close()
    print("\n✅ Database seeded successfully!")
    print("\nTest credentials:")
    print("  Email: priya@priyatextiles.com")
    print("  Email: ramesh@rameshspinners.com")
    print("  Email: aisha@aishafabrics.com")
    print("  Password: password123")


if __name__ == "__main__":
    asyncio.run(seed_data())
