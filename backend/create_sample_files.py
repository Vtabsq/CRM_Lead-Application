import pandas as pd
import json

# Load schema
with open('field_schema.json', 'r') as f:
    schema = json.load(f)

# Get headers from schema
headers = [f['name'] for f in schema[:15]]

# Create sample data
data = {
    'Date': ['03/12/2025', '04/12/2025', '05/12/2025'],
    'Memberidkey': ['MID-2025-12-03-001', 'MID-2025-12-04-002', 'MID-2025-12-05-003'],
    'Attender Name': ['John Smith', 'Jane Doe', 'Robert Johnson'],
    'Patient Name': ['John Patient', 'Jane Patient', 'Robert Patient'],
    'Gender': ['Male', 'Female', 'Male'],
    'Age': ['45', '32', '58'],
    'Patient Location': ['New York', 'London', 'Paris'],
    'Area': ['Manhattan', 'Westminster', 'Marais'],
    'Email Id': ['john@example.com', 'jane@example.com', 'robert@example.com'],
    'Mobile Number': ['1234567890', '0987654321', '1122334455']
}

# Fill missing columns with empty strings
for h in headers:
    if h not in data:
        data[h] = [''] * 3

# Create DataFrame with correct column order
df = pd.DataFrame({k: data.get(k, [''] * 3) for k in headers})

# Save files
df.to_csv('sample_patient_data.csv', index=False)
df.to_excel('sample_patient_data.xlsx', index=False, engine='openpyxl')

print(f'Sample files created with {len(headers)} columns and 3 rows of data')
print(f'Files: sample_patient_data.csv and sample_patient_data.xlsx')
print(f'\nColumns included: {", ".join(headers[:5])}...')
