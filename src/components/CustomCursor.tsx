import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  enabled: boolean;
}

const CustomCursor = ({ enabled }: Props) => {
  const isMobile = useIsMobile();
  const cursorRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<string>("default");
  const rafRef = useRef<number>(0);
  const posRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (isMobile || !enabled || !cursorRef.current) return;

    const cursor = cursorRef.current;

    const getTargetMode = (target: HTMLElement): string => {
      if (target.closest("a, button, [role='button'], [data-clickable], select, .cursor-pointer")) return "hovering";
      if (
        target.closest("input, textarea") ||
        (target.matches("p, span, h1, h2, h3, h4, h5, h6, li, td, th, label, div") &&
          window.getComputedStyle(target).cursor === "text")
      ) return "text";
      return "default";
    };

    const move = (e: MouseEvent) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          cursor.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
          rafRef.current = 0;
        });
      }
    };

    const over = (e: MouseEvent) => {
      const mode = getTargetMode(e.target as HTMLElement);
      if (mode !== modeRef.current) {
        cursor.className = `custom-cursor ${mode}`;
        modeRef.current = mode;
      }
    };

    const out = () => {
      if (modeRef.current !== "default") {
        cursor.className = "custom-cursor default";
        modeRef.current = "default";
      }
    };

    document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over, { passive: true });
    document.addEventListener("mouseout", out, { passive: true });
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
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
