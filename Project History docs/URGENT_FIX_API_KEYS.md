# 🚨 URGENT: Fix API Key 401 Errors

## Current Problem
Backend is running but getting **401 "Invalid API Key"** errors for:
- ❌ Groq API
- ❌ OpenRouter API

## Root Cause
**Your API keys are invalid or expired!** The backend is loading them correctly from `.env`, but the API providers are rejecting them.

---

## ✅ SOLUTION: Get Fresh API Keys

### Step 1: Get New Groq API Key (REQUIRED)

1. **Go to:** https://console.groq.com/keys
2. **Sign in** (or create account if needed)
3. **Delete old keys** (if any exist)
4. **Click "Create API Key"**
5. **Copy the new key** (starts with `gsk_`)
6. **Update `.env` file:**
   ```bash
   GROQ_API_KEY=gsk_YOUR_NEW_KEY_HERE
   ```

### Step 2: Get New OpenRouter API Key (OPTIONAL - for fallback)

1. **Go to:** https://openrouter.ai/keys
2. **Sign in** (or create account)
3. **Click "Create Key"**
4. **Copy the key** (starts with `sk-or-v1-`)
5. **Update `.env` file:**
   ```bash
   OPENROUTER_API_KEY=sk-or-v1-YOUR_NEW_KEY_HERE
   ```

### Step 3: Restart Backend

**IMPORTANT:** Stop the backend completely (Ctrl+C) and restart:

```bash
# From project root directory
cd backend
python main.py
```

OR

```bash
# From project root
uvicorn main:app --reload --app-dir backend
```

---

## 🧪 Test Your New Keys

After updating `.env` and restarting backend:

### Test 1: Check if keys are loaded
```bash
python backend/test_env_loading.py
```

### Test 2: Test chat endpoint
1. Open frontend: http://localhost:3000
2. Go to Dashboard → Chatbot
3. Send message: "Hello"
4. Should get response without 401 errors

---

## 🔍 Why Are My Keys Invalid?

Common reasons:
1. **Keys expired** - API keys can expire
2. **Keys revoked** - You may have regenerated keys on the provider dashboard
3. **Wrong account** - Keys from different account
4. **Free tier limits** - Exceeded free tier quota
5. **Keys never activated** - Some providers require email verification

---

## 🎯 Quick Verification Checklist

Before restarting backend:

- [ ] New Groq key starts with `gsk_`
- [ ] New OpenRouter key starts with `sk-or-v1-`
- [ ] Keys are in `.env` file (project root)
- [ ] No spaces around `=` sign
- [ ] No quotes around keys
- [ ] No extra spaces at end of lines

Example correct format:
```bash
GROQ_API_KEY=gsk_abc123xyz789
OPENROUTER_API_KEY=sk-or-v1-abc123xyz789
```

---

## 🆘 Still Getting 401 Errors?

### Option 1: Use Only Google AI (Gemini)
Your Google AI key seems to work. Temporarily disable Groq/OpenRouter:

1. Edit `backend/services/llm_service.py`
2. Comment out Groq initialization
3. Use only Google Gemini for chat

### Option 2: Check API Quotas
- **Groq:** https://console.groq.com/settings/limits
- **OpenRouter:** https://openrouter.ai/credits

### Option 3: Verify Account Status
- Make sure your accounts are active
- Check if email is verified
- Ensure no payment issues (if using paid tier)

---

## 📝 Current Model Configuration

After the fix, your backend will use:
- **Primary Model:** `llama-3.3-70b-versatile` (Meta Llama 3.3)
- **Reasoning Model:** `qwen/qwen3-32b` (Alibaba Qwen3)
- **Fallback:** `google/gemma-2-9b-it:free` (Google Gemma via OpenRouter)

---

## ⚡ Quick Fix Commands

```bash
# 1. Stop backend (Ctrl+C in backend terminal)

# 2. Update .env with new keys (use text editor)

# 3. Restart backend
cd backend
python main.py

# 4. Test in new terminal
curl -X POST http://localhost:8000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Hello", "language": "en"}'
```

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ No 401 errors in backend logs
- ✅ Chat responds successfully
- ✅ Backend logs show: "✅ Groq LLM initialized"
- ✅ Chat messages get responses

---

## 💡 Pro Tips

1. **Keep backup keys** - Generate 2-3 keys and keep backups
2. **Monitor usage** - Check API usage dashboards regularly
3. **Set up alerts** - Enable email alerts for quota limits
4. **Use environment-specific keys** - Different keys for dev/prod

---

**Remember:** The backend is working fine. You just need valid API keys!
