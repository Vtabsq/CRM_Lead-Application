"""
Alternative entry point for running the FastAPI application
Usage: python run.py
"""
import uvicorn
import os

if __name__ == "__main__":
    # Check for required files before starting
    required_files = [
        "CRM_Lead_Template (1).xlsm",
        "google_credentials.json"
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print("⚠️  WARNING: Missing required files:")
        for file in missing_files:
            print(f"   - {file}")
        print("\nThe server will start, but some features may not work.")
        print("Please place the required files in the backend/ folder.\n")
    
<<<<<<< HEAD
    print(">> Starting CRM Lead Form Backend...")
    print(">> Server will be available at: http://localhost:8000")
    print(">> API Documentation: http://localhost:8000/docs")
    print(">> Health Check: http://localhost:8000/health")
=======
    print("🚀 Starting CRM Lead Form Backend...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📊 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
>>>>>>> bb192ef08f7bfaf739cd63abf2ba26a44c5078da
    print("\nPress Ctrl+C to stop the server\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
