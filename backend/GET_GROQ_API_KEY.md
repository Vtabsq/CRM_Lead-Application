# 🚀 Get Your Free Groq API Key (2 Minutes)

## Why Groq?
- ✅ **FREE** tier available
- ✅ **FAST** (1-2 second responses)
- ✅ **RELIABLE** (99.9% uptime)
- ✅ **POWERFUL** (Llama 3.1 70B model)
- ✅ **NO CREDIT CARD** required for free tier

---

## Step-by-Step Guide

### 1. Go to Groq Website
Visit: **https://console.groq.com/**

### 2. Sign Up (Free)
- Click "Sign Up" or "Get Started"
- Use your email or Google account
- **No credit card required!**

### 3. Get API Key
1. After signing in, go to **API Keys** section
2. Click "Create API Key"
3. Give it a name (e.g., "CRM Chat")
4. Click "Create"
5. **COPY THE KEY** (starts with `gsk_...`)

### 4. Add to Your .env File
Open `backend/.env` and replace the placeholder:

```env
# AI Configuration (Using Groq - Fast & Free)
AI_PROVIDER=groq
GROQ_API_KEY=gsk_YOUR_ACTUAL_KEY_HERE  # ← Paste your key here
GROQ_MODEL=llama-3.1-70b-versatile
AI_ENABLED=True
```

### 5. Restart Backend
```bash
# Stop current backend (Ctrl+C or taskkill)
python main.py
```

### 6. Test It!
Refresh your browser and ask:
```
"Where are the patients located?"
"Give me names for today's follow-ups"
"How many members in Coimbatore?"
```

You'll get **intelligent, conversational AI responses!**

---

## Free Tier Limits

| Feature | Free Tier |
|---------|-----------|
| Requests/Day | 14,400 |
| Requests/Minute | 30 |
| Tokens/Minute | 6,000 |
| Models | All (including Llama 3.1 70B) |
| Cost | **$0** |

**More than enough for your CRM chat!**

---

## Example AI Responses You'll Get

### Before (Rule-Based)
```
User: "Where are patients located?"
Bot: "Found 13 members: MID-XXX (Harish) - Coimbatore, ..."
```

### After (Groq AI)
```
User: "Where are patients located?"
AI: "Based on today's follow-up schedule, you have 13 patients across 
     multiple locations. The majority (6 patients) are in Coimbatore, 
     including Harish, Suman, and Akaash. You also have patients in 
     Nagapattinam (sudharshan), Kumbakonam, Nagercoil, and Kanchipuram. 
     I recommend prioritizing Coimbatore visits since they're concentrated 
     in one area."
```

**Much more conversational and helpful!**

---

## Troubleshooting

### Issue: "Invalid API Key"
- Make sure you copied the full key (starts with `gsk_`)
- No spaces before/after the key in .env
- Restart the backend after updating .env

### Issue: "Rate limit exceeded"
- Free tier: 30 requests/minute
- Wait a minute and try again
- Upgrade to paid tier if needed (very cheap)

### Issue: Still getting rule-based responses
- Check backend logs for "✅ Groq AI Response received"
- If you see "❌ Groq API error", check your API key
- Make sure `AI_ENABLED=True` in .env

---

## Alternative: Use OpenAI (If You Prefer)

If you already have an OpenAI API key:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini
AI_ENABLED=True
```

**Cost**: ~$0.002 per query (very cheap)

---

## Quick Links

- **Groq Console**: https://console.groq.com/
- **Groq Docs**: https://console.groq.com/docs
- **Groq Pricing**: https://groq.com/pricing/

---

## ✅ Summary

1. Go to https://console.groq.com/
2. Sign up (free, no credit card)
3. Create API key
4. Paste in `.env` file
5. Restart backend
6. Enjoy intelligent AI responses!

**Takes 2 minutes, completely free!** 🎉
