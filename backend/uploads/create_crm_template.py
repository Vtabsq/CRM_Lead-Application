"""
Create CRM Lead Template with all required fields
"""
import openpyxl

# Create a new workbook
wb = openpyxl.Workbook()
ws = wb.active

# Define all CRM fields
fields = [
    "Memberidkey",
    "Attender Name",
    "Patient Name",
    "Patient Location",
    "Gender",
    "Age",
    "Email Id",
    "Mobile Number",
    "Service",
    "Location",
    "Date",
    "Source",
    "Crm Agent Name",
    "Currently Assigned",
    "Enquiry Made For",
    "Assigned Care Taker",
    "Age Of Care Taker",
    "Gender Of Care Taker",
    "Lead Status",
    "Active/Inactive",
    "Reason For Rejection",
    "Ed Comments",
    "Follow1 Date",
    "Reminder Date_1",
    "Follow_2 Date",
    "Reminder Date_2",
    "Follow_3 Date",
    "Reminder Date_3",
    "Follow_4 Date",
    "Closed Date",
    "Feedback",
    "Duplicate Flag"
]

# Write fields to first row
for col, field in enumerate(fields, start=1):
    ws.cell(row=1, column=col, value=field)

# Save as .xlsm file
filename = "CRM_Lead_Template (1).xlsm"
wb.save(filename)
print(f"✅ Created: {filename}")
print(f"📊 Total Fields: {len(fields)}")
print(f"📄 Pages (10 fields/page): {(len(fields) + 9) // 10}")
print(f"\n📝 All fields added successfully!")
