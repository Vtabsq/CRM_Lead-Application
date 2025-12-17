# 🤖 AI CRM Chat - Hugging Face Integration

## Overview

The AI CRM Chat feature now uses **Hugging Face Inference API** with **Mistral-7B-Instruct-v0.2** to provide intelligent, context-aware responses to CRM queries.

---

## 🎯 Features

### ✅ AI-Powered Responses
- Uses Mistral-7B-Instruct model via Hugging Face
- Understands natural language queries
- Provides context-aware answers based on CRM data
- Mentions relevant Member IDs in responses

### ✅ Intelligent Fallback
- Falls back to rule-based responses if AI fails
- Ensures service reliability
- No downtime even if AI API is unavailable

### ✅ CRM Data Integration
- Queries Google Sheets in real-time
- Applies filters (Today, This Week, Overdue)
- Extracts member IDs and status information
- Provides data context to AI model

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# Hugging Face AI Configuration
HF_TOKEN=your_hf_token_here
HF_MODEL=meta-llama/Llama-3.2-3B-Instruct
HF_API_BASE_URL=https://api-inference.huggingface.co/v1
HF_ENABLED=True
```

### Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `HF_TOKEN` | - | Your Hugging Face API token (required) |
| `HF_MODEL` | mistralai/Mistral-7B-Instruct-v0.2 | AI model to use |
| `HF_API_BASE_URL` | https://router.huggingface.co/v1 | Hugging Face API endpoint |
| `HF_ENABLED` | True | Enable/disable AI (uses fallback if False) |

---

## 📡 API Endpoint

### POST /api/ai-crm/chat

**Request Body:**
```json
{
  "query": "What are member IDs I need to follow up today?",
  "filter": "today"
}
```

**Filter Options:**
- `"today"` - Members needing follow-up today
- `"this_week"` - Members needing follow-up this week
- `"overdue"` - Overdue follow-ups
- `null` or empty - All members

**Success Response (200):**
```json
{
  "response": "Based on the CRM data, you have 13 members requiring follow-up today. The member IDs are: MID-2025-11-03-11592, MID-2025-11-03-8253, MID-2025-11-04-38351...",
  "member_ids": [
    "MID-2025-11-03-11592",
    "MID-2025-11-03-8253",
    "MID-2025-11-04-38351"
  ],
  "connected": true,
  "count": 13
}
```

---

## 🧪 Testing

### Run Test Suite

```bash
python test_ai_integration.py
```

This will test:
- ✅ Follow-up queries with filters
- ✅ Status summary queries
- ✅ Count queries
- ✅ Natural language understanding
- ✅ Complex prioritization queries

### Manual Testing

```python
import requests

response = requests.post('http://localhost:8000/api/ai-crm/chat', json={
    'query': 'Which members should I prioritize for follow-up?',
    'filter': 'today'
})

print(response.json()['response'])
```

---

## 🤖 How It Works

### 1. Data Collection
```
User Query → Filter CRM Data → Extract Member IDs & Stats
```

### 2. AI Context Building
```python
CRM Data Context:
Total records: 13
Filter applied: today
Member IDs found: 13
Lead statuses: New: 5, Follow-up: 8
These members need follow-up TODAY

Relevant Member IDs: MID-2025-11-03-11592, ...
```

### 3. AI Processing
```
Context + Query → Hugging Face API → Mistral-7B Model → AI Response
```

### 4. Fallback Logic
```
If AI fails → Rule-based response → Ensure service continuity
```

---

## 💡 Example Queries

### Simple Queries
```
"What are member IDs I need to follow up today?"
"Show me overdue follow-ups"
"How many members need follow-up this week?"
```

### Natural Language Queries
```
"Can you explain the current status of our elderly care leads?"
"Which members should I prioritize for follow-up and why?"
"Give me a summary of today's follow-up requirements"
"What's the breakdown of lead statuses?"
```

### Complex Queries
```
"Compare today's follow-ups with overdue ones"
"Analyze the follow-up patterns for this week"
"What insights can you provide about our CRM data?"
```

---

## 🎨 AI Prompt Engineering

### System Prompt
```
You are an AI CRM assistant for an elderly care service. 
You help staff quickly understand customer data and follow-up requirements.
Be concise, professional, and helpful. 
Always mention relevant Member IDs when discussing specific customers.
```

### User Prompt Template
```
CRM Data Context:
{crm_data_summary}

Relevant Member IDs: {member_ids}

User Question: {user_query}

Provide a clear, concise answer based on the CRM data above.
```

---

## ⚙️ Model Configuration

### Current Settings
```python
{
    "model": "mistralai/Mistral-7B-Instruct-v0.2",
    "max_tokens": 500,
    "temperature": 0.7,
    "top_p": 0.9
}
```

### Parameter Explanation
- **max_tokens**: 500 - Limits response length
- **temperature**: 0.7 - Balanced creativity/accuracy
- **top_p**: 0.9 - Nucleus sampling for quality

---

## 🚨 Error Handling

### AI API Failures
- Automatic fallback to rule-based responses
- Logs error details for debugging
- No service interruption

### Timeout Handling
- 30-second timeout for AI requests
- Graceful degradation to fallback

### Network Issues
- Catches connection errors
- Returns user-friendly error messages
- Maintains service availability

---

## 📊 Performance

### Response Times
- **AI Response**: 5-15 seconds (includes inference)
- **Fallback Response**: <1 second
- **Total Timeout**: 30 seconds

### Optimization Tips
1. Use specific filters to reduce data size
2. Keep queries concise
3. Cache frequently asked questions
4. Monitor AI API usage

---

## 🔒 Security

### API Token Protection
- ✅ Stored in environment variables
- ✅ Never committed to Git
- ✅ Loaded via python-dotenv
- ✅ Not exposed in responses

### Data Privacy
- ✅ Only summary data sent to AI
- ✅ No sensitive personal information
- ✅ Member IDs are anonymized
- ✅ Complies with data protection

---

## 🚀 Deployment

### Production Checklist
- [ ] Set `HF_TOKEN` in production environment
- [ ] Verify `HF_ENABLED=True` in .env
- [ ] Test AI responses with production data
- [ ] Monitor AI API usage and costs
- [ ] Set up error alerting
- [ ] Configure rate limiting if needed

### Environment Setup
```bash
# Install dependencies
pip install httpx requests

# Set environment variables
export HF_TOKEN=your_token_here
export HF_ENABLED=True

# Start backend
python main.py
```

---

## 📈 Monitoring

### Key Metrics to Track
1. **AI Success Rate** - % of queries using AI vs fallback
2. **Response Time** - Average time for AI responses
3. **API Errors** - Hugging Face API failures
4. **User Satisfaction** - Quality of AI responses

### Logging
```python
# AI API calls are logged
print(f"Hugging Face API error: {response.status_code}")
print(f"Error calling Hugging Face API: {e}")
```

---

## 🔄 Fallback Behavior

### When Fallback Activates
1. AI API is down or unreachable
2. `HF_ENABLED=False` in configuration
3. `HF_TOKEN` is missing or invalid
4. Request timeout (>30 seconds)
5. AI returns empty/invalid response

### Fallback Response Logic
```python
if 'follow' in query:
    return "Found X members requiring follow-up..."
elif 'status' in query:
    return "Lead status summary: ..."
elif 'count' in query:
    return "Found X members matching criteria..."
else:
    return "Found X members: [member_ids]..."
```

---

## 🎓 Best Practices

### Query Optimization
1. **Be Specific** - "Today's follow-ups" vs "Show me data"
2. **Use Filters** - Apply today/this_week/overdue filters
3. **Ask Clear Questions** - Direct questions get better answers
4. **Include Context** - Mention what you're looking for

### AI Response Quality
1. **Review Responses** - Check AI answers for accuracy
2. **Provide Feedback** - Note which queries work well
3. **Iterate Prompts** - Adjust system prompt if needed
4. **Monitor Patterns** - Track common query types

---

## 🆘 Troubleshooting

### Issue: AI Not Responding
**Solution:**
1. Check `HF_TOKEN` is set correctly
2. Verify `HF_ENABLED=True`
3. Check internet connectivity
4. Review backend logs for errors

### Issue: Slow Responses
**Solution:**
1. Normal for AI inference (5-15s)
2. Use filters to reduce data size
3. Check Hugging Face API status
4. Consider caching common queries

### Issue: Inaccurate Responses
**Solution:**
1. Verify CRM data is up to date
2. Check filter is applied correctly
3. Adjust system prompt if needed
4. Review query phrasing

### Issue: Fallback Always Used
**Solution:**
1. Check `HF_TOKEN` is valid
2. Verify API endpoint is reachable
3. Check backend logs for API errors
4. Test Hugging Face API directly

---

## 📚 Additional Resources

### Hugging Face
- **API Docs**: https://huggingface.co/docs/api-inference
- **Model Card**: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- **Pricing**: https://huggingface.co/pricing

### Related Documentation
- `WHATSAPP_SERVICE_README.md` - WhatsApp integration
- `README.md` - Main backend documentation
- `test_ai_integration.py` - Test examples

---

## 🎉 Summary

You now have a **production-ready AI-powered CRM chat** that:

✅ Uses Mistral-7B for intelligent responses  
✅ Understands natural language queries  
✅ Provides context-aware answers  
✅ Falls back gracefully on errors  
✅ Integrates with Google Sheets data  
✅ Mentions relevant Member IDs  
✅ Handles filters (today, this week, overdue)  
✅ Is secure and production-ready  

**Start chatting with your CRM data intelligently!** 🚀
