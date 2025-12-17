import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper to load image
const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
};

export const generateDischargeSummary = async (patientData, billingData, totals) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- 1. WATERMARK ---
    // "GRAND WORLD ELDER CARE", Center, Diagonal, Light Opacity
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.08 }));
    doc.setFontSize(40);
    doc.setTextColor(150, 150, 150);
    doc.text("GRAND WORLD ELDER CARE", pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45
    });
    doc.restoreGraphicsState();

    // --- 2. HEADER ---
    // Left: Logo
    // Below Logo: Tagline
    // Right of Logo (Left aligned): GRAND WORLD ELDER CARE

    try {
        const logoImg = await loadImage('/grand_world_logo.png');
        // Logo dimensions
        const logoW = 25;
        const logoH = 25;
        const marginX = 15;
        const marginY = 10;

        doc.addImage(logoImg, 'PNG', marginX, marginY, logoW, logoH);

        // Hospital Name (Right of logo, left aligned)
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50); // Dark Gray
        doc.text("GRAND WORLD", marginX + logoW + 5, marginY + 10);
        doc.text("ELDER CARE", marginX + logoW + 5, marginY + 20);

        // Tagline (Below logo)
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text("Assisted Living • Clinics • Home Nursing", marginX, marginY + logoH + 5);
        doc.text("Compassionate Care | Safe Living | 24×7 Support", marginX, marginY + logoH + 10);

    } catch (e) {
        console.error("Logo load failed", e);
        // Fallback text if logo fails
        doc.setFontSize(20);
        doc.text("GRAND WORLD ELDER CARE", 15, 20);
    }

    // --- 3. TITLE ---
    // "CRM DISCHARGE SUMMARY", Center, Bigger, Light Gray
    const titleY = 60;
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60); // Soft Black/Gray
    doc.text("CRM DISCHARGE SUMMARY", pageWidth / 2, titleY, { align: "center" });

    // --- 4. DATA PREP ---
    // Helper to extract nested values safely
    const findVal = (obj, keys) => {
        if (!obj) return '-';
        const normObj = {};
        Object.keys(obj).forEach(k => {
            normObj[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = obj[k];
        });
        for (let k of keys) {
            const val = normObj[k.toLowerCase().replace(/[^a-z0-9]/g, '')];
            if (val) return String(val).trim();
        }
        return '-';
    };

    // Patient Details
    const pDetails = [
        ["Member ID", findVal(patientData, ['memberidkey', 'memberid'])],
        ["Patient Name", findVal(patientData, ['patientname', 'name', 'patient_name', 'firstname'])],
        ["Gender", findVal(patientData, ['gender', 'sex'])],
        ["Date of Birth", findVal(patientData, ['dob', 'dateofbirth'])],
        ["Age", findVal(patientData, ['age'])],
        ["Blood Group", findVal(patientData, ['bloodgroup', 'blood'])],
        ["Marital Status", findVal(patientData, ['maritalstatus', 'marital'])],
        ["Nationality", "Indian"], // Hardcoded as per request request implied standard
        ["Religion", "Hindu"]     // Hardcoded as per request example
    ];

    // Admission Details
    const checkIn = findVal(patientData, ['checkindate', 'admissiondate']);
    const checkOut = findVal(patientData, ['checkoutdate', 'dischargedate']) || new Date().toISOString().split('T')[0];
    const days = billingData.days || 1;

    const aDetails = [
        ["Check-In Date", checkIn],
        ["Discharge Date", checkOut],
        ["Total Stay", `${days} Days`],
        ["Care Type", "Assisted Living"], // Standardized
        ["Primary Care", "24x7 Caretaker Support"]
    ];

    let startY = titleY + 15;

    // PATIENT DETAILS TABLE
    doc.autoTable({
        startY: startY,
        head: [['Field', 'Value']],
        body: pDetails,
        theme: 'grid',
        headStyles: { fillColor: [70, 70, 70], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', width: 60 } },
        margin: { left: 15, right: 15 }
    });

    startY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("ADMISSION & CARE DETAILS", 15, startY - 2);

    // ADMISSION TABLE
    doc.autoTable({
        startY: startY,
        head: [['Field', 'Value']],
        body: aDetails,
        theme: 'grid',
        headStyles: { fillColor: [100, 100, 100], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', width: 60 } },
        margin: { left: 15, right: 15 }
    });

    startY = doc.lastAutoTable.finalY + 10;
    doc.text("BILLING SUMMARY", 15, startY - 2);

    // BILLING TABLE
    const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString()}`;

    const billingRows = [
        [`Room Charge (${days} days)`, formatCurrency(totals.room)],
        ["Bed Charge", formatCurrency(totals.bed)],
        ["Nurse Fee", formatCurrency(totals.nurse)],
        ["Hospital Service Fee", formatCurrency(totals.hospital)],
        ["Doctor Consultation", formatCurrency(totals.doctor)],
        ["Service Charge", formatCurrency(totals.service)],
    ];
    // Add Grand Total Row
    billingRows.push([{ content: "GRAND TOTAL", styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, { content: formatCurrency(totals.grand), styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }]);

    doc.autoTable({
        startY: startY,
        head: [['Description', 'Amount']],
        body: billingRows,
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
        margin: { left: 15, right: 15 }
    });

    // --- 5. FOOTER ---
    const footerY = doc.internal.pageSize.height - 30;

    // Left: Disclaimer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const disclaimer = "This discharge summary is generated electronically from the CRM system of\nGrand World Elder Care. For any queries, please contact the administration office.";
    doc.text(disclaimer, 15, footerY);

    // Right: Signature
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("__________________________", pageWidth - 15, footerY, { align: "right" });
    doc.text("Admission Team", pageWidth - 15, footerY + 5, { align: "right" });

    // Save
    doc.save(`Discharge_Summary_${findVal(patientData, ['memberidkey', 'memberid'])}.pdf`);
};
