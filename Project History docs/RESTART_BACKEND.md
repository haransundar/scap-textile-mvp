# 🔄 RESTART BACKEND SERVER - CRITICAL!

## Why You Need to Restart

Your backend server is still running with:
- ❌ Old model names (qwen2-72b-instruct)
- ❌ Old code loaded in memory
- ❌ Old configuration

Even though we fixed the code, the running server doesn't know about the changes!

---

## Step-by-Step Restart Instructions

### Step 1: Stop the Backend Server

**Find the terminal where backend is running** (you'll see logs like this):
```
INFO:     127.0.0.1:56610 - "POST /api/chat/message HTTP/1.1" 200 OK
❌ Qwen chat failed: Error code: 401...
```

**Stop it:**
- Press `Ctrl + C` in that terminal
- Wait for it to fully stop
- Or just close the terminal window

### Step 2: Verify It's Stopped

Open a new terminal and run:
```bash
# Check if port 8000 is free
netstat -ano | findstr :8000
```

If you see output, the server is still running. Kill it:
```bash
# Find the PID (last column) and kill it
taskkill /PID <PID_NUMBER> /F
```

### Step 3: Start Backend with New Code

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 4: Verify It Started Correctly

You should see:
```
✅ Groq LLM initialized (Llama 3.3 70B + Qwen3 32B)
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**NOT:**
```
✅ Groq LLM initialized (Qwen 2 72B + DeepSeek-R1)  ❌ OLD!
```

---

## Quick Test After Restart

### Test 1: Check the logs
When backend starts, you should see:
```
✅ Groq LLM initialized (Llama 3.3 70B + Qwen3 32B)
```

### Test 2: Send a chat message
1. Go to http://localhost:3000/dashboard/chatbot
2. Send: "Hello"
3. Check backend logs - should NOT see 401 errors

### Test 3: Verify model names
The logs should show the new model being used, not the old one.

---

## If You Still Get 401 Errors After Restart

This means your API keys are actually invalid. Follow these steps:

### Option 1: Get Fresh Groq API Key

1. Go to: https://console.groq.com/keys
2. **Delete your old API key** (the one starting with gsk_RnBurj...)
3. Click "Create API Key"
4. Give it a name: "SCAP Backend"
5. Copy the NEW key
6. Update `.env`:
   ```
   GROQ_API_KEY=gsk_YOUR_NEW_KEY_HERE
   ```
7. Restart backend again

### Option 2: Get Fresh OpenRouter API Key

1. Go to: https://openrouter.ai/keys
2. Delete old key
3. Create new key
4. Copy it
5. Update `.env`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-YOUR_NEW_KEY_HERE
   ```
6. Restart backend again

---

## Common Mistakes

### ❌ Mistake 1: Not restarting after code changes
**Solution:** Always restart when you change Python code

### ❌ Mistake 2: Editing .env but not restarting
**Solution:** Restart after changing .env

### ❌ Mistake 3: Multiple backend instances running
**Solution:** Kill all instances, start fresh

### ❌ Mistake 4: Wrong directory
**Solution:** Make sure you're in the `backend` folder when starting

---

## Verification Checklist

After restart, verify:
- [ ] Backend starts without errors
- [ ] Logs show: "Llama 3.3 70B + Qwen3 32B" (not "Qwen 2 72B")
- [ ] No 401 errors when sending chat messages
- [ ] Chat responds successfully
- [ ] No "model_not_found" errors

---

## Still Having Issues?

### Check 1: API Key Format
```bash
# Should start with gsk_
echo $GROQ_API_KEY
```

### Check 2: Test API Key Directly
```bash
python test_groq_key.py
```

Should show:
```
✅ SUCCESS! Groq API is working!
```

### Check 3: Check Groq Dashboard
- Go to: https://console.groq.com/settings/limits
- Make sure you haven't exceeded rate limits
- Check if key is active

---

## Emergency Fallback: Use Only Google AI

If Groq continues to fail, temporarily disable it:

1. Edit `backend/services/llm_service.py`
2. Find the `__init__` method
3. Comment out Groq initialization:
   ```python
   # self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
   self.groq_client = None
   ```
4. The system will automatically use Google AI (Gemini) instead

---

## Summary

**Most Important Steps:**
1. ⚠️  **STOP the backend server** (Ctrl+C)
2. ⚠️  **START it again** (uvicorn main:app --reload)
3. ✅ **Verify** logs show new model names
4. ✅ **Test** chat functionality

**The code is fixed. You just need to restart the server!**
