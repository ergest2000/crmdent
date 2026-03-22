import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { clinicConfig, type FiscalInvoice, formatDateAL, paymentMethodLabelsAL, numberToWordsAL } from "@/lib/invoice-utils";

export function generateInvoicePDF(invoice: FiscalInvoice): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const sym = invoice.currencySymbol || clinicConfig.currencySymbol;
  const cur = invoice.currency || clinicConfig.currency;
  let y = margin;

  // Header - Clinic info
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 148, 136);
  doc.text(clinicConfig.name, margin, y + 6);
  
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text("Klinike Dentare", margin, y + 12);
  doc.text(clinicConfig.address, margin, y + 17);
  doc.text(`Tel: ${clinicConfig.phone} | Email: ${clinicConfig.email}`, margin, y + 22);
  doc.text(`NIPT: ${clinicConfig.nipt}`, margin, y + 27);

  // Invoice title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 148, 136);
  doc.text("FATURE", pageWidth - margin, y + 6, { align: "right" });
  
  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.text(invoice.invoiceNumber, pageWidth - margin, y + 13, { align: "right" });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Data: ${formatDateAL(invoice.date)}`, pageWidth - margin, y + 20, { align: "right" });
  doc.text(`Ora: ${invoice.time}`, pageWidth - margin, y + 25, { align: "right" });
  doc.text(`Afati: ${formatDateAL(invoice.dueDate)}`, pageWidth - margin, y + 30, { align: "right" });

  y += 36;
  doc.setDrawColor(13, 148, 136);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Client info box
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(margin, y, (pageWidth - 2 * margin) / 2 - 3, 22, 2, 2, "F");
  doc.roundedRect((pageWidth / 2) + 3, y, (pageWidth - 2 * margin) / 2 - 3, 22, 2, 2, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(150);
  doc.text("BLERESI", margin + 4, y + 5);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text(invoice.patientName, margin + 4, y + 11);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  if (invoice.patientAddress) doc.text(invoice.patientAddress, margin + 4, y + 16);
  if (invoice.patientNipt) doc.text(`NIPT: ${invoice.patientNipt}`, margin + 4, y + 20);

  const rightBoxX = (pageWidth / 2) + 7;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(150);
  doc.text("DETAJE", rightBoxX, y + 5);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Dentist: ${invoice.dentist}`, rightBoxX, y + 11);
  doc.text(`Pagesa: ${paymentMethodLabelsAL[invoice.paymentMethod]}`, rightBoxX, y + 16);
  doc.text(`Monedha: ${cur}`, rightBoxX, y + 20);

  y += 28;

  // Items table
  const tableData = invoice.items.map((item, idx) => [
    (idx + 1).toString(),
    item.description,
    item.quantity.toString(),
    `${item.unitPrice.toFixed(2)}`,
    `${item.vatRate}%`,
    `${item.vatAmount.toFixed(2)}`,
    `${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Pershkrimi", "Sasia", `Cmimi (${sym})`, "TVSH %", "TVSH", "Total"]],
    body: tableData,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [13, 148, 136],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 9, textColor: 50 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      2: { halign: "center", cellWidth: 15 },
      3: { halign: "right", cellWidth: 22 },
      4: { halign: "right", cellWidth: 18 },
      5: { halign: "right", cellWidth: 20 },
      6: { halign: "right", cellWidth: 22, fontStyle: "bold" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Totals
  const totalsX = pageWidth - margin - 60;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Nentotali:", totalsX, y);
  doc.text(`${sym}${invoice.subtotal.toFixed(2)}`, pageWidth - margin, y, { align: "right" });
  
  y += 5;
  doc.text(`TVSH (${clinicConfig.vatRate}%):`, totalsX, y);
  doc.text(`${sym}${invoice.vatAmount.toFixed(2)}`, pageWidth - margin, y, { align: "right" });

  y += 2;
  doc.setDrawColor(13, 148, 136);
  doc.setLineWidth(0.8);
  doc.line(totalsX, y, pageWidth - margin, y);
  y += 5;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 148, 136);
  doc.text("TOTAL:", totalsX, y);
  doc.text(`${sym}${invoice.total.toFixed(2)}`, pageWidth - margin, y, { align: "right" });

  if (invoice.paid > 0 && invoice.paid < invoice.total) {
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129);
    doc.text("Paguar:", totalsX, y);
    doc.text(`-${sym}${invoice.paid.toFixed(2)}`, pageWidth - margin, y, { align: "right" });
    
    y += 5;
    doc.setTextColor(220, 38, 38);
    doc.setFont("helvetica", "bold");
    doc.text("Mbetur:", totalsX, y);
    doc.text(`${sym}${(invoice.total - invoice.paid).toFixed(2)}`, pageWidth - margin, y, { align: "right" });
  }

  y += 10;

  // Amount in words
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 10, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Shuma me fjale: ${numberToWordsAL(invoice.total)} ${cur}`, margin + 4, y + 6);

  y += 16;

  // Bank details
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(150);
  doc.text("TE DHENA BANKARE", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`Banka: ${clinicConfig.bankName}`, margin, y);
  y += 4;
  doc.text(`IBAN: ${clinicConfig.iban}`, margin, y);
  y += 4;
  doc.text(`Perfituesi: ${clinicConfig.name}`, margin, y);

  // Footer
  y = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text("Faleminderit per besimin tuaj! | Shendet te mire!", pageWidth / 2, y, { align: "center" });
  y += 3;
  doc.text(`${clinicConfig.name} | NIPT: ${clinicConfig.nipt} | ${clinicConfig.address}`, pageWidth / 2, y, { align: "center" });
  y += 3;
  doc.text("Kjo fature eshte gjeneruar automatikisht nga sistemi DenteOS CRM", pageWidth / 2, y, { align: "center" });

  return doc;
}

export function downloadInvoicePDF(invoice: FiscalInvoice) {
  const doc = generateInvoicePDF(invoice);
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
