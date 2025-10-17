# SCAP System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Supplier   │  │    Brand     │  │   Mobile     │          │
│  │  Dashboard   │  │  Dashboard   │  │     App      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Routes                             │  │
│  │  /suppliers  /documents  /compliance  /risk  /chat       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Services Layer                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │  │
│  │  │   OCR    │  │Document  │  │   LLM    │  │  Risk   │ │  │
│  │  │ Service  │  │   AI     │  │ Service  │  │Predictor│ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   MongoDB    │  │   ChromaDB   │  │ File Storage │          │
│  │  (Primary)   │  │   (Vector)   │  │  (Uploads)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL AI SERVICES                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   EasyOCR    │  │    Gemini    │  │     Qwen     │          │
│  │   (Local)    │  │ 2.5 Flash    │  │  2.5 32B     │          │
│  │              │  │  (Google)    │  │   (Groq)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Certificate Upload

```
1. Supplier uploads photo
        │
        ▼
2. Frontend sends to /api/documents/upload
        │
        ▼
3. Backend saves file to disk
        │
        ▼
4. EasyOCR extracts text (3-4s)
   ┌─────────────────────┐
   │ "GOTS Certificate   │
   │ Number: GOTS-2024   │
   │ Issued: 2024-01-15  │
   │ Expires: 2025-01-15"│
   └─────────────────────┘
        │
        ▼
5. Gemini structures data (1s)
   ┌─────────────────────┐
   │ {                   │
   │   type: "GOTS",     │
   │   number: "...",    │
   │   issued_date: "...",│
   │   expiry_date: "..." │
   │ }                   │
   └─────────────────────┘
        │
        ▼
6. Store in MongoDB + ChromaDB
        │
        ▼
7. Return structured data to frontend
```

## Data Flow: AI Chatbot

```
1. User asks: "When does my GOTS certificate expire?"
        │
        ▼
2. Translate to English (if Tamil/Hindi)
        │
        ▼
3. Convert query to embedding (text-embedding-004)
        │
        ▼
4. Search ChromaDB for relevant documents
   ┌─────────────────────────────────┐
   │ Top 3 similar documents:        │
   │ - GOTS cert expires 2025-01-15  │
   │ - ISO cert expires 2025-06-20   │
   │ - OEKO cert expires 2025-03-10  │
   └─────────────────────────────────┘
        │
        ▼
5. Send context + query to Qwen 2.5 32B
        │
        ▼
6. Generate response (0.5-1s)
   "Your GOTS certificate expires on January 15, 2025"
        │
        ▼
7. Translate back to original language
        │
        ▼
8. Stream response to frontend
```

## Database Schema

### MongoDB Collections

```
suppliers
├── _id: ObjectId
├── name: String
├── tier: Number (2-4)
├── email: String (unique)
├── password_hash: String
├── address: Object
├── language_preference: String (en/ta/hi)
├── industry_type: String
├── risk_score: Number (0-100)
└── certificates: Array (embedded)

certificates
├── _id: ObjectId
├── supplier_id: String (ref)
├── type: String (GOTS/ISO/etc)
├── number: String
├── issued_date: Date
├── expiry_date: Date
├── file_path: String
├── verification_status: String
└── ocr_confidence: Number

regulatory_updates
├── _id: ObjectId
├── regulation_title: String
├── jurisdiction: String (EU/India)
├── effective_date: Date
├── penalty: String
├── affected_sectors: Array
├── banned_chemicals: Array
└── affected_suppliers: Array

risk_scores
├── _id: ObjectId
├── supplier_id: String (ref)
├── score: Number (0-100)
├── risk_drivers: Array
├── features: Object
└── calculated_at: Date

chat_history
├── _id: ObjectId
├── supplier_id: String (ref)
└── messages: Array
    ├── role: String (user/assistant)
    ├── content: String
    ├── timestamp: Date
    └── language: String
```

### ChromaDB Collections

```
supplier_documents
├── id: String (certificate_id)
├── document: String (full text)
├── embedding: Vector (768 dimensions)
└── metadata: Object
    ├── supplier_id: String
    ├── cert_type: String
    └── cert_number: String
```

## API Endpoints Summary

### Authentication
- `POST /api/suppliers/register` - Register new supplier
- `POST /api/suppliers/login` - Login and get JWT token

### Supplier Management
- `GET /api/suppliers/me` - Get current supplier profile
- `PUT /api/suppliers/{id}` - Update supplier profile
- `GET /api/suppliers` - List all suppliers (brands)

### Document Processing
- `POST /api/documents/upload` - Upload certificate (OCR + AI)
- `GET /api/documents/supplier/{id}` - Get supplier certificates
- `PUT /api/documents/{id}/verify` - Verify certificate (brands)

### Compliance
- `GET /api/compliance/regulations` - List regulations
- `GET /api/compliance/alerts/{id}` - Get supplier alerts

### Risk Management
- `GET /api/risk/score/{id}` - Get risk score
- `POST /api/risk/calculate/{id}` - Calculate risk score
- `GET /api/risk/history/{id}` - Get risk history

### AI Chatbot
- `POST /api/chat/message` - Send message (with RAG)
- `GET /api/chat/history/{id}` - Get chat history

## Technology Stack

### Backend
```
FastAPI 0.115.0          → Web framework
Motor 3.6.0              → Async MongoDB driver
ChromaDB 0.5.5           → Vector database
EasyOCR 1.7.2            → Multilingual OCR
google-generativeai 0.8.0 → Gemini API
groq 0.11.0              → Qwen API
XGBoost 2.1.1            → Risk prediction
Pydantic 2.9.0           → Data validation
```

### AI Models
```
EasyOCR (Local)          → Text extraction
  - craft_mlt_25k.pth    → Text detection
  - latin_g2.pth         → English recognition
  - tamil_g2.pth         → Tamil recognition
  - devanagari_g2.pth    → Hindi recognition

Gemini 2.5 Flash (API)   → Document structuring, translation
Qwen 2.5 32B (API)       → Chatbot conversations
text-embedding-004 (API) → Document embeddings
```

### Database
```
MongoDB 7.0+             → Primary database
ChromaDB                 → Vector storage for RAG
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│           Security Layers               │
├─────────────────────────────────────────┤
│ 1. HTTPS/TLS                            │
│    └─ All traffic encrypted             │
├─────────────────────────────────────────┤
│ 2. JWT Authentication                   │
│    └─ Bearer token in headers           │
├─────────────────────────────────────────┤
│ 3. Password Hashing                     │
│    └─ bcrypt with salt                  │
├─────────────────────────────────────────┤
│ 4. Input Validation                     │
│    └─ Pydantic models                   │
├─────────────────────────────────────────┤
│ 5. CORS Configuration                   │
│    └─ Whitelist origins                 │
├─────────────────────────────────────────┤
│ 6. Rate Limiting                        │
│    └─ Per-endpoint limits               │
├─────────────────────────────────────────┤
│ 7. File Upload Validation              │
│    └─ Type, size, content checks        │
└─────────────────────────────────────────┘
```

## Scalability Strategy

### Horizontal Scaling
```
Load Balancer
    │
    ├─── Backend Instance 1
    ├─── Backend Instance 2
    └─── Backend Instance 3
         │
         └─── MongoDB Cluster
              ├─── Primary
              ├─── Secondary 1
              └─── Secondary 2
```

### Caching Strategy
```
Request → Cache Check → Cache Hit? → Return
              │              │
              │              └─ No → Process → Store in Cache → Return
              │
              └─ Redis Cache
                 ├─ API responses (5 min TTL)
                 ├─ Risk scores (1 hour TTL)
                 └─ Regulations (24 hour TTL)
```

## Monitoring & Observability

```
Application Metrics
├── Request rate (req/sec)
├── Response time (ms)
├── Error rate (%)
└── Active users

AI Service Metrics
├── OCR processing time
├── Gemini API latency
├── Groq API latency
└── API costs

Database Metrics
├── Query time (ms)
├── Connection pool usage
├── Index efficiency
└── Storage size

Infrastructure Metrics
├── CPU usage (%)
├── Memory usage (%)
├── Disk I/O
└── Network bandwidth
```

## Disaster Recovery

```
Backup Strategy
├── MongoDB
│   ├── Daily automated backups
│   ├── Point-in-time recovery
│   └── 30-day retention
├── File Storage
│   ├── Weekly full backups
│   └── Incremental daily
└── Configuration
    └── Version controlled (Git)

Recovery Time Objectives
├── Database: < 1 hour
├── Application: < 15 minutes
└── Full system: < 2 hours
```

## Performance Optimization

### Database Optimization
- Indexes on frequently queried fields
- Connection pooling (max 100 connections)
- Query result caching
- Aggregation pipeline optimization

### API Optimization
- Response compression (gzip)
- Pagination for list endpoints
- Field selection (sparse fieldsets)
- Async/await for I/O operations

### AI Service Optimization
- Batch processing for OCR
- Response caching (24 hours)
- Fallback models for rate limits
- Request queuing for high load

---

**Architecture Version**: 1.0
**Last Updated**: 2025-10-17
**Status**: Production-Ready Backend
