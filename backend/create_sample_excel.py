"""
Quick script to create a sample Excel template
Run: python create_sample_excel.py
"""
import openpyxl

# Create a new workbook
wb = openpyxl.Workbook()
ws = wb.active

# Define your form fields (customize these!)
fields = [
    "Full Name",
    "Email Address",
    "Phone Number",
    "Company Name",
    "Job Title",
    "Date of Contact",
    "Lead Source",
    "Budget Range",
    "Project Description",
    "Status"
]

# Write fields to first row
for col, field in enumerate(fields, start=1):
    ws.cell(row=1, column=col, value=field)

# Save as .xlsm file
filename = "CRM_Lead_Template (1).xlsm"
wb.save(filename)
print(f"✅ Created: {filename}")
print(f"📊 Fields: {len(fields)}")
print(f"📝 Field names: {', '.join(fields)}")
print("\nThe Excel file is only used to define form fields.")
print("All submitted data will be saved to Google Sheets!")
