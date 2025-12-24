"""
Professional Hospital Invoice PDF Generator
Creates hospital-style invoice PDFs matching discharge summary layout
Uses ReportLab for PDF generation
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from typing import Dict, Any, List
import io
from datetime import datetime
import os


def number_to_words(num):
    """Convert number to words (Indian Rupees)"""
    try:
        num = int(float(num))
        if num == 0:
            return "Zero Rupees Only"
        
        ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
        tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
        teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
        
        def convert_below_thousand(n):
            if n == 0:
                return ""
            elif n < 10:
                return ones[n]
            elif n < 20:
                return teens[n - 10]
            elif n < 100:
                return tens[n // 10] + (" " + ones[n % 10] if n % 10 != 0 else "")
            else:
                return ones[n // 100] + " Hundred" + (" " + convert_below_thousand(n % 100) if n % 100 != 0 else "")
        
        if num < 1000:
            return convert_below_thousand(num) + " Rupees Only"
        elif num < 100000:  # Lakhs
            thousands = num // 1000
            remainder = num % 1000
            result = convert_below_thousand(thousands) + " Thousand"
            if remainder > 0:
                result += " " + convert_below_thousand(remainder)
            return result + " Rupees Only"
        elif num < 10000000:  # Crores
            lakhs = num // 100000
            remainder = num % 100000
            result = convert_below_thousand(lakhs) + " Lakh"
            if remainder >= 1000:
                result += " " + convert_below_thousand(remainder // 1000) + " Thousand"
                remainder = remainder % 1000
            if remainder > 0:
                result += " " + convert_below_thousand(remainder)
            return result + " Rupees Only"
        else:
            return "Amount Too Large"
    except:
        return "Invalid Amount"


def format_currency(amount: float) -> str:
    """Format amount as Indian Rupee"""
    try:
        return f"₹ {float(amount):,.2f}"
    except:
        return "₹ 0.00"


class InvoiceHeaderFooter:
    """Custom header and footer for invoice PDF"""
    
    def __init__(self, invoice_data):
        self.invoice_data = invoice_data
    
    def header(self, canvas, doc):
        """Draw header on each page"""
        canvas.saveState()
        width, height = A4
        
        # Header background
        canvas.setFillColor(colors.HexColor('#f8f9fa'))
        canvas.rect(0, height - 2.5*cm, width, 2.5*cm, fill=True, stroke=False)
        
        # Logo (if available)
        try:
            logo_path = os.path.join(os.path.dirname(__file__), 'Grand World Logo.png')
            if os.path.exists(logo_path):
                # Draw logo at top left
                canvas.drawImage(logo_path, 1.5*cm, height - 2.3*cm, width=2*cm, height=2*cm, preserveAspectRatio=True, mask='auto')
        except Exception as e:
            print(f"Logo not found or error loading: {e}")
        
        # Hospital Name (moved to the right to accommodate logo)
        canvas.setFillColor(colors.HexColor('#2E7D32'))
        canvas.setFont('Helvetica-Bold', 18)
        canvas.drawString(4*cm, height - 1.2*cm, "GRAND WORLD ELDER CARE")
        
        # Tagline
        canvas.setFillColor(colors.HexColor('#666666'))
        canvas.setFont('Helvetica', 9)
        canvas.drawString(4*cm, height - 1.6*cm, "Assisted Living | Clinics | Home Nursing")
        
        # Contact Info
        canvas.setFont('Helvetica', 8)
        canvas.drawString(4*cm, height - 2*cm, "📞 +91 98765 43210  |  📧 info@grandworldeldercare.com")
        canvas.drawString(4*cm, height - 2.3*cm, "📍 Coimbatore, Tamil Nadu, India")
        
        # Divider line
        canvas.setStrokeColor(colors.HexColor('#2E7D32'))
        canvas.setLineWidth(2)
        canvas.line(1.5*cm, height - 2.7*cm, width - 1.5*cm, height - 2.7*cm)
        
        canvas.restoreState()
    
    def footer(self, canvas, doc):
        """Draw footer on each page"""
        canvas.saveState()
        width, height = A4
        
        # Footer line
        canvas.setStrokeColor(colors.HexColor('#cccccc'))
        canvas.setLineWidth(1)
        canvas.line(1.5*cm, 2*cm, width - 1.5*cm, 2*cm)
        
        # Footer text
        canvas.setFillColor(colors.HexColor('#666666'))
        canvas.setFont('Helvetica-Oblique', 8)
        canvas.drawCentredString(width/2, 1.5*cm, "This is a computer-generated invoice. No signature required.")
        canvas.drawCentredString(width/2, 1.2*cm, "Thank you for choosing Grand World Elder Care")
        
        # Page number
        canvas.setFont('Helvetica', 8)
        canvas.drawRightString(width - 1.5*cm, 1.5*cm, f"Page {doc.page}")
        
        canvas.restoreState()


def generate_invoice_pdf(invoice_data: Dict[str, Any]) -> bytes:
    """
    Generate professional hospital-style invoice PDF
    Returns PDF as bytes
    """
    buffer = io.BytesIO()
    
    # Create PDF document with custom header/footer
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=3.5*cm,
        bottomMargin=2.5*cm
    )
    
    # Container for PDF elements
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#2E7D32'),
        spaceAfter=10,
        spaceBefore=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#666666'),
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    section_heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#2E7D32'),
        spaceAfter=10,
        spaceBefore=15,
        fontName='Helvetica-Bold',
        borderWidth=0,
        borderColor=colors.HexColor('#2E7D32'),
        borderPadding=5,
        backColor=colors.HexColor('#f0f8f0')
    )
    
    # ========================
    # TITLE SECTION
    # ========================
    title = Paragraph("INVOICE", title_style)
    elements.append(title)
    
    # Invoice Date and Number
    invoice_info = Paragraph(
        f"<b>Invoice Date:</b> {invoice_data.get('invoice_date', 'N/A')}<br/>"
        f"<b>Invoice Number:</b> {invoice_data.get('invoice_id', 'N/A')}",
        subtitle_style
    )
    elements.append(invoice_info)
    elements.append(Spacer(1, 0.3*cm))
    
    # ========================
    # PATIENT & VISIT DETAILS (2 COLUMN)
    # ========================
    patient_visit_data = [
        [
            Paragraph("<b>PATIENT DETAILS</b>", section_heading_style),
            Paragraph("<b>VISIT DETAILS</b>", section_heading_style)
        ],
        [
            # Left Column - Patient Details
            Paragraph(
                f"<b>Member ID:</b> {invoice_data.get('patient_id', 'N/A')}<br/>"
                f"<b>Patient Name:</b> {invoice_data.get('patient_name', 'N/A')}<br/>"
                f"<b>Gender:</b> {invoice_data.get('gender', 'N/A')}<br/>"
                f"<b>Age:</b> {invoice_data.get('age', 'N/A')}<br/>"
                f"<b>Mobile:</b> {invoice_data.get('mobile', 'N/A')}<br/>"
                f"<b>Email:</b> {invoice_data.get('email', 'N/A')}",
                styles['Normal']
            ),
            # Right Column - Visit Details
            Paragraph(
                f"<b>Visit ID:</b> {invoice_data.get('visit_id', 'N/A')}<br/>"
                f"<b>Admission Date:</b> {invoice_data.get('admission_date', 'N/A')}<br/>"
                f"<b>Discharge Date:</b> {invoice_data.get('discharge_date', 'N/A')}<br/>"
                f"<b>Care Center:</b> {invoice_data.get('care_center', 'N/A')}<br/>"
                f"<b>Room Type:</b> {invoice_data.get('room_type', 'N/A')}<br/>"
                f"<b>Bed Number:</b> {invoice_data.get('bed_number', 'N/A')}",
                styles['Normal']
            )
        ]
    ]
    
    patient_visit_table = Table(patient_visit_data, colWidths=[9*cm, 9*cm])
    patient_visit_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f0f8f0')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#2E7D32')),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cccccc')),
        ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#2E7D32')),
        ('LEFTPADDING', (0, 1), (-1, -1), 10),
        ('RIGHTPADDING', (0, 1), (-1, -1), 10),
        ('TOPPADDING', (0, 1), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 10),
    ]))
    elements.append(patient_visit_table)
    elements.append(Spacer(1, 0.5*cm))
    
    # ========================
    # SERVICE / PRODUCT DETAILS TABLE
    # ========================
    elements.append(Paragraph("SERVICE / PRODUCT DETAILS", section_heading_style))
    elements.append(Spacer(1, 0.2*cm))
    
    services = invoice_data.get('services', [])
    
    # Table headers
    service_data = [
        ['Sl\nNo', 'Service / Product Name', 'Provider', 'Unit\nPrice\n(₹)', 'Qty', 'Discount\n(₹)', 'Tax\n(₹)', 'Total\nAmount\n(₹)']
    ]
    
    # Add service rows
    for idx, service in enumerate(services, 1):
        service_data.append([
            str(idx),
            service.get('service_name', 'N/A'),
            service.get('provider', '-'),
            f"{float(service.get('price', 0)):,.2f}",
            str(service.get('quantity', 1)),
            f"{float(service.get('discount', 0)):,.2f}",
            f"{float(service.get('tax_amount', 0)):,.2f}",
            f"{float(service.get('amount', 0)):,.2f}",
        ])
    
    service_table = Table(
        service_data,
        colWidths=[0.8*cm, 5.5*cm, 3*cm, 1.8*cm, 1*cm, 1.5*cm, 1.5*cm, 2*cm]
    )
    service_table.setStyle(TableStyle([
        # Header row styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E7D32')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        
        # Data rows styling
        ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # Sl No
        ('ALIGN', (1, 1), (2, -1), 'LEFT'),    # Name, Provider
        ('ALIGN', (3, 1), (-1, -1), 'RIGHT'),  # All currency columns
        ('ALIGN', (4, 1), (4, -1), 'CENTER'),  # Qty
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        
        # Grid and borders
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#2E7D32')),
        
        # Alternating row colors
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
    ]))
    elements.append(service_table)
    elements.append(Spacer(1, 0.5*cm))
    
    # ========================
    # BILLING SUMMARY (RIGHT ALIGNED BOX)
    # ========================
    subtotal = invoice_data.get('subtotal', 0)
    discount = invoice_data.get('discount', 0)
    tax = invoice_data.get('tax', 0)
    grand_total = invoice_data.get('total_amount', 0)
    
    summary_data = [
        ['Sub Total:', format_currency(subtotal)],
        ['Discount:', format_currency(discount)],
        ['Tax:', format_currency(tax)],
        ['', ''],  # Divider
        ['GRAND TOTAL:', format_currency(grand_total)],
    ]
    
    summary_table = Table(summary_data, colWidths=[11*cm, 4*cm])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 3), 'Helvetica'),
        ('FONTNAME', (0, 4), (-1, 4), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 3), 11),
        ('FONTSIZE', (0, 4), (-1, 4), 14),
        ('TEXTCOLOR', (0, 0), (-1, 3), colors.black),
        ('TEXTCOLOR', (0, 4), (-1, 4), colors.HexColor('#2E7D32')),
        ('LINEABOVE', (0, 4), (-1, 4), 2, colors.HexColor('#2E7D32')),
        ('TOPPADDING', (0, 4), (-1, 4), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 3), 6),
        ('TOPPADDING', (0, 0), (-1, 3), 6),
        ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#f0f8f0')),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor('#2E7D32')),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.3*cm))
    
    # Amount in Words
    amount_words = number_to_words(grand_total)
    elements.append(Paragraph(
        f"<b>Amount in Words:</b> {amount_words}",
        ParagraphStyle('AmountWords', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#333333'))
    ))
    elements.append(Spacer(1, 0.5*cm))
    
    # ========================
    # PAYMENT & STATUS SECTION
    # ========================
    status_data = [
        [
            Paragraph(f"<b>Invoice Status:</b> {invoice_data.get('status', 'Invoiced')}", styles['Normal']),
            Paragraph(f"<b>Payment Mode:</b> {invoice_data.get('payment_mode', 'N/A')}", styles['Normal'])
        ]
    ]
    
    if invoice_data.get('notes'):
        status_data.append([
            Paragraph(f"<b>Notes:</b> {invoice_data.get('notes', '')}", styles['Normal']),
            ''
        ])
    
    status_table = Table(status_data, colWidths=[9*cm, 9*cm])
    status_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(status_table)
    elements.append(Spacer(1, 1*cm))
    
    # ========================
    # SIGNATURE SECTION
    # ========================
    signature_data = [
        [
            Paragraph("<b>Patient / Attender Signature</b><br/><br/><br/>_____________________", styles['Normal']),
            Paragraph("<b>Authorized Signature</b><br/><br/><br/>_____________________<br/>(Hospital Seal)", styles['Normal'])
        ]
    ]
    
    signature_table = Table(signature_data, colWidths=[9*cm, 9*cm])
    signature_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    elements.append(signature_table)
    
    # Build PDF with custom header and footer
    header_footer = InvoiceHeaderFooter(invoice_data)
    
    def add_pages(canvas, doc):
        """Add header and footer to all pages"""
        header_footer.header(canvas, doc)
        header_footer.footer(canvas, doc)
    
    # Build PDF once with header and footer
    doc.build(elements, onFirstPage=add_pages, onLaterPages=add_pages)
    
    # CRITICAL: Seek to beginning of buffer before reading
    buffer.seek(0)
    
    # Get PDF bytes
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes


def generate_invoice_filename(invoice_id: str) -> str:
    """Generate filename for invoice PDF"""
    return f"Invoice_{invoice_id}.pdf"
