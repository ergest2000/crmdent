import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/hooks/use-toast";

interface ExportColumn {
  header: string;
  key: string;
  align?: "left" | "right" | "center";
}

interface ExportConfig {
  title: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  filename: string;
}

export function exportCSV({ columns, data, filename }: ExportConfig) {
  if (data.length === 0) {
    toast({ title: "Nuk ka të dhëna për eksportim", variant: "destructive" });
    return;
  }
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) =>
    columns.map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`)
  );
  const bom = "\uFEFF";
  const csv = bom + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast({ title: "CSV u shkarkua", description: `${filename}.csv` });
}

export function exportPDF({ title, columns, data, filename }: ExportConfig) {
  if (data.length === 0) {
    toast({ title: "Nuk ka të dhëna për eksportim", variant: "destructive" });
    return;
  }
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text(title, 14, 18);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Eksportuar: ${new Date().toLocaleDateString("sq-AL")} ${new Date().toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}`, 14, 24);

  const head = [columns.map((c) => c.header)];
  const body = data.map((row) => columns.map((c) => String(row[c.key] ?? "")));

  autoTable(doc, {
    startY: 30,
    head,
    body,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [55, 65, 81], fontSize: 8, fontStyle: "bold" },
    columnStyles: Object.fromEntries(
      columns.map((c, i) => [i, { halign: c.align || "left" }])
    ),
    alternateRowStyles: { fillColor: [248, 248, 248] },
  });

  doc.save(`${filename}.pdf`);
  toast({ title: "PDF u shkarkua", description: `${filename}.pdf` });
}
