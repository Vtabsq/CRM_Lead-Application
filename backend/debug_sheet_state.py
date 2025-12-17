import requests
import json

BASE_URL = "http://localhost:8000"

def debug_sheet():
    print("Fetching /debug/latest...")
    try:
        res = requests.get(f"{BASE_URL}/debug/latest")
        if res.status_code == 200:
            data = res.json()
            print("Sheet URL:", data.get("sheet_url"))
            print("Worksheet:", data.get("worksheet_title"))
            print("Total Rows:", data.get("rows_total"))
            print("Last 5 Rows:")
            print(json.dumps(data.get("last_rows", []), indent=2))
        else:
            print("Failed:", res.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_sheet()
