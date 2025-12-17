"""
Test different questions to verify AI gives different answers
"""
import requests
import json
import time

def ask_question(question, filter_type='today'):
    """Ask a question and show the response"""
    print("=" * 70)
    print(f"Q: {question}")
    print("-" * 70)
    
    try:
        response = requests.post(
            'http://localhost:8000/api/ai-crm/chat',
            json={'query': question, 'filter': filter_type},
            timeout=35
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"A: {data['response'][:200]}...")
            print()
        else:
            print(f"Error: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")
    
    time.sleep(2)  # Wait between requests

if __name__ == "__main__":
    print("\n🧪 Testing AI with Different Questions\n")
    
    # Different types of questions
    questions = [
        ("Where are the patients located?", "today"),
        ("Give me the names of patients", "today"),
        ("How many members need follow-up?", "today"),
        ("What's the lead status summary?", None),
        ("Which areas have the most patients?", None),
        ("Who is in Coimbatore?", None),
        ("Show me overdue follow-ups", "overdue"),
        ("What should I prioritize today?", "today"),
    ]
    
    for question, filter_type in questions:
        ask_question(question, filter_type)
    
    print("\n✅ Test completed! Check if responses are different for each question.")
