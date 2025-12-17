$env:SMTP_HOST = "smtp.gmail.com"
$env:SMTP_PORT = "587"
$env:SMTP_USERNAME = "harishkadhiravan.vtab@gmail.com"
$env:SMTP_PASSWORD = "gcwfmlrotgdtjgnd"

cd C:\Users\91733\Downloads\CRM-Projects\backend
py -3.11 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
