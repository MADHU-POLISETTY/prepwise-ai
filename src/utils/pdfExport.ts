import { jsPDF } from "jspdf";

export interface AnswerInput {
  questionId: number;
  questionText: string;
  answerText: string;
  score?: number;
  feedback?: string;
  improvements?: string;
  idealAnswer?: string;
}

export interface InterviewSessionRecord {
  id?: string;
  category: string;
  role: string;
  difficulty: string;
  company: string;
  score: number;
  metrics: {
    communication: number;
    technical: number;
    confidence: number;
    problemSolving: number;
    clarity: number;
  };
  feedback: string;
  questions: AnswerInput[];
  createdAt: string;
}

// Strip simple markdown tokens for PDF presentation
function cleanMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1")     // Italic
    .replace(/`([^`]+)`/g, "$1")     // Inline Code
    .replace(/#{1,6}\s+/g, "")       // Headers
    .replace(/---\s*/g, "")          // Horizontal rules
    .trim();
}

export function exportEvaluationToPDF(record: InterviewSessionRecord) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const marginX = 15;
  const contentWidth = 180;
  const pageHeightLimit = 270;
  let currentY = 25;

  // Header template drawn on the fly during text additions
  const drawPageHeader = (pdf: jsPDF) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(79, 70, 229); // Indigo-600
    pdf.text("PREPWISE AI", marginX, 12);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139); // Slate-500
    pdf.text("MOCK INTERVIEW PERFORMANCE APPRAISAL REPORT", 65, 12);

    pdf.setDrawColor(226, 232, 240); // Slate-200
    pdf.setLineWidth(0.3);
    pdf.line(marginX, 15, 195, 15);
  };

  // Safe line printing helper that checks for page breaks
  const printTextParagraph = (
    pdf: jsPDF,
    text: string,
    fontSize: number,
    fontStyle: "normal" | "bold" | "italic" = "normal",
    color: [number, number, number] = [30, 41, 59], // Slate-800
    indentX = 0,
    spacingAfter = 4,
    widthOverride?: number
  ): number => {
    pdf.setFont("helvetica", fontStyle);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);

    const activeWidth = widthOverride || (contentWidth - indentX);
    const lines = pdf.splitTextToSize(text, activeWidth);
    const itemLineHeight = fontSize * 0.43; // approximate lines spacing in mm

    for (const line of lines) {
      if (currentY > pageHeightLimit) {
        pdf.addPage();
        drawPageHeader(pdf);
        currentY = 25;
      }
      pdf.text(line, marginX + indentX, currentY);
      currentY += itemLineHeight;
    }

    currentY += spacingAfter;
    return currentY;
  };

  // Draw the first page header
  drawPageHeader(doc);

  // Document Title
  currentY = 25;
  currentY = printTextParagraph(
    doc,
    "MOCK INTERVIEW EVALUATION REPORT",
    15,
    "bold",
    [15, 23, 42], // Slate-900
    0,
    2
  );

  // Subtitle
  const dateStr = record.createdAt ? new Date(record.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : new Date().toLocaleDateString();

  currentY = printTextParagraph(
    doc,
    `Generated on ${dateStr} | Secure Digital Appraisal Record`,
    8.5,
    "italic",
    [100, 116, 139],
    0,
    5
  );

  // Metadata Card Block (Gray Box)
  const cardHeight = 24;
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, currentY, contentWidth, cardHeight, 3, 3, "FD");

  // Metadata Fields
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text("SESSION PARAMETERS", marginX + 5, currentY + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate-600

  // Left column
  doc.text(`Target Role: ${record.role?.toUpperCase() || "CANDIDATE"}`, marginX + 5, currentY + 11.5);
  doc.text(`Target Target/Company: ${record.company || "Standard Standard"}`, marginX + 5, currentY + 16.5);
  doc.text(`Topic Category: ${record.category || "General"}`, marginX + 5, currentY + 21.5);

  // Right column
  doc.text(`Difficulty: ${record.difficulty || "Medium"}`, marginX + 100, currentY + 11.5);
  doc.text(`Overall Appraisal Score: ${record.score}%`, marginX + 100, currentY + 16.5);
  doc.text(`Status: Completed & Approved`, marginX + 100, currentY + 21.5);

  currentY += cardHeight + 8;

  // Overall Score Banner Block
  const scoreBannerHeight = 18;
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.roundedRect(marginX, currentY, contentWidth, scoreBannerHeight, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("OVERALL APPRAISAL SCORE", marginX + 6, currentY + 11.5);

  doc.setFontSize(18);
  doc.text(`${record.score}%`, marginX + 150, currentY + 12.5);

  currentY += scoreBannerHeight + 8;

  // Metrics Section (with beautiful progress bars)
  currentY = printTextParagraph(
    doc,
    "CORE COMPREHENSION & PERFORMANCE METRICS",
    11,
    "bold",
    [15, 23, 42],
    0,
    3
  );

  const metricsList = [
    { label: "Technical Comprehension (TEC)", score: record.metrics?.technical ?? 80, desc: "Aptitude for resolving domain architectural queries correctly." },
    { label: "Communication Flow (COM)", score: record.metrics?.communication ?? 80, desc: "Brevity, structure, and pacing of the articulated answers." },
    { label: "Answer Structural Clarity (CLA)", score: record.metrics?.clarity ?? 80, desc: "Whether answers follow a logical structure (like STAR) cleanly." },
    { label: "Problem Solving Aptitude (SOL)", score: record.metrics?.problemSolving ?? 80, desc: "Approach to identifying trade-offs and proposing edge case fixes." },
    { label: "Confidence & Executive Presence (CON)", score: record.metrics?.confidence ?? 80, desc: "Composure, assertiveness, and readiness for professional interviews." }
  ];

  for (const metric of metricsList) {
    if (currentY + 15 > pageHeightLimit) {
      doc.addPage();
      drawPageHeader(doc);
      currentY = 25;
    }

    // Label and Score
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(metric.label, marginX, currentY + 2);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(79, 70, 229);
    doc.text(`${metric.score}%`, marginX + 162, currentY + 2);

    // Progress bar track
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(marginX, currentY + 3.5, 150, 3, 1.5, 1.5, "F");

    // Progress bar fill
    doc.setFillColor(99, 102, 241); // indigo-500
    doc.roundedRect(marginX, currentY + 3.5, Math.max(3, 150 * (metric.score / 100)), 3, 1.5, 1.5, "F");

    // Small description below bar
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(metric.desc, marginX, currentY + 9.5);

    currentY += 13;
  }

  currentY += 3;

  // Coaching Commentary Section
  currentY = printTextParagraph(
    doc,
    "EXECUTIVE COACHING COMMENTARY",
    11,
    "bold",
    [15, 23, 42],
    0,
    3
  );

  const cleanFeedbackText = cleanMarkdown(record.feedback || "");
  const feedbackParagraphs = cleanFeedbackText.split("\n\n").filter(Boolean);

  for (const para of feedbackParagraphs) {
    currentY = printTextParagraph(
      doc,
      para,
      9.5,
      "normal",
      [51, 65, 85], // slate-700
      0,
      4.5
    );
  }

  currentY += 6;

  // Question-by-Question Section
  currentY = printTextParagraph(
    doc,
    "DETAILED QUESTION-BY-QUESTION SCORECARD",
    11,
    "bold",
    [15, 23, 42],
    0,
    4
  );

  const qItems = record.questions || [];

  qItems.forEach((q, index) => {
    if (currentY + 28 > pageHeightLimit) {
      doc.addPage();
      drawPageHeader(doc);
      currentY = 25;
    }

    // Question title & Score block
    const titleText = `QUESTION ${index + 1} OF ${qItems.length}`;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(titleText, marginX, currentY + 1);

    const scoreStr = `Appraisal Score: ${q.score ?? 0} / 10 Points`;
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text(scoreStr, marginX + 118, currentY + 1);

    currentY += 4;

    // Actual Question text
    currentY = printTextParagraph(
      doc,
      q.questionText || "",
      10,
      "bold",
      [15, 23, 42],
      0,
      3
    );

    // User's Answer Blockquote with a clean vertical grey left accent bar
    const cleanAnswer = q.answerText?.trim() ? `"${q.answerText.trim()}"` : '"[No answer details provided]"';
    
    // We calculate heights dynamically to draw the matching blockquote line
    const ansFontSize = 9;
    const ansLines = doc.splitTextToSize(cleanAnswer, contentWidth - 8);
    const ansBlockHeight = (ansLines.length * ansFontSize * 0.43) + 4;

    if (currentY + ansBlockHeight > pageHeightLimit) {
      doc.addPage();
      drawPageHeader(doc);
      currentY = 25;
    }

    // Draw light gray background box for blockquote
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(marginX, currentY, contentWidth, ansBlockHeight, "F");

    // Draw indigo left-accent line
    doc.setFillColor(99, 102, 241); // indigo-500
    doc.rect(marginX, currentY, 1.8, ansBlockHeight, "F");

    // Print actual answer text inside the box
    currentY += 2;
    currentY = printTextParagraph(
      doc,
      cleanAnswer,
      ansFontSize,
      "italic",
      [71, 85, 105], // Slate-600
      4, // indent inside the gray box
      0,
      contentWidth - 8
    );
    currentY += 4;

    // Analysis and suggestions side-by-side or stacked cleanly
    if (q.feedback) {
      currentY = printTextParagraph(
        doc,
        "Appraisal Critique:",
        8.5,
        "bold",
        [79, 70, 229],
        0,
        1
      );
      currentY = printTextParagraph(
        doc,
        cleanMarkdown(q.feedback),
        9,
        "normal",
        [51, 65, 85],
        0,
        3.5
      );
    }

    if (q.improvements) {
      currentY = printTextParagraph(
        doc,
        "Suggestions for Improvement:",
        8.5,
        "bold",
        [217, 119, 6], // Amber-600
        0,
        1
      );
      currentY = printTextParagraph(
        doc,
        cleanMarkdown(q.improvements),
        9,
        "normal",
        [51, 65, 85],
        0,
        3.5
      );
    }

    if (q.idealAnswer) {
      currentY = printTextParagraph(
        doc,
        "Model Answer (Perfect Standard):",
        8.5,
        "bold",
        [16, 185, 129], // Emerald-500
        0,
        1
      );
      currentY = printTextParagraph(
        doc,
        cleanMarkdown(q.idealAnswer),
        9,
        "normal",
        [71, 85, 105],
        0,
        5.5
      );
    }

    // Divider line between questions
    if (index < qItems.length - 1) {
      if (currentY + 10 > pageHeightLimit) {
        doc.addPage();
        drawPageHeader(doc);
        currentY = 25;
      }
      doc.setDrawColor(241, 245, 249); // slate-100
      doc.setLineWidth(0.4);
      doc.line(marginX, currentY, 195, currentY);
      currentY += 6;
    }
  });

  // Now, decorate all pages with standard footer & dynamic page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Bottom horizontal thin rule
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(marginX, 282, 195, 282);

    // Footer credentials
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("PrepWise AI Mock Interview Platform | Google AI Studio Build", marginX, 287);
    doc.text(`Page ${i} of ${totalPages}`, 176, 287);
  }

  // Create formatted safe file name
  const safeRole = (record.role || "evaluation").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const fileName = `prepwise-evaluation-${safeRole}-${Date.now()}.pdf`;

  // Download PDF
  doc.save(fileName);
}
