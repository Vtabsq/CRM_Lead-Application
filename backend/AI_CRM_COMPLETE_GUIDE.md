# 🤖 AI CRM Chat - Complete Guide

## ✅ What's Working Now

Your AI CRM Chat now provides **intelligent, context-aware answers** to any question about your CRM data using **Llama 3.2 AI model**.

---

## 🎯 Key Features

### **1. Natural Language Understanding**
Ask questions in plain English:
- "Where are the patients located?"
- "Give me names of people needing follow-up today"
- "What's the status of our leads?"
- "How many members are in Coimbatore?"

### **2. Smart Data Extraction**
Automatically extracts and shows:
- ✅ **Names** - Patient/customer names
- ✅ **Locations** - Cities, areas, regions
- ✅ **Member IDs** - Unique identifiers
- ✅ **Status** - Lead statuses
- ✅ **Counts** - Number of members

### **3. Context-Aware Responses**
The AI understands what you're asking for:
- Ask for "names" → Shows names only
- Ask for "locations" → Shows "Name - Location"
- Ask for "IDs" → Shows member IDs
- General query → Shows "ID (Name) - Location"

---

## 📊 Example Queries & Responses

### Query: "Where are the patients located?"
**Response:**
```
Found 13 member(s): 
MID-2025-11-03-11592 (Harish) - Coimbatore
MID-2025-11-03-8253 (Suman) - Coimbatore
MID-2025-11-04-38351 (sudharshan) - Nagapattinam
MID-2025-11-04-22136 (1) - Kumbakonam
...
```

### Query: "Give me the names"
**Response:**
```
Found 13 member(s): Harish, Suman, sudharshan, Akaash, ...
```

### Query: "Show me member IDs for today's follow-ups"
**Response:**
```
Found 13 member(s): MID-2025-11-03-11592, MID-2025-11-03-8253, ...
```

### Query: "How many members in Coimbatore?"
**AI analyzes and responds:**
```
Based on the data, there are 6 members located in Coimbatore: 
Harish, Suman, Harish, Harish, Akaash, Harish
```

---

## 🔧 Technical Setup

### **AI Model**
- **Model**: `meta-llama/Llama-3.2-3B-Instruct`
- **Provider**: Hugging Face Inference API
- **Token**: Configured in `.env`
- **Timeout**: 30 seconds

### **Configuration (.env)**
```env
HF_TOKEN=your_hf_token_here
HF_MODEL=meta-llama/Llama-3.2-3B-Instruct
HF_API_BASE_URL=https://api-inference.huggingface.co/models
HF_ENABLED=True
```

### **Data Sources**
The AI analyzes data from these Google Sheets columns:
- **Names**: Patient Name, Name, Customer Name
- **Locations**: Patient Location, Location, Area, City
- **IDs**: Memberidkey, Member ID
- **Status**: Lead Status
- **Dates**: Follow1 Date, Follow_2 Date, Follow_3 Date

---

## 🎨 How It Works

### **1. Data Collection**
```
User Query → Filter CRM Data (today/this_week/overdue) → Extract Info
```

### **2. AI Context Building**
```python
Context sent to AI:
- Total records: 13
- Filter applied: today
- Members found: 13
- Member details: MID-XXX (Harish - Coimbatore), ...
- Lead statuses: New: 5, Follow-up: 8
- These members need follow-up TODAY
```

### **3. AI Analytics**
```
Context + Query → Llama 3.2 AI → Intelligent Response
```

### **4. Fallback System**
```
If AI fails → Rule-based response → Ensure service continuity
```

---

## 💡 Query Types Supported

### **Location Queries**
```
"Where are the patients?"
"Show me locations for today's follow-ups"
"Which areas have the most members?"
"Give me the cities"
```

### **Name Queries**
```
"Give me the names"
"Who needs follow-up today?"
"List patient names"
"Show me customer names"
```

### **ID Queries**
```
"Show me member IDs"
"What are the IDs for today?"
"List member IDs"
```

### **Status Queries**
```
"What's the lead status?"
"Give me a status summary"
"How many leads are converted?"
"Show me lead breakdown"
```

### **Count Queries**
```
"How many members need follow-up?"
"Count of patients in Coimbatore"
"How many overdue follow-ups?"
```

### **Complex Queries**
```
"Which members in Coimbatore need follow-up today?"
"Give me names and locations for overdue follow-ups"
"Analyze the follow-up patterns"
"What insights can you provide?"
```

---

## 🚀 Usage Tips

### **Be Specific**
✅ "Where are patients located for today's follow-ups?"  
❌ "Show me data"

### **Use Filters**
- **today** - Members needing follow-up today
- **this_week** - Members needing follow-up this week
- **overdue** - Overdue follow-ups
- **none** - All members

### **Ask Natural Questions**
The AI understands context:
- "Where should I visit today?" → Locations for today's follow-ups
- "Who do I need to call?" → Names for follow-ups
- "What's my priority?" → Today's urgent follow-ups

---

## 📈 Performance

- **AI Response Time**: 5-15 seconds
- **Fallback Response Time**: <1 second
- **Timeout**: 30 seconds
- **Max Tokens**: 500 (concise responses)

---

## 🔍 Data Extraction Logic

### **Names**
1. Check "Patient Name" column
2. Fallback to any column with "name"
3. Default: "Unknown"

### **Locations**
1. Check "Patient Location" column
2. Fallback to "Location" column
3. Fallback to "Area" column
4. Search for city/town/district columns
5. Default: "Unknown location"

### **Member IDs**
1. Check "Memberidkey" column
2. Fallback to any column with "member" and "id"

---

## 🎯 Response Formats

### **Location Query**
```
Name - Location
Example: Harish - Coimbatore
```

### **Name Query**
```
Name
Example: Harish, Suman, Akaash
```

### **ID Query**
```
Member ID
Example: MID-2025-11-03-11592
```

### **General Query**
```
ID (Name) - Location
Example: MID-2025-11-03-11592 (Harish) - Coimbatore
```

---

## 🚨 Troubleshooting

### Issue: AI Not Responding
**Check:**
1. `HF_ENABLED=True` in `.env`
2. `HF_TOKEN` is set correctly
3. Internet connection
4. Backend logs for errors

### Issue: Showing "Unknown location"
**Cause:** Location data not in Google Sheets

**Solution:**
1. Add "Patient Location" column
2. Fill in location data
3. Refresh the chat

### Issue: Slow Responses
**Normal:** AI inference takes 5-15 seconds
**If >30s:** Check Hugging Face API status

---

## 📚 Files Reference

- `main.py` - Backend AI integration
- `test_ai_direct.py` - Test AI responses
- `test_hf_api.py` - Test Hugging Face API
- `test_names.py` - Test name/location extraction
- `.env` - Configuration

---

## ✅ Summary

Your AI CRM Chat now:

✅ Uses **Llama 3.2 AI** for intelligent responses  
✅ Analyzes your CRM data in real-time  
✅ Understands natural language questions  
✅ Extracts **names, locations, IDs, statuses**  
✅ Provides **context-aware answers**  
✅ Falls back gracefully on errors  
✅ Responds in **5-15 seconds**  

**Ask any question about your CRM data and get intelligent answers!** 🎉

---

## 🎓 Example Conversation

```
User: "Where are the patients located?"
AI: Found 13 members: Harish - Coimbatore, Suman - Coimbatore, 
    sudharshan - Nagapattinam, ...

User: "How many in Coimbatore?"
AI: Based on the data, there are 6 members in Coimbatore.

User: "Give me their names"
AI: The members in Coimbatore are: Harish, Suman, Harish, Harish, 
    Akaash, Harish

User: "Who needs follow-up today?"
AI: Found 13 members requiring follow-up today: Harish, Suman, 
    sudharshan, Akaash, ...
```

**The AI truly understands and analyzes your data!** 🚀
