import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  enabled: boolean;
}

const CustomCursor = ({ enabled }: Props) => {
  const isMobile = useIsMobile();
  const cursorRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<string>("default");

  useEffect(() => {
    if (isMobile || !enabled || !cursorRef.current) return;

    const cursor = cursorRef.current;
    let lastMode = "default";

    const getMode = (target: HTMLElement): string => {
      if (target.closest("a, button, [role='button'], select, .cursor-pointer")) return "hovering";
      if (target.closest("input, textarea")) return "text";
      return "default";
    };

    const onMove = (e: MouseEvent) => {
      // Position update — runs on every frame via rAF
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;

      // Mode check — only update DOM class when mode actually changes
      const mode = getMode(e.target as HTMLElement);
      if (mode !== lastMode) {
        cursor.className = `custom-cursor ${mode}`;
        lastMode = mode;
      }
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    return () => document.removeEventListener("mousemove", onMove);
  }, [isMobile, enabled]);

  if (isMobile || !enabled) return null;

  return (
    <div
      ref={cursorRef}
      className="custom-cursor default"
      style={{ left: 0, top: 0, transform: "translate3d(-100px, -100px, 0)" }}
    />
  );
};

export default CustomCursor;
