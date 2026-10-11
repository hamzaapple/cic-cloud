import katex from "katex";

interface ExportOptions {
  title: string;
  courseName?: string;
  content: string;
  typeLabel: string; // e.g. "ملخص المحاضرة" or "تبسيط المفاهيم"
}

// Convert markdown & math text to clean HTML for Word & PDF export
function formatContentToHtml(markdown: string): string {
  if (!markdown) return "";

  // 1. Process display equations $$...$$
  let html = markdown.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    let rendered = math.trim();
    try {
      rendered = katex.renderToString(rendered, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      rendered = `<div class="raw-math">${math}</div>`;
    }
    return `<div class="math-block" dir="ltr">${rendered}</div>`;
  });

  // 2. Process inline equations $...$
  html = html.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    let rendered = math.trim();
    try {
      rendered = katex.renderToString(rendered, {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      rendered = `<span>${math}</span>`;
    }
    return `<span class="math-inline" dir="ltr">${rendered}</span>`;
  });

  // 3. Process headings, lists, bold, lines
  const lines = html.split("\n");
  const processedLines: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      processedLines.push("<br/>");
      continue;
    }

    // Bold
    line = line.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");

    // Inline code
    line = line.replace(/`([^`]+?)`/g, "<code style='background:#f1f5f9;padding:2px 5px;border-radius:4px;font-family:monospace;'>$1</code>");

    // Headings
    if (trimmed.startsWith("### ")) {
      processedLines.push(`<h3 style="color:#0f172a;font-size:13pt;margin:12pt 0 6pt 0;">${line.replace("### ", "")}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      processedLines.push(`<h2 style="color:#0369a1;font-size:15pt;margin:16pt 0 8pt 0;border-bottom:1px solid #e2e8f0;padding-bottom:4pt;">${line.replace("## ", "")}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      processedLines.push(`<h1 style="color:#0284c7;font-size:18pt;margin:20pt 0 10pt 0;">${line.replace("# ", "")}</h1>`);
      continue;
    }

    // Bullet lists
    if (/^[-*•]\s+/.test(trimmed)) {
      const itemText = line.replace(/^[-*•]\s+/, "");
      processedLines.push(`<div style="margin:4pt 0;padding-right:16pt;position:relative;"><span style="position:absolute;right:2pt;color:#0284c7;font-weight:bold;">•</span>${itemText}</div>`);
      continue;
    }

    // Numbered lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      const num = numMatch[1];
      const after = line.replace(/^\d+\.\s+/, "");
      processedLines.push(`<div style="margin:5pt 0;padding-right:22pt;position:relative;"><span style="position:absolute;right:0;color:#0284c7;font-weight:bold;background:#e0f2fe;border-radius:50%;width:18px;height:18px;text-align:center;line-height:18px;font-size:10pt;">${num}</span>${after}</div>`);
      continue;
    }

    // Regular paragraph
    processedLines.push(`<p style="margin:6pt 0;line-height:1.7;">${line}</p>`);
  }

  return processedLines.join("\n");
}

/**
 * Export explanation or summary directly to a Word document (.doc)
 * Opens cleanly in Microsoft Word, Google Docs, Word Online, and LibreOffice.
 */
export function exportToWordDocument({
  title,
  courseName = "",
  content,
  typeLabel,
}: ExportOptions) {
  const currentDate = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const bodyHtml = formatContentToHtml(content);

  const wordHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${title} - ${typeLabel}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 21cm 29.7cm;
      margin: 2cm 2cm 2cm 2cm;
      mso-header-margin: 1cm;
      mso-footer-margin: 1cm;
    }
    div.Section1 {
      page: Section1;
      direction: rtl;
      font-family: 'Segoe UI', 'Cairo', 'Arial', sans-serif;
    }
    body {
      direction: rtl;
      text-align: right;
      font-family: 'Segoe UI', 'Cairo', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1e293b;
      background-color: #ffffff;
    }
    .header-card {
      border: 1.5pt solid #0284c7;
      border-radius: 8pt;
      background-color: #f0f9ff;
      padding: 14pt 18pt;
      margin-bottom: 20pt;
    }
    .header-title {
      font-size: 18pt;
      font-weight: bold;
      color: #0369a1;
      margin: 0 0 4pt 0;
    }
    .header-subtitle {
      font-size: 11pt;
      color: #475569;
      margin: 0;
    }
    .badge {
      display: inline-block;
      background-color: #0284c7;
      color: #ffffff;
      padding: 2pt 8pt;
      border-radius: 4pt;
      font-size: 9pt;
      font-weight: bold;
      margin-top: 6pt;
    }
    .math-block {
      background-color: #f8fafc;
      border: 1pt solid #cbd5e1;
      border-radius: 6pt;
      padding: 10pt;
      text-align: center;
      margin: 12pt 0;
      direction: ltr;
      font-family: 'Cambria Math', 'Times New Roman', serif;
      font-size: 13pt;
      color: #0f172a;
    }
    .math-inline {
      direction: ltr;
      font-family: 'Cambria Math', 'Times New Roman', serif;
      font-weight: bold;
      padding: 0 2pt;
    }
    .footer-note {
      margin-top: 30pt;
      padding-top: 10pt;
      border-top: 1pt solid #e2e8f0;
      font-size: 9pt;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <div class="header-card">
      <div class="header-title">${title}</div>
      <div class="header-subtitle">${courseName ? `مقرر: ${courseName} — ` : ""}${typeLabel}</div>
      <div class="badge">منصة سحابة CIC الأكاديمية • ${currentDate}</div>
    </div>

    <div class="content-body">
      ${bodyHtml}
    </div>

    <div class="footer-note">
      تم إعداد وتنسيق هذا الشرح عبر المساعد الذكي في منصة CIC Cloud • بتأريخ ${currentDate}
    </div>
  </div>
</body>
</html>
  `.trim();

  const blob = new Blob(["\ufeff", wordHtml], {
    type: "application/msword;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeTitle = title.replace(/[/\\?%*:|"<>]/g, "_").trim();
  a.download = `${safeTitle} - ${typeLabel}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Print or Export directly to PDF with high-resolution vector fonts and KaTeX equations
 */
export function exportToPdfPrint({
  title,
  courseName = "",
  content,
  typeLabel,
}: ExportOptions) {
  const currentDate = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const bodyHtml = formatContentToHtml(content);

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("يرجى السماح بالنوافذ المنبثقة (Popups) لتصدير ملف الـ PDF والطباعة.");
    return;
  }

  const printHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>${title} - ${typeLabel}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 1.5cm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.7;
      font-size: 13px;
    }
    .header-card {
      border: 1.5px solid #0284c7;
      border-radius: 12px;
      background: #f0f9ff;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .header-title {
      font-size: 20px;
      font-weight: 800;
      color: #0369a1;
      margin: 0 0 6px 0;
    }
    .header-subtitle {
      font-size: 13px;
      color: #475569;
      margin: 0 0 10px 0;
    }
    .badge {
      display: inline-block;
      background: #0284c7;
      color: #ffffff;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }
    .math-block {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      margin: 14px 0;
      direction: ltr;
      font-size: 15px;
    }
    .math-inline {
      direction: ltr;
      display: inline-block;
      padding: 0 3px;
    }
    .footer-note {
      margin-top: 36px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      .header-card { page-break-after: avoid; }
      .math-block { page-break-inside: avoid; }
      h2, h3 { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; padding: 12px 16px; background: #e0f2fe; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-weight: bold; color: #0369a1;">📄 جاهز للطباعة أو الحفظ كملف PDF</span>
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; font-family: inherit;">
      🖨️ اضغط للحفظ كـ PDF / طباعة
    </button>
  </div>

  <div class="header-card">
    <div class="header-title">${title}</div>
    <div class="header-subtitle">${courseName ? `مقرر: ${courseName} — ` : ""}${typeLabel}</div>
    <div class="badge">منصة سحابة CIC الأكاديمية • ${currentDate}</div>
  </div>

  <div class="content-body">
    ${bodyHtml}
  </div>

  <div class="footer-note">
    تم إعداد وتنسيق هذا الملف عبر المساعد الذكي في منصة CIC Cloud • بتأريخ ${currentDate}
  </div>

  <script>
    // Automatically trigger print dialog once fonts/katex are loaded
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `.trim();

  printWindow.document.open();
  printWindow.document.write(printHtml);
  printWindow.document.close();
}
