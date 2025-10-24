# 🔧 Voice Feature Troubleshooting Guide

## Error: "Failed to transcribe audio. Please try again."

This error occurs when the voice transcription service is not properly set up.

---

## ✅ Quick Fix (5 minutes)

### Step 1: Install FFmpeg

**Option A - Using Chocolatey (Recommended)**:
```cmd
choco install ffmpeg
```

**Option B - Manual Installation**:
1. Download FFmpeg from: https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your system PATH
4. Restart your terminal

**Verify Installation**:
```cmd
ffmpeg -version
```

You should see FFmpeg version information.

---

### Step 2: Install Whisper AI

```cmd
cd backend
.venv\Scripts\activate
pip install openai-whisper
```

**Note**: First installation will download the Whisper model (~140MB). This is normal.

---

### Step 3: Restart Backend

```cmd
cd backend
python main.py
```

Look for this message:
```
✅ Whisper AI initialized (base model)
```

If you see:
```
⚠️ Whisper not installed. Voice transcription will not be available.
```

Then Whisper is not installed correctly. Go back to Step 2.

---

## 🔍 Detailed Troubleshooting

### Issue 1: FFmpeg Not Found

**Symptoms**:
- Error: "ffmpeg not recognized"
- Whisper fails to load

**Solution**:
```cmd
# Check if FFmpeg is installed
where ffmpeg

# If not found, install it
choco install ffmpeg

# Restart terminal and verify
ffmpeg -version
```

---

### Issue 2: Whisper Not Installed

**Symptoms**:
- Error: "ModuleNotFoundError: No module named 'whisper'"
- Backend logs: "⚠️ Whisper not installed"

**Solution**:
```cmd
cd backend
.venv\Scripts\activate
pip install openai-whisper

# Verify installation
python -c "import whisper; print('Whisper installed')"
```

---

### Issue 3: Model Download Fails

**Symptoms**:
- First run takes very long
- Error downloading model

**Solution**:
```cmd
# Manually download model
cd backend
.venv\Scripts\activate
python -c "import whisper; whisper.load_model('base')"
```

This will download the model (~140MB) to your cache directory.

---

### Issue 4: Microphone Permission Denied

**Symptoms**:
- Browser shows "Permission denied"
- No recording starts

**Solution**:
1. Click the lock icon in browser address bar
2. Allow microphone access
3. Refresh the page
4. Try recording again

---

### Issue 5: Audio Format Not Supported

**Symptoms**:
- Error: "Unsupported audio format"

**Solution**:
The browser records in WebM format by default. This should work. If not:
1. Check browser console for errors
2. Try a different browser (Chrome recommended)
3. Ensure FFmpeg is installed

---

### Issue 6: Backend Not Running

**Symptoms**:
- Error: "Failed to fetch"
- Network error in console

**Solution**:
```cmd
# Start backend
cd backend
python main.py

# Verify it's running
curl http://localhost:8000/api/voice/status
```

---

## 🧪 Testing Voice Feature

### Test 1: Check Service Status

```bash
curl http://localhost:8000/api/voice/status
```

**Expected Response**:
```json
{
  "available": true,
  "model": "whisper-base",
  "supported_formats": ["mp3", "wav", "m4a", "mp4", "webm", "ogg"],
  "max_file_size": "25MB",
  "languages": ["en", "hi", "ta", "auto-detect"]
}
```

If `"available": false`, Whisper is not installed.

---

### Test 2: Record Audio in Browser

1. Go to http://localhost:3000/dashboard/chatbot
2. Click the microphone button 🎤
3. Allow microphone access
4. Speak: "What is GOTS certification?"
5. Click stop button
6. Wait for transcription

**Expected**: Text appears in input field

---

### Test 3: Check Backend Logs

Look for these messages:
```
✅ Whisper AI initialized (base model)
✅ Transcribed audio: 25 chars
```

If you see errors, check the specific error message.

---

## 📋 Installation Checklist

Use this checklist to verify everything is set up:

- [ ] FFmpeg installed (`ffmpeg -version` works)
- [ ] Whisper installed (`python -c "import whisper"` works)
- [ ] Backend running (`http://localhost:8000/docs` accessible)
- [ ] Voice status shows available (`/api/voice/status`)
- [ ] Microphone permission granted in browser
- [ ] Can record audio in chatbot
- [ ] Transcription works

---

## 🚀 Automated Installation

Run this script to install everything:

```cmd
install_voice_dependencies.bat
```

This will:
1. Check if FFmpeg is installed
2. Install Whisper AI
3. Verify installation
4. Show next steps

---

## 🔧 Manual Installation Steps

### 1. Install FFmpeg

**Windows (Chocolatey)**:
```cmd
choco install ffmpeg
```

**Windows (Manual)**:
1. Download: https://www.gyan.dev/ffmpeg/builds/
2. Extract to `C:\ffmpeg`
3. Add to PATH:
   - Open System Properties → Environment Variables
   - Edit PATH
   - Add `C:\ffmpeg\bin`
   - Click OK
4. Restart terminal

**Verify**:
```cmd
ffmpeg -version
```

---

### 2. Install Whisper

```cmd
cd backend
.venv\Scripts\activate
pip install openai-whisper
```

**First Run** (downloads model):
```cmd
python -c "import whisper; whisper.load_model('base')"
```

Wait for download to complete (~140MB).

---

### 3. Restart Backend

```cmd
cd backend
python main.py
```

Look for:
```
✅ Whisper AI initialized (base model)
```

---

## 💡 Common Questions

### Q: Why is first transcription slow?
**A**: Whisper loads the model into memory on first use. Subsequent transcriptions are faster.

### Q: Can I use a different Whisper model?
**A**: Yes, edit `backend/services/voice_service.py` and change `"base"` to `"small"`, `"medium"`, or `"large"`. Larger models are more accurate but slower.

### Q: Does this work offline?
**A**: Yes, once Whisper is installed and the model is downloaded, transcription works offline.

### Q: What languages are supported?
**A**: Whisper supports 99 languages. We've configured English, Hindi, and Tamil, but you can add more.

### Q: Why does it need FFmpeg?
**A**: Whisper uses FFmpeg to process audio files. It's required for audio format conversion.

---

## 🐛 Still Having Issues?

### Check Backend Logs

```cmd
cd backend
python main.py
```

Look for error messages related to:
- Whisper initialization
- FFmpeg
- Audio processing

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors when recording

### Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Record audio
4. Look for `/api/voice/transcribe` request
5. Check response status and error message

---

## 📞 Error Messages Explained

### "Whisper not installed"
**Fix**: Run `pip install openai-whisper`

### "FFmpeg not found"
**Fix**: Install FFmpeg with `choco install ffmpeg`

### "Permission denied"
**Fix**: Allow microphone access in browser

### "Unsupported audio format"
**Fix**: Ensure FFmpeg is installed and working

### "Service not available"
**Fix**: Restart backend after installing dependencies

### "Failed to transcribe"
**Fix**: Check backend logs for specific error

---

## ✅ Success Indicators

You'll know it's working when:

1. Backend logs show:
   ```
   ✅ Whisper AI initialized (base model)
   ```

2. Voice status endpoint returns:
   ```json
   { "available": true }
   ```

3. You can:
   - Click microphone button
   - Record audio
   - See "Transcribing..." message
   - Get text in input field

---

## 🎯 Quick Reference

| Issue | Solution |
|-------|----------|
| FFmpeg not found | `choco install ffmpeg` |
| Whisper not installed | `pip install openai-whisper` |
| Model download fails | Check internet connection |
| Permission denied | Allow microphone in browser |
| Backend not running | `python main.py` |
| Slow first transcription | Normal - model loading |

---

## 📚 Additional Resources

- FFmpeg: https://ffmpeg.org/
- Whisper: https://github.com/openai/whisper
- Chocolatey: https://chocolatey.org/

---

**Status**: If you've followed all steps, voice transcription should now work! 🎉
