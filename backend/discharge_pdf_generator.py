"""
Discharge Summary PDF Generator
Shared function to generate detailed discharge summary PDF
"""

import io
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, black, white, lightgrey
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader


def generate_detailed_discharge_pdf(patient: dict, totals: dict, billing_data: dict, days: int) -> bytes:
    """
    Generate detailed discharge summary PDF with all patient information
    Returns PDF as bytes
    """
    buffer = io.BytesIO()
    
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Colors
    primary_green = HexColor("#2E7D32")
    dark_gray = HexColor("#333333")
    light_gray = HexColor("#666666")
    border_gray = HexColor("#E0E0E0")
    bg_light = HexColor("#F5F5F5")
    section_bg = HexColor("#F8F9FA")
    
    # Logo path
    logo_path = os.path.join(os.path.dirname(__file__), "Gw- Logo new (2) (1).png")
    
    # Page settings
    header_height = 100
    footer_height = 50
    margin_left = 40
    margin_right = 40
    content_width = width - margin_left - margin_right
    
    # Track current page
    page_num = [1]
    
    # Helper function to get patient value with multiple key attempts
    def get_patient_val(keys):
        if isinstance(keys, str):
            keys = [keys]
        for key in keys:
            if key in patient and patient[key]:
                return str(patient[key])
            lower_key = key.lower()
            for pk in patient:
                if pk.lower() == lower_key and patient[pk]:
                    return str(patient[pk])
                if pk.lower().replace(" ", "").replace("_", "") == lower_key.replace(" ", "").replace("_", "") and patient[pk]:
                    return str(patient[pk])
        return "-"
    
    def draw_header():
        """Draw header on each page"""
        # Header background
        c.setFillColor(white)
        c.rect(0, height - header_height, width, header_height, fill=1, stroke=0)
        
        # Logo
        if os.path.exists(logo_path):
            try:
                logo = ImageReader(logo_path)
                c.drawImage(logo, 30, height - 85, width=70, height=70, preserveAspectRatio=True, mask='auto')
            except Exception as logo_err:
                print(f"Logo error: {logo_err}")
        
        # Hospital name and details
        c.setFillColor(dark_gray)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(110, height - 35, "GRAND WORLD ELDER CARE")
        
        c.setFont("Helvetica", 8)
        c.setFillColor(light_gray)
        c.drawString(110, height - 48, "Assisted Living  |  Clinics  |  Home Nursing")
        c.drawString(110, height - 60, "Contact: +91-XXXXXXXXXX  |  Email: info@grandworld.com")
        c.drawString(110, height - 72, "Address: Chennai, Tamil Nadu, India")
        
        # Document title - right aligned
        c.setFillColor(primary_green)
        c.setFont("Helvetica-Bold", 14)
        c.drawRightString(width - 40, height - 35, "DISCHARGE SUMMARY")
        
        # Date - right aligned below title
        c.setFont("Helvetica", 9)
        c.setFillColor(light_gray)
        current_date = datetime.now().strftime("%d %B %Y")
        c.drawRightString(width - 40, height - 50, f"Date: {current_date}")
        
        # Header bottom border
        c.setStrokeColor(primary_green)
        c.setLineWidth(2)
        c.line(30, height - header_height, width - 30, height - header_height)
    
    def draw_footer():
        """Draw footer on each page"""
        c.setStrokeColor(primary_green)
        c.setLineWidth(1)
        c.line(30, footer_height, width - 30, footer_height)
        
        c.setFont("Helvetica", 7)
        c.setFillColor(light_gray)
        c.drawCentredString(width / 2, footer_height - 15, "This is a computer-generated document. For any queries, please contact the hospital administration.")
        c.drawCentredString(width / 2, footer_height - 27, "Thank you for choosing Grand World Elder Care. Wishing you good health!")
        
        # Page number
        c.drawRightString(width - 40, footer_height - 15, f"Page {page_num[0]}")
    
    def check_page_break(y_pos, needed_space=100):
        """Check if we need a new page and create one if necessary"""
        if y_pos < footer_height + needed_space:
            draw_footer()
            c.showPage()
            page_num[0] += 1
            draw_header()
            return height - header_height - 25
        return y_pos
    
    def draw_section_header(y_pos, title):
        """Draw a section header with consistent styling"""
        y_pos = check_page_break(y_pos, 80)
        c.setFillColor(primary_green)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(margin_left, y_pos, title)
        y_pos -= 5
        c.setStrokeColor(primary_green)
        c.setLineWidth(1)
        c.line(margin_left, y_pos, margin_left + 180, y_pos)
        return y_pos - 18
    
    def draw_field(x, y_pos, label, value, label_width=95):
        """Draw a field with label and value"""
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(dark_gray)
        c.drawString(x, y_pos, f"{label}:")
        c.setFont("Helvetica", 8)
        c.setFillColor(light_gray)
        # Truncate long values
        val_str = str(value) if value and value != "-" else "-"
        if len(val_str) > 30:
            val_str = val_str[:27] + "..."
        c.drawString(x + label_width, y_pos, val_str)
    
    def draw_field_full_width(y_pos, label, value):
        """Draw a field that spans full width for long text"""
        y_pos = check_page_break(y_pos, 30)
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(dark_gray)
        c.drawString(margin_left, y_pos, f"{label}:")
        c.setFont("Helvetica", 8)
        c.setFillColor(light_gray)
        val_str = str(value) if value and value != "-" else "-"
        # Word wrap for long text
        if len(val_str) > 80:
            words = val_str.split()
            lines = []
            current_line = ""
            for word in words:
                if len(current_line + " " + word) < 80:
                    current_line = current_line + " " + word if current_line else word
                else:
                    lines.append(current_line)
                    current_line = word
            if current_line:
                lines.append(current_line)
            y_pos -= 12
            for line in lines[:3]:  # Max 3 lines
                c.drawString(margin_left + 10, y_pos, line.strip())
                y_pos -= 12
        else:
            c.drawString(margin_left + 100, y_pos, val_str)
            y_pos -= 15
        return y_pos
    
    # ==================== START DRAWING ====================
    draw_header()
    y = height - header_height - 25
    
    left_col = margin_left
    right_col = margin_left + 270
    
    # ==================== 1. PATIENT INFORMATION ====================
    y = draw_section_header(y, "PATIENT INFORMATION")
    
    # Row 1
    draw_field(left_col, y, "Member ID", get_patient_val(["memberidkey", "member_id_key", "memberid", "id"]))
    draw_field(right_col, y, "Registration Date", get_patient_val(["date", "registration_date", "reg_date"]))
    y -= 15
    
    # Row 2
    draw_field(left_col, y, "Patient Name", get_patient_val(["patientname", "patient_name", "name", "firstname"]))
    draw_field(right_col, y, "Last Name", get_patient_val(["patientlastname", "patient_last_name", "lastname"]))
    y -= 15
    
    # Row 3
    draw_field(left_col, y, "Gender", get_patient_val(["gender", "sex"]))
    draw_field(right_col, y, "Date of Birth", get_patient_val(["dateofbirth", "date_of_birth", "dob"]))
    y -= 15
    
    # Row 4
    draw_field(left_col, y, "Age", get_patient_val(["age"]))
    draw_field(right_col, y, "Blood Group", get_patient_val(["patientblood", "patient_blood", "bloodgroup", "blood_group", "blood"]))
    y -= 15
    
    # Row 5
    draw_field(left_col, y, "Marital Status", get_patient_val(["patientmaritalstatus", "patient_marital_status", "maritalstatus"]))
    draw_field(right_col, y, "Nationality", get_patient_val(["nationality"]))
    y -= 15
    
    # Row 6
    draw_field(left_col, y, "Religion", get_patient_val(["religion"]))
    draw_field(right_col, y, "Aadhaar No", get_patient_val(["aadhaar", "aadhar", "aadhaar_no"]))
    y -= 15
    
    # Row 7
    draw_field(left_col, y, "ID Proof Type", get_patient_val(["idprooftype", "id_proof_type"]))
    draw_field(right_col, y, "ID Proof Number", get_patient_val(["idproofnumber", "id_proof_number"]))
    y -= 25
    
    # ==================== 2. CONTACT INFORMATION ====================
    y = draw_section_header(y, "CONTACT INFORMATION")
    
    # Row 1
    draw_field(left_col, y, "Mobile Number", get_patient_val(["mobilenumber", "mobile_number", "mobile", "phone", "contact"]))
    draw_field(right_col, y, "Email ID", get_patient_val(["emailid", "email_id", "email"]))
    y -= 15
    
    # Row 2
    draw_field(left_col, y, "Door Number", get_patient_val(["doornumber", "door_number"]))
    draw_field(right_col, y, "Street", get_patient_val(["street"]))
    y -= 15
    
    # Row 3
    draw_field(left_col, y, "City", get_patient_val(["city", "area"]))
    draw_field(right_col, y, "District", get_patient_val(["district", "patientlocation", "patient_location"]))
    y -= 15
    
    # Row 4
    draw_field(left_col, y, "State", get_patient_val(["state"]))
    draw_field(right_col, y, "Pin Code", get_patient_val(["pincode", "pin_code"]))
    y -= 25
    
    # ==================== 3. EMERGENCY CONTACT ====================
    y = draw_section_header(y, "EMERGENCY CONTACT DETAILS")
    
    # Row 1
    draw_field(left_col, y, "Contact Name", get_patient_val(["relationalname", "relational_name", "attendername", "attender_name", "emergencyname"]))
    draw_field(right_col, y, "Relationship", get_patient_val(["relationalrelationship", "relational_relationship", "relationship"]))
    y -= 15
    
    # Row 2
    draw_field(left_col, y, "Contact Mobile", get_patient_val(["relationalmobile", "relational_mobile", "emergencymobile"]))
    draw_field(right_col, y, "Alt. Mobile", get_patient_val(["relationalmobilealternative", "relational_mobile_alternative", "altmobile"]))
    y -= 15
    
    # Emergency Address
    y = draw_field_full_width(y, "Emergency Address", get_patient_val(["emergencyaddress", "emergency_address"]))
    y -= 10
    
    # ==================== 4. MEDICAL HISTORY ====================
    y = draw_section_header(y, "MEDICAL HISTORY")
    
    # Row 1
    draw_field(left_col, y, "Current Status", get_patient_val(["patientcurrentstatus", "patient_current_status", "currentstatus"]))
    draw_field(right_col, y, "Sugar Level", get_patient_val(["patientsugarlevel", "patient_sugar_level", "sugarlevel"]))
    y -= 15
    
    # Row 2
    draw_field(left_col, y, "Pain Point", get_patient_val(["painpoint", "pain_point"]))
    draw_field(right_col, y, "Allergies", get_patient_val(["patientallergy", "patient_allergy", "allergy", "allergies"]))
    y -= 15
    
    # Medical History (full width)
    y = draw_field_full_width(y, "Medical History", get_patient_val(["patientmedicalhistory", "patient_medical_history", "medicalhistory"]))
    y -= 10
    
    # ==================== 5. SERVICE DETAILS ====================
    y = draw_section_header(y, "SERVICE DETAILS")
    
    # Row 1
    draw_field(left_col, y, "Service Type", get_patient_val(["service", "servicetype", "service_type"]))
    draw_field(right_col, y, "Enquiry For", get_patient_val(["enquirymadefor", "enquiry_made_for", "enquiry"]))
    y -= 15
    
    # Row 2
    draw_field(left_col, y, "Services Provided", get_patient_val(["providingservices", "providing_services", "serviceprovided"]))
    draw_field(right_col, y, "Hospital Location", get_patient_val(["hospitallocation", "hospital_location"]))
    y -= 15
    
    # Row 3
    draw_field(left_col, y, "Caretaker Name", get_patient_val(["caretakername", "caretaker_name"]))
    draw_field(right_col, y, "Source", get_patient_val(["source"]))
    y -= 25
    
    # ==================== 6. ADMISSION DETAILS ====================
    y = draw_section_header(y, "ADMISSION DETAILS")
    
    # Row 1
    draw_field(left_col, y, "Check-In Date", get_patient_val(["checkindate", "check_in_date", "admissiondate", "admission_date"]))
    draw_field(right_col, y, "Check-Out Date", get_patient_val(["checkoutdate", "check_out_date", "dischargedate", "discharge_date"]))
    y -= 15
    
    # Row 2
    draw_field(left_col, y, "Room Type", get_patient_val(["roomtype", "room_type", "room"]))
    draw_field(right_col, y, "Room Rent", get_patient_val(["roomrent", "room_rent"]))
    y -= 15
    
    # Row 3
    draw_field(left_col, y, "Bed No", get_patient_val(["bedno", "bed_no", "bed"]))
    draw_field(right_col, y, "Total Stay", f"{days} Day(s)")
    y -= 15
    
    # Row 4
    draw_field(left_col, y, "Attender Name", get_patient_val(["attendername", "attender_name"]))
    draw_field(right_col, y, "Lead Status", get_patient_val(["leadstatus", "lead_status", "status"]))
    y -= 25

    # ==================== 7. BILLING SUMMARY ====================
    y = check_page_break(y, 220)  # Need space for billing table
    y = draw_section_header(y, "BILLING SUMMARY")

    # Table settings
    table_left = margin_left
    table_right = width - margin_right
    table_width = table_right - table_left
    row_height = 20

    # Table header
    c.setFillColor(primary_green)
    c.rect(table_left, y - row_height + 5, table_width, row_height, fill=1, stroke=0)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(table_left + 10, y - 10, "Description")
    c.drawString(table_left + 220, y - 10, "Rate/Day (₹)")
    c.drawString(table_left + 320, y - 10, "Days")
    c.drawRightString(table_right - 10, y - 10, "Amount (₹)")
    y -= row_height

    def draw_table_row(y_pos, desc, rate, days_count, amount, is_fixed=False, alt_bg=False):
        if alt_bg:
            c.setFillColor(bg_light)
        else:
            c.setFillColor(white)
        c.rect(table_left, y_pos - row_height + 5, table_width, row_height, fill=1, stroke=0)

        c.setFillColor(dark_gray)
        c.setFont("Helvetica", 8)
        c.drawString(table_left + 10, y_pos - 10, desc)

        if is_fixed:
            c.drawString(table_left + 220, y_pos - 10, "-")
            c.drawString(table_left + 320, y_pos - 10, "-")
        else:
            c.drawString(table_left + 220, y_pos - 10, f"{rate:,.0f}" if rate else "0")
            c.drawString(table_left + 320, y_pos - 10, str(days_count))

        c.drawRightString(table_right - 10, y_pos - 10, f"{amount:,.0f}" if amount else "0")
        return y_pos - row_height

    # Daily charges
    room_rate = billing_data.get("room_charge", 0)
    bed_rate = billing_data.get("bed_charge", 0)
    nurse_rate = billing_data.get("nurse_payment", 0)
    additional_nurse_rate = billing_data.get("additional_nurse_payment", 0)
    other_charges_rate = billing_data.get("other_charges_amenities", 0)
    hospital_rate = billing_data.get("hospital_payment", 0)

    y = draw_table_row(y, "Room Charge", room_rate, days, totals.get("room", 0), alt_bg=True)
    y = draw_table_row(y, "Bed Charge", bed_rate, days, totals.get("bed", 0), alt_bg=False)
    y = draw_table_row(y, "Nursing Fee", nurse_rate, days, totals.get("nurse", 0), alt_bg=True)
    y = draw_table_row(y, "Additional Nursing Fee", additional_nurse_rate, days, totals.get("additional_nurse", 0), alt_bg=False)
    y = draw_table_row(y, "Other Charges (Amenities)", other_charges_rate, days, totals.get("other_charges", 0), alt_bg=True)
    y = draw_table_row(y, "Hospital Fee", hospital_rate, days, totals.get("hospital", 0), alt_bg=False)

    # Fixed charges
    y = draw_table_row(y, "Doctor Fee", 0, 0, totals.get("doctor", 0), is_fixed=True, alt_bg=True)
    y = draw_table_row(y, "Service Charge", 0, 0, totals.get("service", 0), is_fixed=True, alt_bg=False)
    
    # Discount (subtract from total)
    discount_amount = totals.get("discount", 0)
    if discount_amount > 0:
        y = draw_table_row(y, "Discount", 0, 0, -discount_amount, is_fixed=True, alt_bg=True)

    # Grand total row with extra spacing below
    y -= 3
    c.setFillColor(primary_green)
    c.rect(table_left, y - row_height + 5, table_width, row_height, fill=1, stroke=0)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(table_left + 10, y - 11, "GRAND TOTAL")
    grand_total = totals.get("grand", 0)
    c.drawRightString(table_right - 10, y - 11, f"₹ {grand_total:,.0f}")
    y -= row_height + 90  # extra gap after grand total

    # Amount in words
    y = check_page_break(y, 160)

    def number_to_words(num):
        ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
                'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
                'Seventeen', 'Eighteen', 'Nineteen']
        tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

        if num == 0:
            return 'Zero'
        num = int(num)
        if num < 20:
            return ones[num]
        elif num < 100:
            return tens[num // 10] + ('' if num % 10 == 0 else ' ' + ones[num % 10])
        elif num < 1000:
            return ones[num // 100] + ' Hundred' + ('' if num % 100 == 0 else ' and ' + number_to_words(num % 100))
        elif num < 100000:
            return number_to_words(num // 1000) + ' Thousand' + ('' if num % 1000 == 0 else ' ' + number_to_words(num % 1000))
        elif num < 10000000:
            return number_to_words(num // 100000) + ' Lakh' + ('' if num % 100000 == 0 else ' ' + number_to_words(num % 100000))
        else:
            return number_to_words(num // 10000000) + ' Crore' + ('' if num % 10000000 == 0 else ' ' + number_to_words(num % 10000000))

    amount_words = number_to_words(grand_total) + " Rupees Only"
    c.setFillColor(dark_gray)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin_left, y, "Amount in Words:")
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(margin_left + 90, y, amount_words)
    y -= 70  # extra gap before signatures

    # Signatures section
    y = check_page_break(y, 120)
    c.setStrokeColor(border_gray)
    c.setLineWidth(0.5)
    c.line(margin_left, y + 10, width - margin_right, y + 10)

    sig_y = y - 25
    c.setFont("Helvetica", 8)
    c.setFillColor(light_gray)
    c.drawString(60, sig_y + 35, "Patient/Attender Signature")
    c.setStrokeColor(dark_gray)
    c.setLineWidth(0.5)
    c.line(60, sig_y + 30, 180, sig_y + 30)

    c.drawString(380, sig_y + 35, "Authorized Signature")
    c.line(380, sig_y + 30, 500, sig_y + 30)

    c.setFont("Helvetica", 7)
    c.setFillColor(light_gray)
    c.drawCentredString(440, sig_y, "(Hospital Stamp)")

    # Draw footer on last page
    draw_footer()

    c.showPage()
    c.save()

    buffer.seek(0)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes
