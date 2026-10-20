import React, { useMemo, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Copy, Check } from "lucide-react";

interface FormattedAiTextProps {
  content: string;
  className?: string;
}

// Safely render LaTeX math expressions into HTML
function renderMath(math: string, displayMode: boolean): string {
  try {
    return katex.renderToString(math.trim(), {
      displayMode,
      throwOnError: false,
      strict: false,
      output: "htmlAndMathml",
    });
  } catch (err) {
    console.warn("KaTeX rendering error:", err);
    return `<span class="katex-error">${math}</span>`;
  }
}

// Code Block with Copy Button
const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-border/60 bg-muted/40 overflow-hidden shadow-sm" dir="ltr">
      <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/80 border-b border-border/40 text-xs text-muted-foreground font-mono">
        <span className="uppercase font-bold tracking-wider text-[11px] text-primary">{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-background/80 transition-colors text-[11px]"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? "تم النسخ" : "نسخ الكود"}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-foreground selection:bg-primary/20">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Parse inline formatting: inline math ($...$ or \(...\)), bold (**...**), inline code (`...`)
function renderInlineContent(text: string): React.ReactNode[] {
  const tokenRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$(?:\\.|[^$\\\n])+\$|\\\([\s\S]+?\\\)|\*\*[^*]+?\*\*|`[^`]+?`)/g;

  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Check for inline math $...$
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2 && !part.startsWith("$$")) {
      const math = part.slice(1, -1);
      const html = renderMath(math, false);
      return (
        <span
          key={index}
          dir="ltr"
          className="inline-block px-1 align-baseline select-text font-serif"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // Check for \( ... \)
    if (part.startsWith("\\(") && part.endsWith("\\)") && part.length > 4) {
      const math = part.slice(2, -2);
      const html = renderMath(math, false);
      return (
        <span
          key={index}
          dir="ltr"
          className="inline-block px-1 align-baseline select-text font-serif"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // Bold **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-foreground">
          {renderInlineContent(inner)}
        </strong>
      );
    }

    // Inline code `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          dir="ltr"
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-secondary/80 text-primary font-mono text-[11px] sm:text-xs border border-border/40 inline-block align-baseline"
        >
          {inner}
        </code>
      );
    }

    // Normal text
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export const FormattedAiText: React.FC<FormattedAiTextProps> = ({
  content,
  className = "",
}) => {
  const elements = useMemo(() => {
    if (!content) return null;

    // 1. Split by fenced code blocks (```lang ... ```)
    const codeBlockRegex = /(```[\w-]*\n[\s\S]*?```)/g;
    const topParts = content.split(codeBlockRegex);

    const renderedTopBlocks: React.ReactNode[] = [];

    topParts.forEach((topPart, topIdx) => {
      if (!topPart) return;

      // Check if topPart is a fenced code block
      if (topPart.startsWith("```") && topPart.endsWith("```")) {
        const firstLineEnd = topPart.indexOf("\n");
        const language = firstLineEnd !== -1 ? topPart.slice(3, firstLineEnd).trim() : "";
        const code = firstLineEnd !== -1 ? topPart.slice(firstLineEnd + 1, -3) : topPart.slice(3, -3);
        renderedTopBlocks.push(
          <CodeBlock key={`code-block-${topIdx}`} code={code} language={language} />
        );
        return;
      }

      // 2. Split non-code text by Display LaTeX ($$...$$ or \[...\])
      const blockMathRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\])/g;
      const mathParts = topPart.split(blockMathRegex);

      mathParts.forEach((part, mathIdx) => {
        if (!part) return;

        // Is it a display equation $$...$$
        if (part.startsWith("$$") && part.endsWith("$$") && part.length >= 4) {
          const math = part.slice(2, -2).trim();
          const html = renderMath(math, true);
          renderedTopBlocks.push(
            <div
              key={`math-block-${topIdx}-${mathIdx}`}
              dir="ltr"
              className="my-3 p-3 overflow-x-auto rounded-xl bg-background/80 border border-border/50 shadow-sm flex items-center justify-center select-text text-center text-sm sm:text-base font-serif"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
          return;
        }

        // Is it a display equation \[...\]
        if (part.startsWith("\\[") && part.endsWith("\\]") && part.length >= 4) {
          const math = part.slice(2, -2).trim();
          const html = renderMath(math, true);
          renderedTopBlocks.push(
            <div
              key={`math-block-${topIdx}-${mathIdx}`}
              dir="ltr"
              className="my-3 p-3 overflow-x-auto rounded-xl bg-background/80 border border-border/50 shadow-sm flex items-center justify-center select-text text-center text-sm sm:text-base font-serif"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
          return;
        }

        // 3. Regular markdown lines: parse lines, tables, blockquotes, headers
        const lines = part.split("\n");
        const blockLineElements: React.ReactNode[] = [];
        let inTable = false;
        let tableRows: string[] = [];

        const flushTable = (keyPrefix: string) => {
          if (tableRows.length === 0) return;
          const parsedRows = tableRows.map((r) =>
            r
              .trim()
              .replace(/^\|/, "")
              .replace(/\|$/, "")
              .split("|")
              .map((c) => c.trim())
          );

          // Check if row 1 is header and row 2 is divider (|---|---|)
          const hasDivider = parsedRows.length > 1 && /^[-\s:|]+$/.test(tableRows[1].replace(/\|/g, "").trim());
          const headerRow = parsedRows[0];
          const dataRows = hasDivider ? parsedRows.slice(2) : parsedRows.slice(1);

          blockLineElements.push(
            <div key={`${keyPrefix}-table`} className="my-3 overflow-x-auto rounded-xl border border-border/60 shadow-sm">
              <table className="w-full text-xs text-right border-collapse bg-card">
                <thead>
                  <tr className="bg-secondary/70 border-b border-border/60">
                    {headerRow.map((cell, cIdx) => (
                      <th key={cIdx} className="p-2.5 font-bold text-foreground">
                        {renderInlineContent(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {dataRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 text-muted-foreground">
                          {renderInlineContent(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );

          tableRows = [];
          inTable = false;
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();

          // Check if table line
          if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
            inTable = true;
            tableRows.push(trimmed);
            continue;
          } else if (inTable) {
            flushTable(`tbl-${i}`);
          }

          if (!trimmed) {
            blockLineElements.push(<div key={`br-${i}`} className="h-2" />);
            continue;
          }

          // Horizontal rule
          if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
            blockLineElements.push(
              <hr key={`hr-${i}`} className="my-3 border-border/50" />
            );
            continue;
          }

          // Blockquote / Callout (> ...)
          if (trimmed.startsWith("> ")) {
            const quoteContent = trimmed.slice(2);
            blockLineElements.push(
              <div
                key={`quote-${i}`}
                className="my-2 p-3 rounded-xl bg-primary/10 border-r-4 border-primary text-xs leading-relaxed text-foreground shadow-sm flex items-start gap-2"
              >
                <span className="text-primary font-bold text-sm">💡</span>
                <div className="flex-1">{renderInlineContent(quoteContent)}</div>
              </div>
            );
            continue;
          }

          // Slide Heading Card (e.g. "## 📄 السلايد 1: ..." or "## السلايد 2: ...")
          if (/^##\s+(📄|slide|السلايد|الصفحة|شريحة)/i.test(trimmed) || trimmed.includes("السلايد") && trimmed.startsWith("## ")) {
            blockLineElements.push(
              <div
                key={`slide-head-${i}`}
                className="mt-6 mb-3 p-3.5 rounded-xl bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border border-primary/25 shadow-sm flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  📄
                </div>
                <h3 className="font-bold text-sm sm:text-base text-foreground flex-1">
                  {renderInlineContent(trimmed.replace(/^##\s+/, ""))}
                </h3>
              </div>
            );
            continue;
          }

          // Headings
          if (trimmed.startsWith("### ")) {
            blockLineElements.push(
              <h4
                key={`h4-${i}`}
                className="text-sm sm:text-base font-bold text-foreground mt-3 mb-1.5 flex items-center gap-1.5"
              >
                {renderInlineContent(trimmed.slice(4))}
              </h4>
            );
            continue;
          }
          if (trimmed.startsWith("## ")) {
            blockLineElements.push(
              <h3
                key={`h3-${i}`}
                className="text-base sm:text-lg font-bold text-foreground mt-4 mb-2 flex items-center gap-1.5"
              >
                {renderInlineContent(trimmed.slice(3))}
              </h3>
            );
            continue;
          }
          if (trimmed.startsWith("# ")) {
            blockLineElements.push(
              <h2
                key={`h2-${i}`}
                className="text-lg sm:text-xl font-bold text-foreground mt-4 mb-2 flex items-center gap-1.5"
              >
                {renderInlineContent(trimmed.slice(2))}
              </h2>
            );
            continue;
          }

          // Bullet lists
          if (/^[-*•]\s+/.test(trimmed)) {
            const bulletText = trimmed.replace(/^[-*•]\s+/, "");
            blockLineElements.push(
              <div
                key={`bullet-${i}`}
                className="flex items-start gap-2 my-1.5 pl-1 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1">{renderInlineContent(bulletText)}</div>
              </div>
            );
            continue;
          }

          // Numbered list (e.g. "1. ", "2. ")
          const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
          if (numberedMatch) {
            const num = numberedMatch[1];
            const textAfter = numberedMatch[2];
            blockLineElements.push(
              <div
                key={`num-${i}`}
                className="flex items-start gap-2.5 my-1.5 leading-relaxed"
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                  {num}
                </span>
                <div className="flex-1">{renderInlineContent(textAfter)}</div>
              </div>
            );
            continue;
          }

          // Normal paragraph line
          blockLineElements.push(
            <p key={`p-${i}`} className="leading-relaxed my-1">
              {renderInlineContent(line)}
            </p>
          );
        }

        if (inTable) {
          flushTable(`tbl-end`);
        }

        renderedTopBlocks.push(
          <div key={`text-block-${topIdx}-${mathIdx}`} className="space-y-0.5">
            {blockLineElements}
          </div>
        );
      });
    });

    return renderedTopBlocks;
  }, [content]);

  if (!content) return null;

  return (
    <div
      className={`leading-relaxed text-sm text-foreground/90 select-text ${className}`}
      dir="rtl"
    >
      {elements}
    </div>
  );
};

export default FormattedAiText;
