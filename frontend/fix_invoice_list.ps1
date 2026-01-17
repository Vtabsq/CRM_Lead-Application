# Fix corrupted InvoiceList.jsx file
$filePath = "c:\Users\ragul\OneDrive\Dokumen\CRM_Lead-Application\frontend\src\Invoice\InvoiceList.jsx"

# Read the file
$content = Get-Content $filePath -Raw

# The correct functions to insert
$correctFunctions = @"
    const handleDownloadCSV = () => {
        if (invoices.length === 0) {
            alert('No invoices to download');
            return;
        }
        const headers = ['Invoice Date', 'Patient Name', 'Patient ID', 'Invoice Ref', 'Visit ID', 'Care Center', 'Provider', 'Status', 'Total Amount'];
        const rows = invoices.map(inv => [
            inv.invoice_date || '',
            inv.patient_name || '',
            inv.patient_id || '',
            inv.invoice_id || '',
            inv.visit_id || '',
            inv.care_center || '',
            inv.provider || '',
            inv.status || '',
            inv.total_amount || '0'
        ]);
        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"`+"`$`{cell`}`"+"`").join(',') + '\n';
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `invoices_`+"`$`{new Date().toISOString().split('T')[0]`}"+`.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportExcel = () => {
        if (invoices.length === 0) {
            alert('No invoices to export');
            return;
        }
        const headers = ['Invoice Date', 'Patient Name', 'Patient ID', 'Invoice Ref', 'Visit ID', 'Care Center', 'Provider', 'Status', 'Total Amount'];
        const rows = invoices.map(inv => [
            inv.invoice_date || '',
            inv.patient_name || '',
            inv.patient_id || '',
            inv.invoice_id || '',
            inv.visit_id || '',
            inv.care_center || '',
            inv.provider || '',
            inv.status || '',
            inv.total_amount || '0'
        ]);
        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"`+"`$`{cell`}`"+"`").join(',') + '\n';
        });
        const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `invoices_`+"`$`{new Date().toISOString().split('T')[0]`}"+`.xlsx`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePatientSelect
"@

# Find and replace the corrupted line using regex
# Match from "const handleDownloadCSV" to "const handlePatientSelect"
$pattern = '    const handleDownloadCSV.*?const handlePatientSelect'
$content = $content -replace $pattern, $correctFunctions

# Write back to file
$content | Set-Content $filePath -NoNewline

Write-Host "File fixed successfully!"
