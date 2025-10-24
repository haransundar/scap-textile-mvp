# 🚀 Quick Start: New AI Models

## What's New?

We just added **5 new AI models** to SCAP:

1. **Whisper AI** - Voice input (speech-to-text)
2. **DeepSeek-R1** - Complex reasoning
3. **Gemma 3 9B** - Fallback chatbot
4. **XGBoost** - Risk prediction
5. **Google text-embedding-004** - Better embeddings

---

## ⚡ Quick Installation (5 minutes)

### Step 1: Install Dependencies
```cmd
cd backend
.venv\Scripts\activate
pip install openai-whisper ffmpeg-python
```

### Step 2: Install FFmpeg
**Option A - Chocolatey (Recommended)**:
```cmd
choco install ffmpeg
```

**Option B - Manual**:
1. Download from: https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to PATH

**Verify**:
```cmd
ffmpeg -version
```

### Step 3: Restart Backend
```cmd
cd backend
python main.py
```

---

## 🧪 Quick Tests

### Test Voice Input
```bash
# Check status
curl http://localhost:8000/api/voice/status

# Upload audio (use Postman or frontend)
POST http://localhost:8000/api/voice/transcribe
```

### Test Complex Reasoning
```bash
curl -X POST http://localhost:8000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analyze EUDR impact on cotton supply chains",
    "use_reasoning": true
  }'
```

### Test Risk Prediction
```bash
curl -X POST http://localhost:8000/api/risk/calculate/SUPPLIER_ID
```

---

## 📊 Model Status

| Model | Status | Endpoint |
|-------|--------|----------|
| Whisper | ✅ Ready | /api/voice/transcribe |
| DeepSeek | ✅ Ready | /api/chat/message |
| Gemma | ✅ Ready | /api/chat/message |
| XGBoost | ✅ Ready | /api/risk/calculate |
| Google Embeddings | ✅ Ready | Automatic |

---

## 🎯 What Can You Do Now?

### 1. Voice Input
Users can now speak instead of typing:
- Upload audio files (mp3, wav, m4a)
- Auto-detect language (EN/HI/TA)
- Get text transcription

### 2. Complex Analysis
Ask complex compliance questions:
- Regulatory impact analysis
- Multi-factor risk assessment
- Step-by-step reasoning

### 3. High Availability
Automatic fallback if primary model fails:
- Qwen → DeepSeek → Gemma
- No downtime for users

### 4. Risk Scoring
Automated supplier risk assessment:
- 0-100 risk score
- Risk level (Low/Medium/High)
- Actionable recommendations

### 5. Better Search
Improved semantic search with Google embeddings:
- More accurate context retrieval
- Better chatbot responses

---

## 🔑 API Keys Needed

Make sure these are in your `.env`:
```env
GOOGLE_AI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
```

---

## 📚 Full Documentation

See `ALL_MODELS_CONFIGURED.md` for complete details.

---

## ❓ Troubleshooting

### Whisper not working?
- Install FFmpeg: `choco install ffmpeg`
- Verify: `ffmpeg -version`

### DeepSeek not responding?
- Check Groq API key
- Will auto-fallback to Gemma

### Google embeddings failing?
- Check Google AI API key
- Will auto-fallback to default embeddings

---

**Ready to test? Start the backend and try the new features!** 🚀
