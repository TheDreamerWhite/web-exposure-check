import type { AgencyProfileForm } from "@/lib/scans/types";
import type { BusinessSecurityReport } from "./types";

type PdfExportInput = {
  report: BusinessSecurityReport;
  scanDate: string;
  customerName?: string | null;
  agencyProfile?: Partial<AgencyProfileForm> | null;
};

function sanitizePdfText(value: string) {
  return value
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(value: string, maxLength = 92) {
  const words = value.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

function makeTextLines(input: PdfExportInput) {
  const agencyName = input.agencyProfile?.agency_name || "Web Exposure Check";
  const agencyEmail = input.agencyProfile?.agency_email || "";
  const agencyWebsite = input.agencyProfile?.agency_website || "";
  const lines = [
    "Web Exposure Check Security Report",
    `Prepared by: ${agencyName}`,
    agencyEmail ? `Contact: ${agencyEmail}` : "",
    agencyWebsite ? `Website: ${agencyWebsite}` : "",
    "",
    `Domain: ${input.report.domain}`,
    input.customerName ? `Customer: ${input.customerName}` : "",
    `Scan date: ${input.scanDate}`,
    `Language: ${input.report.language}`,
    `Score: ${input.report.score}/100`,
    `Risk level: ${input.report.riskLevel}`,
    "",
    "Executive summary",
    input.report.summary,
    "",
    "Findings",
  ].filter(Boolean);

  input.report.findings.forEach((finding) => {
    lines.push("");
    lines.push(`${finding.passed ? "Passed" : "Needs attention"}: ${finding.title}`);
    lines.push(`Status: ${finding.status}`);
    lines.push(`Business impact: ${finding.businessImpact}`);
    lines.push(`Fix owner: ${finding.responsibleOwner}`);
    lines.push(`Fix difficulty: ${finding.fixDifficulty}`);
    lines.push(`Estimated fix time: ${finding.estimatedFixTime}`);
    lines.push(`Fix steps: ${finding.fixSteps.join(" ")}`);
    lines.push(`Technician note: ${finding.copyForTechnician.replace(/\n/g, " ")}`);
  });

  return lines.flatMap((line) => (line ? wrapText(line) : [""]));
}

export function downloadReportPdf(input: PdfExportInput) {
  const textLines = makeTextLines(input);
  const pageWidth = 612;
  const pageHeight = 792;
  const left = 54;
  const top = 744;
  const lineHeight = 14;
  const linesPerPage = Math.floor((top - 54) / lineHeight);
  const pages: string[][] = [];

  for (let i = 0; i < textLines.length; i += linesPerPage) {
    pages.push(textLines.slice(i, i + linesPerPage));
  }

  const objects: string[] = [];
  const pageRefs: number[] = [];
  const fontObjectNumber = 3;

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "";
  objects[fontObjectNumber] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  pages.forEach((pageLines, index) => {
    const pageObjectNumber = 4 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    pageRefs.push(pageObjectNumber);

    const text = pageLines
      .map((line, lineIndex) => {
        const y = top - lineIndex * lineHeight;

        return `BT /F1 10 Tf ${left} ${y} Td (${sanitizePdfText(line)}) Tj ET`;
      })
      .join("\n");

    objects[pageObjectNumber] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    objects[contentObjectNumber] =
      `<< /Length ${text.length} >>\nstream\n${text}\nendstream`;
  });

  objects[2] =
    `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    if (!object) return;

    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  const maxObject = objects.length - 1;
  pdf += `xref\n0 ${maxObject + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= maxObject; i += 1) {
    const offset = offsets[i] || 0;
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${maxObject + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${input.report.domain}-security-report.pdf`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 100);
}
