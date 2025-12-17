"""
Test if Hugging Face AI is actually being called
"""
import requests
import json

def test_ai_call():
    """Test a query and check if AI responds"""
    
    query = "Where are the patients located and what are their names?"
    
    print("=" * 70)
    print(f"Testing AI with query: {query}")
    print("=" * 70)
    
    response = requests.post(
        'http://localhost:8000/api/ai-crm/chat',
        json={
            'query': query,
            'filter': 'today'
        },
        timeout=35
    )
    
    print(f"\nStatus: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nResponse:")
        print(data['response'])
        print(f"\nMember count: {data.get('count', 0)}")
        print(f"Connected: {data.get('connected', False)}")
        
        # Check if response looks AI-generated (longer, more natural)
        response_text = data['response']
        if len(response_text) > 100 and not response_text.startswith("Found"):
            print("\n✅ Looks like AI-generated response!")
        else:
            print("\n⚠️  Looks like fallback response (rule-based)")
            print("AI might not be working - check HF_TOKEN and API")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_ai_call()
