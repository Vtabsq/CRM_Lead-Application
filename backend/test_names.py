"""
Test script to verify name extraction works correctly
"""
import requests
import json

def test_names_query():
    """Test asking for names"""
    
    queries = [
        "give me the names",
        "what are the names of members I need to follow up today?",
        "show me patient names",
        "who needs follow-up today?",
        "list the customer names"
    ]
    
    for query in queries:
        print("=" * 70)
        print(f"Query: {query}")
        print("-" * 70)
        
        try:
            response = requests.post(
                'http://localhost:8000/api/ai-crm/chat',
                json={
                    'query': query,
                    'filter': 'today'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Response:")
                print(data['response'])
                print()
            else:
                print(f"❌ Error: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print()

def test_location_query():
    """Test asking for locations"""
    
    queries = [
        "show me the locations",
        "where are the patients located?",
        "give me the areas for today's follow-ups",
        "list the locations of members",
        "where should I schedule visits today?"
    ]
    
    for query in queries:
        print("=" * 70)
        print(f"Query: {query}")
        print("-" * 70)
        
        try:
            response = requests.post(
                'http://localhost:8000/api/ai-crm/chat',
                json={
                    'query': query,
                    'filter': 'today'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Response:")
                print(data['response'])
                print()
            else:
                print(f"❌ Error: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print()

if __name__ == "__main__":
    print("\n🧪 Testing Name Extraction\n")
    test_names_query()
    print("\n🧪 Testing Location Extraction\n")
    test_location_query()
    print("✅ Test completed!")
