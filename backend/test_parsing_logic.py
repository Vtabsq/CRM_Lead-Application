import pandas as pd
import numpy as np

def test_parsing():
    # Data from debug output
    data = ['11/12/2025', '2025-12-11', '11/12/2025', '2025-12-11', '2025-12-11', '2025-12-11', '2025-12-12']
    df = pd.DataFrame(data, columns=['Date'])
    
    print("Original Data:")
    print(df['Date'].tolist())
    
    # Simulate Backend Logic
    # 1. First Pass (dayfirst=True)
    df['temp_date'] = pd.to_datetime(df['Date'], dayfirst=True, errors='coerce')
    print("\nAfter Pass 1 (dayfirst=True):")
    print(df['temp_date'])
    
    # 2. Second Pass (ISO fallback for NaT)
    mask_nat = df['temp_date'].isna()
    if mask_nat.any():
        print(f"\nFound {mask_nat.sum()} NaTs. Attempting Pass 2 (ISO)...")
        df.loc[mask_nat, 'temp_date'] = pd.to_datetime(df.loc[mask_nat, 'Date'], errors='coerce')
        
    print("\nFinal Result:")
    print(df['temp_date'])
    
    na_count = df['temp_date'].isna().sum()
    print(f"\nFinal NaT Count: {na_count}")
    
    if na_count == 0:
        print("SUCCESS: All dates parsed!")
    else:
        print("FAILURE: Some dates failed parsing.")

if __name__ == "__main__":
    test_parsing()
