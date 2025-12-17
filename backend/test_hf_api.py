"""
Test Hugging Face API directly
"""
import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv('HF_TOKEN', '')
HF_MODEL = os.getenv('HF_MODEL', 'microsoft/Phi-3-mini-4k-instruct')
HF_API_BASE_URL = os.getenv('HF_API_BASE_URL', 'https://api-inference.huggingface.co/models')

async def test_hf_api():
    """Test Hugging Face API directly"""
    
    print("=" * 70)
    print("Testing Hugging Face API")
    print("=" * 70)
    print(f"Token: {HF_TOKEN[:20]}..." if HF_TOKEN else "Token: NOT SET")
    print(f"Model: {HF_MODEL}")
    print(f"API URL: {HF_API_BASE_URL}")
    print()
    
    if not HF_TOKEN:
        print("❌ HF_TOKEN not set in .env file!")
        return
    
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": "You are a helpful assistant. Say 'Hello, I am working!' if you can respond.",
        "parameters": {
            "max_new_tokens": 50,
            "temperature": 0.7,
            "return_full_text": False
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            print("Sending request to Hugging Face...")
            api_url = f"{HF_API_BASE_URL}/{HF_MODEL}"
            print(f"URL: {api_url}")
            response = await client.post(
                api_url,
                headers=headers,
                json=payload
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"\nResponse: {result}")
                if isinstance(result, list) and len(result) > 0:
                    ai_response = result[0].get('generated_text', '')
                    print(f"\n✅ AI Response: {ai_response}")
                    print("\n✅ Hugging Face API is working!")
                else:
                    print(f"\nUnexpected format: {result}")
            else:
                print(f"\n❌ Error Response:")
                print(response.text)
                
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_hf_api())
