import { jsPDF } from 'jspdf';
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

export const generateInvoicePDF = async (invoiceData) => {
    try {
        console.log('=== Starting Invoice PDF Generation ===');
        console.log('Invoice Data:', invoiceData);
        console.log('Invoice ID:', invoiceData?.invoice_id);
        console.log('Patient Name:', invoiceData?.patient_name);

        if (!invoiceData) {
            throw new Error('No invoice data provided');
        }

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
            console.warn("Logo load failed, using fallback", e);
            // Fallback text if logo fails
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(50, 50, 50);
            doc.text("GRAND WORLD ELDER CARE", 15, 20);
        }

        // --- 3. TITLE ---
        // "INVOICE", Center, Bigger, Light Gray
        const titleY = 60;
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60); // Soft Black/Gray
        doc.text("INVOICE", pageWidth / 2, titleY, { align: "center" });

        // Invoice Number and Date (Right aligned)
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(`Invoice #: ${invoiceData.invoice_id || invoiceData.invoice_ref || 'N/A'}`, pageWidth - 15, titleY + 10, { align: "right" });
        doc.text(`Date: ${invoiceData.invoice_date || new Date().toLocaleDateString()}`, pageWidth - 15, titleY + 15, { align: "right" });
        doc.text(`Visit ID: ${invoiceData.visit_id || 'N/A'}`, pageWidth - 15, titleY + 20, { align: "right" });

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

        // Patient/Bill To Details
        const billToDetails = [
            ["Patient Name", invoiceData.patient_name || findVal(invoiceData, ['patientname', 'name']) || '-'],
            ["Patient ID", invoiceData.patient_id || findVal(invoiceData, ['patientid', 'memberidkey', 'memberid']) || '-'],
            ["Mobile Number", findVal(invoiceData, ['mobilenumber', 'mobile_number', 'mobile', 'phone']) || '-'],
            ["Email", findVal(invoiceData, ['emailid', 'email_id', 'email']) || '-'],
            ["Care Center", invoiceData.care_center || findVal(invoiceData, ['carecenter']) || '-'],
        ];

        let startY = titleY + 30;

        // BILL TO TABLE
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("BILL TO", 15, startY - 2);

        doc.autoTable({
            startY: startY,
            head: [['Field', 'Value']],
            body: billToDetails,
            theme: 'grid',
            headStyles: { fillColor: [70, 70, 70], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', width: 60 } },
            margin: { left: 15, right: 15 }
        });

        startY = doc.lastAutoTable.finalY + 10;

        // --- 5. SERVICE ITEMS TABLE ---
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("SERVICE DETAILS", 15, startY - 2);

        const formatCurrency = (val) => `₹ ${Number(val || 0).toLocaleString()}`;

        // Service items from invoice data
        const services = invoiceData.services || [];
        const serviceRows = services.map((service, index) => [
            index + 1,
            service.service_name || '-',
            service.provider || '-',
            service.perform_date || '-',
            formatCurrency(service.price),
            service.quantity || 1,
            `${service.discount || 0}%`,
            service.tax_type || 'Non-taxable',
            formatCurrency(service.amount)
        ]);

        // If no services, show a placeholder
        if (serviceRows.length === 0) {
            serviceRows.push([
                1,
                invoiceData.service_name || 'General Service',
                invoiceData.provider || '-',
                invoiceData.perform_date || '-',
                formatCurrency(invoiceData.price || 0),
                invoiceData.quantity || 1,
                `${invoiceData.discount || 0}%`,
                invoiceData.tax_type || 'Non-taxable',
                formatCurrency(invoiceData.amount || invoiceData.total_amount || 0)
            ]);
        }

        doc.autoTable({
            startY: startY,
            head: [['#', 'Service', 'Provider', 'Date', 'Price', 'Qty', 'Disc', 'Tax', 'Amount']],
            body: serviceRows,
            theme: 'striped',
            headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold', fontSize: 8 },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 35 },
                2: { cellWidth: 25 },
                3: { cellWidth: 22 },
                4: { cellWidth: 20, halign: 'right' },
                5: { cellWidth: 12, halign: 'center' },
                6: { cellWidth: 15, halign: 'center' },
                7: { cellWidth: 25 },
                8: { cellWidth: 22, halign: 'right' }
            },
            margin: { left: 15, right: 15 }
        });

        startY = doc.lastAutoTable.finalY + 10;

        // --- 6. BILLING SUMMARY ---
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("BILLING SUMMARY", 15, startY - 2);

        const subtotal = services.reduce((sum, s) => sum + (Number(s.amount) || 0), 0) || Number(invoiceData.total_amount || 0);
        const taxTotal = services.reduce((sum, s) => sum + (Number(s.tax_amount) || 0), 0);
        const grandTotal = invoiceData.total_amount || subtotal;

        const billingRows = [
            ["Subtotal", formatCurrency(subtotal)],
            ["Tax", formatCurrency(taxTotal)],
        ];

        // Add Grand Total Row
        billingRows.push([
            { content: "GRAND TOTAL", styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
            { content: formatCurrency(grandTotal), styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }
        ]);

        doc.autoTable({
            startY: startY,
            head: [['Description', 'Amount']],
            body: billingRows,
            theme: 'striped',
            headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: {
                0: { fontStyle: 'bold' },
                1: { halign: 'right' }
            },
            margin: { left: 15, right: 15 }
        });

        startY = doc.lastAutoTable.finalY + 10;

        // Amount in Words
        const numberToWords = (num) => {
            const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
                'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
                'Seventeen', 'Eighteen', 'Nineteen'];
            const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

            if (num === 0) return 'Zero';
            num = Math.floor(num);
            if (num < 20) return ones[num];
            if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 === 0 ? '' : ' ' + ones[num % 10]);
            if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 === 0 ? '' : ' and ' + numberToWords(num % 100));
            if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 === 0 ? '' : ' ' + numberToWords(num % 1000));
            if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 === 0 ? '' : ' ' + numberToWords(num % 100000));
            return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 === 0 ? '' : ' ' + numberToWords(num % 10000000));
        };

        const amountWords = numberToWords(grandTotal) + " Rupees Only";
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text("Amount in Words:", 15, startY);
        doc.setFont("helvetica", "italic");
        doc.text(amountWords, 15, startY + 5);

        // --- 7. PAYMENT STATUS ---
        startY += 15;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        const status = invoiceData.status || 'Invoiced';
        const statusColor = status === 'Paid' ? [34, 139, 34] : status === 'Invoiced' ? [255, 140, 0] : [200, 0, 0];
        doc.setTextColor(...statusColor);
        doc.text(`Payment Status: ${status}`, 15, startY);

        // --- 8. FOOTER ---
        const footerY = doc.internal.pageSize.height - 30;

        // Left: Disclaimer
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        const disclaimer = "This invoice is generated electronically from the CRM system of\nGrand World Elder Care. For any queries, please contact the billing department.";
        doc.text(disclaimer, 15, footerY);

        // Right: Signature
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("__________________________", pageWidth - 15, footerY, { align: "right" });
        doc.text("Authorized Signature", pageWidth - 15, footerY + 5, { align: "right" });

        // Terms & Conditions
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text("Terms: Payment due within 30 days. Late payments may incur additional charges.", 15, footerY + 15);

        // Save
        const fileName = `Invoice_${invoiceData.invoice_id || invoiceData.invoice_ref || 'Unknown'}_${invoiceData.patient_id || 'Patient'}.pdf`;
        doc.save(fileName);
    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        throw error; // Re-throw so the calling code can handle it
    }
};
