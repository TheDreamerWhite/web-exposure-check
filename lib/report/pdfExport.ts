import type { AgencyProfileForm } from "../scans/types";
import {
  confidenceLabels,
  exposureLabels,
  getVerifiedFinding,
  priorityLabels,
  summarizeVerifiedFindings,
  verificationLabels,
} from "../findings/presentation";
import type {
  FindingPriority,
  VerifiedFinding,
} from "../findings/types";
import type { BusinessSecurityReport, ReportFinding } from "./types";

export type PdfExportInput = {
  report: BusinessSecurityReport;
  scanDate: string;
  customerName?: string | null;
  agencyProfile?: Partial<AgencyProfileForm> | null;
};

type PdfColor = readonly [number, number, number];
type PdfFont = "regular" | "bold";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const PAGE_MARGIN = 44;
const CONTENT_TOP = 62;
const CONTENT_BOTTOM = 746;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

const colors = {
  navy: [0.063, 0.102, 0.157] as PdfColor,
  teal: [0.059, 0.463, 0.431] as PdfColor,
  tealSoft: [0.925, 0.976, 0.969] as PdfColor,
  text: [0.063, 0.102, 0.157] as PdfColor,
  muted: [0.4, 0.439, 0.522] as PdfColor,
  border: [0.894, 0.906, 0.925] as PdfColor,
  surface: [1, 1, 1] as PdfColor,
  surfaceMuted: [0.965, 0.973, 0.984] as PdfColor,
  warning: [0.706, 0.325, 0.035] as PdfColor,
  warningSoft: [1, 0.969, 0.922] as PdfColor,
  danger: [0.706, 0.137, 0.094] as PdfColor,
  dangerSoft: [0.996, 0.941, 0.933] as PdfColor,
  success: [0.082, 0.502, 0.239] as PdfColor,
  successSoft: [0.941, 0.988, 0.957] as PdfColor,
};

const priorityOrder: FindingPriority[] = [
  "fix_today",
  "fix_this_week",
  "needs_more_evidence",
  "schedule_later",
  "monitor",
];

function normalizePdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?")
    .replace(/\?{4,}/g, "???");
}

function escapePdfText(value: string) {
  return normalizePdfText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function approximateTextWidth(value: string, fontSize: number, font: PdfFont) {
  const factor = font === "bold" ? 1.04 : 1;

  return (
    [...normalizePdfText(value)].reduce((width, character) => {
      if (character === " ") return width + fontSize * 0.28;
      if (/[ilI1.,:;'|]/.test(character)) return width + fontSize * 0.25;
      if (/[mwMW@%&]/.test(character)) return width + fontSize * 0.82;
      if (/[A-Z0-9]/.test(character)) return width + fontSize * 0.6;
      return width + fontSize * 0.5;
    }, 0) * factor
  );
}

function wrapTextToWidth(
  value: string,
  width: number,
  fontSize: number,
  font: PdfFont = "regular"
) {
  const paragraphs = normalizePdfText(value).split(/\r?\n/);
  const lines: string[] = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let current = "";

    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;

      if (current && approximateTextWidth(next, fontSize, font) > width) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    });

    if (current) lines.push(current);
    if (paragraphIndex < paragraphs.length - 1) lines.push("");
  });

  return lines.length > 0 ? lines : [""];
}

function formatScanDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Madrid",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function priorityColor(priority: FindingPriority) {
  if (priority === "fix_today") return colors.danger;
  if (priority === "fix_this_week") return colors.warning;
  if (priority === "monitor") return colors.success;
  return colors.teal;
}

function prioritySoftColor(priority: FindingPriority) {
  if (priority === "fix_today") return colors.dangerSoft;
  if (priority === "fix_this_week") return colors.warningSoft;
  if (priority === "monitor") return colors.successSoft;
  return colors.tealSoft;
}

class PdfLayout {
  pages: string[][] = [];
  pageIndex = -1;
  cursorY = CONTENT_TOP;

  constructor() {
    this.addPage();
  }

  get commands() {
    return this.pages[this.pageIndex];
  }

  addPage() {
    this.pages.push([]);
    this.pageIndex += 1;
    this.cursorY = CONTENT_TOP;
  }

  ensureSpace(height: number) {
    if (this.cursorY + height > CONTENT_BOTTOM) {
      this.addPage();
      return true;
    }

    return false;
  }

  rect(
    x: number,
    y: number,
    width: number,
    height: number,
    fill: PdfColor,
    stroke: PdfColor = fill,
    lineWidth = 1
  ) {
    const pdfY = PAGE_HEIGHT - y - height;
    this.commands.push(
      `q ${fill.join(" ")} rg ${stroke.join(" ")} RG ${lineWidth} w ${x} ${pdfY} ${width} ${height} re B Q`
    );
  }

  line(x1: number, y1: number, x2: number, y2: number, color: PdfColor) {
    this.commands.push(
      `q ${color.join(" ")} RG 0.75 w ${x1} ${PAGE_HEIGHT - y1} m ${x2} ${PAGE_HEIGHT - y2} l S Q`
    );
  }

  text(
    value: string,
    x: number,
    y: number,
    fontSize = 9,
    font: PdfFont = "regular",
    color: PdfColor = colors.text
  ) {
    const fontRef = font === "bold" ? "F2" : "F1";
    this.commands.push(
      `BT /${fontRef} ${fontSize} Tf ${color.join(" ")} rg ${x} ${PAGE_HEIGHT - y - fontSize} Td (${escapePdfText(value)}) Tj ET`
    );
  }

  textLines(
    lines: string[],
    x: number,
    y: number,
    options: {
      fontSize?: number;
      lineHeight?: number;
      font?: PdfFont;
      color?: PdfColor;
    } = {}
  ) {
    const fontSize = options.fontSize ?? 9;
    const lineHeight = options.lineHeight ?? fontSize * 1.35;

    lines.forEach((line, index) => {
      this.text(
        line,
        x,
        y + index * lineHeight,
        fontSize,
        options.font,
        options.color
      );
    });

    return lines.length * lineHeight;
  }

  wrappedText(
    value: string,
    x: number,
    y: number,
    width: number,
    options: {
      fontSize?: number;
      lineHeight?: number;
      font?: PdfFont;
      color?: PdfColor;
    } = {}
  ) {
    const fontSize = options.fontSize ?? 9;
    const lines = wrapTextToWidth(value, width, fontSize, options.font);
    const height = this.textLines(lines, x, y, options);

    return { lines, height };
  }
}

function getFindingPriority(finding: ReportFinding, verified?: VerifiedFinding) {
  return verified?.priority || (finding.passed ? "monitor" : "needs_more_evidence");
}

function getFindingPresentation(
  finding: ReportFinding,
  verified?: VerifiedFinding
) {
  const priority = getFindingPriority(finding, verified);

  return {
    priority,
    confidence: verified
      ? confidenceLabels[verified.confidence]
      : "Evidence not stored",
    exposure: verified
      ? exposureLabels[verified.exposure]
      : "External exposure unknown",
    verification: verified
      ? verificationLabels[verified.verificationStatus]
      : finding.passed
        ? "Observed pass"
        : "Not verified",
    source:
      verified?.evidence.map((evidence) => evidence.source).join("; ") ||
      "Source evidence was not stored with this report.",
    evidence:
      verified?.evidence.map((evidence) => evidence.summary).join(" ") ||
      "No structured evidence summary is available for this older report.",
    limitations:
      verified?.limitations.length
        ? verified.limitations.join(" ")
        : "No additional evidence limitations were recorded.",
  };
}

function measureFindingCard(
  finding: ReportFinding,
  verified: VerifiedFinding | undefined,
  width: number
) {
  const innerWidth = width - 28;
  const presentation = getFindingPresentation(finding, verified);
  const titleLines = wrapTextToWidth(finding.title, innerWidth - 118, 13, "bold");
  const impactLines = wrapTextToWidth(finding.businessImpact, innerWidth, 8.5);
  const evidenceLines = wrapTextToWidth(
    `Observation: ${presentation.evidence} Source: ${presentation.source}`,
    innerWidth,
    8
  );
  const limitationLines = wrapTextToWidth(
    `Evidence limitations: ${presentation.limitations}`,
    innerWidth,
    8
  );
  const stepLines = finding.fixSteps.flatMap((step, index) =>
    wrapTextToWidth(`${index + 1}. ${step}`, innerWidth, 8.5)
  );
  const ownerLines = wrapTextToWidth(
    `${finding.responsibleOwner} | ${finding.fixDifficulty} | ${finding.estimatedFixTime}`,
    innerWidth,
    8.5,
    "bold"
  );

  const height =
    176 +
    titleLines.length * 17 +
    impactLines.length * 11.5 +
    ownerLines.length * 11.5 +
    evidenceLines.length * 10.5 +
    limitationLines.length * 10.5 +
    stepLines.length * 11.5;

  return {
    presentation,
    titleLines,
    impactLines,
    evidenceLines,
    limitationLines,
    stepLines,
    ownerLines,
    height,
  };
}

function drawFindingCard(
  layout: PdfLayout,
  finding: ReportFinding,
  verified: VerifiedFinding | undefined
) {
  const card = measureFindingCard(finding, verified, CONTENT_WIDTH);
  const priority = card.presentation.priority;

  layout.ensureSpace(card.height + 10);

  const top = layout.cursorY;
  const x = PAGE_MARGIN;
  const innerX = x + 14;
  const innerWidth = CONTENT_WIDTH - 28;
  const accent = priorityColor(priority);

  layout.rect(x, top, CONTENT_WIDTH, card.height, colors.surface, colors.border);
  layout.rect(x, top, 4, card.height, accent, accent, 0);

  let y = top + 14;
  layout.textLines(card.titleLines, innerX, y, {
    fontSize: 13,
    lineHeight: 17,
    font: "bold",
  });
  layout.rect(
    x + CONTENT_WIDTH - 112,
    y - 2,
    98,
    20,
    prioritySoftColor(priority),
    accent
  );
  layout.text(
    priorityLabels[priority],
    x + CONTENT_WIDTH - 105,
    y + 3,
    7.5,
    "bold",
    accent
  );
  y += card.titleLines.length * 17 + 4;

  layout.text(
    `${finding.statusLabel}: ${finding.status}`,
    innerX,
    y,
    8,
    "bold",
    finding.passed ? colors.success : colors.danger
  );
  y += 22;

  layout.text("BUSINESS IMPACT", innerX, y, 7, "bold", colors.muted);
  y += 12;
  layout.textLines(card.impactLines, innerX, y, {
    fontSize: 8.5,
    lineHeight: 11.5,
    color: colors.text,
  });
  y += card.impactLines.length * 11.5 + 10;

  layout.line(innerX, y, innerX + innerWidth, y, colors.border);
  y += 10;
  layout.text("OWNER | DIFFICULTY | ESTIMATED TIME", innerX, y, 7, "bold", colors.muted);
  y += 12;
  layout.textLines(card.ownerLines, innerX, y, {
    fontSize: 8.5,
    lineHeight: 11.5,
    font: "bold",
  });
  y += card.ownerLines.length * 11.5 + 11;

  layout.rect(innerX, y, innerWidth, 20, colors.surfaceMuted, colors.border);
  layout.text(
    `Confidence: ${card.presentation.confidence}  |  Exposure: ${card.presentation.exposure}  |  Verification: ${card.presentation.verification}`,
    innerX + 8,
    y + 5,
    7.2,
    "bold",
    colors.text
  );
  y += 27;

  layout.textLines(card.evidenceLines, innerX, y, {
    fontSize: 8,
    lineHeight: 10.5,
    color: colors.muted,
  });
  y += card.evidenceLines.length * 10.5 + 4;
  layout.textLines(card.limitationLines, innerX, y, {
    fontSize: 8,
    lineHeight: 10.5,
    color: colors.warning,
  });
  y += card.limitationLines.length * 10.5 + 10;

  layout.line(innerX, y, innerX + innerWidth, y, colors.border);
  y += 10;
  layout.text("REMEDIATION STEPS", innerX, y, 7, "bold", colors.muted);
  y += 12;
  layout.textLines(card.stepLines, innerX, y, {
    fontSize: 8.5,
    lineHeight: 11.5,
  });

  layout.cursorY = top + card.height + 10;
}

function drawCustomerHandoff(layout: PdfLayout) {
  const height = 210;

  if (CONTENT_BOTTOM - layout.cursorY < height) return;

  const top = layout.cursorY;
  const innerX = PAGE_MARGIN + 14;
  const innerWidth = CONTENT_WIDTH - 28;
  const handoffSteps = [
    "1. Share the Fix today and Fix this week findings with the responsible technician.",
    "2. Collect the raw DNS, certificate, or redirect evidence requested by Likely and Possible findings.",
    "3. Re-scan after changes and compare the new public observations before closing the work.",
  ];

  layout.text("CLIENT HANDOFF", PAGE_MARGIN, top, 11, "bold", colors.navy);
  layout.rect(
    PAGE_MARGIN,
    top + 24,
    CONTENT_WIDTH,
    height - 24,
    colors.surfaceMuted,
    colors.border
  );
  layout.text("RECOMMENDED NEXT STEPS", innerX, top + 39, 7.5, "bold", colors.teal);

  let y = top + 57;
  handoffSteps.forEach((step) => {
    const lines = wrapTextToWidth(step, innerWidth, 8.5);
    layout.textLines(lines, innerX, y, {
      fontSize: 8.5,
      lineHeight: 12,
      color: colors.text,
    });
    y += lines.length * 12 + 5;
  });

  layout.line(innerX, y + 2, innerX + innerWidth, y + 2, colors.border);
  y += 16;
  layout.text("HOW TO READ THE EVIDENCE", innerX, y, 7.5, "bold", colors.teal);
  y += 16;
  layout.wrappedText(
    "Confirmed means the source evidence was stored. Likely means the scan observed an outcome but did not store every raw detail. Possible means more evidence is needed. Confidence describes evidence quality; priority is a workflow aid, not a CVSS score.",
    innerX,
    y,
    innerWidth,
    { fontSize: 8.5, lineHeight: 12, color: colors.muted }
  );

  layout.cursorY = top + height + 10;
}

function drawSummaryPage(layout: PdfLayout, input: PdfExportInput) {
  const { report } = input;
  const agencyName = input.agencyProfile?.agency_name || "Web Exposure Check";
  const summary = report.verifiedFindings
    ? summarizeVerifiedFindings(report.verifiedFindings)
    : {
        confirmedIssues: 0,
        needsValidation: report.riskFindings.length,
        externallyObservable: 0,
        fixedAndVerified: 0,
        priorities: {
          fixToday: 0,
          fixThisWeek: 0,
          needsMoreEvidence: report.riskFindings.length,
          scheduleLater: 0,
        },
      };

  layout.text("CLIENT SECURITY REPORT", PAGE_MARGIN, 70, 9, "bold", colors.teal);
  layout.text("Website exposure report", PAGE_MARGIN, 90, 25, "bold", colors.navy);
  layout.wrappedText(
    `Prepared by ${agencyName} for ${input.customerName || report.domain}`,
    PAGE_MARGIN,
    124,
    CONTENT_WIDTH,
    { fontSize: 10, lineHeight: 14, color: colors.muted }
  );

  const metricTop = 156;
  const metricGap = 10;
  const metricWidth = (CONTENT_WIDTH - metricGap * 3) / 4;
  const metrics = [
    ["DOMAIN", report.domain],
    ["SCAN DATE", formatScanDate(input.scanDate)],
    ["SECURITY SCORE", `${report.score}/100`],
    ["RISK LEVEL", report.riskLevel],
  ];

  metrics.forEach(([label, value], index) => {
    const x = PAGE_MARGIN + index * (metricWidth + metricGap);
    layout.rect(x, metricTop, metricWidth, 62, colors.surface, colors.border);
    layout.text(label, x + 10, metricTop + 11, 6.8, "bold", colors.muted);
    layout.textLines(wrapTextToWidth(value, metricWidth - 20, 10, "bold"), x + 10, metricTop + 29, {
      fontSize: 10,
      lineHeight: 12,
      font: "bold",
      color: colors.navy,
    });
  });

  let y = metricTop + 82;
  const summaryLines = wrapTextToWidth(report.summary, CONTENT_WIDTH - 28, 10);
  const summaryHeight = 44 + summaryLines.length * 14;
  layout.rect(PAGE_MARGIN, y, CONTENT_WIDTH, summaryHeight, colors.surfaceMuted, colors.border);
  layout.text("EXECUTIVE SUMMARY", PAGE_MARGIN + 14, y + 13, 7.5, "bold", colors.teal);
  layout.textLines(summaryLines, PAGE_MARGIN + 14, y + 31, {
    fontSize: 10,
    lineHeight: 14,
    color: colors.text,
  });
  y += summaryHeight + 20;

  layout.text("VERIFIED FINDINGS SUMMARY", PAGE_MARGIN, y, 10, "bold", colors.navy);
  y += 22;
  const summaryMetrics = [
    ["Confirmed issues", summary.confirmedIssues, colors.tealSoft, colors.teal],
    ["Need validation", summary.needsValidation, colors.warningSoft, colors.warning],
    ["Publicly observable", summary.externallyObservable, colors.dangerSoft, colors.danger],
    ["Fixed and verified", summary.fixedAndVerified, colors.surfaceMuted, colors.navy],
  ] as const;

  summaryMetrics.forEach(([label, value, fill, accent], index) => {
    const x = PAGE_MARGIN + index * (metricWidth + metricGap);
    layout.rect(x, y, metricWidth, 52, fill, colors.border);
    layout.text(String(value), x + 10, y + 9, 17, "bold", accent);
    layout.text(label, x + 10, y + 33, 7.2, "bold", colors.text);
  });
  y += 72;

  const priorityText = [
    `Fix today: ${summary.priorities.fixToday}`,
    `Fix this week: ${summary.priorities.fixThisWeek}`,
    `Collect more evidence: ${summary.priorities.needsMoreEvidence}`,
    `Schedule later: ${summary.priorities.scheduleLater}`,
  ].join("  |  ");
  layout.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 56, colors.surface, colors.border);
  layout.text("PRIORITY OVERVIEW", PAGE_MARGIN + 14, y + 12, 7.5, "bold", colors.teal);
  layout.wrappedText(priorityText, PAGE_MARGIN + 14, y + 29, CONTENT_WIDTH - 28, {
    fontSize: 8.5,
    lineHeight: 12,
    font: "bold",
  });
  y += 74;

  const scopeText =
    "Authorized, non-invasive scope: this report uses public DNS, TLS, HTTP, header, and website evidence. It does not exploit vulnerabilities, access private pages, or replace a penetration test or code review.";
  const scopeLines = wrapTextToWidth(scopeText, CONTENT_WIDTH - 28, 8.5);
  const scopeHeight = 28 + scopeLines.length * 12;
  layout.rect(PAGE_MARGIN, y, CONTENT_WIDTH, scopeHeight, colors.tealSoft, colors.teal);
  layout.textLines(scopeLines, PAGE_MARGIN + 14, y + 14, {
    fontSize: 8.5,
    lineHeight: 12,
    color: colors.navy,
  });

  layout.cursorY = y + scopeHeight;
}

function drawFindings(layout: PdfLayout, input: PdfExportInput) {
  const verifiedSnapshot = input.report.verifiedFindings;
  const findings = input.report.findings
    .map((finding) => ({
      finding,
      verified: verifiedSnapshot
        ? getVerifiedFinding(verifiedSnapshot, finding.checkKey)
        : undefined,
    }))
    .sort((left, right) => {
      const leftPriority = getFindingPriority(left.finding, left.verified);
      const rightPriority = getFindingPriority(right.finding, right.verified);
      const priorityDifference =
        priorityOrder.indexOf(leftPriority) - priorityOrder.indexOf(rightPriority);

      if (priorityDifference !== 0) return priorityDifference;
      return (right.verified?.priorityScore || 0) - (left.verified?.priorityScore || 0);
    });

  priorityOrder.forEach((priority) => {
    if (priority === "monitor" && input.report.riskFindings.length > 0) {
      drawCustomerHandoff(layout);
    }

    const group = findings.filter(
      ({ finding, verified }) => getFindingPriority(finding, verified) === priority
    );

    if (group.length === 0) return;

    const cardHeights = group.map(
      ({ finding, verified }) =>
        measureFindingCard(finding, verified, CONTENT_WIDTH).height + 10
    );
    const groupHeight = 28 + cardHeights.reduce((total, height) => total + height, 0);
    const fullPageCapacity = CONTENT_BOTTOM - CONTENT_TOP;

    if (
      groupHeight <= fullPageCapacity &&
      layout.cursorY + groupHeight > CONTENT_BOTTOM
    ) {
      layout.addPage();
    } else {
      layout.ensureSpace(28 + cardHeights[0]);
    }
    layout.text(priorityLabels[priority], PAGE_MARGIN, layout.cursorY, 14, "bold", colors.navy);
    layout.text(
      `${group.length} finding${group.length === 1 ? "" : "s"}`,
      PAGE_MARGIN + CONTENT_WIDTH - 70,
      layout.cursorY + 3,
      8,
      "bold",
      priorityColor(priority)
    );
    layout.cursorY += 28;

    group.forEach(({ finding, verified }) => {
      drawFindingCard(layout, finding, verified);
    });
  });
}

function addPageChrome(layout: PdfLayout) {
  const totalPages = layout.pages.length;

  layout.pages.forEach((commands, index) => {
    const header = [
      `BT /F2 8 Tf ${colors.navy.join(" ")} rg ${PAGE_MARGIN} ${PAGE_HEIGHT - 33} Td (WEB EXPOSURE CHECK) Tj ET`,
      `q ${colors.border.join(" ")} RG 0.75 w ${PAGE_MARGIN} ${PAGE_HEIGHT - 46} m ${PAGE_WIDTH - PAGE_MARGIN} ${PAGE_HEIGHT - 46} l S Q`,
    ];
    const footer = [
      `q ${colors.border.join(" ")} RG 0.75 w ${PAGE_MARGIN} 36 m ${PAGE_WIDTH - PAGE_MARGIN} 36 l S Q`,
      `BT /F1 7 Tf ${colors.muted.join(" ")} rg ${PAGE_MARGIN} 22 Td (Authorized non-invasive public checks only) Tj ET`,
      `BT /F2 7 Tf ${colors.navy.join(" ")} rg ${PAGE_WIDTH - PAGE_MARGIN - 55} 22 Td (Page ${index + 1} of ${totalPages}) Tj ET`,
    ];

    layout.pages[index] = [...header, ...commands, ...footer];
  });
}

function assemblePdf(pages: string[][]) {
  const objects: string[] = [];
  const pageRefs: number[] = [];
  const regularFontObject = 3;
  const boldFontObject = 4;

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "";
  objects[regularFontObject] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[boldFontObject] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  pages.forEach((pageCommands, index) => {
    const pageObjectNumber = 5 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const stream = pageCommands.join("\n");
    pageRefs.push(pageObjectNumber);
    objects[pageObjectNumber] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${regularFontObject} 0 R /F2 ${boldFontObject} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    objects[contentObjectNumber] =
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  objects[2] =
    `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`;

  let pdf = "%PDF-1.4\n%WEC1\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    if (!object) return;
    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  const maxObject = objects.length - 1;
  pdf += `xref\n0 ${maxObject + 1}\n0000000000 65535 f \n`;

  for (let index = 1; index <= maxObject; index += 1) {
    pdf += `${String(offsets[index] || 0).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${maxObject + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

export function makeReportPdfTextLines(input: PdfExportInput) {
  const agencyName = input.agencyProfile?.agency_name || "Web Exposure Check";
  const report = input.report;
  const summary = report.verifiedFindings
    ? summarizeVerifiedFindings(report.verifiedFindings)
    : null;
  const lines = [
    "Web Exposure Check - Client Security Report",
    `Prepared by: ${agencyName}`,
    `Domain: ${report.domain}`,
    input.customerName ? `Customer: ${input.customerName}` : "",
    `Scan date: ${formatScanDate(input.scanDate)}`,
    `Score: ${report.score}/100`,
    `Risk level: ${report.riskLevel}`,
    "Executive summary",
    report.summary,
    "Verified Findings summary",
    summary ? `Confirmed issues: ${summary.confirmedIssues}` : "Confirmed issues: Not available",
    summary ? `Need validation: ${summary.needsValidation}` : `Need validation: ${report.riskFindings.length}`,
    summary ? `Publicly observable: ${summary.externallyObservable}` : "Publicly observable: Not available",
    "Priority is a workflow score, not a CVSS rating.",
    "Authorized, non-invasive public checks only. No exploitation or private-page access was performed.",
    "Findings by priority",
  ].filter(Boolean);

  priorityOrder.forEach((priority) => {
    const grouped = report.findings.filter((finding) => {
      const verified = report.verifiedFindings
        ? getVerifiedFinding(report.verifiedFindings, finding.checkKey)
        : undefined;
      return getFindingPriority(finding, verified) === priority;
    });

    if (grouped.length === 0) return;
    lines.push(priorityLabels[priority]);

    grouped.forEach((finding) => {
      const verified = report.verifiedFindings
        ? getVerifiedFinding(report.verifiedFindings, finding.checkKey)
        : undefined;
      const presentation = getFindingPresentation(finding, verified);

      lines.push(`${finding.statusLabel}: ${finding.title}`);
      lines.push(`Observed status: ${finding.status}`);
      lines.push(`Business impact: ${finding.businessImpact}`);
      lines.push(`Responsible owner: ${finding.responsibleOwner}`);
      lines.push(`Fix difficulty: ${finding.fixDifficulty}`);
      lines.push(`Estimated fix time: ${finding.estimatedFixTime}`);
      lines.push(`Evidence confidence: ${presentation.confidence}`);
      lines.push(`External exposure: ${presentation.exposure}`);
      lines.push(`Verification status: ${presentation.verification}`);
      lines.push(`Evidence source: ${presentation.source}`);
      lines.push(`Stored evidence: ${presentation.evidence}`);
      lines.push(`Evidence limitations: ${presentation.limitations}`);
      finding.fixSteps.forEach((step, index) => {
        lines.push(`Remediation step ${index + 1}: ${step}`);
      });
    });
  });

  return lines;
}

export function buildReportPdf(input: PdfExportInput) {
  const layout = new PdfLayout();

  drawSummaryPage(layout, input);
  layout.addPage();
  drawFindings(layout, input);
  addPageChrome(layout);

  return assemblePdf(layout.pages);
}

export function downloadReportPdf(input: PdfExportInput) {
  const bytes = buildReportPdf(input);
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
  const url = URL.createObjectURL(new Blob([buffer], { type: "application/pdf" }));
  const link = document.createElement("a");

  link.href = url;
  link.download = `${input.report.domain}-security-report.pdf`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 100);
}
