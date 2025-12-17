"""
Test Groq AI with different questions
"""
import requests
import time

def test_ai(question, filter_type='today'):
    print("=" * 70)
    print(f"Q: {question}")
    print("-" * 70)
    
    response = requests.post(
        'http://localhost:8000/api/ai-crm/chat',
        json={'query': question, 'filter': filter_type},
        timeout=35
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"A: {data['response']}\n")
    else:
        print(f"Error: {response.status_code}\n")
    
    time.sleep(1)

if __name__ == "__main__":
    print("\n🤖 Testing Groq AI\n")
    
    test_ai("Where are the patients located?", "today")
    test_ai("Give me just the names", "today")
    test_ai("How many members in Coimbatore?", None)
    test_ai("What should I prioritize today?", "today")
    test_ai("Analyze the follow-up patterns", None)
    
    print("✅ Test completed!")
