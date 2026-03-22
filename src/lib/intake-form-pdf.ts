import jsPDF from "jspdf";
import type { IntakeFormData } from "@/stores/intake-form-store";

// Colors
const PRIMARY: [number, number, number] = [41, 98, 155];
const DARK: [number, number, number] = [33, 37, 41];
const GRAY: [number, number, number] = [108, 117, 125];
const LIGHT_BG: [number, number, number] = [245, 247, 250];
const BORDER: [number, number, number] = [222, 226, 230];
const WHITE: [number, number, number] = [255, 255, 255];
const GREEN: [number, number, number] = [76, 175, 80];
const AMBER: [number, number, number] = [255, 193, 7];
const RED: [number, number, number] = [244, 67, 54];

type RGB = [number, number, number];

export function exportIntakeFormPDF(
  form: IntakeFormData,
  clinicName = "DenteOS Dental Clinic",
  clinicContact = "",
  clinicAddress = ""
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const MARGIN = 14;
  const CONTENT_W = W - MARGIN * 2;
  let y = 0;

  const setColor = (rgb: RGB) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  const setDrawColor = (rgb: RGB) => doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
  const setFillColor = (rgb: RGB) => doc.setFillColor(rgb[0], rgb[1], rgb[2]);

  const checkPage = (needed: number) => {
    if (y + needed > 280) {
      doc.addPage();
      y = 14;
    }
  };

  // ── HEADER ──
  y = 14;
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  setColor(PRIMARY);
  doc.text(clinicName, MARGIN, y);
  y += 5;

  if (clinicAddress || clinicContact) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setColor(GRAY);
    const parts = [clinicAddress, clinicContact].filter(Boolean);
    doc.text(parts.join("  |  "), MARGIN, y);
    y += 4;
  }

  // Header line
  y += 2;
  setDrawColor(PRIMARY);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 6;

  // Document title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  setColor(DARK);
  doc.text("Formulari i Aplikimit - Pacienti", MARGIN, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setColor(GRAY);
  doc.text(
    `Krijuar: ${new Date(form.createdAt).toLocaleDateString("sq-AL")}  |  Përditësuar: ${new Date(form.updatedAt).toLocaleDateString("sq-AL")}`,
    MARGIN,
    y
  );
  y += 8;

  // ── HELPERS ──
  const drawSectionHeader = (num: number, title: string) => {
    checkPage(20);
    const badgeX = MARGIN;
    const badgeSize = 6;
    setFillColor(PRIMARY);
    doc.roundedRect(badgeX, y - 4.5, badgeSize, badgeSize, 1, 1, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    setColor(WHITE);
    doc.text(String(num), badgeX + badgeSize / 2, y - 1, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    setColor(DARK);
    doc.text(title, badgeX + badgeSize + 3, y);
    y += 5;
  };

  const drawCheckbox = (x: number, yPos: number, checked: boolean) => {
    const size = 3.5;
    setDrawColor(checked ? PRIMARY : BORDER);
    setFillColor(WHITE);
    doc.setLineWidth(0.3);
    doc.rect(x, yPos - size + 0.5, size, size, "FD");
    if (checked) {
      setDrawColor(PRIMARY);
      doc.setLineWidth(0.5);
      doc.line(x + 0.6, yPos - size + 1.1, x + size - 0.6, yPos - 0.1);
      doc.line(x + size - 0.6, yPos - size + 1.1, x + 0.6, yPos - 0.1);
    }
  };

  const fieldRow = (label: string, value: string, xOffset = 0) => {
    checkPage(6);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    setColor(GRAY);
    doc.text(label + ":", MARGIN + 4 + xOffset, y);
    doc.setFont("helvetica", "normal");
    setColor(DARK);
    const labelW = doc.getTextWidth(label + ": ");
    doc.text(value || "—", MARGIN + 4 + xOffset + labelW, y);
    y += 4.5;
  };

  const checkboxRow = (label: string, checked: boolean, details?: string) => {
    checkPage(6);
    drawCheckbox(MARGIN + 4, y, checked);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setColor(DARK);
    doc.text(label, MARGIN + 10, y);
    if (checked && details) {
      setColor(PRIMARY);
      const arrow = "  \u2192  ";
      doc.text(arrow + details, MARGIN + 10 + doc.getTextWidth(label), y);
    }
    y += 5;
  };

  const startBox = () => {
    setFillColor(LIGHT_BG);
    setDrawColor(BORDER);
    doc.setLineWidth(0.3);
    // We'll draw the box after content, but we need the start Y
    return y;
  };

  const endBox = (startY: number) => {
    // Draw background rect behind content (we use the internal page to draw under)
    // Since jsPDF draws in order, we'll use a light bottom border instead
    setDrawColor(BORDER);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y + 1, W - MARGIN, y + 1);
    y += 5;
  };

  // ── SECTION 1: Personal Data ──
  drawSectionHeader(1, "Të Dhënat Personale");
  fieldRow("Emri", `${form.firstName} ${form.lastName}`);
  fieldRow("Datëlindja", form.dateOfBirth || "—");
  fieldRow("Gjinia", form.gender === "M" ? "Mashkull" : form.gender === "F" ? "Femër" : "—");
  fieldRow("Telefoni", form.phone);
  fieldRow("Email", form.email);
  fieldRow("Adresa", `${form.address || "—"}, ${form.city || "—"}`);
  fieldRow("Kontakt emergjence", form.emergencyContact);
  checkboxRow("Pranoj të marr njoftime", form.acceptNotifications);
  y += 3;

  // ── SECTION 2: Visit Reason ──
  drawSectionHeader(2, "Arsyeja e Vizitës");
  if (form.visitReasonTags.length > 0) {
    fieldRow("Kategoritë", form.visitReasonTags.join(", "));
  }
  fieldRow("Përshkrimi", form.visitReason);
  y += 3;

  // ── SECTION 3: Medical History ──
  drawSectionHeader(3, "Anamneza Mjekësore");
  checkboxRow("Sëmundje kardiovaskulare", form.cardiovascular, form.cardiovascularDetails);
  checkboxRow("Diabet", form.diabetes, form.diabetesDetails);
  checkboxRow("Probleme respiratore", form.respiratory, form.respiratoryDetails);
  checkboxRow("Probleme me koagulimin", form.coagulation, form.coagulationDetails);
  checkboxRow("Sëmundje infektive", form.infectious, form.infectiousDetails);
  checkboxRow("Alergji", form.allergies, form.allergiesDetails);
  y += 3;

  // ── SECTION 4: Medications ──
  drawSectionHeader(4, "Medikamente");
  checkboxRow("Antikoagulantë", form.anticoagulants, form.anticoagulantsDetails);
  checkboxRow("Bifosfonate", form.bisphosphonates, form.bisphosphonatesDetails);
  checkboxRow("Medikamente aktuale", form.currentMedication, form.currentMedicationDetails);
  checkboxRow("Alergji ndaj ilaçeve", form.drugAllergy, form.drugAllergyDetails);
  y += 3;

  // ── SECTION 5: Lifestyle ──
  drawSectionHeader(5, "Stil Jete & Zakone");
  checkboxRow("Duhan / Vape", form.smoking, form.smokingDetails);
  checkboxRow("Alkool", form.alcohol, form.alcoholDetails);
  fieldRow("Higjiena orale (herë/ditë)", form.oralHygiene);
  y += 3;

  // ── SECTION 6: Special Status ──
  drawSectionHeader(6, "Status i Veçantë");
  checkboxRow("Shtatzënë", form.pregnant);
  if (form.pregnant) {
    fieldRow("Tremujori", form.trimester, 6);
  }
  checkboxRow("Ushqen me gji", form.breastfeeding);
  y += 3;

  // ── SECTION 7: Clinical ──
  drawSectionHeader(7, "Informacion Klinik");
  fieldRow("Kohëzgjatja e problemit", form.problemDuration);
  fieldRow("Nivel dhimbje", `${form.painLevel} / 10`);

  // Pain bar
  checkPage(8);
  const barX = MARGIN + 4;
  const barW = 80;
  const barH = 3;
  setFillColor(BORDER);
  doc.roundedRect(barX, y - 1, barW, barH, 1, 1, "F");
  const painColor: RGB = form.painLevel <= 3 ? GREEN : form.painLevel <= 6 ? AMBER : RED;
  setFillColor(painColor);
  if (form.painLevel > 0) {
    doc.roundedRect(barX, y - 1, barW * (form.painLevel / 10), barH, 1, 1, "F");
  }
  y += 5;

  fieldRow("Vërejtje shtesë", form.additionalNotes);
  y += 3;

  // ── SECTION 8: Consent ──
  drawSectionHeader(8, "Dokumente & Konsent");
  checkboxRow("Pranim GDPR", form.consentGDPR);
  checkboxRow("Konsent për trajtim", form.consentTreatment);
  checkboxRow("Konsent për komunikim", form.consentCommunication);
  y += 3;

  // ── SIGNATURE FOOTER ──
  checkPage(50);
  y += 3;
  setDrawColor(BORDER);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 8;

  if (form.signatureData) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setColor(GRAY);
    doc.text("Firma e Pacientit:", MARGIN, y);
    y += 3;
    try {
      doc.addImage(form.signatureData, "PNG", MARGIN, y, 60, 22);
    } catch { /* ignore */ }
    y += 25;
  }

  // Name & date footer
  const colW = CONTENT_W / 2 - 5;
  const col1 = MARGIN;
  const col2 = MARGIN + colW + 10;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setColor(GRAY);
  doc.text("Emër Mbiemër", col1, y);
  doc.text("Data", col2, y);
  y += 5;

  setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.line(col1, y, col1 + colW, y);
  doc.line(col2, y, col2 + colW, y);
  y -= 2;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  setColor(DARK);
  doc.text(`${form.firstName} ${form.lastName}`, col1, y);
  doc.text(new Date().toLocaleDateString("sq-AL"), col2, y);

  doc.save(`formulari-${form.firstName}-${form.lastName}.pdf`);
}
