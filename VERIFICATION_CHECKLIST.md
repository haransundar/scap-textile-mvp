# SCAP Backend Verification Checklist

## 🎯 Pre-Frontend Development Audit

This comprehensive checklist ensures all backend components are operational before frontend development.

---

## ✅ PHASE 1: ENVIRONMENT & SETUP

### 1.1 Virtual Environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
python --version  # Should show Python 3.11.x
```

**Expected Output:**
```
Python 3.11.x
```

**Status:** [ ] Pass [ ] Fail

---

### 1.2 Package Installation
```bash
pip install -r requirements.txt
pip list | findstr "fastapi motor easyocr chromadb xgboost"
```

**Expected Packages:**
- ✅ fastapi==0.115.0
- ✅ motor==3.6.0
- ✅ easyocr==1.7.2
- ✅ chromadb==0.5.5
- ✅ xgboost==2.1.1
- ✅ google-generativeai==0.8.0
- ✅ groq==0.11.0

**Status:** [ ] Pass [ ] Fail

---

### 1.3 Environment Variables
```bash
python scripts/verify_env.py
```

**Expected Output:**
```
✅ GOOGLE_AI_API_KEY: Present (40 chars)
✅ GROQ_API_KEY: Present (48 chars)
✅ OPENROUTER_API_KEY: Present (52 chars)
✅ MONGODB_URI: Present (45 chars)
✅ All environment variables configured correctly
```

**Status:** [ ] Pass [ ] Fail

---

### 1.4 Local AI Models
```bash
python scripts/verify_models.py
```

**Expected Output:**
```
✅ EasyOCR directory: ~/.EasyOCR/model
   Found 4 models:
   - craft_mlt_25k.pth (25.4 MB)
   - latin_g2.pth (94.2 MB)
   - tamil_g2.pth (89.7 MB)
   - devanagari_g2.pth (88.3 MB)
✅ All required EasyOCR models present
```

**Status:** [ ] Pass [ ] Fail

---

## ✅ PHASE 2: DATABASE VERIFICATION

### 2.1 MongoDB Connection
```bash
python scripts/test_mongodb.py
```

**Expected Output:**
```
✅ MongoDB connection successful
✅ Database: scap_local
   Collections (6): suppliers, certificates, regulatory_updates, 
                    supply_chain_links, risk_scores, chat_history
✅ All required collections exist

Index Verification:
  suppliers: 3 indexes
    - _id_: ['_id']
    - email_1: ['email']
    - tier_1: ['tier']
```

**Status:** [ ] Pass [ ] Fail

---

### 2.2 Sample Data
```bash
python scripts/seed_data.py
```

**Expected Output:**
```
✅ Created 3 suppliers
✅ Created 3 certificates
✅ Created 2 regulations

Test credentials:
  Email: priya@priyatextiles.com
  Password: password123
```

**Status:** [ ] Pass [ ] Fail

---

## ✅ PHASE 3: AI MODEL INTEGRATION

### 3.1 EasyOCR Test
```python
import easyocr
reader = easyocr.Reader(['en', 'ta', 'hi'], gpu=False)
result = reader.readtext('test_image.png')
print(f"Detected {len(result)} text regions")
```

**Expected:** 
- Initialization: <5 seconds
- OCR processing: <2 seconds per image
- Accuracy: >90%

**Status:** [ ] Pass [ ] Fail

---

### 3.2 Gemini API Test
```python
import google.generativeai as genai
genai.configure(api_key=os.getenv('GOOGLE_AI_API_KEY'))
model = genai.GenerativeModel('gemini-2.0-flash-exp')
response = model.generate_content("Test")
print(response.text)
```

**Expected:**
- Response time: <2 seconds
- Valid JSON output for document structuring

**Status:** [ ] Pass [ ] Fail

---

### 3.3 Groq API Test (Qwen)
```python
from groq import Groq
client = Groq(api_key=os.getenv('GROQ_API_KEY'))
response = client.chat.completions.create(
    model="qwen2-72b-instruct",
    messages=[{"role": "user", "content": "What is GOTS?"}]
)
print(response.choices[0].message.content)
```

**Expected:**
- Response time: <1 second
- Coherent answer about GOTS certification

**Status:** [ ] Pass [ ] Fail

---

### 3.4 ChromaDB Test
```python
import chromadb
client = chromadb.PersistentClient(path="../data/embeddings")
collection = client.get_or_create_collection("test")
collection.add(documents=["Test doc"], ids=["1"])
results = collection.query(query_texts=["Test"], n_results=1)
print(f"Found: {results['documents']}")
```

**Expected:**
- Collection created successfully
- Document added and retrieved

**Status:** [ ] Pass [ ] Fail

---

## ✅ PHASE 4: API ENDPOINT TESTING

### 4.1 Start Backend Server
```bash
cd backend
python main.py
```

**Expected Output:**
```
✅ Connected to MongoDB: scap_local
✅ SCAP Backend running on http://0.0.0.0:8000
📚 API Documentation: http://localhost:8000/docs
```

**Status:** [ ] Pass [ ] Fail

---

### 4.2 Health Check
```bash
curl http://localhost:8000/health
```

**Expected:**
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "development"
}
```

**Status:** [ ] Pass [ ] Fail

---

### 4.3 API Documentation
Open browser: http://localhost:8000/docs

**Expected:**
- Interactive Swagger UI
- 20+ endpoints listed
- All endpoints have descriptions

**Status:** [ ] Pass [ ] Fail

---

### 4.4 Authentication Flow
```bash
# Register
curl -X POST http://localhost:8000/api/suppliers/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test1234","tier":2,"phone":"9876543210"}'

# Login
curl -X POST http://localhost:8000/api/suppliers/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}'
```

**Expected:**
- Register returns 201 with user ID
- Login returns 200 with JWT token

**Status:** [ ] Pass [ ] Fail

---

### 4.5 Document Upload (OCR)
Use Swagger UI at /docs:
1. Login to get token
2. Go to POST /api/documents/upload
3. Upload a certificate image
4. Verify OCR extraction

**Expected:**
- Processing time: <4 seconds
- Structured JSON returned
- OCR confidence: >0.90

**Status:** [ ] Pass [ ] Fail

---

### 4.6 Risk Score Calculation
```bash
curl http://localhost:8000/api/risk/calculate/{supplier_id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
```json
{
  "score": 45.0,
  "risk_drivers": [
    {"factor": "Certificate Expiring Soon", "weight": 0.4}
  ]
}
```

**Status:** [ ] Pass [ ] Fail

---

### 4.7 AI Chatbot
```bash
curl -X POST http://localhost:8000/api/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is GOTS?","language":"en"}'
```

**Expected:**
- Response time: <1 second
- Coherent answer about GOTS

**Status:** [ ] Pass [ ] Fail

---

## ✅ PHASE 5: ERROR HANDLING

### 5.1 Invalid Authentication
```bash
curl http://localhost:8000/api/suppliers/me \
  -H "Authorization: Bearer invalid_token"
```

**Expected:** 401 Unauthorized

**Status:** [ ] Pass [ ] Fail

---

### 5.2 Missing Required Fields
```bash
curl -X POST http://localhost:8000/api/suppliers/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'
```

**Expected:** 422 Validation Error

**Status:** [ ] Pass [ ] Fail

---

### 5.3 Invalid ObjectId
```bash
curl http://localhost:8000/api/suppliers/invalid_id_123
```

**Expected:** 400 Bad Request or 404 Not Found

**Status:** [ ] Pass [ ] Fail

---

## ✅ PHASE 6: PERFORMANCE

### 6.1 Response Time
Run test_api.py and check:
- Average latency: <100ms
- P90 latency: <500ms
- Throughput: >20 req/s

**Status:** [ ] Pass [ ] Fail

---

### 6.2 Concurrent Requests
Test 10 parallel requests:
```python
from concurrent.futures import ThreadPoolExecutor
import requests

def make_request(i):
    return requests.get("http://localhost:8000/health")

with ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(make_request, range(10)))

print(f"Success: {sum(1 for r in results if r.status_code == 200)}/10")
```

**Expected:** All 10 requests succeed in <2 seconds

**Status:** [ ] Pass [ ] Fail

---

## ✅ PHASE 7: SECURITY

### 7.1 Environment Security
- [ ] .env file NOT in Git
- [ ] .gitignore includes .env
- [ ] API keys not hardcoded

**Status:** [ ] Pass [ ] Fail

---

### 7.2 Password Security
Check database:
```python
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017')
db = client['scap_local']
user = db.suppliers.find_one()
print(f"Password hashed: {'password_hash' in user}")
print(f"Plain password: {'password' in user}")
```

**Expected:**
- password_hash exists
- password does NOT exist

**Status:** [ ] Pass [ ] Fail

---

## 🎯 FINAL CHECKLIST

### Critical Components
- [ ] Python 3.11 venv activated
- [ ] All packages installed
- [ ] Environment variables configured
- [ ] MongoDB running and connected
- [ ] EasyOCR models downloaded
- [ ] Gemini API working
- [ ] Groq API working
- [ ] ChromaDB functional

### API Endpoints (20+)
- [ ] /health returns 200
- [ ] POST /api/suppliers/register works
- [ ] POST /api/suppliers/login returns JWT
- [ ] GET /api/suppliers/me works
- [ ] POST /api/documents/upload (OCR)
- [ ] GET /api/risk/score/{id}
- [ ] POST /api/chat/message
- [ ] GET /api/compliance/regulations

### Core Features
- [ ] Certificate OCR: 95%+ accuracy
- [ ] Document structuring: Valid JSON
- [ ] Risk prediction: Scores 0-100
- [ ] Chatbot: Tamil/Hindi translation
- [ ] RAG: Correct retrieval

### Error Handling
- [ ] 401 for invalid auth
- [ ] 422 for validation errors
- [ ] 400/404 for invalid IDs
- [ ] File type validation

### Performance
- [ ] Avg latency <100ms
- [ ] P90 latency <500ms
- [ ] Throughput >20 req/s
- [ ] No memory leaks

### Security
- [ ] .env NOT in Git
- [ ] JWT tokens expire
- [ ] Passwords hashed
- [ ] CORS configured

---

## 🚀 PROCEED TO FRONTEND IF:

✅ All Phase 1-6 tests pass
✅ No critical errors in logs
✅ API /docs shows 20+ endpoints
✅ MongoDB has sample data
✅ EasyOCR accuracy >90%
✅ Gemini structuring works
✅ Chatbot responds correctly
✅ Risk scoring operational

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: MongoDB _id Field Error
```python
# CORRECT:
class SupplierModel(BaseModel):
    id: str = Field(alias="_id")
    
    class Config:
        populate_by_name = True
```

### Issue 2: EasyOCR GPU Error
```python
# Force CPU mode
reader = easyocr.Reader(['en', 'ta', 'hi'], gpu=False)
```

### Issue 3: Gemini JSON Response
```python
# Clean markdown from response
response_text = response.text.strip()
response_text = response_text.replace('```json', '').replace('```', '').strip()
data = json.loads(response_text)
```

### Issue 4: MongoDB Connection Timeout
```python
# Add connection pooling
client = AsyncIOMotorClient(
    MONGODB_URI,
    maxPoolSize=50,
    minPoolSize=10,
    serverSelectionTimeoutMS=5000
)
```

---

## 📊 VERIFICATION SUMMARY

**Date:** _____________
**Tester:** _____________

**Overall Status:** [ ] PASS [ ] FAIL

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Ready for Frontend:** [ ] YES [ ] NO

**Signature:** _____________

---

**Estimated Verification Time:** 2-3 hours for comprehensive testing

**Next Step:** If all tests pass, proceed to frontend development (Next.js + TypeScript)
