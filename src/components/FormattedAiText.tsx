import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

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

// Parse inline formatting: inline math ($...$ or \(...\)), bold (**...**), inline code (`...`)
function renderInlineContent(text: string): React.ReactNode[] {
  // Regex matches:
  // 1) Inline LaTeX: $...$ or \(...\)
  // 2) Bold: **...**
  // 3) Inline Code: `...`
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

    // First, split into blocks by Display LaTeX ($$...$$ or \[...\])
    const blockMathRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\])/g;
    const blockParts = content.split(blockMathRegex);

    const renderedBlocks: React.ReactNode[] = [];

    blockParts.forEach((part, blockIdx) => {
      if (!part) return;

      // Is it a display equation $$...$$
      if (part.startsWith("$$") && part.endsWith("$$") && part.length >= 4) {
        const math = part.slice(2, -2).trim();
        const html = renderMath(math, true);
        renderedBlocks.push(
          <div
            key={`math-block-${blockIdx}`}
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
        renderedBlocks.push(
          <div
            key={`math-block-${blockIdx}`}
            dir="ltr"
            className="my-3 p-3 overflow-x-auto rounded-xl bg-background/80 border border-border/50 shadow-sm flex items-center justify-center select-text text-center text-sm sm:text-base font-serif"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
        return;
      }

      // Regular markdown/text block: split by lines
      const lines = part.split("\n");
      const blockLineElements: React.ReactNode[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

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

      renderedBlocks.push(
        <div key={`text-block-${blockIdx}`} className="space-y-0.5">
          {blockLineElements}
        </div>
      );
    });

    return renderedBlocks;
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
