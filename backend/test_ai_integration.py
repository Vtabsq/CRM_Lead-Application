"""
Test script for Hugging Face AI integration with CRM Chat
"""
import requests
import json
import time

# Service URL
SERVICE_URL = "http://localhost:8000"

def test_ai_chat(query, filter_type=None):
    """Test the AI chat endpoint with different queries"""
    
    payload = {
        "query": query,
        "filter": filter_type
    }
    
    print("=" * 70)
    print(f"Query: {query}")
    print(f"Filter: {filter_type or 'None'}")
    print("-" * 70)
    
    try:
        start_time = time.time()
        response = requests.post(
            f"{SERVICE_URL}/api/ai-crm/chat",
            json=payload,
            timeout=35
        )
        elapsed = time.time() - start_time
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Time: {elapsed:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ AI Response:")
            print(f"{data.get('response', 'No response')}")
            print(f"\n📊 Stats:")
            print(f"  - Member IDs: {len(data.get('member_ids', []))}")
            print(f"  - Total Count: {data.get('count', 0)}")
            print(f"  - Connected: {data.get('connected', False)}")
            
            if data.get('member_ids'):
                print(f"\n🔖 Member IDs (first 5):")
                for mid in data['member_ids'][:5]:
                    print(f"  - {mid}")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏱️  Request timed out (>35s)")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("=" * 70 + "\n")


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("  🤖 AI CRM Chat Integration Test Suite")
    print("=" * 70 + "\n")
    
    # Test 1: Follow-up query with today filter
    test_ai_chat(
        query="What are the member IDs I need to follow up today?",
        filter_type="today"
    )
    
    # Test 2: Status summary query
    test_ai_chat(
        query="Give me a summary of lead statuses",
        filter_type=None
    )
    
    # Test 3: Count query with this week filter
    test_ai_chat(
        query="How many members need follow-up this week?",
        filter_type="this_week"
    )
    
    # Test 4: Overdue follow-ups
    test_ai_chat(
        query="Show me overdue follow-ups",
        filter_type="overdue"
    )
    
    # Test 5: Natural language query (tests AI capabilities)
    test_ai_chat(
        query="Can you explain the current status of our elderly care leads?",
        filter_type=None
    )
    
    # Test 6: Complex query
    test_ai_chat(
        query="Which members should I prioritize for follow-up and why?",
        filter_type="today"
    )
    
    print("\n" + "=" * 70)
    print("  ✅ Test Suite Completed!")
    print("=" * 70)
    print("\n💡 Notes:")
    print("  - AI responses use Hugging Face Mistral-7B model")
    print("  - Falls back to rule-based responses if AI fails")
    print("  - Response time includes AI inference (may take 5-15s)")
    print("  - Check backend logs for detailed AI API calls")
    print("\n")
